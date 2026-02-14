<script setup lang="ts">
import ResponseMeta from '@/renderer/components/ResponseMeta.vue';
import ResponseBodyViewer from '@/renderer/components/ResponseBodyViewer.vue';
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
    background-color: var(--bg-primary);
}
</style>
