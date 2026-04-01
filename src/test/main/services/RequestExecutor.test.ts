import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestExecutor, NativeHttpClient } from '@/main/services/RequestExecutor';
import { EventEmitter } from 'events';
import http from 'http';
import https from 'https';
import fsPromises from 'fs/promises';

vi.mock('http');
vi.mock('https');
vi.mock('fs/promises');

describe('RequestExecutor Definitive Tests', () => {
    let executor: RequestExecutor;
    let mockScriptExec: any;
    let mockEnvManager: any;
    let mockHttpClient: any;

    const mockResponse = (status: number, data: any) => {
        const resMock = new EventEmitter() as any;
        resMock.statusCode = status;
        resMock.headers = {};
        const reqMock = new EventEmitter() as any;
        reqMock.write = vi.fn();
        reqMock.end = vi.fn().mockImplementation(() => {
            process.nextTick(() => {
                if (data) resMock.emit('data', Buffer.from(typeof data === 'string' ? data : JSON.stringify(data)));
                resMock.emit('end');
            });
        });
        (http.request as any).mockImplementation((_u:any, _o:any, cb:any) => {
            cb(resMock);
            return reqMock;
        });
        (https.request as any).mockImplementation((_u:any, _o:any, cb:any) => {
            cb(resMock);
            return reqMock;
        });
        return { req: reqMock, res: resMock };
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockScriptExec = {
            execute: vi.fn().mockReturnValue({ success: true, environment: {} })
        };
        mockEnvManager = {
            resolveVariables: vi.fn((s) => s)
        };
        mockHttpClient = new NativeHttpClient();
        executor = new RequestExecutor(mockScriptExec, mockEnvManager, mockHttpClient);
    });

    it('handles successful execution with scripts', async () => {
        mockResponse(200, 'ok');
        const req = { url: 'http://a.com', preRequestScript: 'pre', postResponseScript: 'post' };
        const result = await executor.executeRequest(req as any, {});
        
        expect(result.success).toBe(true);
        expect(mockScriptExec.execute).toHaveBeenCalledTimes(2);
    });

    it('aborts on pre-request script failure', async () => {
        mockScriptExec.execute.mockReturnValueOnce({ success: false, error: 'pre-fail' });
        const result = await executor.executeRequest({ preRequestScript: 's', url: 'u' } as any, {});
        expect(result.success).toBe(false);
        expect(result.error).toContain('pre-fail');
    });

    it('covers SSL configuration branches in NativeHttpClient', async () => {
        (fsPromises.readFile as any).mockResolvedValue(Buffer.from('pem'));
        mockResponse(200, 'ok');
        
        const result = await mockHttpClient.request({
            method: 'GET',
            url: 'https://api.com',
            headers: {},
            sslConfig: { ca: ['ca.pem'], clientCert: 'c.pem', clientKey: 'k.pem' }
        });
        
        expect(result.status).toBe(200);
        expect(https.request).toHaveBeenCalled();
    });

    it('covers body resolution branches', async () => {
        mockResponse(200, 'ok');
        
        // JSON Body
        await executor.executeRequest({ 
            url: 'u', method: 'POST', body: { type: 'json', content: '{"a": "{{v}}"}' } 
        } as any, { v: '1' });
        
        // FormData Body with resolved variables and files (triggers pipe)
        (fsPromises.readFile as any).mockResolvedValue(Buffer.from('file-content'));
        await executor.executeRequest({ 
            url: 'u', method: 'POST', body: { type: 'form-data', content: { f: { type: 'file', path: 'p', name: 'n' }, k: '{{v}}' } } 
        } as any, { v: 'val' });
        
        // Body-less request
        await executor.executeRequest({ url: 'u', method: 'GET' } as any, {});

        expect(mockEnvManager.resolveVariables).toHaveBeenCalled();
    });

    it('covers NativeHttpClient edge cases', async () => {
        // Missing status codes
        const resMock = new EventEmitter() as any;
        resMock.headers = {};
        const reqMock = new EventEmitter() as any;
        reqMock.end = vi.fn().mockImplementation(() => {
            process.nextTick(() => resMock.emit('end'));
        });
        (http.request as any).mockImplementationOnce((_u:any, _o:any, cb:any) => {
            cb(resMock); return reqMock;
        });

        const result = await mockHttpClient.request({ method: 'GET', url: 'http://a.com', headers: {} });
        expect(result.status).toBe(0);
        expect(result.statusText).toBe('');
    });

    it('covers error branches in SSL and transport', async () => {
        // CA error
        (fsPromises.readFile as any).mockRejectedValueOnce(new Error('ca fail'));
        await expect(mockHttpClient.request({
            method: 'GET', url: 'https://a.com', headers: {}, sslConfig: { ca: ['bad'] }
        })).rejects.toThrow('Failed to load SSL certificates (CA)');

        // Cert error
        (fsPromises.readFile as any).mockRejectedValueOnce(new Error('cert fail'));
        await expect(mockHttpClient.request({
            method: 'GET', url: 'https://a.com', headers: {}, sslConfig: { clientCert: 'bad' }
        })).rejects.toThrow('Failed to load SSL certificates (Cert)');

        // Key error
        (fsPromises.readFile as any).mockRejectedValueOnce(new Error('key fail'));
        await expect(mockHttpClient.request({
            method: 'GET', url: 'https://a.com', headers: {}, sslConfig: { clientKey: 'bad' }
        })).rejects.toThrow('Failed to load SSL certificates (Key)');

        // Transport error
        const reqMock = new EventEmitter() as any;
        reqMock.end = vi.fn();
        (http.request as any).mockReturnValueOnce(reqMock);
        const promise = mockHttpClient.request({ method: 'GET', url: 'http://a.com', headers: {} });
        reqMock.emit('error', new Error('conn fail'));
        await expect(promise).rejects.toThrow('conn fail');
    });
});
