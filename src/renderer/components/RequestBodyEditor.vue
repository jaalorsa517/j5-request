<script setup lang="ts">
import { computed } from 'vue';
import { useRequestStore } from '@/renderer/stores/request';
import MonacoEditor from '@/renderer/components/MonacoEditor.vue';
import FormDataEditor from '@/renderer/components/FormDataEditor.vue';

const requestStore = useRequestStore();

const editorLanguage = computed(() => {
    switch (requestStore.bodyType) {
        case 'json': return 'json';
        case 'xml': return 'xml';
        default: return 'plaintext';
    }
});
</script>

<template>
    <div class="requestBodyEditor">
        <div class="requestBodyEditor__toolbar">
            <label class="radio-label">
                <input type="radio" value="none" v-model="requestStore.bodyType"> None
            </label>
            <label class="radio-label">
                <input type="radio" value="form-data" v-model="requestStore.bodyType"> Form Data
            </label>
            <label class="radio-label">
                <input type="radio" value="json" v-model="requestStore.bodyType"> JSON
            </label>
            <label class="radio-label">
                <input type="radio" value="text" v-model="requestStore.bodyType"> Text
            </label>
             <label class="radio-label">
                <input type="radio" value="xml" v-model="requestStore.bodyType"> XML
            </label>
        </div>
        
        <div class="requestBodyEditor__content">
            <div v-if="requestStore.bodyType === 'none'" class="requestBodyEditor__empty">
                This request has no body
            </div>
            
            <div v-else-if="requestStore.bodyType === 'form-data'" class="requestBodyEditor__formData">
                <FormDataEditor v-model="requestStore.bodyFormData" />
            </div>

            <MonacoEditor
                v-else
                v-model="requestStore.body"
                :language="editorLanguage"
                :read-only="false"
            />
        </div>
    </div>
</template>

<style scoped>
.requestBodyEditor {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.requestBodyEditor__toolbar {
    padding: 8px 12px;
    background-color: #1e1e1e;
    border-bottom: 1px solid #333;
    display: flex;
    gap: 16px;
    align-items: center;
}

.radio-label {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #ccc;
    font-size: 13px;
    cursor: pointer;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.radio-label input {
    margin: 0;
    cursor: pointer;
}

.requestBodyEditor__content {
    flex: 1;
    min-height: 0;
}

.requestBodyEditor__empty {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #666;
    font-size: 14px;
    font-style: italic;
}
</style>
