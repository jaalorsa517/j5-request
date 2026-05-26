<script setup lang="ts">
import { ref } from 'vue';
import { J5FileEntry } from '@/shared/types';
import { useFileSystemStore } from '@/renderer/stores/file-system';

defineProps<{
  entries: J5FileEntry[];
  depth?: number;
}>();

const emit = defineEmits<{
  (e: 'node-contextmenu', event: MouseEvent, entry: J5FileEntry): void;
  (e: 'node-dblclick', entry: J5FileEntry): void;
}>();

const store = useFileSystemStore();
const dragOverPath = ref<string | null>(null);

function onRightClick(event: MouseEvent, entry: J5FileEntry) {
    emit('node-contextmenu', event, entry);
}

function onDragStart(event: DragEvent, entry: J5FileEntry) {
    if (event.dataTransfer) {
        event.dataTransfer.setData('text/plain', entry.path);
        event.dataTransfer.effectAllowed = 'move';
    }
}

function onDragOver(event: DragEvent, entry: J5FileEntry) {
    event.preventDefault();
    dragOverPath.value = entry.path;
}

function onDragLeave() {
    dragOverPath.value = null;
}

function onDragEnd() {
    dragOverPath.value = null;
}

async function onDrop(event: DragEvent, targetEntry: J5FileEntry) {
    event.preventDefault();
    dragOverPath.value = null;
    if (!event.dataTransfer) return;

    const sourcePath = event.dataTransfer.getData('text/plain');
    if (!sourcePath || sourcePath === targetEntry.path) return;

    // Determinar directorio destino
    let targetDir = targetEntry.path;
    const separator = navigator.userAgent.includes('Win') ? '\\' : '/';
    if (targetEntry.type === 'file') {
        targetDir = targetEntry.path.substring(0, targetEntry.path.lastIndexOf(separator));
    }

    // Evitar mover una carpeta dentro de sí misma
    if (sourcePath === targetDir || targetDir.startsWith(sourcePath + separator)) {
        return;
    }

    const itemName = sourcePath.substring(sourcePath.lastIndexOf(separator) + 1);
    const newPath = `${targetDir}${separator}${itemName}`;

    try {
        await window.electron.fs.rename(sourcePath, newPath);
    } catch (e: any) {
        alert('Error al mover elemento: ' + e.message);
    }
}
const vFocus = {
  mounted: (el: HTMLInputElement) => {
    el.focus();
    el.select();
  }
};
</script>

<template>
  <ul class="file-tree" :style="{ paddingLeft: (depth || 0) > 0 ? '12px' : '0' }">
    <li v-for="entry in entries" :key="entry.path">
      <div 
        class="file-entry" 
        :class="{ 
          'file-entry--selected': store.selectedFilePath === entry.path,
          'file-entry--drag-over': dragOverPath === entry.path
        }"
        draggable="true"
        @dragstart="onDragStart($event, entry)"
        @dragover="onDragOver($event, entry)"
        @dragleave="onDragLeave"
        @dragend="onDragEnd"
        @drop="onDrop($event, entry)"
        @click.stop="entry.type === 'file' ? store.selectFile(entry.path) : store.selectDirectory(entry.path)"
        @dblclick.stop="emit('node-dblclick', entry)"
        @contextmenu.prevent="onRightClick($event, entry)"
      >
        <span class="icon">{{ entry.type === 'directory' ? '📁' : '📄' }}</span>
        <template v-if="store.editingPath === entry.path">
          <input 
            v-model="store.editingName"
            class="file-entry__input"
            @click.stop
            @keydown.enter="store.finishRename"
            @keydown.esc="store.cancelRename"
            @blur="store.finishRename"
            v-focus
          />
        </template>
        <template v-else>
          <span class="name">{{ entry.type === 'file' ? entry.name.replace('.j5request', '') : entry.name }}</span>
        </template>
      </div>
      <!-- Recursive Metadata: Self-reference works in Vue 3 SFC if filename matches -->
      <FileTree 
        v-if="entry.type === 'directory' && entry.children && entry.children.length > 0" 
        :entries="entry.children" 
        :depth="(depth || 0) + 1"
        @node-contextmenu="(e, entry) => emit('node-contextmenu', e, entry)"
        @node-dblclick="(entry) => emit('node-dblclick', entry)"
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
  color: var(--text-primary);
  user-select: none;
}
.file-entry:hover {
  background-color: var(--bg-tertiary);
}
.file-entry--selected {
  background-color: var(--accent-color);
  color: var(--text-inverse);
}
.file-entry--drag-over {
  outline: 2px dashed var(--accent-color, #007acc);
  outline-offset: -2px;
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
.file-entry__input {
  background-color: var(--input-bg, #1e1e1e);
  color: var(--text-primary, #ffffff);
  border: 1px solid var(--accent-color, #007acc);
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 0.9rem;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}
.file-entry__input:focus {
  outline: none;
}
</style>
