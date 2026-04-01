import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportService } from '@/main/services/ExportService';
import { J5Request } from '@/shared/types';
import { clipboard } from 'electron';
import fs from 'fs/promises';

vi.mock('electron', () => ({
    clipboard: { writeText: vi.fn() }
}));
vi.mock('fs/promises');

describe('ExportService Final Push', () => {
    let service: ExportService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new ExportService();
    });

    const baseReq: J5Request = {
        id: '1', name: 'T', method: 'POST', url: 'https://api.com/v1',
        headers: { 'h': "v'", 'X-S': 's' }, params: { 'p': 'q' }, 
        body: { type: 'json', content: { a: 1 } },
        preRequestScript: 's', postResponseScript: 's'
    };

    it('covers curl complex paths', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const res = service.generateCurl(baseReq);
        expect(res).toContain("-X POST");
        expect(res).toContain("'h: v'\\'''");
        expect(consoleSpy).toHaveBeenCalled();

        const form = service.generateCurl({
            ...baseReq, body: { type: 'form-data', content: { f: { path: 'p' } } }
        } as any);
        expect(form).toContain("-F 'f=@p'");

        expect(service.generateCurl({ ...baseReq, method: 'GET', body: undefined } as any)).not.toContain("-d");
        expect(service.generateCurl({ ...baseReq, sslConfig: { rejectUnauthorized: false } } as any)).toContain("-k");
        consoleSpy.mockRestore();
    });

    it('covers fetch and powershell branches', () => {
        expect(service.generateFetch({ ...baseReq, body: { type: 'raw', content: 'txt' } } as any)).toContain('"body": "txt"');
        expect(service.generateFetch({ ...baseReq, method: 'HEAD' } as any)).not.toContain('"body"');
        expect(service.generateFetch({ ...baseReq, body: { type: 'form-data', content: { a: 'b' } } } as any)).toContain('new FormData()');

        expect(service.generatePowerShell(baseReq)).toContain('Invoke-WebRequest');
        const psJson = service.generatePowerShell({ ...baseReq, body: { type: 'json', content: {x:1} } } as any);
        expect(psJson).toContain("-Body");
    });

    it('covers collections generation fully', () => {
        const reqs = [baseReq, { ...baseReq, method: 'GET', body: undefined }];
        expect(service.generatePostmanCollection(reqs as any)).toBeDefined();
        expect(service.generateInsomniaCollection(reqs as any)).toBeDefined();
        const openapi = service.generateOpenAPI(reqs as any, { title: 'T', version: '1' }) as any;
        expect(openapi.info.title).toBe('T');
    });

    it('covers all validation and error paths', () => {
        // OpenAPI
        expect(() => (service as any).validateOpenAPI({})).toThrow();
        expect(() => (service as any).validateOpenAPI({ openapi: '3', info: { title: 'T', version: '1' } })).toThrow();

        // JSON
        const circular: any = {}; circular.s = circular;
        expect(() => (service as any).validateJSON(circular, 'T')).toThrow();
        expect(() => (service as any).validateJSON(null, 'T')).not.toThrow();

        // Curl
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        (service as any).validateCurlCommand("curl 'unbalanced");
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('covers clipboard and file exports', async () => {
        await service.exportToClipboard('txt');
        expect(clipboard.writeText).toHaveBeenCalledWith('txt');
        await service.exportToFile('txt', 'path');
        expect(fs.writeFile).toHaveBeenCalled();
    });
});
