<template>
  <div class="git-changes-list">
    <!-- Staged Changes -->
    <div class="git-changes-section" v-if="staged.length > 0">
      <div class="git-changes-header">
        <span class="git-changes-title">STAGED CHANGES ({{ staged.length }})</span>
        <div class="git-changes-actions">
           <button @click="$emit('unstage', staged)" class="git-action-btn" title="Unstage All">-</button>
        </div>
      </div>
      <ul class="git-file-list">
        <li v-for="file in staged" :key="file" class="git-file-item" @click="$emit('openDiff', file)">
           <div class="git-file-left">
              <!-- Icons could be improved based on status letter if available from git service -->
              <span class="git-status-icon staged">S</span>
              <span class="git-file-name" :title="file">{{ file }}</span>
           </div>
           <button @click.stop="$emit('unstage', [file])" class="git-item-action">-</button>
        </li>
      </ul>
    </div>

    <!-- Changes -->
    <div class="git-changes-section">
      <div class="git-changes-header">
        <span class="git-changes-title">CHANGES ({{ changes.length }})</span>
        <div class="git-changes-actions">
           <button @click="$emit('stage', changes)" class="git-action-btn" title="Stage All">+</button>
        </div>
      </div>
      <ul class="git-file-list">
        <li v-for="file in changes" :key="file" class="git-file-item" @click="$emit('openDiff', file)">
           <div class="git-file-left">
              <span class="git-status-icon modified">M</span>
              <span class="git-file-name" :title="file">{{ file }}</span>
           </div>
           <button @click.stop="$emit('stage', [file])" class="git-item-action">+</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { GitStatus } from '../../../shared/types'; // Assuming path relative to component

// Note: importing from shared might fail if alias not set up in vite for renderer components. 
// Usually shared types are just types.

// To avoid import issues with relative paths if ../../shared/types doesn't work (it should), 
// we'll redefine if needed or trust alias.
// But earlier vite-env used ../shared/types so it should be fine.

// Actually, let's use Props directly
const props = defineProps<{
  status: GitStatus | null
}>();

defineEmits<{
  (e: 'stage', files: string[]): void;
  (e: 'unstage', files: string[]): void;
  (e: 'openDiff', file: string): void;
}>();

const staged = computed(() => props.status?.staged || []);
const changes = computed(() => {
    if (!props.status) return [];
    return [...props.status.changed, ...props.status.untracked];
});

</script>

<style scoped>
.git-changes-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.git-changes-section {
  display: flex;
  flex-direction: column;
}

.git-changes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background-color: var(--header-bg, #252526); /* Fallback color */
  font-size: 0.8em;
  font-weight: bold;
  color: var(--text-color-subtle, #cccccc);
  text-transform: uppercase;
}

.git-changes-header:hover .git-action-btn {
    opacity: 1;
}

.git-action-btn {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.2em;
    opacity: 0; 
    transition: opacity 0.2s;
    padding: 0 4px;
}

.git-file-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.git-file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 0.9em;
  color: var(--text-color);
}

.git-file-item:hover {
  background-color: var(--hover-bg);
}

.git-file-item:hover .git-item-action {
    opacity: 1;
}

.git-file-left {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
}

.git-file-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.git-status-icon {
    font-size: 0.8em;
    font-weight: bold;
    width: 14px;
    text-align: center;
}

.git-status-icon.staged { color: #89d185; } /* Green */
.git-status-icon.modified { color: #cca700; } /* Yellow */

.git-item-action {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.1em;
    opacity: 0;
    padding: 0 4px;
}
</style>
