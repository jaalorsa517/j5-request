import { describe, it, expect, beforeEach } from 'vitest';
import { ImportService } from '@/main/services/ImportService';

describe('ImportService', () => {
    let service: ImportService;

    beforeEach(() => {
        service = new ImportService();
    });

    describe('detectFormat', () => {
        it('should detect cURL', () => {
            const curl = "curl -X GET http://example.com";
            expect(service.detectFormat(curl).format).toBe('curl');
        });

        it('should detect OpenAPI JSON', () => {
            const json = JSON.stringify({ openapi: '3.0.0', paths: {} });
            expect(service.detectFormat(json).format).toBe('openapi');
        });

        it('should detect Postman Collection', () => {
            const json = JSON.stringify({ info: { schema: 'postman' }, item: [] });
            expect(service.detectFormat(json).format).toBe('postman');
        });

        it('should detect Insomnia Export', () => {
            const json = JSON.stringify({ _type: 'export', resources: [] });
            expect(service.detectFormat(json).format).toBe('insomnia');
        });

        it('should detect Fetch', () => {
            const code = "fetch('http://example.com', { method: 'GET' })";
            expect(service.detectFormat(code).format).toBe('fetch');
        });

        it('should detect PowerShell', () => {
            const code = "Invoke-WebRequest -Uri http://example.com";
            expect(service.detectFormat(code).format).toBe('powershell');
        });
    });

    describe('parseCurl', () => {
        it('should parse basic GET', () => {
            const curl = "curl http://example.com";
            const result = service.parseCurl(curl);
            expect(result.method).toBe('GET');
            // curlconverter puede o no agregar trailing slash dependiendo de la versión/input
            expect(result.url.replace(/\/$/, '')).toBe('http://example.com');
        });

        it('should parse POST with JSON body', () => {
            const curl = `curl -X POST http://api.com -H "Content-Type: application/json" -d '{"foo":"bar"}'`;
            const result = service.parseCurl(curl);
            expect(result.method).toBe('POST');
            expect(result.headers['Content-Type']).toBe('application/json');
            expect(result.body?.type).toBe('json');
            expect((result.body?.content as any).foo).toBe('bar');
        });
    });

    describe('parseFetch', () => {
        it('should parse fetch call', () => {
            const code = `
                fetch('https://api.example.com/data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ "id": 123 })
                })
            `;
            const result = service.parseFetch(code);
            expect(result.method).toBe('POST');
            expect(result.url).toBe('https://api.example.com/data');
            expect(result.headers['Content-Type']).toBe('application/json');
            expect((result.body?.content as any).id).toBe(123);
        });
    });

    describe('Validation', () => {
        it('should throw error for invalid OpenAPI spec', () => {
            expect(() => service.parseOpenAPI('invalid')).toThrow();
        });

        it('should throw error for invalid Postman collection', () => {
            expect(() => service.parsePostman('invalid')).toThrow();
        });
    });

    describe('parseOpenAPI', () => {
        it('should parse basic OpenAPI JSON', () => {
            const spec = {
                openapi: '3.0.0',
                paths: {
                    '/users': {
                        get: {
                            summary: 'Get Users',
                            responses: {}
                        }
                    }
                }
            };
            const results = service.parseOpenAPI(spec);
            expect(results).toHaveLength(1);
            expect(results[0].method).toBe('GET');
            expect(results[0].url).toContain('/users');
        });
    });

    describe('parsePostman', () => {
        it('should parse Postman collection', () => {
            const collection = {
                info: { name: 'Test' },
                item: [
                    {
                        name: 'Get User',
                        request: {
                            method: 'GET',
                            url: { raw: 'http://api.com/user' }
                        }
                    }
                ]
            };
            const results = service.parsePostman(collection);
            expect(results).toHaveLength(1);
            expect(results[0].method).toBe('GET');
            expect(results[0].url).toBe('http://api.com/user');
        });
    });

    describe('parsePowerShell', () => {
        it('should parse Invoke-WebRequest', () => {
            const code = `Invoke-WebRequest -Uri "http://api.com" -Method POST -Body '{"a":1}'`;
            const result = service.parsePowerShell(code);
            expect(result.method).toBe('POST');
            expect(result.url).toBe('http://api.com');
            expect((result.body?.content as any).a).toBe(1);
        });
    });
});
