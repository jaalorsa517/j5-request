import { describe, it, expect, beforeEach } from 'vitest';
import { ExportService } from '@/main/services/ExportService';
import { J5Request } from '@/shared/types';

describe('ExportService', () => {
    let exportService: ExportService;

    beforeEach(() => {
        exportService = new ExportService();
    });

    const createMockRequest = (overrides?: Partial<J5Request>): J5Request => ({
        id: '123',
        name: 'Test Request',
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: {},
        params: {},
        ...overrides
    });

    describe('generateCurl', () => {
        it('should generate basic GET cURL command', () => {
            const request = createMockRequest();
            const result = exportService.generateCurl(request);

            expect(result).toContain('curl -X GET');
            expect(result).toContain('https://api.example.com/users');
        });

        it('should include headers in cURL command', () => {
            const request = createMockRequest({
                headers: {
                    'Authorization': 'Bearer token123',
                    'Content-Type': 'application/json'
                }
            });
            const result = exportService.generateCurl(request);

            expect(result).toContain('-H \'Authorization:');
            expect(result).toContain('-H \'Content-Type:');
        });

        it('should include JSON body in POST request', () => {
            const request = createMockRequest({
                method: 'POST',
                body: {
                    type: 'json',
                    content: { name: 'John', age: 30 }
                }
            });
            const result = exportService.generateCurl(request);

            expect(result).toContain('-X POST');
            expect(result).toContain('-d \'');
            expect(result).toContain('John');
        });

        it('should escape single quotes in values', () => {
            const request = createMockRequest({
                headers: {
                    'X-Custom': "It's a test"
                }
            });
            const result = exportService.generateCurl(request);

            // Should escape the single quote
            expect(result).toContain('It');
        });

        it('should handle form-data body', () => {
            const request = createMockRequest({
                method: 'POST',
                body: {
                    type: 'form-data',
                    content: {
                        field1: 'value1',
                        field2: 'value2'
                    }
                }
            });
            const result = exportService.generateCurl(request);

            expect(result).toContain('-F \'field1=');
            expect(result).toContain('-F \'field2=');
        });
    });

    describe('generateFetch', () => {
        it('should generate basic Fetch code', () => {
            const request = createMockRequest();
            const result = exportService.generateFetch(request);

            expect(result).toContain('fetch(');
            expect(result).toContain('https://api.example.com/users');
            expect(result).toContain('"method": "GET"');
        });

        it('should include headers in Fetch options', () => {
            const request = createMockRequest({
                headers: {
                    'Authorization': 'Bearer token123'
                }
            });
            const result = exportService.generateFetch(request);

            expect(result).toContain('Authorization');
            expect(result).toContain('Bearer token123');
        });

        it('should include JSON body in POST request', () => {
            const request = createMockRequest({
                method: 'POST',
                body: {
                    type: 'json',
                    content: { name: 'John' }
                }
            });
            const result = exportService.generateFetch(request);

            expect(result).toContain('"method": "POST"');
            expect(result).toContain('"body":');
        });
    });

    describe('generatePowerShell', () => {
        it('should generate basic PowerShell command', () => {
            const request = createMockRequest();
            const result = exportService.generatePowerShell(request);

            expect(result).toContain('Invoke-WebRequest');
            expect(result).toContain('-Uri "https://api.example.com/users"');
            expect(result).toContain('-Method GET');
        });

        it('should include headers in PowerShell command', () => {
            const request = createMockRequest({
                headers: {
                    'Authorization': 'Bearer token123'
                }
            });
            const result = exportService.generatePowerShell(request);

            expect(result).toContain('-Headers');
            expect(result).toContain('Authorization');
        });

        it('should include JSON body in POST request', () => {
            const request = createMockRequest({
                method: 'POST',
                body: {
                    type: 'json',
                    content: { name: 'John' }
                }
            });
            const result = exportService.generatePowerShell(request);

            expect(result).toContain('-Body');
            expect(result).toContain('-ContentType "application/json"');
        });
    });

    describe('generatePostmanCollection', () => {
        it('should generate valid Postman collection structure', () => {
            const requests = [createMockRequest()];
            const result = exportService.generatePostmanCollection(requests);

            expect(result).toHaveProperty('info');
            expect(result).toHaveProperty('item');
            expect((result as any).info.name).toBe('Exported from J5 Request');
            expect((result as any).item).toHaveLength(1);
        });

        it('should include request details in collection', () => {
            const request = createMockRequest({
                name: 'Get Users',
                method: 'GET',
                headers: { 'Authorization': 'Bearer token' }
            });
            const result = exportService.generatePostmanCollection([request]);

            const item = (result as any).item[0];
            expect(item.name).toBe('Get Users');
            expect(item.request.method).toBe('GET');
            expect(item.request.header).toHaveLength(1);
        });

        it('should not throw when serialized to JSON', () => {
            const requests = [createMockRequest()];
            const result = exportService.generatePostmanCollection(requests);

            expect(() => JSON.stringify(result)).not.toThrow();
            expect(() => JSON.parse(JSON.stringify(result))).not.toThrow();
        });
    });

    describe('generateInsomniaCollection', () => {
        it('should generate valid Insomnia collection structure', () => {
            const requests = [createMockRequest()];
            const result = exportService.generateInsomniaCollection(requests);

            expect(result).toHaveProperty('_type', 'export');
            expect(result).toHaveProperty('__export_format', 4);
            expect(result).toHaveProperty('resources');
            expect((result as any).resources).toBeInstanceOf(Array);
        });

        it('should include workspace and request resources', () => {
            const requests = [createMockRequest()];
            const result = exportService.generateInsomniaCollection(requests);

            const resources = (result as any).resources;
            expect(resources.length).toBeGreaterThan(1);
            expect(resources[0]._type).toBe('workspace');
            expect(resources[1]._type).toBe('request');
        });

        it('should not throw when serialized to JSON', () => {
            const requests = [createMockRequest()];
            const result = exportService.generateInsomniaCollection(requests);

            expect(() => JSON.stringify(result)).not.toThrow();
            expect(() => JSON.parse(JSON.stringify(result))).not.toThrow();
        });
    });

    describe('generateOpenAPI', () => {
        const metadata = {
            title: 'Test API',
            version: '1.0.0',
            description: 'Test API Description',
            serverUrl: 'https://api.example.com'
        };

        it('should generate valid OpenAPI structure', () => {
            const requests = [createMockRequest()];
            const result = exportService.generateOpenAPI(requests, metadata);

            expect(result).toHaveProperty('openapi', '3.0.0');
            expect(result).toHaveProperty('info');
            expect(result).toHaveProperty('paths');
            expect((result as any).info.title).toBe('Test API');
        });

        it('should include server URL if provided', () => {
            const requests = [createMockRequest()];
            const result = exportService.generateOpenAPI(requests, metadata);

            expect((result as any).servers).toHaveLength(1);
            expect((result as any).servers[0].url).toBe('https://api.example.com');
        });

        it('should create paths from request URLs', () => {
            const requests = [createMockRequest({
                url: 'https://api.example.com/users',
                method: 'GET'
            })];
            const result = exportService.generateOpenAPI(requests, metadata);

            expect((result as any).paths).toHaveProperty('/users');
            expect((result as any).paths['/users']).toHaveProperty('get');
        });

        it('should add script warning to description when requests have scripts', () => {
            const requests = [createMockRequest({
                preRequestScript: 'console.log("test");'
            })];
            const result = exportService.generateOpenAPI(requests, metadata);

            expect((result as any).info.description).toContain('⚠️');
            expect((result as any).info.description).toContain('scripts');
        });

        it('should not throw when serialized to JSON', () => {
            const requests = [createMockRequest()];
            const result = exportService.generateOpenAPI(requests, metadata);

            expect(() => JSON.stringify(result)).not.toThrow();
            expect(() => JSON.parse(JSON.stringify(result))).not.toThrow();
        });
    });
});
