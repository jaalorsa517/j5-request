<script setup lang="ts">
import { ref, watch } from 'vue';
import { VueMonacoEditor } from '@guolao/vue-monaco-editor';

interface Props {
    modelValue: string;
    language?: string;
    readOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    language: 'json',
    readOnly: false,
});

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const editorValue = ref(props.modelValue);

// Sincronizar cambios del padre al editor
watch(() => props.modelValue, (newValue) => {
    if (newValue !== editorValue.value) {
        editorValue.value = newValue;
    }
});

// Emitir cambios del editor al padre
function handleChange(value: string | undefined) {
    const newValue = value ?? '';
    editorValue.value = newValue;
    emit('update:modelValue', newValue);
}

const editorOptions = {
    automaticLayout: true,
    formatOnPaste: true,
    formatOnType: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    readOnly: props.readOnly,
    theme: 'vs-dark',
};
</script>

<template>
    <div class="monacoEditor">
        <VueMonacoEditor
            v-model:value="editorValue"
            :language="language"
            :options="editorOptions"
            @change="handleChange"
        />
    </div>
</template>

<style scoped>
.monacoEditor {
    width: 100%;
    height: 100%;
    min-height: 200px;
}
</style>
