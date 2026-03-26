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
            <div class="requestTabBar__label">
                <span class="method-badge" :class="tab.request.method.toLowerCase()">{{ tab.request.method }}</span>
                <span class="tab-name">{{ tab.name || 'Sin Título' }}</span>
                <span v-if="tab.isDirty" class="dirty-marker">●</span>
            </div>
            <button class="requestTabBar__close" @click="handleCloseTab($event, tab.id)" aria-label="Cerrar pestaña">×</button>
        </div>
        <button class="requestTabBar__new" @click="handleNewTab" title="Nueva Pestaña">
            <span>+</span>
        </button>
    </div>
</template>

<style scoped>
.requestTabBar {
    display: flex;
    flex-direction: row;
    background-color: var(--bg-secondary);
    height: 40px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    border-bottom: 1px solid var(--border-subtle);
    padding: 0 4px;
    align-items: flex-end;
}

.requestTabBar::-webkit-scrollbar {
    display: none;
}

.requestTabBar__tab {
    display: flex;
    align-items: center;
    padding: 0 12px;
    height: 34px;
    min-width: 140px;
    max-width: 220px;
    background-color: var(--bg-tertiary);
    color: var(--text-tertiary);
    border: 1px solid var(--border-subtle);
    border-bottom: none;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    cursor: pointer;
    user-select: none;
    font-size: 13px;
    margin-right: 2px;
    transition: all var(--transition-fast);
}

.requestTabBar__tab:hover {
    color: var(--text-secondary);
    background-color: var(--steel);
}

.requestTabBar__tab--active {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    height: 36px;
    border-color: var(--border-standard);
    border-bottom: 1px solid var(--bg-primary);
    margin-bottom: -1px;
    z-index: 10;
}

.requestTabBar__label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: 8px;
}

.tab-name {
    overflow: hidden;
    text-overflow: ellipsis;
}

.method-badge {
    font-size: 10px;
    font-weight: 800;
    opacity: 0.8;
    min-width: 28px;
}

.method-badge.get { color: var(--accent-green); }
.method-badge.post { color: var(--accent-orange); }
.method-badge.put { color: var(--accent-blue); }
.method-badge.delete { color: var(--accent-red); }

.dirty-marker {
    font-size: 10px;
    color: var(--accent-blue);
}

.requestTabBar__close {
    background: none;
    border: none;
    color: var(--text-tertiary);
    font-size: 14px;
    margin-left: 8px;
    cursor: pointer;
    border-radius: var(--radius-sm);
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all var(--transition-fast);
}

.requestTabBar__tab:hover .requestTabBar__close,
.requestTabBar__tab--active .requestTabBar__close {
    opacity: 1;
}

.requestTabBar__close:hover {
    background-color: var(--border-standard);
    color: var(--text-primary);
}

.requestTabBar__new {
    background: none;
    border: none;
    color: var(--text-tertiary);
    width: 32px;
    height: 32px;
    margin-bottom: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
}

.requestTabBar__new:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
}
</style>

