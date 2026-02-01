<template>
  <div class="git-repo-item">
    <div class="git-repo-item__header">
      <span class="git-repo-item__title">{{ repoName }}</span>
       <div class="git-repo-item__actions">
          <button class="git-repo-item__action-btn" @click="$emit('refresh')" title="Refresh">
             🔄
          </button>
       </div>
    </div>
    <div class="git-repo-item__branch-selector">
      <span class="git-repo-item__branch-icon">🌲</span>
      <select :value="currentBranch" @change="onBranchChange" class="git-repo-item__select">
        <option v-for="branch in branches" :key="branch" :value="branch">
          {{ branch }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  repoPath: string;
  currentBranch: string;
  branches: string[];
}>();

const emit = defineEmits<{
  (e: 'checkout', branch: string): void;
  (e: 'refresh'): void;
}>();

const repoName = computed(() => {
  // Extract last part of path
  const parts = props.repoPath.split(/[/\\]/);
  return parts[parts.length - 1] || props.repoPath;
});

function onBranchChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit('checkout', target.value);
}
</script>

<style scoped>
.git-repo-item {
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--sidebar-bg);
}

.git-repo-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.git-repo-item__title {
  font-weight: bold;
  font-size: 0.9em;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.git-repo-item__action-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.1em;
    padding: 2px;
}

.git-repo-item__branch-selector {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--input-bg);
  padding: 4px 6px;
  border-radius: 4px;
}

.git-repo-item__branch-icon {
    font-size: 0.9em;
}

.git-repo-item__select {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 0.85em;
  width: 100%;
  cursor: pointer;
  outline: none;
}
</style>
