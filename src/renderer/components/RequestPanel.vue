<script setup lang="ts">
import { useRequestStore } from '../stores/request';
import UrlBar from './UrlBar.vue';
import RequestTabs from './RequestTabs.vue';
import KeyValueEditor from './KeyValueEditor.vue';
import RequestBodyEditor from './RequestBodyEditor.vue';
import MonacoEditor from './MonacoEditor.vue';

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
    background-color: #1e1e1e;
    overflow: hidden;
}
</style>
