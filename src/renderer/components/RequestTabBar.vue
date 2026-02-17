<script setup lang="ts">
import { useRequestStore } from '@/renderer/stores/request';

const store = useRequestStore();

function handleTabClick(tabId: string) {
    store.setActiveTab(tabId);
}

function handleCloseTab(event: MouseEvent, tabId: string) {
    event.stopPropagation(); // Evitar cambiar a la pestaña que se está cerrando
    store.closeTab(tabId);
}

function handleNewTab() {
    store.addTab();
}
</script>

<template>
    <div class="requestTabBar">
        <div 
            v-for="tab in store.tabs" 
            :key="tab.id"
            class="requestTabBar__tab"
            :class="{ 'requestTabBar__tab--active': tab.id === store.activeTabId }"
            @click="handleTabClick(tab.id)"
            :title="tab.name || 'Sin Título'"
        >
            <span class="requestTabBar__label">
                <span class="method-badge" :class="tab.request.method.toLowerCase()">{{ tab.request.method }}</span>
                {{ tab.name || 'Sin Título' }}
                <span v-if="tab.isDirty" class="dirty-marker">●</span>
            </span>
            <button class="requestTabBar__close" @click="handleCloseTab($event, tab.id)">×</button>
        </div>
        <button class="requestTabBar__new" @click="handleNewTab" title="Nueva Pestaña">+</button>
    </div>
</template>

<style scoped>
.requestTabBar {
    display: flex;
    flex-direction: row;
    background-color: var(--bg-secondary);
    height: 35px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    border-bottom: 1px solid var(--border-color);
}

.requestTabBar::-webkit-scrollbar {
    height: 4px;
}

.requestTabBar::-webkit-scrollbar-thumb {
    background-color: var(--border-color);
}

.requestTabBar__tab {
    display: flex;
    align-items: center;
    padding: 0 10px;
    min-width: 120px;
    max-width: 200px;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
    border-right: 1px solid var(--border-color);
    cursor: pointer;
    user-select: none;
    font-size: 13px;
    position: relative;
}

.requestTabBar__tab:hover {
    background-color: var(--bg-secondary);
}

.requestTabBar__tab--active {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border-top: 1px solid var(--accent-color);
}

.requestTabBar__label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: 6px;
}

.method-badge {
    font-size: 0.7em;
    font-weight: bold;
    color: var(--text-secondary);
    opacity: 0.8;
    min-width: 24px;
}

/* Method colors might need to be variables too for full theming support, keeping hardcoded for now as they are usually consistent */
.method-badge.get { color: #6aca4b; }
.method-badge.post { color: #f9c74f; }
.method-badge.put { color: #4facfe; }
.method-badge.delete { color: #f94144; }
.method-badge.patch { color: #a67aff; }

.dirty-marker {
    font-size: 0.8em;
    color: var(--text-primary);
    margin-left: 4px;
}

.requestTabBar__close {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 16px;
    margin-left: 6px;
    cursor: pointer;
    border-radius: 4px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s, background-color 0.2s;
}

.requestTabBar__tab:hover .requestTabBar__close,
.requestTabBar__tab--active .requestTabBar__close {
    opacity: 1;
}

.requestTabBar__close:hover {
    background-color: var(--border-color);
    color: var(--text-primary);
}

.requestTabBar__new {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 18px;
    padding: 0 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.requestTabBar__new:hover {
    background-color: var(--bg-tertiary);
}
</style>
