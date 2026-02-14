<script setup lang="ts">
import { useRequestStore } from '@/renderer/stores/request';
import UrlBar from '@/renderer/components/UrlBar.vue';
import RequestTabs from '@/renderer/components/RequestTabs.vue';
import KeyValueEditor from '@/renderer/components/KeyValueEditor.vue';
import RequestBodyEditor from '@/renderer/components/RequestBodyEditor.vue';
import MonacoEditor from '@/renderer/components/MonacoEditor.vue';

const requestStore = useRequestStore();
</script>

<template>
    <div class="requestPanel">
        <UrlBar />
        <RequestTabs>
            <template #params>
                <KeyValueEditor v-model="requestStore.params" />
            </template>
            <template #headers>
                <KeyValueEditor v-model="requestStore.headers" />
            </template>
            <template #body>
                <RequestBodyEditor />
            </template>
            <template #pre-request>
                <MonacoEditor 
                    v-model="requestStore.preRequestScript" 
                    language="javascript" 
                />
            </template>
            <template #tests>
                <MonacoEditor 
                    v-model="requestStore.postResponseScript" 
                    language="javascript" 
                />
            </template>
        </RequestTabs>
    </div>
</template>

<style scoped>
.requestPanel {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: var(--bg-primary);
    overflow: hidden;
}
</style>
