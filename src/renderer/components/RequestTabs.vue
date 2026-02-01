<script setup lang="ts">
import { ref } from 'vue';

type Tab = 'headers' | 'params' | 'body';

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
    background-color: #1e1e1e;
    border-bottom: 1px solid #333;
}

.requestTabs__tab {
    padding: 6px 16px;
    background-color: transparent;
    color: #888;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    transition: all 0.2s;
}

.requestTabs__tab:hover {
    color: #fff;
}

.requestTabs__tab--active {
    color: #fff;
    border-bottom-color: #0e639c;
}

.requestTabs__content {
    flex: 1;
    overflow: auto;
}
</style>
