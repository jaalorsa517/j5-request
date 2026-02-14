import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted to create mock objects that can be used in vi.mock factory
const { mockIpcRenderer, mockContextBridge } = vi.hoisted(() => ({
    mockIpcRenderer: {
        on: vi.fn(),
        off: vi.fn(),
        send: vi.fn(),
        invoke: vi.fn(),
        removeListener: vi.fn(),
    },
    mockContextBridge: {
        exposeInMainWorld: vi.fn(),
    },
}));

vi.mock('electron', () => ({
    ipcRenderer: mockIpcRenderer,
    contextBridge: mockContextBridge,
}));

describe('Preload Script', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        // Dynamically import preload to trigger execution
        return import('@/preload/preload');
    });

    it('should expose ipcRenderer', () => {
        // exposeInMainWorld('ipcRenderer', {...})
        const calls = mockContextBridge.exposeInMainWorld.mock.calls;
        const ipcRendererCall = calls.find((call: any[]) => call[0] === 'ipcRenderer');
        expect(ipcRendererCall).toBeDefined();

        const exposedApi = ipcRendererCall![1];
        expect(exposedApi).toHaveProperty('on');
        expect(exposedApi).toHaveProperty('off');
        expect(exposedApi).toHaveProperty('send');
        expect(exposedApi).toHaveProperty('invoke');

        // Test wrappers
        const listener = vi.fn();
        exposedApi.on('channel', listener);
        expect(mockIpcRenderer.on).toHaveBeenCalledWith('channel', expect.any(Function));

        exposedApi.send('channel', 'data');
        expect(mockIpcRenderer.send).toHaveBeenCalledWith('channel', 'data');

        exposedApi.invoke('channel', 'data');
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('channel', 'data');
    });

    it('should expose electron API', () => {
        const calls = mockContextBridge.exposeInMainWorld.mock.calls;
        const electronCall = calls.find((call: any[]) => call[0] === 'electron');
        expect(electronCall).toBeDefined();

        const exposedApi = electronCall![1];
        expect(exposedApi).toHaveProperty('fs');
        expect(exposedApi).toHaveProperty('git');
        expect(exposedApi).toHaveProperty('request');
    });

    describe('fs API', () => {
        const getFsApi = () => {
            const calls = mockContextBridge.exposeInMainWorld.mock.calls;
            // Add check to fail fast if undefined (helps debugging)
            const call = calls.find((call: any[]) => call[0] === 'electron');
            if (!call) throw new Error('electron API not exposed');
            return call[1].fs;
        };

        it('should call correct ipc channels', () => {
            const fsApi = getFsApi();

            fsApi.readDir('path');
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('fs:read-dir', 'path');

            fsApi.readFile('path');
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('fs:read-file', 'path');

            fsApi.writeFile('path', 'content');
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('fs:write-file', 'path', 'content');

            fsApi.createDirectory('path');
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('fs:create-dir', 'path');

            fsApi.rename('old', 'new');
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('fs:rename', 'old', 'new');

            fsApi.delete('path');
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('fs:delete', 'path');

            fsApi.selectFolder();
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('fs:select-folder');

            fsApi.selectFile();
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('fs:select-file');

            fsApi.saveFileDialog('default');
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('fs:save-file-dialog', 'default');

            fsApi.watch('path');
            expect(mockIpcRenderer.send).toHaveBeenCalledWith('fs:watch', 'path');

            fsApi.getUserDataPath();
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('app:get-user-data-path');

            fsApi.getGlobalsPath();
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('app:get-globals-path');
        });

        it('should handle onChanged listener', () => {
            const fsApi = getFsApi();
            const callback = vi.fn();
            const unsubscribe = fsApi.onChanged(callback);

            expect(mockIpcRenderer.on).toHaveBeenCalledWith('fs:changed', expect.any(Function));

            const call = mockIpcRenderer.on.mock.calls.find((c: any[]) => c[0] === 'fs:changed');
            expect(call).toBeDefined();
            const listener = call![1];

            listener({}, 'event', 'path');
            expect(callback).toHaveBeenCalledWith('event', 'path');

            unsubscribe();
            expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith('fs:changed', listener);
        });
    });

    describe('git API', () => {
        const getGitApi = () => {
            const calls = mockContextBridge.exposeInMainWorld.mock.calls;
            const call = calls.find((call: any[]) => call[0] === 'electron');
            if (!call) throw new Error('electron API not exposed');
            return call[1].git;
        };

        it('should call correct ipc channels', () => {
            const gitApi = getGitApi();

            gitApi.getStatus('path');
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('git:status', 'path');

            gitApi.stage('path', ['file']);
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('git:stage', 'path', ['file']);

            gitApi.unstage('path', ['file']);
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('git:unstage', 'path', ['file']);

            gitApi.commit('path', 'msg');
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('git:commit', 'path', 'msg');

            gitApi.push('path');
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('git:push', 'path');

            gitApi.pull('path');
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('git:pull', 'path');

            gitApi.checkout('path', 'branch');
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('git:checkout', 'path', 'branch');

            gitApi.getBranches('path');
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('git:get-branches', 'path');

            gitApi.findRepos('path');
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('git:find-repos', 'path');

            gitApi.getFileContent('path', 'file', 'ref');
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('git:get-file-content', 'path', 'file', 'ref');
        });
    });

    describe('request API', () => {
        const getRequestApi = () => {
            const calls = mockContextBridge.exposeInMainWorld.mock.calls;
            const call = calls.find((call: any[]) => call[0] === 'electron');
            if (!call) throw new Error('electron API not exposed');
            return call[1].request;
        };

        it('should call correct ipc channels', () => {
            const requestApi = getRequestApi();
            requestApi.execute({}, {});
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('request:execute', {}, {});
        });
    });
});
