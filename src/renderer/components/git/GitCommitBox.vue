<template>
  <div class="git-commit-box">
    <textarea 
      v-model="message"
      class="git-commit-box__input" 
      placeholder="Message (Cmd+Enter to commit)"
      @keydown.meta.enter="commit"
      @keydown.ctrl.enter="commit"
    ></textarea>
    
    <div class="git-commit-box__actions">
      <button 
        class="git-commit-box__btn git-commit-box__btn--primary" 
        :disabled="!message.trim()"
        @click="commit"
      >
        Commit
      </button>
      <button 
        class="git-commit-box__btn git-commit-box__btn--secondary" 
        @click="$emit('sync')"
        title="Pull then Push"
      >
        Sync 🔄
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'commit', message: string): void;
  (e: 'sync'): void;
}>();

const message = ref('');

function commit() {
  if (!message.value.trim()) return;
  emit('commit', message.value);
  message.value = '';
}
</script>

<style scoped>
.git-commit-box {
  padding: 10px;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.git-commit-box__input {
  width: 100%;
  height: 60px;
  resize: vertical;
  background-color: var(--input-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 8px;
  font-family: inherit;
  font-size: 0.9em;
  outline: none;
}

.git-commit-box__input:focus {
    border-color: var(--accent-color);
}

.git-commit-box__actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.git-commit-box__btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
  font-weight: 500;
  transition: background 0.2s;
}

.git-commit-box__btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.git-commit-box__btn--primary {
  background-color: var(--accent-color);
  color: var(--text-inverse);
  flex: 1;
}

.git-commit-box__btn--primary:hover:not(:disabled) {
    background-color: var(--accent-hover);
}

.git-commit-box__btn--secondary {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.git-commit-box__btn--secondary:hover {
    background-color: var(--input-border);
}
</style>
