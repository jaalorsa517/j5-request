<script setup lang="ts">
import ResponseMeta from './ResponseMeta.vue';
import ResponseBodyViewer from './ResponseBodyViewer.vue';
</script>

<template>
    <div class="responsePanel">
        <ResponseMeta />
        <ResponseBodyViewer />
    </div>
</template>

<style scoped>
.responsePanel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #1e1e1e;
}
</style>
