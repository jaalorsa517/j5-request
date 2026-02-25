<script setup lang="ts">
import { computed } from 'vue'
import { VueMonacoDiffEditor } from '@guolao/vue-monaco-editor'
import { useThemeStore } from '@/renderer/stores/theme'

defineProps<{
  original: string
  modified: string
  language?: string
}>()

const themeStore = useThemeStore()

const editorTheme = computed(() => {
    return themeStore.theme === 'dark' ? 'vs-dark' : 'vs'
})

const options = computed(() => ({
  theme: editorTheme.value,
  automaticLayout: true,
  readOnly: true,
  minimap: { enabled: false }
}))
</script>

<template>
  <div class="diff-editor-container">
    <VueMonacoDiffEditor
      :original="original"
      :modified="modified"
      :language="language"
      :options="options"
      :theme="editorTheme"
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
