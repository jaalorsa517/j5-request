<script setup lang="ts">
import FileTree from './FileTree.vue';
import RequestPanel from './RequestPanel.vue';
import ResponsePanel from './ResponsePanel.vue';
import GitPanel from './git/GitPanel.vue';
import DiffEditor from './git/DiffEditor.vue';
import EnvironmentSelector from './EnvironmentSelector.vue';
import EnvironmentManagerModal from './EnvironmentManagerModal.vue';
import { useFileSystemStore } from '../stores/file-system';
import { useRequestStore } from '../stores/request';
import { useEnvironmentStore } from '../stores/environment';
import { ref } from 'vue';

const store = useFileSystemStore();
const requestStore = useRequestStore();
const envStore = useEnvironmentStore();
const showNewRequestModal = ref(false);
const newRequestName = ref('');

// Navigation state
const activeActivity = ref<'explorer' | 'git'>('explorer');

// Diff state
const showDiff = ref(false);
const diffOriginal = ref('');
const diffModified = ref('');
const diffLanguage = ref('json');

async function openFolder() {
    const path = await window.electron.fs.selectFolder();
    if (path) {
        await store.openDirectory(path);
    }
}

function openCreateModal() {
    newRequestName.value = '';
    showNewRequestModal.value = true;
}

async function confirmCreateRequest() {
    if (newRequestName.value) {
        await store.createRequest(newRequestName.value);
        showNewRequestModal.value = false;
    }
}

async function saveRequest() {
    await requestStore.saveToFile();
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
        
        // Use fs.readFile which returns parsed JSON (J5Request) if json, or we might need raw text?
        // Wait, fs.readFile in previous code returns `J5Request`. 
        // But for diffing any file, we might want raw string.
        // The current fs.readFile implementation parses JSON. 
        // We might need a raw read. But for now let's use what we have and stringify if it's an object.
        const content = await window.electron.fs.readFile(absolutePath);
        
        if (typeof content === 'string') {
            diffModified.value = content;
        } else {
            diffModified.value = JSON.stringify(content, null, 2);
        }
        
        showDiff.value = true;
        // Language detection based on extension
        if (file.endsWith('.json')) diffLanguage.value = 'json';
        else if (file.endsWith('.js') || file.endsWith('.ts')) diffLanguage.value = 'typescript';
        else diffLanguage.value = 'plaintext';
        
    } catch (e) {
        console.error("Failed to open diff", e);
    }
}

function closeDiff() {
    showDiff.value = false;
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
            </div>
            
            <div class="mainLayout__sidebarContent">
                <FileTree v-if="activeActivity === 'explorer'" :entries="store.rootEntry" />
                <GitPanel v-else-if="activeActivity === 'git'" @openDiff="handleOpenDiff" />
            </div>
        </aside>

        <!-- Workspace -->
        <div class="mainLayout__workspace">
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
    </div>
</template>

<style scoped>
.mainLayout {
    display: flex;
    height: 100vh;
    width: 100vw;
    background-color: #1e1e1e;
    color: #e0e0e0;
}



/* Activity Bar */
.activityBar {
    width: 48px;
    background-color: #333333;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 10px;
    border-right: 1px solid #252526;
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
    border-left: 2px solid #0e639c; /* Active indicator */
    background-color: #252526;
}

/* Sidebar */
.mainLayout__sidebar {
    width: 280px;
    background-color: #252526;
    border-right: 1px solid #333;
    display: flex;
    flex-direction: column;
}

.mainLayout__sidebarHeader {
    padding: 12px;
    border-bottom: 1px solid #333;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.mainLayout__actionButton {
    width: 100%;
    padding: 8px;
    background-color: #333;
    border: 1px solid #444;
    color: #eee;
    cursor: pointer;
    border-radius: 4px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    transition: background-color 0.2s;
}

.mainLayout__actionButton:hover:not(:disabled) {
    background-color: #444;
}

.mainLayout__actionButton:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.mainLayout__actionButton--save {
    background-color: #0e639c;
}

.mainLayout__actionButton--save:hover:not(:disabled) {
    background-color: #1177bb;
}

.mainLayout__actionButton--dirty {
    background-color: #d97706;
}

.mainLayout__actionButton--dirty:hover:not(:disabled) {
    background-color: #f59e0b;
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
    border-bottom: 1px solid #333;
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
    background: #252526;
    padding: 24px;
    border-radius: 8px;
    border: 1px solid #444;
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.mainLayout__modalTitle {
    margin: 0;
    font-size: 1.2rem;
    color: #fff;
}

.mainLayout__modalInput {
    padding: 10px;
    background: #333;
    border: 1px solid #444;
    color: white;
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
    background: #444;
    border: none;
    color: white;
    border-radius: 4px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    transition: background-color 0.2s;
}

.mainLayout__modalActions button:hover {
    background: #555;
}

.mainLayout__modalActions button:last-child {
    background: #0e639c;
}

.mainLayout__modalActions button:last-child:hover {
    background: #1177bb;
}

/* Diff View */
.diff-header {
    height: 35px;
    background-color: #1e1e1e;
    border-bottom: 1px solid #333;
    display: flex;
    align-items: center;
    padding: 0 10px;
}

.close-diff-btn {
    background: none;
    border: 1px solid #444;
    color: #ccc;
    cursor: pointer;
    font-size: 0.9em;
    padding: 2px 8px;
    border-radius: 3px;
}
.close-diff-btn:hover {
    background: #333;
}
</style>
