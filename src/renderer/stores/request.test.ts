import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRequestStore } from './request';

// Hoist mocks to ensure singleton behavior
const { mockFsStore, mockEnvStore, mockRequest } = vi.hoisted(() => ({
    mockFsStore: {
        selectedFilePath: '/path/to/file.j5request',
        selectedFile: null,
        saveRequest: vi.fn(),
        $reset: vi.fn()
    },
    mockEnvStore: {
        currentVariables: {},
        updateVariablesFromExecution: vi.fn(),
        $reset: vi.fn()
    },
    mockRequest: {
        execute: vi.fn()
    }
}));

vi.mock('./file-system', () => ({
    useFileSystemStore: vi.fn(() => mockFsStore)
}));

vi.mock('./environment', () => ({
    useEnvironmentStore: vi.fn(() => mockEnvStore)
}));

// Mock window.electron
vi.stubGlobal('window', {
    electron: {
        request: mockRequest
    }
});

describe('Request Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();

        // Reset mock store state if needed, though they are objects not real stores
        mockFsStore.selectedFilePath = '/path/to/file.j5request';
        mockFsStore.selectedFile = null;
        mockEnvStore.currentVariables = {};
    });

    it('should initialize with default state', () => {
        const store = useRequestStore();
        expect(store.method).toBe('GET');
        expect(store.isLoading).toBe(false);
    });

    it('should load from file', () => {
        const store = useRequestStore();
        const request = {
            id: '123',
            name: 'Test Request',
            method: 'POST',
            url: 'http://test.com',
            headers: { 'Content-Type': 'application/json' },
            params: { page: '1' },
            body: { type: 'json', content: { foo: 'bar' } },
            preRequestScript: 'console.log("pre")',
            postResponseScript: 'console.log("post")'
        };

        store.loadFromFile(request as any);

        expect(store.id).toBe('123');
        expect(store.name).toBe('Test Request');
        expect(store.method).toBe('POST');
        expect(store.url).toBe('http://test.com');
        expect(store.headers).toEqual({ 'Content-Type': 'application/json' });
        expect(store.params).toEqual({ page: '1' });
        expect(store.bodyType).toBe('json');
        expect(store.body).toBe(JSON.stringify({ foo: 'bar' }, null, 2));
        expect(store.preRequestScript).toBe('console.log("pre")');
        expect(store.postResponseScript).toBe('console.log("post")');
        expect(store.isDirty).toBe(false);
    });

    it('should track changes (isDirty)', () => {
        const store = useRequestStore();
        const request = {
            id: '123',
            name: 'Test Request',
            method: 'GET',
            url: 'http://test.com',
            headers: {},
            params: {},
            body: null
        };
        store.loadFromFile(request as any);
        expect(store.isDirty).toBe(false);

        store.url = 'http://test.com/api';
        expect(store.isDirty).toBe(true);

        store.url = 'http://test.com'; // revert
        expect(store.isDirty).toBe(false);
    });

    it('should save to file', async () => {
        const store = useRequestStore();

        // Setup state
        store.id = '123';
        store.name = 'Req';
        store.url = 'http://url';
        store.method = 'GET';
        store.bodyType = 'json';
        store.body = '{}';

        await store.saveToFile();

        expect(mockFsStore.saveRequest).toHaveBeenCalled();
        expect(mockFsStore.selectedFile).toEqual(expect.objectContaining({
            id: '123',
            name: 'Req',
            url: 'http://url'
        }));

        // isDirty logic depends on originalState which is updated after save
        // Wait, saveToFile updates originalState.
        expect(store.isDirty).toBe(false);
    });

    it('should execute request', async () => {
        const store = useRequestStore();

        mockRequest.execute.mockResolvedValue({
            success: true,
            response: {
                status: 200,
                statusText: 'OK',
                headers: {},
                time: 100,
                data: { key: 'val' }
            },
            environment: { newVar: 'val' }
        });

        store.url = 'http://api';
        store.method = 'GET';
        store.bodyType = 'json';

        await store.execute();

        expect(mockRequest.execute).toHaveBeenCalledWith(
            expect.objectContaining({ url: 'http://api' }),
            expect.anything()
        );

        expect(mockEnvStore.updateVariablesFromExecution).toHaveBeenCalledWith({ newVar: 'val' });

        expect(store.response).toEqual({
            status: 200,
            statusText: 'OK',
            headers: {},
            time: 100,
            size: expect.any(Number),
            body: JSON.stringify({ key: 'val' }, null, 2)
        });
        expect(store.isLoading).toBe(false);
    });

    it('should handle execution error', async () => {
        const store = useRequestStore();
        mockRequest.execute.mockResolvedValue({
            success: false,
            error: 'Network Error',
            executionTime: 50
        });

        await store.execute();

        expect(store.response).toEqual({
            status: 0,
            statusText: 'Network Error',
            headers: {},
            time: 50,
            size: 0,
            body: 'Network Error'
        });
    });
});
