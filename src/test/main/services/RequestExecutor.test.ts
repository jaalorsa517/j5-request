import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestExecutor } from '@/main/services/RequestExecutor';
import { ScriptExecuter } from '@/main/services/ScriptExecuter';
import { J5Request } from '@/shared/types';
import http from 'http';
import https from 'https';
import fsPromises from 'fs/promises';
import { EventEmitter } from 'events';

// Mock dependencies
vi.mock('http', () => {
    const request = vi.fn();
    return {
        default: { request },
        request
    };
});
vi.mock('https', () => {
    const request = vi.fn();
    // Use traditional function for constructor mock
    const Agent = vi.fn().mockImplementation(function(this: any, options: any) {
        this.options = options;
    });
    return {
        default: { request, Agent },
        request,
        Agent
    };
});
vi.mock('@/main/services/ScriptExecuter');
vi.mock('fs', () => ({
    createReadStream: vi.fn(),
}));
vi.mock('fs/promises', () => {
    const readFile = vi.fn();
    return {
        default: { readFile },
        readFile
    };
});
vi.mock('form-data', () => {
    return {
        default: vi.fn().mockImplementation(function (this: any) {
            return {
                append: vi.fn(),
                getHeaders: vi.fn().mockReturnValue({ 'content-type': 'multipart/form-data; boundary=---' }),
                pipe: vi.fn().mockImplementation((req) => {
                    req.end();
                })
            };
        })
    };
});

// Helper to mock Node.js http/https request
function mockNativeRequest(status: number, data: any, headers = {}, statusText = 'OK') {
    const res = new EventEmitter() as any;
    res.statusCode = status;
    res.statusMessage = statusText;
    res.headers = headers;

    const req = new EventEmitter() as any;
    req.write = vi.fn();
    req.end = vi.fn().mockImplementation(() => {
        process.nextTick(() => {
            res.emit('data', Buffer.from(typeof data === 'string' ? data : JSON.stringify(data)));
            res.emit('end');
        });
    });

    const requestMock = vi.fn().mockImplementation((_url, options, callback) => {
        const cb = typeof options === 'function' ? options : callback;
        if (cb) cb(res);
        return req;
    });

    (http.request as any).mockImplementation(requestMock);
    (https.request as any).mockImplementation(requestMock);
    
    if ((http as any).default) (http as any).default.request.mockImplementation(requestMock);
    if ((https as any).default) (https as any).default.request.mockImplementation(requestMock);

    return { req, res, requestMock };
}

describe('RequestExecutor', () => {
    let executor: RequestExecutor;

    beforeEach(() => {
        vi.clearAllMocks();
        executor = new RequestExecutor();
    });

    const basicRequest: J5Request = {
        id: '1',
        name: 'Basic Request',
        method: 'GET',
        url: 'http://example.com/api',
        headers: {},
        params: {},
        body: { type: 'raw', content: '' },
        preRequestScript: '',
        postResponseScript: ''
    };

    it('should execute a simple GET request successfully', async () => {
        const { requestMock } = mockNativeRequest(200, { message: 'success' });

        const result = await executor.executeRequest(basicRequest, {});

        expect(result.success).toBe(true);
        expect(result.response?.status).toBe(200);
        expect(JSON.parse(result.response?.data)).toEqual({ message: 'success' });
        expect(requestMock).toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
        const req = new EventEmitter() as any;
        req.end = vi.fn();
        const requestMock = vi.fn().mockReturnValue(req);
        (http.request as any).mockImplementation(requestMock);

        const promise = executor.executeRequest(basicRequest, {});
        
        process.nextTick(() => {
            req.emit('error', new Error('Connection failed'));
        });

        const result = await promise;

        expect(result.success).toBe(false);
        expect(result.error).toBe('Connection failed');
    });

    it('should resolve variables in URL before sending', async () => {
        const requestWithVar: J5Request = {
            ...basicRequest,
            url: 'http://{{host}}/api'
        };
        const env = { host: 'localhost:3000' };

        const { requestMock } = mockNativeRequest(200, {});

        await executor.executeRequest(requestWithVar, env);

        const callUrl = requestMock.mock.calls[0][0];
        expect(callUrl.toString()).toContain('http://localhost:3000/api');
    });

    it('should resolve headers and params variables', async () => {
        const requestWithVars: J5Request = {
            ...basicRequest,
            headers: { 'Authorization': 'Bearer {{token}}' },
            params: { 'q': '{{query}}' }
        };
        const env = { token: 'secret', query: 'search' };

        const { requestMock } = mockNativeRequest(200, {});

        await executor.executeRequest(requestWithVars, env);

        const options = requestMock.mock.calls[0][1];
        expect(options.headers).toHaveProperty('Authorization', 'Bearer secret');
        
        const callUrl = requestMock.mock.calls[0][0];
        expect(callUrl.searchParams.get('q')).toBe('search');
    });

    it('should handle JSON body with variable resolution', async () => {
        const requestWithJson: J5Request = {
            ...basicRequest,
            method: 'POST',
            body: {
                type: 'json',
                content: '{"name": "{{name}}"}'
            }
        };
        const env = { name: 'John' };

        const { req } = mockNativeRequest(200, {});

        await executor.executeRequest(requestWithJson, env);

        expect(req.write).toHaveBeenCalledWith(JSON.stringify({ name: 'John' }));
    });

    it('should execute post-response script', async () => {
        const script = 'env.status = response.status;';
        const requestWithPostScript: J5Request = {
            ...basicRequest,
            postResponseScript: script
        };

        const mockExecute = vi.fn().mockImplementation((_script: any, context: any) => ({
            environment: { ...context.environment, status: context.response.status },
            logs: []
        }));

        (ScriptExecuter as any).mockImplementation(function (this: any) {
            this.execute = mockExecute;
        });

        executor = new RequestExecutor();

        mockNativeRequest(201, {}, {}, 'Created');

        const result = await executor.executeRequest(requestWithPostScript, {});

        expect(mockExecute).toHaveBeenCalled();
        expect(result.environment).toHaveProperty('status', 201);
    });

    it('should configure SSL agent when sslConfig is provided', async () => {
        const sslRequest: J5Request = {
            ...basicRequest,
            url: 'https://example.com/api',
            sslConfig: {
                ca: ['/path/to/ca.pem'],
                rejectUnauthorized: false
            }
        };

        (fsPromises.readFile as any).mockResolvedValue(Buffer.from('mock-cert-content'));
        const { requestMock } = mockNativeRequest(200, {});

        await executor.executeRequest(sslRequest, {});

        expect(requestMock).toHaveBeenCalled();
        const options = requestMock.mock.calls[0][1];
        expect(options.agent).toBeDefined();
        expect(options.agent.options.rejectUnauthorized).toBe(false);
        expect(options.agent.options.ca[0]).toEqual(Buffer.from('mock-cert-content'));
    });

    it('should handle SSL certificate loading errors', async () => {
        const sslRequest: J5Request = {
            ...basicRequest,
            url: 'https://example.com/api',
            sslConfig: {
                clientCert: '/path/to/missing.pem'
            }
        };

        (fsPromises.readFile as any).mockRejectedValue(new Error('ENOENT'));

        const result = await executor.executeRequest(sslRequest, {});

        expect(result.success).toBe(false);
        expect(result.error).toContain('Failed to load SSL certificates');
    });
});
