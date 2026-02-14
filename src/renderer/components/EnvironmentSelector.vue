<script setup lang="ts">
import { useEnvironmentStore } from '@/renderer/stores/environment';

const store = useEnvironmentStore();

async function openEnv() {
    try {
        const path = await window.electron.fs.selectFile();
        if (path) {
            await store.loadEnvironmentFromFile(path);
        }
    } catch (e) {
        alert('Error loading environment');
    }
}
</script>

<template>
    <div class="envSelector">
        <div class="current-env" @click="store.showManager = true">
            <span class="label">Env:</span>
            <span class="value" :class="{ 'no-env': !store.activeEnvironment }">
                {{ store.activeEnvironment ? store.activeEnvironment.name : 'None' }}
            </span>
        </div>
        <div class="actions">
            <button class="icon-btn" title="Open Environment File" @click="openEnv">📂</button>
            <button class="icon-btn" title="Manage Environments" @click="store.showManager = true">⚙️</button>
        </div>
    </div>
</template>

<style scoped>
.envSelector {
    display: flex;
    align-items: center;
    background: var(--bg-secondary);
    border-radius: 4px;
    height: 28px;
    max-width: 200px;
    border: 1px solid var(--border-color);
}

.current-env {
    display: flex;
    align-items: center;
    padding: 0 8px;
    cursor: pointer;
    flex: 1;
    overflow: hidden;
    gap: 6px;
}
.current-env:hover {
    background: var(--bg-tertiary);
}

.label {
    color: var(--text-secondary);
    font-size: 11px;
}

.value {
    color: var(--text-gold); /* Gold for env */
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
}

.value.no-env {
    color: var(--text-secondary);
    font-style: italic;
}

.actions {
    display: flex;
    border-left: 1px solid var(--border-color);
}

.icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 6px;
    font-size: 12px;
    height: 28px;
    opacity: 0.7;
    color: var(--text-primary);
}

.icon-btn:hover {
    background: var(--bg-tertiary);
    opacity: 1;
}
</style>
