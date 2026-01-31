<script setup lang="ts">
import { useFileSystemStore } from './stores/file-system';
import FileTree from './components/FileTree.vue';
import RequestEditor from './components/RequestEditor.vue';

const store = useFileSystemStore();

import { ref } from 'vue';

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
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <button class="action-btn" @click="openFolder">📂 Open</button>
        <button class="action-btn" @click="openCreateModal" :disabled="!store.currentPath">➕ New</button>
      </div>
      <div class="sidebar-content">
        <FileTree :entries="store.rootEntry" />
      </div>
    </aside>
    <main class="main-content">
      <RequestEditor />
    </main>
    
    <!-- Simple Modal -->
    <div v-if="showNewRequestModal" class="modal-overlay">
      <div class="modal">
        <h3>New Request</h3>
        <input v-model="newRequestName" @keyup.enter="confirmCreateRequest" placeholder="Request Name" autofocus class="modal-input" />
        <div class="modal-actions">
          <button @click="showNewRequestModal = false">Cancel</button>
          <button @click="confirmCreateRequest">Create</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Global Reset */
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  background-color: #1e1e1e;
  color: #e0e0e0;
  overflow: hidden;
}
</style>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  position: relative;
  z-index: 1;
}
.sidebar {
  width: 260px;
  background-color: #252526;
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  padding: 10px;
  border-bottom: 1px solid #333;
  display: flex;
  gap: 8px;
}
.action-btn {
  width: 100%;
  padding: 6px;
  background-color: #333;
  border: 1px solid #444;
  color: #eee;
  cursor: pointer;
  border-radius: 4px;
}
.action-btn:hover {
  background-color: #444;
}
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}
.main-content {
  flex: 1;
  overflow: hidden;
  background-color: #1e1e1e;
  position: relative;
  z-index: 2;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.modal {
  background: #252526;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #333;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.modal h3 {
  margin: 0;
  font-size: 1.1rem;
}
.modal-input {
  padding: 8px;
  background: #333;
  border: 1px solid #444;
  color: white;
  border-radius: 4px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.modal-actions button {
  padding: 6px 12px;
  cursor: pointer;
  background: #444;
  border: none;
  color: white;
  border-radius: 4px;
}
.modal-actions button:hover {
  background: #555;
}
.modal-actions button:last-child {
  background: #007acc;
}
.modal-actions button:last-child:hover {
  background: #005f9e;
}
</style>
