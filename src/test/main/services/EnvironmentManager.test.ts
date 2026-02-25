import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnvironmentManager } from '@/main/services/EnvironmentManager';
import fs from 'fs/promises';

vi.mock('fs/promises');

describe('EnvironmentManager', () => {
    const envManager = new EnvironmentManager();

    describe('resolveVariables', () => {
        it('should return original string if no variables present', () => {
            const template = 'http://example.com';
            const variables = { host: 'localhost' };
            expect(envManager.resolveVariables(template, variables)).toBe('http://example.com');
        });

        it('should resolve simple variable', () => {
            const template = 'http://{{host}}/api';
            const variables = { host: 'localhost:8080' };
            expect(envManager.resolveVariables(template, variables)).toBe('http://localhost:8080/api');
        });

        it('should resolve multiple variables', () => {
            const template = '{{protocol}}://{{host}}:{{port}}';
            const variables = { protocol: 'https', host: 'api.dev', port: '443' };
            expect(envManager.resolveVariables(template, variables)).toBe('https://api.dev:443');
        });

        it('should handle nested variables', () => {
            const template = '{{baseUrl}}/users';
            const variables = {
                host: 'localhost',
                baseUrl: 'http://{{host}}/v1'
            };
            // First pass: http://{{host}}/v1/users -> Second pass: http://localhost/v1/users
            expect(envManager.resolveVariables(template, variables)).toBe('http://localhost/v1/users');
        });

        it('should leave unresolved variables intact', () => {
            const template = 'Authorization: Bearer {{token}}';
            const variables = { user: 'admin' };
            expect(envManager.resolveVariables(template, variables)).toBe('Authorization: Bearer {{token}}');
        });

        it('should handle whitespace in variable tags', () => {
            const template = '{{  host  }}';
            const variables = { host: '127.0.0.1' };
            expect(envManager.resolveVariables(template, variables)).toBe('127.0.0.1');
        });

        it('should prevent infinite loops in recursive variables', () => {
            const template = '{{a}}';
            const variables = { a: '{{b}}', b: '{{a}}' };
            // Should resolve partially or stop after maxIterations, but definitely not hang
            const result = envManager.resolveVariables(template, variables);
            // It will likely be {{a}} or {{b}} depending on where it stops,
            // but the important thing is that it returns.
            expect(result).toMatch(/{{[ab]}}/);
        });
    });

    describe('flattenEnvironment', () => {
        it('should return map of only enabled variables', () => {
            const env = {
                id: '1',
                name: 'Test',
                variables: [
                    { key: 'url', value: 'http://test.com', enabled: true, type: 'default' },
                    { key: 'token', value: '123', enabled: false, type: 'secret' },
                    { key: 'user', value: 'admin', enabled: true, type: 'default' }
                ] as any[]
            };
            const flattened = envManager.flattenEnvironment(env);
            expect(flattened).toEqual({
                url: 'http://test.com',
                user: 'admin'
            });
            expect(flattened).not.toHaveProperty('token');
        });
    });
    describe('loadEnvironment', () => {
        it('should read and parse environment file', async () => {
            const mockContent = '{"name": "test", "variables": []}';
            (fs.readFile as any).mockResolvedValue(mockContent);

            const env = await envManager.loadEnvironment('/path/to/env.json');

            expect(env).toEqual({ name: "test", variables: [] });
            expect(fs.readFile).toHaveBeenCalledWith('/path/to/env.json', 'utf-8');
        });
    });

    describe('saveEnvironment', () => {
        it('should serialize and write environment file', async () => {
            const env = { id: '1', name: 'test', variables: [] };
            await envManager.saveEnvironment('/path/to/env.json', env);

            expect(fs.writeFile).toHaveBeenCalledWith(
                '/path/to/env.json',
                expect.stringContaining('"name": "test"'),
                'utf-8'
            );
        });
    });

    describe('encryption integration', () => {
        const PROJECT_PATH = '/test/project';
        const KEY_PATH = `${PROJECT_PATH}/environment.key`;
        const encEnvManager = new EnvironmentManager();

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it('should encrypt secret variables on save with projectPath', async () => {
            // Mock environment.key NO existe
            (fs.readFile as any).mockRejectedValue(new Error('Not found'));

            // Mock para que pass el access de evitar rescritura: no existe, pasa al catch
            (fs.access as any).mockRejectedValue(new Error('Not found'));

            (fs.writeFile as any).mockResolvedValue(undefined);

            const env = {
                id: '1',
                name: 'Test',
                variables: [
                    { key: 'API_URL', value: 'https://api.com', type: 'default', enabled: true },
                    { key: 'API_KEY', value: 'my-secret-key', type: 'secret', enabled: true }
                ]
            };

            await encEnvManager.saveEnvironment('/path/to/env.json', env as any, PROJECT_PATH);

            // Verificar que se escribió la key
            const writeKeyCall = (fs.writeFile as any).mock.calls.find(
                (c: any[]) => c[0] === KEY_PATH
            );
            expect(writeKeyCall).toBeDefined();

            // Verificar que se escribió el environment
            const writeEnvCall = (fs.writeFile as any).mock.calls.find(
                (c: any[]) => c[0] === '/path/to/env.json'
            );
            expect(writeEnvCall).toBeDefined();

            const savedContent = JSON.parse(writeEnvCall[1]);
            // Variable default debe permanecer en texto plano
            expect(savedContent.variables[0].value).toBe('https://api.com');
            // Variable secret debe estar encriptada
            expect(savedContent.variables[1].value).toMatch(/^ENC\[AES256_GCM:/);
        });

        it('should NOT encrypt when no projectPath (globals)', async () => {
            (fs.writeFile as any).mockResolvedValue(undefined);

            const env = {
                id: '1',
                name: 'Globals',
                variables: [
                    { key: 'SECRET', value: 'plain-value', type: 'secret', enabled: true }
                ]
            };

            await encEnvManager.saveEnvironment('/path/to/globals.json', env as any);

            const writeCall = (fs.writeFile as any).mock.calls[0];
            const savedContent = JSON.parse(writeCall[1]);
            // Sin projectPath, no se encripta
            expect(savedContent.variables[0].value).toBe('plain-value');
        });

        it('should load and decrypt environment with projectPath', async () => {

            const { CryptoService } = await import('@/main/services/CryptoService');
            const crypto = new CryptoService();
            const key = crypto.generateRandomKey();
            const encrypted = crypto.encrypt('my-secret-value', key);

            // Mock environment.key con la llave generada
            (fs.readFile as any).mockImplementation((filePath: string) => {
                if (filePath === KEY_PATH) {
                    return Promise.resolve(key.toString('base64'));
                }
                // El environment file con valor encriptado
                return Promise.resolve(JSON.stringify({
                    id: '1',
                    name: 'Test',
                    variables: [
                        { key: 'API_KEY', value: encrypted, type: 'secret', enabled: true }
                    ]
                }));
            });

            const result = await encEnvManager.loadEnvironment('/path/to/env.json', PROJECT_PATH);
            expect(result.variables[0].value).toBe('my-secret-value');
        });

        it('should load environment without encryption (backwards compatibility)', async () => {
            (fs.readFile as any).mockResolvedValue(JSON.stringify({
                id: '1',
                name: 'Old Env',
                variables: [
                    { key: 'URL', value: 'https://old.api.com', type: 'default', enabled: true }
                ]
            }));

            const result = await encEnvManager.loadEnvironment('/path/to/env.json', PROJECT_PATH);
            expect(result.variables[0].value).toBe('https://old.api.com');
        });

        it('should prevent double encryption', async () => {

            const { CryptoService } = await import('@/main/services/CryptoService');
            const crypto = new CryptoService();
            const key = crypto.generateRandomKey();
            const alreadyEncrypted = crypto.encrypt('secret', key);

            (fs.readFile as any).mockImplementation((filePath: string) => {
                if (filePath === KEY_PATH) {
                    return Promise.resolve(key.toString('base64'));
                }
                return Promise.reject(new Error('Not found'));
            });
            (fs.access as any).mockResolvedValue(undefined); // Para denotar que ya existe
            (fs.writeFile as any).mockResolvedValue(undefined);

            const env = {
                id: '1',
                name: 'Test',
                variables: [
                    { key: 'API_KEY', value: alreadyEncrypted, type: 'secret', enabled: true }
                ]
            };

            await encEnvManager.saveEnvironment('/path/to/env.json', env as any, PROJECT_PATH);

            const writeCall = (fs.writeFile as any).mock.calls.find(
                (c: any[]) => c[0] === '/path/to/env.json'
            );
            const savedContent = JSON.parse(writeCall[1]);
            // No debe haber doble encriptación — el valor debe ser el mismo
            expect(savedContent.variables[0].value).toBe(alreadyEncrypted);
        });

        it('should throw error if project environment is missing environment.key', async () => {
            const { CryptoService } = await import('@/main/services/CryptoService');
            const crypto = new CryptoService();
            const fakeKey = crypto.generateRandomKey();
            const encrypted = crypto.encrypt('my-secret-value', fakeKey);

            (fs.readFile as any).mockImplementation((filePath: string) => {
                if (filePath === KEY_PATH) {
                    return Promise.reject(new Error('Not found')); // Simulation key lost
                }
                return Promise.resolve(JSON.stringify({
                    id: '1',
                    name: 'Test',
                    variables: [
                        { key: 'API_KEY', value: encrypted, type: 'secret', enabled: true }
                    ]
                }));
            });

            await expect(encEnvManager.loadEnvironment('/path/to/env.json', PROJECT_PATH))
                .rejects.toThrow('MISSING_ENVIRONMENT_KEY');
        });
    });
});

