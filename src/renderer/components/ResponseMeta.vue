<script setup lang="ts">
import { computed } from 'vue';
import { useRequestStore } from '../stores/request';

const requestStore = useRequestStore();

const statusColor = computed(() => {
    if (!requestStore.response) return 'var(--text-secondary)';
    const status = requestStore.response.status;
    if (status >= 200 && status < 300) return 'var(--success-color)';
    if (status >= 300 && status < 400) return 'var(--warning-color)';
    return 'var(--error-color)';
});

const formattedSize = computed(() => {
    if (!requestStore.response) return '0 B';
    const bytes = requestStore.response.size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
});
</script>

<template>
    <div class="responseMeta">
        <div v-if="requestStore.response" class="responseMeta__stats">
            <div class="responseMeta__stat">
                <span class="responseMeta__label">Status:</span>
                <span
                    class="responseMeta__value responseMeta__value--status"
                    :style="{ color: statusColor }"
                >
                    {{ requestStore.response.status }} {{ requestStore.response.statusText }}
                </span>
            </div>
            <div class="responseMeta__stat">
                <span class="responseMeta__label">Time:</span>
                <span class="responseMeta__value">{{ requestStore.response.time }} ms</span>
            </div>
            <div class="responseMeta__stat">
                <span class="responseMeta__label">Size:</span>
                <span class="responseMeta__value">{{ formattedSize }}</span>
            </div>
        </div>
        <div v-else-if="requestStore.error" class="responseMeta__error">
            Error: {{ requestStore.error }}
        </div>
        <div v-else class="responseMeta__empty">
            No response yet
        </div>
    </div>
</template>

<style scoped>
.responseMeta {
    padding: 12px;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
}

.responseMeta__stats {
    display: flex;
    gap: 24px;
}

.responseMeta__stat {
    display: flex;
    gap: 8px;
    align-items: center;
}

.responseMeta__label {
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.responseMeta__value {
    color: var(--text-primary);
    font-size: 14px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.responseMeta__value--status {
    font-weight: 600;
}

.responseMeta__empty {
    color: var(--text-secondary);
    font-style: italic;
}

.responseMeta__error {
    color: var(--error-color);
    font-weight: bold;
}
</style>
