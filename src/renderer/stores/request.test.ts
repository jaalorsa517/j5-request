import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRequestStore } from './request';
import { J5Request } from '../../shared/types';
import { useFileSystemStore } from './file-system';
import { useEnvironmentStore } from './environment';

// Mock dependencies
vi.mock('./file-system');
vi.mock('./environment');
vi.mock('../../shared/utils/uuid', () => ({
    generateUUID: vi.fn(() => 'test-uuid')
}));
// Re-import uuid mock to control it
import { generateUUID } from '../../shared/utils/uuid';

const mockUuid = generateUUID as unknown as Mock;

describe('Request Store', () => {
    let fsStoreMock: any;
    let envStoreMock: any;

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();

        // Setup FileSystem Store Mock
        fsStoreMock = {
            selectedFilePath: null,
            selectedFile: null,
            saveRequest: vi.fn(),
        };
        (useFileSystemStore as unknown as Mock).mockReturnValue(fsStoreMock);

        // Setup Environment Store Mock
        envStoreMock = {
            currentVariables: [],
            updateVariablesFromExecution: vi.fn(),
        };
        (useEnvironmentStore as unknown as Mock).mockReturnValue(envStoreMock);

        // Ensure window exists
        if (typeof window === 'undefined') {
            (global as any).window = {};
        }

        (window as any).electron = {
            request: {
                execute: vi.fn()
            },
            fs: {
                writeFile: vi.fn()
            }
        };

        // Default UUID behavior
        mockUuid.mockReturnValue('default-uuid');
    });

    describe('Initialization', () => {
        it('should initialize with one default tab', () => {
            const store = useRequestStore();
            expect(store.tabs.length).toBe(1);
            expect(store.activeTabId).toBe('default-uuid');
            expect(store.method).toBe('GET');
        });
    });

    describe('Tab Management', () => {
        it('should add a new tab', () => {
            const store = useRequestStore();
            const firstTabId = store.activeTabId;

            mockUuid.mockReturnValueOnce('new-tab-id').mockReturnValueOnce('new-req-id');
            store.addTab();

            expect(store.tabs.length).toBe(2);
            expect(store.activeTabId).toBe('new-tab-id');
            expect(store.tabs[1].id).toBe('new-tab-id');
            expect(store.tabs[0].id).toBe(firstTabId);
        });

        it('should switch active tab', () => {
            const store = useRequestStore();
            mockUuid.mockReturnValueOnce('tab-2');
            store.addTab();

            expect(store.activeTabId).toBe('tab-2');

            store.setActiveTab(store.tabs[0].id);
            expect(store.activeTabId).toBe(store.tabs[0].id);
        });

        it('should close a tab (middle)', () => {
            const store = useRequestStore();
            // Create 3 tabs
            mockUuid.mockReturnValue('tab-1');
            // store.initDefaultTab() is called on creation, giving us tab-1 (active).
            // But we already created store.
            // Wait, previous tests passed?
            // "should initialize with one default tab" passes.
            // So store creation calls it.
            // But useRequestStore() returns existing store?
            // "setActivePinia" in beforeEach clears it.

            // To ensure tab-1 is the ID:
            // The store creation happened at line 91: const store = useRequestStore();
            // During creation, createNewTab was called with mockUuid result.
            // But mockUuid was configures to return 'default-uuid' in beforeEach.
            // So tab 0 is 'default-uuid'.

            // Let's rely on addTab.
            // Tab 0: default-uuid
            mockUuid.mockReturnValue('tab-2');
            store.addTab();
            mockUuid.mockReturnValue('tab-3');
            store.addTab();

            // Active is tab-3. Set active to tab-2
            store.setActiveTab('tab-2');

            expect(store.tabs.length).toBe(3);

            store.closeTab('tab-2');

            expect(store.tabs.length).toBe(2);
            expect(store.tabs.map(t => t.id)).toEqual(['default-uuid', 'tab-3']);
            // Should switch to previous (tab-1 / default-uuid)
            expect(store.activeTabId).toBe('default-uuid');
        });

        it('should close a tab (last)', () => {
            const store = useRequestStore();
            // Tab 0
            mockUuid.mockReturnValue('tab-2');
            store.addTab();
            // Active is tab-2

            store.closeTab('tab-2');

            expect(store.tabs.length).toBe(1);
            expect(store.activeTabId).toBe('default-uuid');
        });

        it('should close a tab (first)', () => {
            const store = useRequestStore();
            // Tab 0
            mockUuid.mockReturnValue('tab-2');
            store.addTab();

            // Go to Tab 0
            store.setActiveTab('default-uuid');

            store.closeTab('default-uuid');

            expect(store.tabs.length).toBe(1);
            expect(store.activeTabId).toBe('tab-2');
        });

        it('should create new tab if closing the only tab', () => {
            const store = useRequestStore();
            // Tab 0 is only tab
            const oldId = store.activeTabId;

            mockUuid.mockReturnValue('new-fresh-tab');
            store.closeTab(oldId);

            expect(store.tabs.length).toBe(1);
            expect(store.activeTabId).toBe('new-fresh-tab');
        });

        it('should not do anything if closing non-existent tab', () => {
            const store = useRequestStore();
            store.closeTab('non-existent');
            expect(store.tabs.length).toBe(1);
        });

        it('should not switch tab if setting active to non-existent', () => {
            const store = useRequestStore();
            const current = store.activeTabId;
            store.setActiveTab('non-existent');
            expect(store.activeTabId).toBe(current);
        });
    });

    describe('State Proxies', () => {
        it('should update active tab state via proxies', () => {
            const store = useRequestStore();

            store.url = 'http://test.com';
            store.method = 'POST';
            store.headers = { 'X-Test': '1' };
            store.params = { 'q': '1' };
            store.body = 'test';
            store.preRequestScript = 'pre';
            store.postResponseScript = 'post';

            expect(store.activeTab.request.url).toBe('http://test.com');
            expect(store.activeTab.request.method).toBe('POST');
            expect(store.activeTab.request.headers).toEqual({ 'X-Test': '1' });
            expect(store.activeTab.request.params).toEqual({ 'q': '1' });
            expect(store.activeTab.request.body).toBe('test');
            expect(store.activeTab.request.preRequestScript).toBe('pre');
            expect(store.activeTab.request.postResponseScript).toBe('post');

            // Check setter/getter for others
            store.bodyType = 'xml';
            expect(store.activeTab.request.bodyType).toBe('xml');
            expect(store.bodyType).toBe('xml');

            store.bodyFormData = { key: 'val' };
            expect(store.activeTab.request.bodyFormData).toEqual({ key: 'val' });
        });

        it('should maintain separate state for different tabs', () => {
            const store = useRequestStore();
            const tab1Id = store.activeTabId;

            store.url = 'http://tab1.com';

            mockUuid.mockReturnValueOnce('tab-2');
            store.addTab(); // active is now tab-2
            store.url = 'http://tab2.com';

            expect(store.tabs.find(t => t.id === tab1Id)?.request.url).toBe('http://tab1.com');
            expect(store.tabs.find(t => t.id === 'tab-2')?.request.url).toBe('http://tab2.com');
        });
    });

    describe('Actions: Persistence', () => {
        it('should load request into active tab (JSON)', () => {
            const store = useRequestStore();
            const request: J5Request = {
                id: '123',
                name: 'Test Req',
                method: 'POST',
                url: 'https://api.test',
                headers: { 'Content-Type': 'application/json' },
                params: { 'q': 'search' },
                body: { type: 'json', content: JSON.stringify({ key: 'value' }) },
                preRequestScript: 'console.log("pre")',
                postResponseScript: 'console.log("post")'
            };

            store.loadFromFile(request);

            expect(store.activeTab.request.id).toBe('123');
            expect(store.name).toBe('Test Req');
            expect(store.method).toBe('POST');
            expect(store.url).toBe('https://api.test');
            expect(store.bodyType).toBe('json');
            expect(store.body).toBe(JSON.stringify({ key: 'value' }));
            expect(store.activeTab.originalState).toBe(JSON.stringify(store.activeTab.request));
            expect(store.isDirty).toBe(false);
        });

        it('should load form-data request', () => {
            const store = useRequestStore();
            const request: J5Request = {
                id: '1', name: 'FD', method: 'POST', url: '', headers: {}, params: {},
                body: {
                    type: 'form-data',
                    content: { file: { type: 'file', path: '/tmp/f' }, text: 'val' }
                }
            };
            store.loadFromFile(request);
            expect(store.bodyType).toBe('form-data');
            expect(store.bodyFormData).toEqual({ file: { type: 'file', path: '/tmp/f' }, text: 'val' });
        });

        it('should load raw request (parsed as json if valid)', () => {
            const store = useRequestStore();
            // if raw but content is valid json object in J5Request (legacy?) or string
            // Logic: if type is raw, sets bodyType to json (assuming legacy raw json?).
            // "Default to json for raw for now, or check content"
            // Implementation: if (request.body?.type === 'json' || request.body?.type === 'raw') -> bodyType = 'json'

            const request: J5Request = {
                id: '1', name: 'R', method: 'GET', url: '', headers: {}, params: {},
                body: { type: 'raw', content: '{"a":1}' }
            };
            store.loadFromFile(request);
            expect(store.bodyType).toBe('json');
            expect(store.body).toBe('{"a":1}');
        });

        it('should load text request (fallback)', () => {
            const store = useRequestStore();
            const request: J5Request = {
                id: '1', name: 'R', method: 'GET', url: '', headers: {}, params: {},
                body: { type: 'xml' as any, content: '<xml/>' }
            };
            store.loadFromFile(request);
            expect(store.bodyType).toBe('text');
            expect(store.body).toBe('<xml/>');
        });

        it('should load request with no body', () => {
            const store = useRequestStore();
            const request: J5Request = {
                id: '1', name: 'R', method: 'GET', url: '', headers: {}, params: {}
            };
            store.loadFromFile(request);
            expect(store.bodyType).toBe('none');
        });

        it('should save to file using fsStore.selectedFilePath if no tab.filePath', async () => {
            const store = useRequestStore();
            fsStoreMock.selectedFilePath = '/path/to/file.j5request';

            store.url = 'http://save.com';
            store.bodyType = 'json';
            store.body = '{"k":"v"}';

            await store.saveToFile();

            const expectedRequest = expect.objectContaining({
                url: 'http://save.com',
                body: { type: 'json', content: { k: 'v' } }
            });

            expect((window as any).electron.fs.writeFile).toHaveBeenCalledWith(
                '/path/to/file.j5request',
                expectedRequest
            );
            expect(store.isDirty).toBe(false);
            expect(store.activeTab.filePath).toBe('/path/to/file.j5request');
        });

        it('should save to file using tab.filePath', async () => {
            const store = useRequestStore();
            // Setup tab with filePath
            store.activeTab.filePath = '/custom/path.j5request';
            fsStoreMock.selectedFilePath = '/ignored/path'; // Should be ignored

            store.url = 'http://custom.com';

            await store.saveToFile();

            const expectedRequest = expect.objectContaining({
                url: 'http://custom.com'
            });

            expect((window as any).electron.fs.writeFile).toHaveBeenCalledWith(
                '/custom/path.j5request',
                expectedRequest
            );
        });

        it('should save raw body when json parse fails', async () => {
            const store = useRequestStore();
            fsStoreMock.selectedFilePath = '/path';
            store.bodyType = 'json';
            store.body = '{invalid';

            await store.saveToFile();

            const writeArgs = (window as any).electron.fs.writeFile.mock.calls[0];
            expect(writeArgs[1].body).toEqual({ type: 'raw', content: '{invalid' });
        });

        it('should save form-data', async () => {
            const store = useRequestStore();
            fsStoreMock.selectedFilePath = '/path';
            store.bodyType = 'form-data';
            store.bodyFormData = { k: 'v' };

            await store.saveToFile();

            const writeArgs = (window as any).electron.fs.writeFile.mock.calls[0];
            expect(writeArgs[1].body).toEqual({ type: 'form-data', content: { k: 'v' } });
        });

        it('should throw if no file selected', async () => {
            const store = useRequestStore();
            fsStoreMock.selectedFilePath = null;
            // filePath also null
            await expect(store.saveToFile()).rejects.toThrow('No hay archivo seleccionado');
        });
    });

    describe('Actions: Execution', () => {
        it('should execute request successfully', async () => {
            const store = useRequestStore();
            store.url = 'https://api.test';
            store.method = 'GET';

            const mockResponse = {
                success: true,
                response: {
                    status: 200, statusText: 'OK', headers: {}, data: { success: true }, time: 100
                }
            };

            (window as any).electron.request.execute.mockResolvedValue(mockResponse);

            await store.execute();

            expect((window as any).electron.request.execute).toHaveBeenCalled();
            expect(store.response).not.toBeNull();
            expect(store.response?.status).toBe(200);
            expect(store.isLoading).toBe(false);
        });

        it('should handle execution failure', async () => {
            const store = useRequestStore();
            const mockError = {
                success: false, error: 'Network Error', executionTime: 0
            };

            (window as any).electron.request.execute.mockResolvedValue(mockError);

            await store.execute();

            expect(store.response?.status).toBe(0);
            expect(store.response?.body).toBe('Network Error');
        });

        it('should handle exception during execution', async () => {
            const store = useRequestStore();
            (window as any).electron.request.execute.mockRejectedValue(new Error('Crash'));

            await store.execute();

            expect(store.response?.status).toBe(0);
            expect(store.response?.body).toBe('Crash');
            expect(store.isLoading).toBe(false);
        });

        it('should update environment variables after execution', async () => {
            const store = useRequestStore();
            const mockResponse = {
                success: true,
                response: { status: 200, data: '' },
                environment: [{ key: 'new', value: 'val' }]
            };
            (window as any).electron.request.execute.mockResolvedValue(mockResponse);

            await store.execute();

            expect(envStoreMock.updateVariablesFromExecution).toHaveBeenCalledWith(mockResponse.environment);
        });

        it('should execute with body (json)', async () => {
            const store = useRequestStore();
            store.bodyType = 'json';
            store.body = '{"a":1}';

            (window as any).electron.request.execute.mockResolvedValue({ success: true, response: { status: 200, data: '' } });

            await store.execute();

            const callArg = (window as any).electron.request.execute.mock.calls[0][0];
            expect(callArg.body).toEqual({ type: 'json', content: { a: 1 } });
        });

        it('should execute with body (raw fallback)', async () => {
            const store = useRequestStore();
            store.bodyType = 'json';
            store.body = '{inv';

            (window as any).electron.request.execute.mockResolvedValue({ success: true, response: { status: 200, data: '' } });

            await store.execute();

            const callArg = (window as any).electron.request.execute.mock.calls[0][0];
            expect(callArg.body).toEqual({ type: 'raw', content: '{inv' });
        });

        it('should execute with form-data', async () => {
            const store = useRequestStore();
            store.bodyType = 'form-data';
            store.bodyFormData = { key: 'val' };

            (window as any).electron.request.execute.mockResolvedValue({ success: true, response: { status: 200, data: '' } });

            await store.execute();

            const callArg = (window as any).electron.request.execute.mock.calls[0][0];
            expect(callArg.body).toEqual({ type: 'form-data', content: { key: 'val' } });
        });

        it('should execute with text body', async () => {
            const store = useRequestStore();
            store.bodyType = 'text';
            store.body = 'some text';

            (window as any).electron.request.execute.mockResolvedValue({ success: true, response: { status: 200, data: '' } });

            await store.execute();

            const callArg = (window as any).electron.request.execute.mock.calls[0][0];
            expect(callArg.body).toEqual({ type: 'raw', content: 'some text' });
        });
    });

    describe('Proxies (Getters/Setters)', () => {
        it('should read and write computed properties correctly', () => {
            const store = useRequestStore();

            // Test Setters
            store.id = '123';
            store.name = 'Test';
            store.method = 'PUT';
            store.url = 'url';
            store.headers = { h: '1' };
            store.params = { p: '1' };
            store.body = 'b';
            store.bodyFormData = { f: 'd' };
            store.preRequestScript = 'pre';
            store.postResponseScript = 'post';
            store.bodyType = 'xml';

            // Check underlying
            expect(store.activeTab.request.id).toBe('123');
            expect(store.activeTab.request.name).toBe('Test');
            expect(store.activeTab.request.method).toBe('PUT');
            expect(store.activeTab.request.url).toBe('url');
            expect(store.activeTab.request.headers).toEqual({ h: '1' });
            expect(store.activeTab.request.params).toEqual({ p: '1' });
            expect(store.activeTab.request.body).toBe('b');
            expect(store.activeTab.request.bodyFormData).toEqual({ f: 'd' });
            expect(store.activeTab.request.preRequestScript).toBe('pre');
            expect(store.activeTab.request.postResponseScript).toBe('post');
            expect(store.activeTab.request.bodyType).toBe('xml');

            // Check Getters
            expect(store.id).toBe('123');
            expect(store.name).toBe('Test');
            expect(store.method).toBe('PUT');
            expect(store.url).toBe('url');
            expect(store.headers).toEqual({ h: '1' });
            expect(store.params).toEqual({ p: '1' });
            expect(store.body).toBe('b');
            expect(store.bodyFormData).toEqual({ f: 'd' });
            expect(store.preRequestScript).toBe('pre');
            expect(store.postResponseScript).toBe('post');
            expect(store.bodyType).toBe('xml');
        });
        it('should read response proxy', () => {
            const store = useRequestStore();
            store.activeTab.response = { status: 200 } as any;
            expect(store.response?.status).toBe(200);

            store.activeTab.response = null;
            expect(store.response).toBeNull();
        });
    });

    describe('Reset', () => {
        it('should reset active tab to default state', () => {
            const store = useRequestStore();
            store.name = 'Edited';
            store.method = 'DELETE';
            store.response = {} as any;

            store.reset();

            expect(store.name).toBe('');
            expect(store.activeTab.name).toBe('Sin Título');
            expect(store.method).toBe('GET');
            expect(store.response).toBeNull();
            expect(store.isDirty).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should execute with invalid JSON body (fallback to raw)', async () => {
            const store = useRequestStore();
            store.bodyType = 'json';
            store.body = '{invalid-json}';

            (window as any).electron.request.execute.mockResolvedValue({ success: true, response: { status: 200, data: '' } });

            await store.execute();

            const callArg = (window as any).electron.request.execute.mock.calls[0][0];
            expect(callArg.body).toEqual({ type: 'raw', content: '{invalid-json}' });
        });

        it('should load request with object content in body', () => {
            const store = useRequestStore();
            const request: J5Request = {
                id: '1', name: 'Obj', method: 'GET', url: '', headers: {}, params: {},
                body: { type: 'json' as any, content: { key: 'val' } }
            };
            store.loadFromFile(request);

            expect(store.bodyType).toBe('json');
            expect(store.body).toBe(JSON.stringify({ key: 'val' }, null, 2));
        });

        it('should save text body', async () => {
            const store = useRequestStore();
            const fsStoreMock = (useFileSystemStore() as any);
            fsStoreMock.selectedFilePath = '/path';

            store.bodyType = 'text';
            store.body = 'some text';

            await store.saveToFile();

            const writeArgs = (window as any).electron.fs.writeFile.mock.calls[0];
            expect(writeArgs[1].body).toEqual({ type: 'raw', content: 'some text' });
        });

        it('should load form-data with invalid content (ignore)', () => {
            const store = useRequestStore();
            const request: J5Request = {
                id: '1', name: 'FD Invalid', method: 'POST', url: '', headers: {}, params: {},
                body: { type: 'form-data', content: 'invalid' as any }
            };
            store.loadFromFile(request);

            expect(store.bodyType).toBe('form-data');
            expect(store.bodyFormData).toEqual({});
        });

        it('should save empty text body (no body in file)', async () => {
            const store = useRequestStore();
            const fsStoreMock = (useFileSystemStore() as any);
            fsStoreMock.selectedFilePath = '/path';

            store.bodyType = 'text';
            store.body = '   '; // trim -> empty

            await store.saveToFile();

            const writeArgs = (window as any).electron.fs.writeFile.mock.calls[0];
            expect(writeArgs[1].body).toBeUndefined();
        });

        it('should execute with empty id (fallback to temp)', async () => {
            const store = useRequestStore();
            store.activeTab.request.id = '';
            (window as any).electron.request.execute.mockResolvedValue({ success: true, response: { status: 200, data: '' } });
            await store.execute();
            const callArg = (window as any).electron.request.execute.mock.calls[0][0];
            expect(callArg.id).toBe('temp');
        });

        it('should handle execution failure with no error message', async () => {
            const store = useRequestStore();
            (window as any).electron.request.execute.mockResolvedValue({ success: false });
            await store.execute();
            expect(store.response?.statusText).toBe('Error desconocido');
            expect(store.response?.body).toBe('');
        });
    });

    describe('Dirty State', () => {
        it('should detect dirty state per tab', () => {
            const store = useRequestStore();
            expect(store.isDirty).toBe(false);

            store.method = 'POST';
            expect(store.isDirty).toBe(true);

            store.method = 'GET'; // Back to default
            expect(store.isDirty).toBe(false);
        });
        it('should execute with none body', async () => {
            const store = useRequestStore();
            store.bodyType = 'none';
            store.body = 'ignored';

            (window as any).electron.request.execute.mockResolvedValue({ success: true, response: { status: 200, data: '' } });

            await store.execute();

            const callArg = (window as any).electron.request.execute.mock.calls[0][0];
            expect(callArg.body).toBeUndefined();
        });

        it('should load text body (fallback to empty if not string)', () => {
            const store = useRequestStore();
            const request: J5Request = {
                id: '1', name: 'R', method: 'GET', url: '', headers: {}, params: {},
                body: { type: 'xml' as any, content: 123 as any }
            };
            store.loadFromFile(request);
            expect(store.bodyType).toBe('text');
            expect(store.body).toBe('');
        });
    });
});
