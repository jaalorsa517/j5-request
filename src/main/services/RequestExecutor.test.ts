import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestExecutor } from './RequestExecutor';
import { ScriptExecuter } from './ScriptExecuter';
import { J5Request } from '../../shared/types';
import axios from 'axios';
import * as fs from 'fs';

// Mock dependencies
vi.mock('axios');
vi.mock('./ScriptExecuter');
vi.mock('fs', () => ({
    createReadStream: vi.fn(),
}));
vi.mock('form-data', () => {
    return {
        default: vi.fn().mockImplementation(function () {
            return {
                append: vi.fn(),
                getHeaders: vi.fn().mockReturnValue({ 'content-type': 'multipart/form-data; boundary=---' })
            };
        })
    };
});
// For integration testing RequestExecutor, using real EnvironmentManager is fine/better.

describe('RequestExecutor', () => {
    let executor: RequestExecutor;
    // const mockedAxios = axios as unknown as ReturnType<typeof vi.fn>;

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
        // Setup mock response
        const mockResponse = {
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': 'application/json' },
            data: { message: 'success' }
        };
        (axios as any).mockResolvedValue(mockResponse);

        const result = await executor.executeRequest(basicRequest, {});

        expect(result.success).toBe(true);
        expect(result.response?.status).toBe(200);
        expect(result.response?.data).toEqual({ message: 'success' });
        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            method: 'GET',
            url: 'http://example.com/api'
        }));
    });

    it('should handle network errors gracefully', async () => {
        const errorMessage = 'Network Error';
        (axios as any).mockRejectedValue(new Error(errorMessage));

        const result = await executor.executeRequest(basicRequest, {});

        expect(result.success).toBe(false);
        expect(result.error).toBe(errorMessage);
        expect(result.response).toBeUndefined();
    });

    it('should resolve variables in URL before sending', async () => {
        const requestWithVar: J5Request = {
            ...basicRequest,
            url: 'http://{{host}}/api'
        };
        const env = { host: 'localhost:3000' };

        (axios as any).mockResolvedValue({ status: 200, data: {} });

        await executor.executeRequest(requestWithVar, env);

        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://localhost:3000/api'
        }));
    });

    it('should execute pre-request script', async () => {
        const script = 'env.token = "123";';
        const requestWithScript: J5Request = {
            ...basicRequest,
            preRequestScript: script
        };

        // Mock ScriptExecuter behavior
        const mockExecute = vi.fn().mockReturnValue({
            environment: { token: '123' },
            logs: []
        });
        // We need to access the private instance or mock the class implementation
        // Since we mocked the module './ScriptExecuter', any new instance is a mock.
        // However, typescript mocks are tricky with private properties.
        // Let's rely on the module mock.
        (ScriptExecuter as any).mockImplementation(class MockScriptExecuter {
            execute = mockExecute;
        });

        // Re-instantiate to use the mock implementation
        executor = new RequestExecutor();

        (axios as any).mockResolvedValue({ status: 200, data: {} });

        const result = await executor.executeRequest(requestWithScript, {});

        expect(mockExecute).toHaveBeenCalledWith(script, expect.objectContaining({
            environment: {}
        }));
        expect(result.environment).toHaveProperty('token', '123');
    });
    it('should resolve headers and params variables', async () => {
        const requestWithVars: J5Request = {
            ...basicRequest,
            headers: { 'Authorization': 'Bearer {{token}}' },
            params: { 'q': '{{query}}' }
        };
        const env = { token: 'secret', query: 'search' };

        (axios as any).mockResolvedValue({ status: 200, data: {} });

        await executor.executeRequest(requestWithVars, env);

        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            headers: expect.objectContaining({ 'Authorization': 'Bearer secret' }),
            params: expect.objectContaining({ 'q': 'search' })
        }));
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

        (axios as any).mockResolvedValue({ status: 200, data: {} });

        await executor.executeRequest(requestWithJson, env);

        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            data: { name: 'John' }
        }));
    });

    it('should fallback to string if JSON body parsing fails', async () => {
        const requestWithBadJson: J5Request = {
            ...basicRequest,
            method: 'POST',
            body: {
                type: 'json',
                content: '{invalid-json}'
            }
        };

        (axios as any).mockResolvedValue({ status: 200, data: {} });

        await executor.executeRequest(requestWithBadJson, {});

        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            data: '{invalid-json}'
        }));
    });

    it('should execute post-response script', async () => {
        const script = 'env.status = response.status;';
        const requestWithPostScript: J5Request = {
            ...basicRequest,
            postResponseScript: script
        };

        // Mock ScriptExecuter logic for execution
        const mockExecute = vi.fn().mockImplementation((script, context) => ({
            environment: { ...context.environment, status: context.response.status },
            logs: []
        }));

        (ScriptExecuter as any).mockImplementation(function (this: any) {
            this.execute = mockExecute;
        });

        // Re-instantiate
        executor = new RequestExecutor();

        (axios as any).mockResolvedValue({
            status: 201,
            statusText: 'Created',
            headers: {},
            data: {}
        });

        const result = await executor.executeRequest(requestWithPostScript, {});

        expect(mockExecute).toHaveBeenCalled();
        expect(result.environment).toHaveProperty('status', 201);
    });

    it('should handle form-data body', async () => {
        const requestWithFormData: J5Request = {
            ...basicRequest,
            method: 'POST',
            body: {
                type: 'form-data',
                content: {
                    file: { type: 'file', path: '/path/to/file.txt' },
                    text: 'some text'
                }
            }
        };

        (axios as any).mockResolvedValue({ status: 200, data: {} });

        const result = await executor.executeRequest(requestWithFormData, {});

        if (!result.success) {
            console.error('Request failed:', result.error);
        }

        expect(result.success).toBe(true);
        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            headers: expect.objectContaining({ 'Content-Type': 'multipart/form-data; boundary=---' })
        }));
    });

    it('should configure axios with correct callbacks', async () => {
        (axios as any).mockResolvedValue({ status: 200, data: {} });
        await executor.executeRequest(basicRequest, {});

        // Find the call with the config
        const calls = (axios as any).mock.calls;
        const lastCall = calls[calls.length - 1];
        const config = lastCall[0];

        // Test validateStatus: should return true for any status
        expect(config.validateStatus(200)).toBe(true);
        expect(config.validateStatus(500)).toBe(true);
        expect(config.validateStatus(404)).toBe(true);

        // Test transformResponse: should return data as is
        const rawData = '{"key": "value"}';
        const transformFn = config.transformResponse[0];
        expect(transformFn(rawData)).toBe(rawData);
    });

    it('should log error when file read fails in form-data', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        (fs.createReadStream as any).mockImplementation(() => { throw new Error('File read error'); });

        const requestWithFile: J5Request = {
            ...basicRequest,
            method: 'POST',
            body: {
                type: 'form-data',
                content: {
                    file: { type: 'file', path: '/bad_file.txt' }
                }
            }
        };

        (axios as any).mockResolvedValue({ status: 200, data: {} });

        await executor.executeRequest(requestWithFile, {});

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to read file'), expect.any(Error));

        consoleSpy.mockRestore();
    });
});
