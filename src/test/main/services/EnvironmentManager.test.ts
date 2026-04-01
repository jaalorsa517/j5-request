import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnvironmentManager } from '@/main/services/EnvironmentManager';
import fs from 'fs/promises';
import path from 'path';

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
            const result = envManager.resolveVariables(template, variables);
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
            const filePath = path.join('path', 'to', 'env.json');
            const mockContent = '{"name": "test", "variables": []}';
            (fs.readFile as any).mockResolvedValue(mockContent);

            const env = await envManager.loadEnvironment(filePath);

            expect(env).toEqual({ name: "test", variables: [] });
            expect(fs.readFile).toHaveBeenCalledWith(filePath, 'utf-8');
        });
    });

    describe('saveEnvironment', () => {
        it('should serialize and write environment file', async () => {
            const filePath = path.join('path', 'to', 'env.json');
            const env = { id: '1', name: 'test', variables: [] };
            await envManager.saveEnvironment(filePath, env);

            expect(fs.writeFile).toHaveBeenCalledWith(
                filePath,
                expect.stringContaining('"name": "test"'),
                'utf-8'
            );
        });
    });

    describe('encryption integration', () => {
        const PROJECT_PATH = path.normalize('/test/project');
        const KEY_PATH = path.join(PROJECT_PATH, 'environment.key');
        const ENV_PATH = path.join('path', 'to', 'env.json');
        const encEnvManager = new EnvironmentManager();

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it('should encrypt secret variables on save with projectPath', async () => {
            (fs.readFile as any).mockRejectedValue(new Error('Not found'));
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

            await encEnvManager.saveEnvironment(ENV_PATH, env as any, PROJECT_PATH);

            const writeKeyCall = (fs.writeFile as any).mock.calls.find(
                (c: any[]) => path.normalize(c[0]) === path.normalize(KEY_PATH)
            );
            expect(writeKeyCall).toBeDefined();

            const writeEnvCall = (fs.writeFile as any).mock.calls.find(
                (c: any[]) => path.normalize(c[0]) === path.normalize(ENV_PATH)
            );
            expect(writeEnvCall).toBeDefined();

            const savedContent = JSON.parse(writeEnvCall[1]);
            expect(savedContent.variables[0].value).toBe('https://api.com');
            expect(savedContent.variables[1].value).toMatch(/^ENC\[AES256_GCM:/);
        });

        it('should load and decrypt environment with projectPath', async () => {
            const { CryptoService } = await import('@/main/services/CryptoService');
            const crypto = new CryptoService();
            const key = crypto.generateRandomKey();
            const encrypted = crypto.encrypt('my-secret-value', key);

            (fs.readFile as any).mockImplementation((filePath: string) => {
                const normPath = path.normalize(filePath);
                if (normPath === path.normalize(KEY_PATH)) {
                    return Promise.resolve(key.toString('base64'));
                }
                if (normPath === path.normalize(ENV_PATH)) {
                    return Promise.resolve(JSON.stringify({
                        id: '1',
                        name: 'Test',
                        variables: [
                            { key: 'API_KEY', value: encrypted, type: 'secret', enabled: true }
                        ]
                    }));
                }
                return Promise.reject(new Error('Not found'));
            });

            const result = await encEnvManager.loadEnvironment(ENV_PATH, PROJECT_PATH);
            expect(result.variables[0].value).toBe('my-secret-value');
        });

        it('should throw error if project environment is missing environment.key', async () => {
            const { CryptoService } = await import('@/main/services/CryptoService');
            const crypto = new CryptoService();
            const fakeKey = crypto.generateRandomKey();
            const encrypted = crypto.encrypt('my-secret-value', fakeKey);

            (fs.readFile as any).mockImplementation((filePath: string) => {
                const normPath = path.normalize(filePath);
                if (normPath === path.normalize(KEY_PATH)) {
                    return Promise.reject(new Error('Not found'));
                }
                return Promise.resolve(JSON.stringify({
                    id: '1',
                    name: 'Test',
                    variables: [
                        { key: 'API_KEY', value: encrypted, type: 'secret', enabled: true }
                    ]
                }));
            });

            await expect(encEnvManager.loadEnvironment(ENV_PATH, PROJECT_PATH))
                .rejects.toThrow('MISSING_ENVIRONMENT_KEY');
        });
    });
});
