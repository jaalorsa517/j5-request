<script setup lang="ts">
import { J5FileEntry } from '../../shared/types';
import { useFileSystemStore } from '../stores/file-system';

defineProps<{
  entries: J5FileEntry[];
  depth?: number;
}>();

const store = useFileSystemStore();
</script>

<template>
  <ul class="file-tree" :style="{ paddingLeft: (depth || 0) > 0 ? '12px' : '0' }">
    <li v-for="entry in entries" :key="entry.path">
      <div 
        class="file-entry" 
        :class="{ 'file-entry--selected': store.selectedFilePath === entry.path }"
        @click.stop="entry.type === 'file' ? store.selectFile(entry.path) : null"
      >
        <span class="icon">{{ entry.type === 'directory' ? '📁' : '📄' }}</span>
        <span class="name">{{ entry.name }}</span>
      </div>
      <!-- Recursive Metadata: Self-reference works in Vue 3 SFC if filename matches -->
      <FileTree 
        v-if="entry.type === 'directory' && entry.children && entry.children.length > 0" 
        :entries="entry.children" 
        :depth="(depth || 0) + 1"
      />
    </li>
  </ul>
</template>

<style scoped>
.file-tree {
  list-style: none;
  margin: 0;
  padding: 0;
}
.file-entry {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  color: #e0e0e0;
}
.file-entry:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.file-entry--selected {
  background-color: #2e7d32;
  color: white;
}
.icon {
  margin-right: 6px;
  font-size: 0.9em;
}
.name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
}
</style>
