<script setup lang="ts">
import { ref } from 'vue';

type Tab = 'headers' | 'params' | 'body' | 'pre-request' | 'tests' | 'ssl';

const activeTab = ref<Tab>('body');
</script>

<template>
    <div class="requestTabs">
        <div class="requestTabs__header">
            <button
                class="requestTabs__tab"
                :class="{ 'requestTabs__tab--active': activeTab === 'params' }"
                @click="activeTab = 'params'"
            >
                Params
            </button>
            <button
                class="requestTabs__tab"
                :class="{ 'requestTabs__tab--active': activeTab === 'headers' }"
                @click="activeTab = 'headers'"
            >
                Headers
            </button>
            <button
                class="requestTabs__tab"
                :class="{ 'requestTabs__tab--active': activeTab === 'body' }"
                @click="activeTab = 'body'"
            >
                Body
            </button>
            <button
                class="requestTabs__tab"
                :class="{ 'requestTabs__tab--active': activeTab === 'pre-request' }"
                @click="activeTab = 'pre-request'"
            >
                Pre-req
            </button>
            <button
                class="requestTabs__tab"
                :class="{ 'requestTabs__tab--active': activeTab === 'tests' }"
                @click="activeTab = 'tests'"
            >
                Tests
            </button>
            <button
                class="requestTabs__tab"
                :class="{ 'requestTabs__tab--active': activeTab === 'ssl' }"
                @click="activeTab = 'ssl'"
            >
                SSL
            </button>
        </div>
        <div class="requestTabs__content">
            <slot :name="activeTab" />
        </div>
    </div>
</template>

<style scoped>
.requestTabs {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
}

.requestTabs__header {
    display: flex;
    gap: 8px;
    padding: 0 16px;
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--border-subtle);
    height: 40px;
    align-items: center;
}

.requestTabs__tab {
    height: 100%;
    padding: 0 12px;
    background-color: transparent;
    color: var(--text-tertiary);
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all var(--transition-fast);
}

.requestTabs__tab:hover:not(.requestTabs__tab--active) {
    color: var(--text-secondary);
    background-color: var(--bg-tertiary);
}

.requestTabs__tab--active {
    color: var(--accent-blue);
    border-bottom-color: var(--accent-blue);
}

.requestTabs__content {
    flex: 1;
    overflow: auto;
    background-color: var(--bg-primary);
}
</style>

