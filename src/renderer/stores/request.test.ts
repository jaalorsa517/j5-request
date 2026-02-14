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
        request: mockRequest,
        fs: {
            writeFile: vi.fn().mockResolvedValue(undefined)
        }
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

        expect(window.electron.fs.writeFile).toHaveBeenCalledWith(
            '/path/to/file.j5request',
            expect.objectContaining({
                id: '123',
                name: 'Req',
                url: 'http://url'
            })
        );

        // isDirty logic depends on originalState which is updated after save
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

    it('should manage tabs correctly', () => {
        const store = useRequestStore();
        
        // Initial tab
        expect(store.tabs).toHaveLength(1);
        const firstTabId = store.activeTabId;

        // Add tab
        store.addTab();
        expect(store.tabs).toHaveLength(2);
        expect(store.activeTabId).not.toBe(firstTabId);

        // Switch tab
        const secondTabId = store.activeTabId;
        store.setActiveTab(firstTabId);
        expect(store.activeTabId).toBe(firstTabId);

        // Close tab
        store.closeTab(secondTabId);
        expect(store.tabs).toHaveLength(1);
        expect(store.activeTabId).toBe(firstTabId);

        // Close last tab (should create new one)
        store.closeTab(firstTabId);
        expect(store.tabs).toHaveLength(1);
        expect(store.activeTabId).not.toBe(firstTabId);
    });

    it('should load various body types from file', () => {
        const store = useRequestStore();
        
        // JSON
        store.loadFromFile({ name: 'n', method: 'GET', url: '', headers: {}, params: {}, body: { type: 'json', content: { a: 1 } } } as any);
        expect(store.bodyType).toBe('json');
        expect(store.body).toContain('"a": 1');

        // Form Data
        store.loadFromFile({ name: 'n', method: 'GET', url: '', headers: {}, params: {}, body: { type: 'form-data', content: { f: 'v' } } } as any);
        expect(store.bodyType).toBe('form-data');
        expect(store.bodyFormData).toEqual({ f: 'v' });

        // Raw/Text
        store.loadFromFile({ name: 'n', method: 'GET', url: '', headers: {}, params: {}, body: { type: 'raw', content: 'text' } } as any);
        expect(store.bodyType).toBe('json'); // Implementation maps raw to json if possible or text? Let's check implementation
        // Actually loadFromFile implementation:
        // if (request.body?.type === 'json' || request.body?.type === 'raw') { newRequestState.bodyType = 'json'; ... }
    });

    it('should save various body types to file', async () => {
        const store = useRequestStore();
        mockFsStore.selectedFilePath = '/test.j5request';

        // Form Data save
        store.bodyType = 'form-data';
        store.bodyFormData = { key: 'val' };
        await store.saveToFile();
        expect(window.electron.fs.writeFile).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ body: { type: 'form-data', content: { key: 'val' } } })
        );

        // JSON save
        store.bodyType = 'json';
        store.body = '{"a": 1}';
        await store.saveToFile();
        expect(window.electron.fs.writeFile).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ body: { type: 'json', content: { a: 1 } } })
        );
    });

    it('should reset active tab', () => {
        const store = useRequestStore();
        store.url = 'http://dirty';
        store.name = 'Changed';
        
        store.reset();
        
        expect(store.url).toBe('');
        expect(store.name).toBe('Sin Título');
        expect(store.isDirty).toBe(false);
    });

    it('should handle execution error with response object', async () => {
        const store = useRequestStore();
        mockRequest.execute.mockResolvedValue({
            success: false,
            error: 'Failed',
            executionTime: 10
        });

        await store.execute();
        expect(store.response?.statusText).toBe('Failed');
    });

    it('should handle critical execution error', async () => {
        const store = useRequestStore();
        mockRequest.execute.mockRejectedValue(new Error('Critical'));
        
        await store.execute();
        expect(store.response?.statusText).toBe('Error Crítico');
        expect(store.response?.body).toBe('Critical');
    });

    it('should cover tab switching logic when closing', () => {
        const store = useRequestStore();
        store.addTab(); // Tab 1
        store.addTab(); // Tab 2
        // [T0, T1, T2]. Active: T2 (index 2)
        
        const t0 = store.tabs[0].id;
        const t1 = store.tabs[1].id;
        const t2 = store.tabs[2].id;

        // Close middle tab
        store.setActiveTab(t1);
        store.closeTab(t1);
        expect(store.activeTabId).toBe(t0); // Goes to left

        // Close first tab when there is a right one
        store.addTab(); // [T0, T2, T3]. Active: T3
        store.setActiveTab(t0);
        store.closeTab(t0);
        expect(store.activeTabId).toBe(t2); // Goes to right (T2 is now index 0)
    });

    it('should handle body type edge cases in loadFromFile', () => {
        const store = useRequestStore();
        
        // No body
        store.loadFromFile({ name: 'test', method: 'GET', url: '', headers: {}, params: {} } as any);
        expect(store.bodyType).toBe('none');

        // Form data with object content
        store.loadFromFile({ body: { type: 'form-data', content: { a: 'b' } } } as any);
        expect(store.bodyType).toBe('form-data');
        expect(store.bodyFormData).toEqual({ a: 'b' });
    });
});
