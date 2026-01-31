<script setup lang="ts">
import { useFileSystemStore } from '../stores/file-system';
import { storeToRefs } from 'pinia';

const store = useFileSystemStore();
const { selectedFile } = storeToRefs(store);

async function save() {
  await store.saveRequest();
  alert('Saved!');
}
</script>

<template>
  <div v-if="selectedFile" class="editor">
    <div class="header">
      <h3 class="title">{{ selectedFile.name }}</h3>
      <button class="save-btn" @click="save">Save JSON</button>
    </div>
    
    <div class="request-line">
        <select v-model="selectedFile.method" class="method-select">
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
            <option>PATCH</option>
        </select>
        <input v-model="selectedFile.url" class="url-input" placeholder="https://api.example.com" />
    </div>
    
    <div class="code-area">
      <p class="label">Raw JSON Content:</p>
      <pre class="json-preview">{{ JSON.stringify(selectedFile, null, 2) }}</pre>
    </div>
  </div>
  <div v-else class="empty-state">
    <p>Select a request definition file (.json)</p>
  </div>
</template>

<style scoped>
.editor {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  box-sizing: border-box;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  margin: 0;
  font-size: 1.2rem;
}
.request-line {
  display: flex;
  gap: 0.5rem;
}
.method-select {
  padding: 8px;
  background: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
}
.url-input {
  flex: 1;
  padding: 8px;
  background: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
}
.save-btn {
  padding: 6px 12px;
  background-color: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.save-btn:hover {
  background-color: #005f9e;
}
.code-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.label {
  font-size: 0.8rem;
  color: #aaa;
  margin-bottom: 0.5rem;
}
.json-preview {
  flex: 1;
  background: #1e1e1e;
  padding: 1rem;
  border-radius: 4px;
  overflow: auto;
  font-size: 0.85rem;
  margin: 0;
}
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
}
</style>
