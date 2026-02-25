<script setup lang="ts">
import FileTree from '@/renderer/components/FileTree.vue';
import RequestPanel from '@/renderer/components/RequestPanel.vue';
import ResponsePanel from '@/renderer/components/ResponsePanel.vue';
import GitPanel from '@/renderer/components/git/GitPanel.vue';
import DiffEditor from '@/renderer/components/git/DiffEditor.vue';
import EnvironmentSelector from '@/renderer/components/EnvironmentSelector.vue';
import EnvironmentManagerModal from '@/renderer/components/EnvironmentManagerModal.vue';
import ImportModal from '@/renderer/components/ImportModal.vue';
import ContextMenu, { MenuItem } from '@/renderer/components/ContextMenu.vue';
import ConfirmModal from '@/renderer/components/ConfirmModal.vue';
import ExportDialog from '@/renderer/components/ExportDialog.vue';
import { J5FileEntry, J5Request } from '@/shared/types';
import RequestTabBar from '@/renderer/components/RequestTabBar.vue';
import { useFileSystemStore } from '@/renderer/stores/file-system';
import { useRequestStore } from '@/renderer/stores/request';
import { useEnvironmentStore } from '@/renderer/stores/environment';
import { useThemeStore } from '@/renderer/stores/theme';
import { ref } from 'vue';

const store = useFileSystemStore();
const requestStore = useRequestStore();
const envStore = useEnvironmentStore();
const themeStore = useThemeStore();
const showNewRequestModal = ref(false);
const newRequestName = ref('');
const showImportModal = ref(false);

// Context Menu State
const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const contextMenuTarget = ref<J5FileEntry | null>(null);
const contextMenuItems = ref<MenuItem[]>([
    { label: 'Eliminar', action: 'delete', danger: true }
]);

// Delete Modal State
const showDeleteConfirm = ref(false);
const itemToDelete = ref<J5FileEntry | null>(null);

// Export Dialog State
const showExportDialog = ref(false);
const exportSingleRequest = ref<Partial<J5Request> | undefined>(undefined);
const exportCollectionRequests = ref<J5Request[] | undefined>(undefined);

// Navigation state
const activeActivity = ref<'explorer' | 'git'>('explorer');

// Diff state
const showDiff = ref(false);
const diffOriginal = ref('');
const diffModified = ref('');
const diffLanguage = ref('json');

async function openFolder() {
    try {
        const path = await window.electron.fs.selectFolder();
        if (path) {
            await store.openDirectory(path);
        }
    } catch (e: any) {
        alert('Error opening folder: ' + e.message);
    }
}

function openCreateModal() {
    newRequestName.value = '';
    showNewRequestModal.value = true;
}

async function confirmCreateRequest() {
    if (newRequestName.value) {
        try {
            await store.createRequest(newRequestName.value);
            showNewRequestModal.value = false;
        } catch (e: any) {
            alert('Error creating request: ' + e.message);
        }
    }
}

async function saveRequest() {
    try {
        await requestStore.saveToFile();
    } catch (e: any) {
        alert('Error saving request: ' + e.message);
    }
}

async function handleOpenDiff(file: string, repoPath: string) {
    try {
        // Assume file path is relative to repoPath or absolute? 
        // GitService expects relative for getFileContent, but getStatus returns paths relative to repo root (usually).
        // Let's assume file is relative to repoPath.
        
        // 1. Get original content
        diffOriginal.value = await window.electron.git.getFileContent(repoPath, file, 'HEAD');
        
        // 2. Get modified content (from disk)
        // We need absolute path for fs.readFile.
        // If file is relative, we join with repoPath.
        const separator = navigator.userAgent.includes('Win') ? '\\' : '/';
        const absolutePath = `${repoPath}${separator}${file}`;
        
        // Use fs.readTextFile to read the raw string content without attempting to parse JSON.
        const content = await window.electron.fs.readTextFile(absolutePath);
        
        if (typeof content === 'string') {
            diffModified.value = content;
        } else {
            // Fallback just in case, though readTextFile should return strictly string.
            diffModified.value = JSON.stringify(content, null, 2);
        }
        
        showDiff.value = true;
        // Language detection based on extension
        if (file.endsWith('.json')) diffLanguage.value = 'json';
        else if (file.endsWith('.js') || file.endsWith('.ts')) diffLanguage.value = 'typescript';
        else diffLanguage.value = 'plaintext';
        
    } catch (e: any) {
        console.error("Failed to open diff", e);
        alert('Error opening diff: ' + e.message);
    }
}

function closeDiff() {
    showDiff.value = false;
}

function openImportModal() {
    showImportModal.value = true;
}

function handleImported(count: number) {
    // TODO: Refresh file tree aquí cuando se implementen las secciones 4
    console.log(`Imported ${count} requests successfully`);
    // Potencialmente: await store.refreshDirectory();
}

function handleNodeContextMenu(event: MouseEvent, entry: J5FileEntry) {
    contextMenuTarget.value = entry;
    contextMenuX.value = event.clientX;
    contextMenuY.value = event.clientY;
    
    // Update context menu items based on entry type
    contextMenuItems.value = [
        { label: 'Exportar...', action: 'export' },
        { label: 'Eliminar', action: 'delete', danger: true }
    ];
    
    showContextMenu.value = true;
}

async function handleContextMenuAction(item: MenuItem) {
    showContextMenu.value = false;
    if (item.action === 'delete' && contextMenuTarget.value) {
        itemToDelete.value = contextMenuTarget.value;
        showDeleteConfirm.value = true;
    } else if (item.action === 'export' && contextMenuTarget.value) {
        const target = contextMenuTarget.value;
        if (target.type === 'directory') {
            try {
                // Show loading indicator?
                const reqs = await window.electron.fs.readAllRequests(target.path);
                if (!reqs || reqs.length === 0) {
                    alert('No se encontraron peticiones en la carpeta seleccionada.');
                    return;
                }
                exportCollectionRequests.value = reqs;
                exportSingleRequest.value = undefined;
                showExportDialog.value = true;
            } catch (e: any) {
                alert('Error al leer la carpeta: ' + e.message);
            }
        } else {
             // Single file
             try {
                 const req = await window.electron.fs.readFile(target.path);
                 exportSingleRequest.value = req;
                 exportCollectionRequests.value = undefined;
                 showExportDialog.value = true;
             } catch (e: any) {
                 alert('Error al leer el archivo: ' + e.message);
             }
        }
    }
}

async function confirmDelete() {
    if (itemToDelete.value) {
        try {
            await store.deleteItem(itemToDelete.value.path);
            itemToDelete.value = null;
            showDeleteConfirm.value = false;
        } catch (e: any) {
             alert('Error deleting item: ' + e.message);
        }
    }
}
</script>

<template>
    <div class="mainLayout">
        <!-- Activity Bar -->
        <div class="activityBar">
            <button 
                class="activityBar__item" 
                :class="{ active: activeActivity === 'explorer' }"
                @click="activeActivity = 'explorer'; closeDiff()"
                title="Explorer"
            >
                📁
            </button>
             <button 
                class="activityBar__item" 
                :class="{ active: activeActivity === 'git' }"
                @click="activeActivity = 'git'"
                title="Source Control"
            >
                🌲
            </button>
            <div style="flex: 1;"></div>
            <button
                class="activityBar__item theme-toggle"
                @click="themeStore.toggleTheme()"
                title="Toggle Theme"
            >
                {{ themeStore.theme === 'dark' ? '☀️' : '🌙' }}
            </button>
        </div>

        <!-- Sidebar -->
        <aside class="mainLayout__sidebar">
            <div class="mainLayout__sidebarHeader" v-if="activeActivity === 'explorer'">
                <div style="margin-bottom: 8px;">
                     <EnvironmentSelector />
                </div>
                <button class="mainLayout__actionButton" @click="openFolder">
                    📂 Open
                </button>
                <button
                    class="mainLayout__actionButton"
                    :disabled="!store.currentPath"
                    @click="openCreateModal"
                >
                    ➕ New
                </button>
                <button
                    class="mainLayout__actionButton mainLayout__actionButton--save"
                    :class="{ 'mainLayout__actionButton--dirty': requestStore.isDirty }"
                    :disabled="!store.selectedFile"
                    @click="saveRequest"
                >
                    {{ requestStore.isDirty ? '● ' : '' }}💾 Save
                </button>
                <button
                    class="mainLayout__actionButton"
                    @click="openImportModal"
                >
                    📥 Import
                </button>
            </div>
            
            <div class="mainLayout__sidebarContent">
                <FileTree v-if="activeActivity === 'explorer'" :entries="store.rootEntry" @node-contextmenu="handleNodeContextMenu" />
                <GitPanel v-else-if="activeActivity === 'git'" @openDiff="handleOpenDiff" />
            </div>
        </aside>

        <!-- Workspace -->
        <div class="mainLayout__workspace">
            <RequestTabBar />
            
            <template v-if="showDiff">
                 <div class="diff-header">
                     <button @click="closeDiff" class="close-diff-btn">❌ Close Diff</button>
                 </div>
                 <DiffEditor 
                    :original="diffOriginal" 
                    :modified="diffModified" 
                    :language="diffLanguage" 
                 />
            </template>
            <template v-else>
                <div class="mainLayout__panel mainLayout__panel--request">
                    <RequestPanel />
                </div>
                <div class="mainLayout__panel mainLayout__panel--response">
                    <ResponsePanel />
                </div>
            </template>
        </div>


        <!-- Modal -->
        <div v-if="showNewRequestModal" class="mainLayout__modalOverlay">
            <div class="mainLayout__modal">
                <h3 class="mainLayout__modalTitle">New Request</h3>
                <input
                    v-model="newRequestName"
                    class="mainLayout__modalInput"
                    placeholder="Request Name"
                    autofocus
                    @keyup.enter="confirmCreateRequest"
                />
                <div class="mainLayout__modalActions">
                    <button @click="showNewRequestModal = false">Cancel</button>
                    <button @click="confirmCreateRequest">Create</button>
                </div>
            </div>
        </div>
        
        <EnvironmentManagerModal v-if="envStore.showManager" />
        <ImportModal 
            v-if="showImportModal" 
            @close="showImportModal = false"
            @imported="handleImported"
        />

        <ContextMenu 
            v-if="showContextMenu"
            :x="contextMenuX"
            :y="contextMenuY"
            :items="contextMenuItems"
            @action="handleContextMenuAction"
            @close="showContextMenu = false"
        />

        <ConfirmModal
            :is-open="showDeleteConfirm"
            :title="itemToDelete?.type === 'directory' ? 'Eliminar Carpeta' : 'Eliminar Archivo'"
            :message="`¿Estás seguro de que deseas eliminar permanentemente '${itemToDelete?.name}'? Esta acción no se puede deshacer.`"
            confirm-text="Eliminar"
            :danger="true"
            @confirm="confirmDelete"
            @cancel="showDeleteConfirm = false"
        />

        <ExportDialog
            :is-open="showExportDialog"
            :request="exportSingleRequest"
            :requests="exportCollectionRequests"
            @close="showExportDialog = false"
        />
    </div>
</template>

<style scoped>
.mainLayout {
    display: flex;
    height: 100vh;
    width: 100vw;
    background-color: var(--bg-primary);
    color: var(--text-primary);
}



/* Activity Bar */
.activityBar {
    width: 48px;
    background-color: var(--bg-tertiary);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 10px;
    border-right: 1px solid var(--border-color);
}

.activityBar__item {
    background: none;
    border: none;
    font-size: 1.5em; /* Emoji size */
    padding: 10px;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.2s;
    width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.activityBar__item:hover {
    opacity: 0.8;
}

.activityBar__item.active {
    opacity: 1;
    border-left: 2px solid var(--accent-color); /* Active indicator */
    background-color: var(--bg-secondary);
}

/* Sidebar */
.mainLayout__sidebar {
    width: 280px;
    background-color: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
}

.mainLayout__sidebarHeader {
    padding: 12px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.mainLayout__actionButton {
    width: 100%;
    padding: 8px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--input-border);
    color: var(--text-primary);
    cursor: pointer;
    border-radius: 4px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    transition: background-color 0.2s;
}

.mainLayout__actionButton:hover:not(:disabled) {
    background-color: var(--input-border);
}

.mainLayout__actionButton:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.mainLayout__actionButton--save {
    background-color: var(--accent-color);
    color: var(--text-inverse);
    border: none;
}

.mainLayout__actionButton--save:hover:not(:disabled) {
    background-color: var(--accent-hover);
}

.mainLayout__actionButton--dirty {
    background-color: var(--accent-dirty);
    color: var(--text-inverse);
    border: none;
}

.mainLayout__actionButton--dirty:hover:not(:disabled) {
    background-color: var(--accent-dirty-hover);
}

.mainLayout__sidebarContent {
    flex: 1;
    overflow-y: auto;
    padding: 10px 0;
}

/* Workspace */
.mainLayout__workspace {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0; /* Permite que flex shrink funcione correctamente */
}

.mainLayout__panel {
    flex: 1;
    overflow: hidden;
    min-height: 0; /* Permite que flex shrink funcione correctamente */
    display: flex;
    flex-direction: column;
}

.mainLayout__panel--request {
    border-bottom: 1px solid var(--border-color);
}

/* Modal */
.mainLayout__modalOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.mainLayout__modal {
    background: var(--bg-modal);
    padding: 24px;
    border-radius: 8px;
    border: 1px solid var(--input-border);
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.mainLayout__modalTitle {
    margin: 0;
    font-size: 1.2rem;
    color: var(--text-primary);
}

.mainLayout__modalInput {
    padding: 10px;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--text-primary);
    border-radius: 4px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.mainLayout__modalActions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.mainLayout__modalActions button {
    padding: 8px 16px;
    cursor: pointer;
    background: var(--input-border);
    border: none;
    color: var(--text-primary);
    border-radius: 4px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    transition: background-color 0.2s;
}

.mainLayout__modalActions button:hover {
    background: var(--bg-tertiary);
}

.mainLayout__modalActions button:last-child {
    background: var(--accent-color);
    color: var(--text-inverse);
}

.mainLayout__modalActions button:last-child:hover {
    background: var(--accent-hover);
}

/* Diff View */
.diff-header {
    height: 35px;
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    padding: 0 10px;
}

.close-diff-btn {
    background: none;
    border: 1px solid var(--input-border);
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9em;
    padding: 2px 8px;
    border-radius: 3px;
}
.close-diff-btn:hover {
    background: var(--bg-tertiary);
}

.theme-toggle {
    margin-bottom: 10px;
    font-size: 1.2em;
}
</style>
