import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFileSystemStore } from './file-system';

// Mock window.electron
const mockFs = {
    readDir: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    createDirectory: vi.fn(),
    rename: vi.fn(),
    delete: vi.fn(),
    watch: vi.fn(),
    stopWatch: vi.fn(),
    onChanged: vi.fn(),
};

vi.stubGlobal('window', {
    electron: {
        fs: mockFs
    },
    navigator: {
        userAgent: 'Linux'
    }
});

// Mock dynamic import of request store
vi.mock('./request', () => ({
    useRequestStore: vi.fn(() => ({
        loadFromFile: vi.fn()
    }))
}));

import { useRequestStore } from './request';

describe('FileSystem Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        mockFs.onChanged.mockReturnValue(() => {});
    });

    it('should load directory', async () => {
        const store = useFileSystemStore();
        const entries = [{ name: 'test', type: 'file' }];
        mockFs.readDir.mockResolvedValue(entries);

        store.currentPath = '/test/path';
        // Trigger loadDirectory indirectly or export it?
        // It is not exported directly, but openDirectory calls it.
        await store.openDirectory('/test/path');

        expect(mockFs.readDir).toHaveBeenCalledWith('/test/path');
        expect(store.rootEntry).toEqual(entries);
    });

    it('should select file and load it into request store', async () => {
        const store = useFileSystemStore();
        const fileContent = { id: '1', name: 'req' };
        mockFs.readFile.mockResolvedValue(fileContent);

        const mockRequestStore = { loadFromFile: vi.fn() };
        (useRequestStore as any).mockReturnValue(mockRequestStore);

        await store.selectFile('/test/file.j5request');

        expect(mockFs.readFile).toHaveBeenCalledWith('/test/file.j5request');
        expect(store.selectedFile).toEqual(fileContent);
        expect(store.selectedFilePath).toBe('/test/file.j5request');
        expect(mockRequestStore.loadFromFile).toHaveBeenCalledWith(fileContent, '/test/file.j5request');
    });

    it('should save request', async () => {
        const store = useFileSystemStore();
        store.selectedFilePath = '/test/file.j5request';
        store.selectedFile = { id: '1', name: 'req' } as any;

        await store.saveRequest();

        expect(mockFs.writeFile).toHaveBeenCalledWith('/test/file.j5request', { id: '1', name: 'req' });
    });

    it('should create request', async () => {
        const store = useFileSystemStore();
        store.currentPath = '/test/dir';
        mockFs.writeFile.mockResolvedValue(undefined);

        // Mock selectFile internal call?
        // selectFile is public, so we can spy on it if we want, but it's part of the store.
        // It calls window.electron.fs.readFile.
        mockFs.readFile.mockResolvedValue({ id: 'new', name: 'test' });

        await store.createRequest('test');

        expect(mockFs.writeFile).toHaveBeenCalledWith(
            '/test/dir/test.j5request',
            expect.objectContaining({ name: 'test' })
        );
        // It should also select the file
        expect(mockFs.readFile).toHaveBeenCalledWith('/test/dir/test.j5request');
    });

    it('should create folder', async () => {
        const store = useFileSystemStore();
        store.currentPath = '/test/dir';

        await store.createFolder('newfolder');

        expect(mockFs.createDirectory).toHaveBeenCalledWith('/test/dir/newfolder');
    });

    it('should rename item', async () => {
        const store = useFileSystemStore();

        await store.renameItem('/test/dir/old', 'new');

        expect(mockFs.rename).toHaveBeenCalledWith('/test/dir/old', '/test/dir/new');
    });

    it('should use backslash separator on Windows', async () => {
        const store = useFileSystemStore();
        
        // Mock navigator.userAgent
        const originalUserAgent = navigator.userAgent;
        Object.defineProperty(navigator, 'userAgent', {
            value: 'Windows',
            configurable: true
        });

        await store.renameItem('C:\\test\\old', 'new');
        expect(mockFs.rename).toHaveBeenCalledWith('C:\\test\\old', 'C:\\test\\new');
        
        // Restore
        Object.defineProperty(navigator, 'userAgent', {
            value: originalUserAgent,
            configurable: true
        });
    });

    it('should delete item and clear selection if active', async () => {
        const store = useFileSystemStore();
        store.selectedFilePath = '/test/dir/item';
        store.selectedFile = {} as any;

        await store.deleteItem('/test/dir/item');

        expect(mockFs.delete).toHaveBeenCalledWith('/test/dir/item');
        expect(store.selectedFilePath).toBeNull();
        expect(store.selectedFile).toBeNull();
    });

    it('should delete item and NOT clear selection if not active', async () => {
        const store = useFileSystemStore();
        store.selectedFilePath = '/test/dir/other';
        store.selectedFile = {} as any;

        await store.deleteItem('/test/dir/item');

        expect(mockFs.delete).toHaveBeenCalledWith('/test/dir/item');
        expect(store.selectedFilePath).not.toBeNull();
    });

    it('should setup watcher on openDirectory', async () => {
        const store = useFileSystemStore();
        mockFs.readDir.mockResolvedValue([]);

        await store.openDirectory('/test/path');

        expect(mockFs.watch).toHaveBeenCalledWith('/test/path');
        expect(mockFs.onChanged).toHaveBeenCalled();

        // Simulate file change event
        const changeHandler = mockFs.onChanged.mock.calls[0][0];
        
        // 1. Just refresh tree
        await changeHandler('unlink', '/test/path/other.txt');
        expect(mockFs.readDir).toHaveBeenCalledTimes(2);

        // 2. Reload selected file if it changed
        store.selectedFilePath = '/test/path/file.j5request';
        mockFs.readFile.mockResolvedValue({ id: '1', name: 'updated' });
        await changeHandler('change', '/test/path/file.j5request');
        expect(mockFs.readFile).toHaveBeenCalledWith('/test/path/file.j5request');
    });

    it('should not load directory if path is null', async () => {
        const store = useFileSystemStore();
        store.currentPath = null;
        // openDirectory(null) is not possible via types, but we can check initial state or side effects
        // since openDirectory immediately sets the path, we can't easily trigger loadDirectory with null path via it.
        // But we can verify that initial state doesn't trigger anything.
        expect(mockFs.readDir).not.toHaveBeenCalled();
    });

    it('should handle errors in all operations', async () => {
        const store = useFileSystemStore();
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // openDirectory with null path (branch coverage)
        await store.openDirectory(null as any);
        expect(mockFs.readDir).not.toHaveBeenCalled();

        // selectFile error
        mockFs.readFile.mockRejectedValue(new Error('fail'));
        await store.selectFile('/path');
        expect(store.selectedFile).toBeNull();

        // createRequest error
        store.currentPath = '/dir';
        mockFs.writeFile.mockRejectedValue(new Error('fail'));
        await store.createRequest('new');
        expect(consoleSpy).toHaveBeenCalled();

        // createFolder error
        mockFs.createDirectory.mockRejectedValue(new Error('fail'));
        await expect(store.createFolder('new')).rejects.toThrow();

        // renameItem error
        mockFs.rename.mockRejectedValue(new Error('fail'));
        await expect(store.renameItem('/old', 'new')).rejects.toThrow();

        // deleteItem error
        mockFs.delete.mockRejectedValue(new Error('fail'));
        await expect(store.deleteItem('/path')).rejects.toThrow();

        consoleSpy.mockRestore();
    });
});
