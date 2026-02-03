import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestExecutor } from './RequestExecutor';
import { ScriptExecuter } from './ScriptExecuter';
import { J5Request } from '../../shared/types';
import axios from 'axios';

// Mock dependencies
vi.mock('axios');
vi.mock('./ScriptExecuter');
// No need to mock EnvironmentManager as it's logic-only and fast, but we could.
// For integration testing RequestExecutor, using real EnvironmentManager is fine/better.

describe('RequestExecutor', () => {
    let executor: RequestExecutor;
    const mockedAxios = axios as unknown as ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        executor = new RequestExecutor();
    });

    const basicRequest: J5Request = {
        id: '1',
        method: 'GET',
        url: 'http://example.com/api',
        headers: {},
        params: {},
        body: { type: 'none', content: '' },
        auth: { type: 'none' },
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
});
