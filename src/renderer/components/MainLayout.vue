<script setup lang="ts">
import FileTree from './FileTree.vue';
import RequestPanel from './RequestPanel.vue';
import ResponsePanel from './ResponsePanel.vue';
import { useFileSystemStore } from '../stores/file-system';
import { useRequestStore } from '../stores/request';
import { ref } from 'vue';

const store = useFileSystemStore();
const requestStore = useRequestStore();
const showNewRequestModal = ref(false);
const newRequestName = ref('');

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
</script>

<template>
    <div class="mainLayout">
        <!-- Sidebar -->
        <aside class="mainLayout__sidebar">
            <div class="mainLayout__sidebarHeader">
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
                <FileTree :entries="store.rootEntry" />
            </div>
        </aside>

        <!-- Workspace -->
        <div class="mainLayout__workspace">
            <div class="mainLayout__panel mainLayout__panel--request">
                <RequestPanel />
            </div>
            <div class="mainLayout__panel mainLayout__panel--response">
                <ResponsePanel />
            </div>
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
</style>
