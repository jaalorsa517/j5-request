<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRequestStore } from '@/renderer/stores/request';
import MonacoEditor from '@/renderer/components/MonacoEditor.vue';

const requestStore = useRequestStore();

// UI State
const activeTab = ref<'body' | 'headers'>('body');
const formatMode = ref<'pretty' | 'raw'>('pretty');

const responseBody = computed(() => {
    if (!requestStore.response) return '';
    const rawBody = requestStore.response.body;

    if (formatMode.value === 'raw') {
        return rawBody;
    }

    // Pretty mode logic
    try {
        const trimmed = rawBody.trim();
        // Simple check if it might be JSON
        if (typeof rawBody === 'string' && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
             const parsed = JSON.parse(rawBody);
             return JSON.stringify(parsed, null, 2);
        }
    } catch {
        // Fallback to raw if parsing fails
    }
    
    return rawBody;
});

const responseLanguage = computed(() => {
     // Simple detection
     const text = requestStore.response?.body || '';
     if (text.trim().startsWith('{') || text.trim().startsWith('[')) return 'json';
     if (text.trim().startsWith('<')) return 'xml';
     return 'plaintext';
});

const headersList = computed(() => {
    if (!requestStore.response || !requestStore.response.headers) return [];
    return Object.entries(requestStore.response.headers).map(([key, value]) => ({
        key,
        value: String(value)
    }));
});
</script>

<template>
    <div class="responseBodyViewer">
        <div class="responseBodyViewer__toolbar" v-if="requestStore.response">
            <div class="tabs">
                <button
                    class="tab"
                    :class="{ 'tab--active': activeTab === 'body' }"
                    @click="activeTab = 'body'"
                >
                    Body
                </button>
                <button
                    class="tab"
                    :class="{ 'tab--active': activeTab === 'headers' }"
                    @click="activeTab = 'headers'"
                >
                    Headers ({{ headersList.length }})
                </button>
            </div>
            
            <div class="actions" v-if="activeTab === 'body'">
               <button 
                  class="action-btn"
                  :class="{ 'action-btn--active': formatMode === 'pretty' }"
                  @click="formatMode = 'pretty'"
               >
                  Pretty
               </button>
               <button 
                  class="action-btn"
                  :class="{ 'action-btn--active': formatMode === 'raw' }"
                  @click="formatMode = 'raw'"
               >
                  Raw
               </button>
            </div>
        </div>

        <div class="responseBodyViewer__content" v-if="requestStore.response">
            <!-- BODY TAB -->
            <div v-if="activeTab === 'body'" class="tab-content">
                <MonacoEditor
                    :model-value="responseBody"
                    :language="responseLanguage"
                    :read-only="true"
                />
            </div>

            <!-- HEADERS TAB -->
            <div v-else-if="activeTab === 'headers'" class="tab-content headers-content">
                <div class="headers-table">
                    <div class="headers-row header">
                        <div class="headers-cell key">Key</div>
                        <div class="headers-cell value">Value</div>
                    </div>
                    <div v-for="(header, index) in headersList" :key="index" class="headers-row">
                        <div class="headers-cell key">{{ header.key }}</div>
                        <div class="headers-cell value">{{ header.value }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="responseBodyViewer__empty">
            Send a request to see the response
        </div>
    </div>
</template>

<style scoped>
.responseBodyViewer {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.responseBodyViewer__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 12px;
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
    height: 36px;
}

.tabs {
    display: flex;
    height: 100%;
}

.tab {
    background: none;
    border: none;
    color: var(--text-secondary);
    padding: 0 16px;
    height: 100%;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    font-size: 13px;
    transition: all 0.2s;
}

.tab:hover {
    color: var(--text-primary);
}

.tab--active {
    color: var(--text-primary);
    border-bottom-color: var(--accent-color);
}

.actions {
    display: flex;
    gap: 8px;
}

.action-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 3px;
}

.action-btn:hover {
    color: var(--text-primary);
}

.action-btn--active {
    color: var(--text-primary);
    background-color: var(--bg-tertiary);
}

.responseBodyViewer__content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.tab-content {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.responseBodyViewer__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-secondary);
    font-style: italic;
}

/* Headers Table */
.headers-content {
    overflow-y: auto;
    padding: 0;
}

.headers-table {
    display: flex;
    flex-direction: column;
    width: 100%;
    border-collapse: collapse;
}

.headers-row {
    display: flex;
    border-bottom: 1px solid var(--border-color);
}

.headers-row.header {
    background-color: var(--bg-secondary);
    font-weight: bold;
    color: var(--text-secondary);
    position: sticky;
    top: 0;
}

.headers-cell {
    padding: 8px 12px;
    font-size: 13px;
    color: var(--text-primary);
    overflow-wrap: break-word;
}

.headers-cell.key {
    width: 30%;
    min-width: 150px;
    border-right: 1px solid var(--border-color);
    color: var(--syntax-key);
}

.headers-cell.value {
    flex: 1;
    color: var(--syntax-string);
}
</style>
