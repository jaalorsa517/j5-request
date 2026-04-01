import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportService } from '@/main/services/ExportService';
import { J5Request } from '@/shared/types';
import { clipboard } from 'electron';
import fs from 'fs/promises';

vi.mock('electron', () => ({
    clipboard: {
        writeText: vi.fn()
    }
}));
vi.mock('fs/promises');

describe('ExportService', () => {
    let service: ExportService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new ExportService();
    });

    const mockRequest: J5Request = {
        id: '1',
        name: 'Test Request',
        method: 'POST',
        url: 'https://api.example.com/data',
        headers: { 'X-Test': 'Value' },
        params: {},
        body: { type: 'json', content: { foo: 'bar' } },
        preRequestScript: '',
        postResponseScript: ''
    };

    describe('generateCurl', () => {
        it('should generate a basic curl command', () => {
            const curl = service.generateCurl(mockRequest);
            expect(curl).toContain("curl -X POST 'https://api.example.com/data'");
            expect(curl).toContain("-H 'X-Test: Value'");
            expect(curl).toContain("-d '{\"foo\":\"bar\"}'");
        });

        it('should handle SSL insecure flag', () => {
            const req = { ...mockRequest, sslConfig: { rejectUnauthorized: false } };
            const curl = service.generateCurl(req as any);
            expect(curl).toContain('-k');
            expect(curl).toContain('# CAUTION: SSL Verification Disabled');
        });

        it('should escape single quotes in shell command', () => {
            const req = { ...mockRequest, headers: { 'User': "O'Reilly" } };
            const curl = service.generateCurl(req as any);
            expect(curl).toContain("'User: O'\\''Reilly'");
        });

        it('should handle form-data body', () => {
            const req = {
                ...mockRequest,
                body: {
                    type: 'form-data',
                    content: { key: 'val', file: { path: '/tmp/test.txt' } }
                }
            };
            const curl = service.generateCurl(req as any);
            expect(curl).toContain("-F 'key=val'");
            expect(curl).toContain("-F 'file=@/tmp/test.txt'");
        });

        it('should warn about scripts in curl', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const req = { ...mockRequest, preRequestScript: 'console.log()' };
            service.generateCurl(req as any);
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('scripts are not supported'));
            consoleSpy.mockRestore();
        });
    });

    describe('generateFetch', () => {
        it('should generate basic fetch code', () => {
            const code = service.generateFetch(mockRequest);
            expect(code).toContain("fetch('https://api.example.com/data'");
            expect(code).toContain('"method": "POST"');
        });

        it('should handle form-data in fetch', () => {
            const req = {
                ...mockRequest,
                body: { type: 'form-data', content: { key: 'val' } }
            };
            const code = service.generateFetch(req as any);
            expect(code).toContain('const formData = new FormData()');
            expect(code).toContain("formData.append('key', 'val')");
        });
    });

    describe('generatePowerShell', () => {
        it('should generate Invoke-WebRequest command', () => {
            const ps = service.generatePowerShell(mockRequest);
            expect(ps).toContain('Invoke-WebRequest -Uri "https://api.example.com/data"');
            expect(ps).toContain("-Method POST");
            expect(ps).toContain('`"foo`":`"bar`"');
        });
    });

    describe('generatePostmanCollection', () => {
        it('should generate valid Postman v2.1 collection', () => {
            const collection = service.generatePostmanCollection([mockRequest]) as any;
            expect(collection.info.schema).toContain('collection.json');
            expect(collection.item[0].name).toBe('Test Request');
            expect(collection.item[0].request.header[0].key).toBe('X-Test');
        });
    });

    describe('generateInsomniaCollection', () => {
        it('should generate valid Insomnia v4 export', () => {
            const collection = service.generateInsomniaCollection([mockRequest]) as any;
            expect(collection.__export_format).toBe(4);
            const req = collection.resources.find((r: any) => r._type === 'request');
            expect(req.name).toBe('Test Request');
            expect(req.body.mimeType).toBe('application/json');
        });
    });

    describe('generateOpenAPI', () => {
        it('should generate valid OpenAPI 3.0.0 spec', () => {
            const metadata = { title: 'Test API', version: '1.0.0' };
            const spec = service.generateOpenAPI([mockRequest], metadata) as any;
            expect(spec.openapi).toBe('3.0.0');
            expect(spec.info.title).toBe('Test API');
            expect(spec.paths['/data'].post).toBeDefined();
        });

        it('should throw error for invalid OpenAPI metadata', () => {
            expect(() => service.generateOpenAPI([], {} as any)).toThrow('missing required "info" fields');
        });

        it('should handle invalid URLs gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const invalidReq = { ...mockRequest, url: 'invalid-url' };
            service.generateOpenAPI([invalidReq as any], { title: 'T', version: '1' });
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Skipping invalid URL'),
                'invalid-url'
            );
            consoleSpy.mockRestore();
        });
    });

    describe('clipboard and file exports', () => {
        it('should write to clipboard', async () => {
            await service.exportToClipboard('content');
            expect(clipboard.writeText).toHaveBeenCalledWith('content');
        });

        it('should write to file', async () => {
            await service.exportToFile('content', '/path/to/file');
            expect(fs.writeFile).toHaveBeenCalledWith('/path/to/file', 'content', 'utf-8');
        });
    });

    describe('validation logic', () => {
        it('should throw error for circular references in JSON', () => {
            const circular: any = {};
            circular.self = circular;
            expect(() => (service as any).validateJSON(circular, 'Test')).toThrow('contains invalid JSON');
        });
    });
});
