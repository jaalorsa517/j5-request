<script setup lang="ts">
import { useEnvironmentStore } from '../stores/environment';

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
    background: #252526;
    border-radius: 4px;
    height: 28px;
    max-width: 200px;
    border: 1px solid #333;
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
    background: #2d2d2d;
}

.label {
    color: #888;
    font-size: 11px;
}

.value {
    color: #ffd700; /* Gold for env */
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
}

.value.no-env {
    color: #666;
    font-style: italic;
}

.actions {
    display: flex;
    border-left: 1px solid #333;
}

.icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 6px;
    font-size: 12px;
    height: 28px;
    opacity: 0.7;
}

.icon-btn:hover {
    background: #333;
    opacity: 1;
}
</style>
