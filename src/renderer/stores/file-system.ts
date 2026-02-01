import { defineStore } from 'pinia';
import { ref } from 'vue';
import { J5FileEntry, J5Request } from '../../shared/types';

export const useFileSystemStore = defineStore('file-system', () => {
    const rootEntry = ref<J5FileEntry[]>([]);
    const currentPath = ref<string | null>(null);
    const selectedFile = ref<J5Request | null>(null);
    const selectedFilePath = ref<string | null>(null);

    // Listener cleanup
    let stopWatcher: (() => void) | null = null;

    async function loadDirectory() {
        if (!currentPath.value) return;
        try {
            rootEntry.value = await window.electron.fs.readDir(currentPath.value);
        } catch (e) {
            console.error('Failed to load directory', e);
        }
    }

    async function openDirectory(path: string) {
        currentPath.value = path;
        await loadDirectory();

        // Start watcher
        window.electron.fs.watch(path);

        // Implement 3.3: Listen to events
        if (stopWatcher) stopWatcher();
        stopWatcher = window.electron.fs.onChanged((event, changedPath) => {
            console.log('File System Event:', event, changedPath);
            // Refresh tree on any change for now
            loadDirectory();

            // If the selected file changed externally, reload it
            // Note: This might overwrite local unsaved changes if we had them.
            // For now, we assume simple flow.
            if (selectedFilePath.value && (changedPath === selectedFilePath.value || changedPath.endsWith(selectedFilePath.value))) {
                selectFile(selectedFilePath.value);
            }
        });
    }

    async function selectFile(path: string) {
        try {
            const content = await window.electron.fs.readFile(path);
            selectedFile.value = content;
            selectedFilePath.value = path;

            // Cargar en RequestStore
            const { useRequestStore } = await import('./request');
            const requestStore = useRequestStore();
            requestStore.loadFromFile(content);
        } catch (e) {
            console.error('Failed to read file', e);
            selectedFile.value = null;
        }
    }

    async function saveRequest() {
        if (selectedFilePath.value && selectedFile.value) {
            // Unwrap the proxy to plain object
            const content = JSON.parse(JSON.stringify(selectedFile.value));
            await window.electron.fs.writeFile(selectedFilePath.value, content);
        }
    }

    async function createRequest(filename: string) {
        if (!currentPath.value) return;

        // Ensure .json extension
        const finalName = filename.endsWith('.json') ? filename : `${filename}.json`;
        // Basic path join (assuming unix-style for now, but electron handles absolute paths)
        // Ideally we should use path.join in main process, but string concat works if currentPath has separation
        // Let's assume currentPath is absolute.
        // We'll trust the main process write-file to handle absolute path.
        // We need the separator. Electron runs on Node, but this is renderer.
        // Let's use a simple slash, assuming Linux/macOS or that Electron normalization handles it.
        const separator = navigator.userAgent.includes('Win') ? '\\' : '/';
        const newPath = `${currentPath.value}${separator}${finalName}`;

        const newRequest: J5Request = {
            id: crypto.randomUUID(),
            name: finalName.replace('.json', ''),
            method: 'GET',
            url: '',
            headers: {},
            params: {}
        };

        try {
            await window.electron.fs.writeFile(newPath, newRequest);
            // The watcher will trigger reload, but let's select it immediately
            await selectFile(newPath);
        } catch (e) {
            console.error('Failed to create file', e);
        }
    }

    async function createFolder(name: string) {
        if (!currentPath.value) return;
        const separator = navigator.userAgent.includes('Win') ? '\\' : '/';
        const newPath = `${currentPath.value}${separator}${name}`;
        try {
            await window.electron.fs.createDirectory(newPath);
        } catch (e) {
            console.error('Failed to create directory', e);
            throw e;
        }
    }

    async function renameItem(oldPath: string, newName: string) {
        const separator = navigator.userAgent.includes('Win') ? '\\' : '/';
        const directory = oldPath.substring(0, oldPath.lastIndexOf(separator));
        const newPath = `${directory}${separator}${newName}`;
        try {
            await window.electron.fs.rename(oldPath, newPath);
        } catch (e) {
            console.error('Failed to rename item', e);
            throw e;
        }
    }

    async function deleteItem(path: string) {
        try {
            await window.electron.fs.delete(path);
            if (selectedFilePath.value === path) {
                selectedFile.value = null;
                selectedFilePath.value = null;
            }
        } catch (e) {
            console.error('Failed to delete item', e);
            throw e;
        }
    }

    return {
        rootEntry,
        currentPath,
        selectedFile,
        selectedFilePath,
        openDirectory,
        selectFile,
        saveRequest,
        createRequest,
        createFolder,
        renameItem,
        deleteItem
    };
});
