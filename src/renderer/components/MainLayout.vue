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
import AboutModal from '@/renderer/components/AboutModal.vue';
import { J5FileEntry, J5Request } from '@/shared/types';
import RequestTabBar from '@/renderer/components/RequestTabBar.vue';
import { useFileSystemStore } from '@/renderer/stores/file-system';
import { useRequestStore } from '@/renderer/stores/request';
import { useEnvironmentStore } from '@/renderer/stores/environment';
import { useThemeStore } from '@/renderer/stores/theme';
import { ref, onMounted, onUnmounted } from 'vue';

const store = useFileSystemStore();
const requestStore = useRequestStore();
const envStore = useEnvironmentStore();
const themeStore = useThemeStore();
const showNewRequestModal = ref(false);
const newRequestName = ref('');
const showImportModal = ref(false);
const showAboutModal = ref(false);

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

function handleGlobalKeydown(e: KeyboardEvent) {
    const isCtrlCmd = e.ctrlKey || e.metaKey;

    if (e.key === 'Escape') {
        if (showNewRequestModal.value) showNewRequestModal.value = false;
        if (showImportModal.value) showImportModal.value = false;
        if (showExportDialog.value) showExportDialog.value = false;
        if (envStore.showManager) envStore.showManager = false;
        if (showDeleteConfirm.value) showDeleteConfirm.value = false;
        if (showAboutModal.value) showAboutModal.value = false;
        if (showDiff.value) closeDiff();
    }

    if (isCtrlCmd && e.key.toLowerCase() === 't') {
        e.preventDefault();
        requestStore.addTab();
    }

    if (isCtrlCmd && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (requestStore.activeTabId) {
            requestStore.closeTab(requestStore.activeTabId);
        }
    }

    if (isCtrlCmd && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveRequest();
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<template>
    <div class="mainLayout">
        <!-- Activity Bar -->
        <nav class="mainLayout__activityBar activityBar">
            <div class="activityBar__top">
                <button 
                    class="activityBar__item" 
                    :class="{ 'activityBar__item--active': activeActivity === 'explorer' }"
                    @click="activeActivity = 'explorer'; closeDiff()"
                    title="Explorador"
                >
                    <span class="activityBar__icon">📁</span>
                </button>
                <button 
                    class="activityBar__item" 
                    :class="{ 'activityBar__item--active': activeActivity === 'git' }"
                    @click="activeActivity = 'git'"
                    title="Control de Código"
                >
                    <span class="activityBar__icon">🌲</span>
                </button>
            </div>
            <div class="activityBar__bottom">
                <button
                    class="activityBar__item"
                    @click="showAboutModal = true"
                    title="Acerca de"
                >
                    <span class="activityBar__icon">ℹ️</span>
                </button>
                <button
                    class="activityBar__item activityBar__item--theme"
                    @click="themeStore.toggleTheme()"
                    title="Cambiar Tema"
                >
                    {{ themeStore.theme === 'dark' ? '☀️' : '🌙' }}
                </button>
            </div>
        </nav>

        <!-- Sidebar -->
        <aside class="mainLayout__sidebar sidebar">
            <div class="sidebar__header" v-if="activeActivity === 'explorer'">
                <div class="sidebar__controls">
                     <EnvironmentSelector />
                </div>
                <div class="sidebar__toolbar">
                    <button class="sidebar__btn" @click="openFolder" title="Abrir Carpeta">
                        📂 Abrir
                    </button>
                    <button
                        class="sidebar__btn"
                        :disabled="!store.currentPath"
                        @click="openCreateModal"
                        title="Nueva Petición"
                    >
                        ➕ Nueva
                    </button>
                    <button
                        class="sidebar__btn sidebar__btn--primary"
                        :class="{ 'sidebar__btn--dirty': requestStore.isDirty }"
                        :disabled="!store.selectedFile"
                        @click="saveRequest"
                        title="Guardar Petición"
                    >
                        {{ requestStore.isDirty ? '● ' : '' }}💾 Guardar
                    </button>
                    <button
                        class="sidebar__btn"
                        @click="openImportModal"
                        title="Importar"
                    >
                        📥 Importar
                    </button>
                </div>
            </div>
            
            <div class="sidebar__content">
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
                <h3 class="mainLayout__modalTitle">Nueva Petición</h3>
                <input
                    v-model="newRequestName"
                    class="mainLayout__modalInput"
                    placeholder="Nombre de la petición"
                    autofocus
                    @keyup.enter="confirmCreateRequest"
                />
                <div class="mainLayout__modalActions">
                    <button @click="showNewRequestModal = false">Cancelar</button>
                    <button class="primary" @click="confirmCreateRequest">Crear</button>
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

        <AboutModal :is-open="showAboutModal" @close="showAboutModal = false" />
    </div>
</template>

<style scoped>
.mainLayout {
    display: flex;
    height: 100vh;
    width: 100vw;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    overflow: hidden;
}

/* Activity Bar */
.activityBar {
    width: 64px;
    background-color: var(--bg-secondary);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-right: 1px solid var(--border-subtle);
}

.activityBar__top, .activityBar__bottom {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.activityBar__item {
    background: none;
    border: none;
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: var(--text-tertiary);
    transition: all var(--transition-fast);
    position: relative;
    padding: 0;
}

.activityBar__item:hover {
    color: var(--text-primary);
    background-color: var(--bg-tertiary);
}

.activityBar__item--active {
    color: var(--accent-blue);
    background-color: var(--accent-blue-soft);
}

.activityBar__item--active::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 12px;
    bottom: 12px;
    width: 3px;
    background-color: var(--accent-blue);
    border-radius: 0 4px 4px 0;
}

.activityBar__icon {
    font-size: 20px;
}

/* Sidebar */
.sidebar {
    width: 300px;
    background-color: var(--bg-secondary);
    border-right: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
}

.sidebar__header {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    border-bottom: 1px solid var(--border-subtle);
}

.sidebar__toolbar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.sidebar__btn {
    padding: 6px 10px;
    font-size: 12px;
    justify-content: flex-start;
    background-color: var(--bg-tertiary);
}

.sidebar__btn--primary {
    background-color: var(--accent-blue);
    color: var(--text-primary);
    border: none;
}

.sidebar__btn--dirty {
    background-color: var(--warning);
    border: none;
}

.sidebar__content {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
}

/* Workspace */
.mainLayout__workspace {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
    background-color: var(--bg-primary);
}

.mainLayout__panel {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-primary);
}

.mainLayout__panel--request {
    border-bottom: 1px solid var(--border-subtle);
}

/* Modals */
.mainLayout__modalOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--bg-overlay);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.mainLayout__modal {
    background: var(--bg-modal);
    padding: 24px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-standard);
    width: 360px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.mainLayout__modalTitle {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.mainLayout__modalInput {
    width: 100%;
}

.mainLayout__modalActions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

/* Diff View */
.diff-header {
    height: 40px;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    padding: 0 16px;
}

.close-diff-btn {
    padding: 4px 12px;
    font-size: 12px;
    background-color: var(--bg-tertiary);
}
</style>
