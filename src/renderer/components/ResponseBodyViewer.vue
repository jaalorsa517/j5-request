<script setup lang="ts">
import { useRequestStore } from '../stores/request';
import MonacoEditor from './MonacoEditor.vue';

const requestStore = useRequestStore();
</script>

<template>
    <div class="responseBodyViewer">
        <MonacoEditor
            v-if="requestStore.response"
            :model-value="requestStore.response.body"
            language="json"
            :read-only="true"
        />
        <div v-else class="responseBodyViewer__empty">
            Send a request to see the response
        </div>
    </div>
</template>

<style scoped>
.responseBodyViewer {
    height: 100%;
    width: 100%;
}

.responseBodyViewer__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #888;
    font-style: italic;
}
</style>
