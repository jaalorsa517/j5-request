import { describe, it, expect, vi } from 'vitest';
import { EnvironmentManager } from './EnvironmentManager';
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
});
