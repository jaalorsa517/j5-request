<script setup lang="ts">
import { ref } from 'vue';

type Tab = 'headers' | 'params' | 'body' | 'pre-request' | 'tests';

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
    height: 100%;
}

.requestTabs__header {
    display: flex;
    gap: 4px;
    padding: 8px 12px;
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
}

.requestTabs__tab {
    padding: 6px 16px;
    background-color: transparent;
    color: var(--text-secondary);
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    transition: all 0.2s;
}

.requestTabs__tab:hover {
    color: var(--text-primary);
}

.requestTabs__tab--active {
    color: var(--text-primary);
    border-bottom-color: var(--accent-color);
}

.requestTabs__content {
    flex: 1;
    overflow: auto;
}
</style>
