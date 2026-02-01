<script setup lang="ts">
import { useRequestStore } from '../stores/request';
import MonacoEditor from './MonacoEditor.vue';

const requestStore = useRequestStore();
</script>

<template>
    <div class="requestBodyEditor">
        <MonacoEditor
            v-model="requestStore.body"
            language="json"
            :read-only="false"
        />
    </div>
</template>

<style scoped>
.requestBodyEditor {
    height: 100%;
    width: 100%;
}
</style>
