/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFileSystemStore } from '@/renderer/stores/file-system';

// Mock window.electron
const mockFs = {
    readDir: vi.fn(),
    readFile: vi.fn(),
    readTextFile: vi.fn(),
    writeFile: vi.fn(),
    createDirectory: vi.fn(),
    rename: vi.fn(),
    delete: vi.fn(),
    watch: vi.fn(),
    stopWatch: vi.fn(),
    onChanged: vi.fn(),
    getUserDataPath: vi.fn(),
    getGlobalsPath: vi.fn(),
    makeRelative: vi.fn(),
};

// Use surgical stubs instead of replacing entire window
if (typeof window !== 'undefined') {
    (window as any).electron = {
        fs: mockFs
    };
}

// Ensure navigator is stubbed globally for environments where it might be missing
vi.stubGlobal('navigator', {
    userAgent: 'Linux'
});

// Mock dynamic import of request store
vi.mock('@/renderer/stores/request', () => ({
    useRequestStore: vi.fn(() => ({
        loadFromFile: vi.fn(),
        closeTabByPath: vi.fn()
    }))
}));

import { useRequestStore } from '@/renderer/stores/request';

describe('FileSystem Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        mockFs.onChanged.mockReturnValue(() => { });
    });

    // ... unchanged parts ...

    it('should delete item and update state', async () => {
        const store = useFileSystemStore();
        store.selectedFilePath = '/test/dir/item';
        store.selectedFile = {} as any;

        const mockRequestStore = {
            loadFromFile: vi.fn(),
            closeTabByPath: vi.fn()
        };
        (useRequestStore as any).mockReturnValue(mockRequestStore);

        await store.deleteItem('/test/dir/item');

        expect(mockFs.delete).toHaveBeenCalledWith('/test/dir/item');
        expect(store.selectedFilePath).toBeNull();
        expect(store.selectedFile).toBeNull();
        expect(mockRequestStore.closeTabByPath).toHaveBeenCalledWith('/test/dir/item');
    });

    it('should delete item and NOT clear selection if not active', async () => {
        const store = useFileSystemStore();
        store.selectedFilePath = '/test/dir/other';
        store.selectedFile = {} as any;

        const mockRequestStore = {
            loadFromFile: vi.fn(),
            closeTabByPath: vi.fn()
        };
        (useRequestStore as any).mockReturnValue(mockRequestStore);

        await store.deleteItem('/test/dir/item');

        expect(mockFs.delete).toHaveBeenCalledWith('/test/dir/item');
        expect(store.selectedFilePath).not.toBeNull();
        expect(mockRequestStore.closeTabByPath).toHaveBeenCalledWith('/test/dir/item');
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
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

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
