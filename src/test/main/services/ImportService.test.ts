import { describe, it, expect, beforeEach } from 'vitest';
import { ImportService } from '@/main/services/ImportService';

describe('ImportService Final Depth Validation', () => {
    let service: ImportService;

    beforeEach(() => {
        service = new ImportService();
    });

    it('detects all supported formats correctly', () => {
        expect(service.detectFormat('curl http://a.com').format).toBe('curl');
        expect(service.detectFormat('{"info":{"schema":"v"},"item":[]}').format).toBe('postman');
        expect(service.detectFormat('{"resources":[]}').format).toBe('insomnia');
        expect(service.detectFormat('{"openapi":"3","paths":{}}').format).toBe('openapi');
        expect(service.detectFormat('openapi: 3').format).toBe('openapi');
        expect(service.detectFormat('fetch("u", { method: "POST" })').format).toBe('fetch');
        expect(service.detectFormat('Invoke-WebRequest -Uri u').format).toBe('powershell');
        expect(service.detectFormat('invalid').format).toBeNull();
    });

    it('parses cURL correctly', () => {
        const res = service.parseCurl("curl http://a.com -d '{\"x\":1}'");
        expect(res.url).toBe('http://a.com/');
        expect(res.body?.content).toEqual({ x: 1 });
    });

    it('parses Postman with deep nesting and all modes', () => {
        const postman = {
            info: { schema: 'v2.1.0' },
            item: [{
                name: 'Folder',
                item: [
                    { name: 'R1', request: { url: 'u1', method: 'GET', header: { 'h': 'v' } } },
                    { name: 'R2', request: { method: 'POST', body: { mode: 'formdata', formdata: [{key:'k', value:'v'}] } } },
                    { name: 'R3', request: { method: 'POST', body: { mode: 'urlencoded', urlencoded: [{key:'k', value:'v'}] } } }
                ]
            }]
        };
        const result = service.parsePostman(JSON.stringify(postman));
        expect(result).toHaveLength(3);
        expect(result[0].headers['h']).toBe('v');
        expect(result[1].body?.type).toBe('form-data');
    });

    it('parses Insomnia with full resource graph', () => {
        const insomnia = {
            resources: [
                { _id: 'w', _type: 'workspace' },
                { _id: 'f', _type: 'request_group', parentId: 'w' },
                { _id: 'r1', _type: 'request', parentId: 'f', name: 'R1', method: 'GET', url: 'u?q=1', headers: [{name:'h', value:'v'}] },
                { _id: 'r2', _type: 'request', parentId: 'w', name: 'R2', method: 'POST', url: 'u2', body: { text: '{}', mimeType: 'application/json' } }
            ]
        };
        const result = service.parseInsomnia(JSON.stringify(insomnia));
        expect(result).toHaveLength(2);
        expect(result[0].url).toContain('q=1');
        expect(result[1].body?.type).toBe('json');
    });

    it('parses Fetch and PowerShell', () => {
        expect(service.parseFetch('fetch("u", {method:"PUT"})').method).toBe('PUT');
        expect(service.parsePowerShell('Invoke-RestMethod -Uri u -Method Delete').method).toBe('DELETE');
    });

    it('parses OpenAPI successfully', async () => {
        const spec = {
            openapi: '3.0.0',
            info: { title: 'T', version: '1' },
            paths: { '/u': { get: { responses: { '200': { description: 'ok' } } } } }
        };
        const result = await service.parseOpenAPI(JSON.stringify(spec));
        expect(result).toHaveLength(1);
    });

    it('covers deep nesting and raw body fallback', () => {
        const postmanDeep = {
            info: { schema: 'v2.1.0' },
            item: [{
                name: 'L1',
                item: [{
                    name: 'L2',
                    item: [{
                        name: 'L3',
                        item: [{ name: 'R', request: { url: 'u', method: 'GET', body: { mode: 'raw', raw: 'txt' } } }]
                    }]
                }]
            }]
        };
        const result = service.parsePostman(JSON.stringify(postmanDeep));
        expect(result).toHaveLength(1);
        expect(result[0].body?.type).toBe('raw');
    });
});
