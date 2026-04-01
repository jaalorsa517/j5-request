import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImportService } from '@/main/services/ImportService';

describe('ImportService', () => {
    let service: ImportService;

    beforeEach(() => {
        service = new ImportService();
    });

    describe('detectFormat', () => {
        it('should detect cURL', () => {
            expect(service.detectFormat('curl https://api.com')).toEqual({ format: 'curl', confidence: 0.95 });
        });

        it('should detect Postman collection', () => {
            const postman = JSON.stringify({ info: { schema: 'v2.1' }, item: [] });
            expect(service.detectFormat(postman)).toEqual({ format: 'postman', confidence: 0.9 });
        });

        it('should detect Insomnia collection', () => {
            const insomnia = JSON.stringify({ resources: [{ _type: 'request' }] });
            expect(service.detectFormat(insomnia)).toEqual({ format: 'insomnia', confidence: 0.9 });
        });

        it('should detect OpenAPI JSON', () => {
            const openapi = JSON.stringify({ openapi: '3.0.0', paths: {} });
            expect(service.detectFormat(openapi)).toEqual({ format: 'openapi', confidence: 0.95 });
        });

        it('should detect OpenAPI YAML', () => {
            expect(service.detectFormat('openapi: 3.0.0\npaths: {}')).toEqual({ format: 'openapi', confidence: 0.8 });
        });

        it('should detect Fetch', () => {
            expect(service.detectFormat('fetch("url", { method: "GET" })')).toEqual({ format: 'fetch', confidence: 0.7 });
        });

        it('should detect PowerShell', () => {
            expect(service.detectFormat('Invoke-WebRequest -Uri "url"')).toEqual({ format: 'powershell', confidence: 0.8 });
        });

        it('should return null for unknown content', () => {
            expect(service.detectFormat('just some text')).toEqual({ format: null, confidence: 0 });
        });
    });

    describe('parseCurl', () => {
        it('should parse basic curl command', () => {
            const curl = "curl -X POST 'https://api.com/v1/users?a=1' -H 'Authorization: Bearer token' -d '{\"name\":\"test\"}'";
            const result = service.parseCurl(curl);
            expect(result.method).toBe('POST');
            expect(result.url).toBe('https://api.com/v1/users');
            expect(result.headers).toHaveProperty('Authorization', 'Bearer token');
            expect(result.queryParams).toHaveProperty('a', '1');
            expect(result.body?.content).toEqual({ name: 'test' });
        });

        it('should throw error if no URL found', () => {
            expect(() => service.parseCurl('curl -X GET')).toThrow('No URL found');
        });
    });

    describe('parseOpenAPI', () => {
        it('should parse simple OpenAPI JSON', () => {
            const spec = {
                openapi: '3.0.0',
                servers: [{ url: 'https://api.com' }],
                paths: {
                    '/users': {
                        get: { summary: 'List Users' }
                    }
                }
            };
            const result = service.parseOpenAPI(spec);
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('List Users');
            expect(result[0].url).toBe('https://api.com/users');
        });

        it('should parse OpenAPI YAML string', () => {
            const yaml = `
openapi: 3.0.0
paths:
  /test:
    post:
      summary: Test
`;
            const result = service.parseOpenAPI(yaml);
            expect(result[0].name).toBe('Test');
        });

        it('should throw error for invalid format', () => {
            expect(() => service.parseOpenAPI('!!! invalid yaml')).toThrow('Invalid OpenAPI format');
        });
    });

    describe('parsePostman', () => {
        it('should parse Postman v2.1 collection', () => {
            const col = {
                info: { name: 'Col' },
                item: [
                    {
                        name: 'Req 1',
                        request: {
                            method: 'GET',
                            url: { raw: 'https://api.com/test', query: [{ key: 'p', value: '1' }] },
                            header: [{ key: 'H', value: 'V' }],
                            body: { mode: 'raw', raw: '{"a":1}' }
                        }
                    }
                ]
            };
            const result = service.parsePostman(col);
            expect(result[0].name).toBe('Req 1');
            expect(result[0].queryParams).toHaveProperty('p', '1');
            expect(result[0].body?.type).toBe('json');
        });
    });

    describe('parseInsomnia', () => {
        it('should parse Insomnia export', () => {
            const exp = {
                resources: [
                    {
                        _type: 'request',
                        name: 'Req 1',
                        method: 'PUT',
                        url: 'https://api.com',
                        headers: [{ name: 'H', value: 'V' }],
                        body: { mimeType: 'application/json', text: '{"ok":true}' }
                    }
                ]
            };
            const result = service.parseInsomnia(exp);
            expect(result[0].name).toBe('Req 1');
            expect(result[0].method).toBe('PUT');
            expect(result[0].body?.content).toEqual({ ok: true });
        });
    });

    describe('parseFetch', () => {
        it('should parse simple fetch code', () => {
            const code = "fetch('https://api.com/data?q=test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ a: 1 }) })";
            const result = service.parseFetch(code);
            expect(result.method).toBe('POST');
            expect(result.url).toBe('https://api.com/data');
            expect(result.queryParams).toHaveProperty('q', 'test');
            expect(result.headers).toHaveProperty('Content-Type', 'application/json');
        });
    });

    describe('parsePowerShell', () => {
        it('should parse Invoke-WebRequest', () => {
            const code = 'Invoke-WebRequest -Uri "https://api.com/res" -Method "DELETE" -Headers @{ "Auth" = "123" }';
            const result = service.parsePowerShell(code);
            expect(result.method).toBe('DELETE');
            expect(result.url).toBe('https://api.com/res');
            expect(result.headers).toHaveProperty('Auth', '123');
        });
    });

    describe('importFromContent', () => {
        it('should import from curl automatically', async () => {
            const result = await service.importFromContent('curl https://api.com');
            expect(result.success).toBe(true);
            expect(result.requests).toHaveLength(1);
            expect(result.requests[0].url).toBe('https://api.com/');
        });

        it('should handle explicit format', async () => {
            const result = await service.importFromContent('https://api.com', { format: 'fetch' });
            // Although it's just a URL, parseFetch will try to extract what it can
            expect(result.requests).toHaveLength(1);
        });

        it('should return error for unsupported format', async () => {
            const result = await service.importFromContent('text', { format: 'unknown' as any });
            expect(result.success).toBe(false);
            expect(result.errors[0]).toContain('Unsupported format');
        });

        it('should return error if detection fails', async () => {
            const result = await service.importFromContent('just text');
            expect(result.success).toBe(false);
            expect(result.errors[0]).toContain('Could not detect format');
        });
    });
});
