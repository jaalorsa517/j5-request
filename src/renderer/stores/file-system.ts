import { defineStore } from 'pinia';
import { ref } from 'vue';
import { J5FileEntry, J5Request } from '@/shared/types';

export const useFileSystemStore = defineStore('file-system', () => {
    const rootEntry = ref<J5FileEntry[]>([]);
    const currentPath = ref<string | null>(null);
    const selectedFile = ref<J5Request | null>(null);
    const selectedFilePath = ref<string | null>(null);

    const editingPath = ref<string | null>(null);
    const editingName = ref<string>('');

    function startRename(path: string, currentName: string) {
        editingPath.value = path;
        editingName.value = path.endsWith('.j5request') ? currentName.replace('.j5request', '') : currentName;
    }

    function cancelRename() {
        editingPath.value = null;
        editingName.value = '';
    }

    async function finishRename() {
        const path = editingPath.value;
        const name = editingName.value.trim();
        cancelRename();
        if (!path || !name) {
            return;
        }
        try {
            await renameItem(path, name);
        } catch (e: any) {
            alert('Error al renombrar: ' + e.message);
        }
    }

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

    async function selectDirectory(path: string) {
        selectedFilePath.value = path;
        selectedFile.value = null;
    }

    async function selectFile(path: string) {
        try {
            const content = await window.electron.fs.readFile(path);
            selectedFile.value = content;
            selectedFilePath.value = path;

            // Cargar en RequestStore
            const { useRequestStore } = await import('@/renderer/stores/request');
            const requestStore = useRequestStore();
            requestStore.loadFromFile(content, path);
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

        let parentDir = currentPath.value;
        if (selectedFilePath.value) {
            if (selectedFilePath.value.endsWith('.j5request')) {
                const separator = (typeof navigator !== 'undefined' && navigator.userAgent.includes('Win')) ? '\\' : '/';
                parentDir = selectedFilePath.value.substring(0, selectedFilePath.value.lastIndexOf(separator));
            } else {
                parentDir = selectedFilePath.value;
            }
        }

        // Ensure .j5request extension
        const finalName = filename.endsWith('.j5request') ? filename : `${filename}.j5request`;
        const separator = (typeof navigator !== 'undefined' && navigator.userAgent.includes('Win')) ? '\\' : '/';
        const newPath = `${parentDir}${separator}${finalName}`;

        const newRequest: J5Request = {
            id: crypto.randomUUID(),
            name: finalName.replace('.j5request', ''),
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
        let parentDir = currentPath.value;
        if (selectedFilePath.value) {
            if (selectedFilePath.value.endsWith('.j5request')) {
                const separator = (typeof navigator !== 'undefined' && navigator.userAgent.includes('Win')) ? '\\' : '/';
                parentDir = selectedFilePath.value.substring(0, selectedFilePath.value.lastIndexOf(separator));
            } else {
                parentDir = selectedFilePath.value;
            }
        }
        const separator = (typeof navigator !== 'undefined' && navigator.userAgent.includes('Win')) ? '\\' : '/';
        const newPath = `${parentDir}${separator}${name}`;
        try {
            await window.electron.fs.createDirectory(newPath);
        } catch (e) {
            console.error('Failed to create directory', e);
            throw e;
        }
    }

    async function renameItem(oldPath: string, newName: string) {
        const separator = (typeof navigator !== 'undefined' && navigator.userAgent.includes('Win')) ? '\\' : '/';
        const directory = oldPath.substring(0, oldPath.lastIndexOf(separator));
        
        let finalName = newName;
        if (oldPath.endsWith('.j5request') && !newName.endsWith('.j5request')) {
            finalName = `${newName}.j5request`;
        }
        
        const newPath = `${directory}${separator}${finalName}`;
        try {
            await window.electron.fs.rename(oldPath, newPath);

            const isDir = !oldPath.endsWith('.j5request');

            // Actualizar la propiedad name dentro del archivo JSON
            if (!isDir) {
                try {
                    const content = await window.electron.fs.readFile(newPath);
                    if (content && typeof content === 'object') {
                        content.name = finalName.replace('.j5request', '');
                        await window.electron.fs.writeFile(newPath, content);
                    }
                } catch (err) {
                    console.error('Failed to update internal request name', err);
                }
            }

            // Actualizar referencias en el request store
            const { useRequestStore } = await import('@/renderer/stores/request');
            const requestStore = useRequestStore();

            requestStore.tabs.forEach(t => {
                if (t.filePath) {
                    if (t.filePath === oldPath) {
                        t.filePath = newPath;
                        t.name = finalName.replace('.j5request', '');
                        t.request.name = finalName.replace('.j5request', '');
                    } else if (isDir && t.filePath.startsWith(oldPath + separator)) {
                        t.filePath = newPath + t.filePath.substring(oldPath.length);
                    }
                }
            });

            // Actualizar selección activa
            if (selectedFilePath.value) {
                if (selectedFilePath.value === oldPath) {
                    selectedFilePath.value = newPath;
                    if (selectedFile.value) {
                        selectedFile.value.name = finalName.replace('.j5request', '');
                    }
                } else if (isDir && selectedFilePath.value.startsWith(oldPath + separator)) {
                    selectedFilePath.value = newPath + selectedFilePath.value.substring(oldPath.length);
                }
            }
        } catch (e) {
            console.error('Failed to rename item', e);
            throw e;
        }
    }

    async function deleteItem(path: string) {
        try {
            await window.electron.fs.delete(path);

            // Cerrar pestañas abiertas
            const { useRequestStore } = await import('@/renderer/stores/request');
            const requestStore = useRequestStore();
            requestStore.closeTabByPath(path);

            // Limpiar selección si el archivo eliminado (o carpeta contenedora) estaba seleccionado
            const separator = (typeof navigator !== 'undefined' && navigator.userAgent.includes('Win')) ? '\\' : '/';
            if (selectedFilePath.value && (selectedFilePath.value === path || selectedFilePath.value.startsWith(path + separator))) {
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
        editingPath,
        editingName,
        startRename,
        cancelRename,
        finishRename,
        openDirectory,
        selectFile,
        selectDirectory,
        saveRequest,
        createRequest,
        createFolder,
        renameItem,
        deleteItem
    };
});
