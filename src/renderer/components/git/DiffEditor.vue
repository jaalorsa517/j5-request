<script setup lang="ts">
import { VueMonacoDiffEditor } from '@guolao/vue-monaco-editor'

defineProps<{
  original: string
  modified: string
  language?: string
}>()

const options = {
  theme: 'vs-dark',
  automaticLayout: true,
  readOnly: true,
  minimap: { enabled: false }
}
</script>

<template>
  <div class="diff-editor-container">
    <VueMonacoDiffEditor
      :original="original"
      :modified="modified"
      :language="language"
      :options="options"
      style="height: 100%; width: 100%"
    />
  </div>
</template>

<style scoped>
.diff-editor-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>
