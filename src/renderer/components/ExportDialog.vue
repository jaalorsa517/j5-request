<script setup lang="ts">
import { ref, computed } from 'vue';
import { J5Request } from '@/shared/types';

const props = defineProps<{
    isOpen: boolean;
    request?: Partial<J5Request>; // Single request mode
    requests?: J5Request[]; // Multiple request mode (collection)
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'exported'): void;
}>();

const selectedFormat = ref('curl');

const allFormats = [
    { value: 'curl', label: 'cURL', extension: 'sh', single: true, collection: false },
    { value: 'fetch', label: 'Fetch (JavaScript)', extension: 'js', single: true, collection: false },
    { value: 'powershell', label: 'PowerShell', extension: 'ps1', single: true, collection: false },
    { value: 'postman', label: 'Postman Collection v2.1', extension: 'json', single: true, collection: true },
    { value: 'insomnia', label: 'Insomnia Export v4', extension: 'json', single: true, collection: true },
    { value: 'openapi', label: 'OpenAPI 3.0', extension: 'yaml', single: true, collection: true }
];

const isCollection = computed(() => !!props.requests && props.requests.length > 0);

const formats = computed(() => {
    if (isCollection.value) {
        return allFormats.filter(f => f.collection);
    }
    return allFormats.filter(f => f.single);
});

const isLoading = ref(false);

async function handleCopy() {
    if (!props.request && !props.requests) return;
    isLoading.value = true;
    try {
        const content = await generateContent();
        await window.electron.export.toClipboard(content);
        emit('exported');
        emit('close');
    } catch (e: any) {
        alert('Error exporting to clipboard: ' + e.message);
    } finally {
        isLoading.value = false;
    }
}

async function handleSave() {
    if (!props.request && !props.requests) return;
    isLoading.value = true;
    try {
        const content = await generateContent();
        const format = formats.value.find(f => f.value === selectedFormat.value);
        
        let defaultName = 'export';
        if (isCollection.value) {
            defaultName = `collection.${format?.extension || 'json'}`;
        } else if (props.request?.name) {
            const safeName = props.request.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            defaultName = `${safeName}.${format?.extension || 'txt'}`;
        }

        const path = await window.electron.export.toFile(content, defaultName);
        if (path) {
            alert(`Archivo guardado exitosamente en:\n${path}`);
            emit('exported');
            emit('close');
        }
    } catch (e: any) {
        alert('Error saving file: ' + e.message);
    } finally {
        isLoading.value = false;
    }
}

async function generateContent(): Promise<string> {
    if (isCollection.value && props.requests) {
        // Collection export - deeply strip proxies to avoid cloning errors
        const rawRequests = JSON.parse(JSON.stringify(props.requests));
        const result = await window.electron.export.generate(rawRequests, selectedFormat.value);
        return result;
    } else if (props.request) {
        // Single request export - deeply strip proxies to avoid cloning errors
        const rawRequest = JSON.parse(JSON.stringify(props.request));
        const result = await window.electron.export.generate(rawRequest, selectedFormat.value);
        return result;
    }
    throw new Error('No request or collection to export');
}

</script>

<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
        <div class="modal">
            <h3 class="modal__title">
                {{ isCollection ? `Exportar Colección (${requests?.length} peticiones)` : 'Exportar Petición' }}
            </h3>
            
            <div class="modal__content">
                <label class="form-label">Formato:</label>
                <select v-model="selectedFormat" class="form-select">
                    <option v-for="f in formats" :key="f.value" :value="f.value">
                        {{ f.label }}
                    </option>
                </select>
                
                <div class="preview-info" v-if="!isCollection && (selectedFormat === 'postman' || selectedFormat === 'insomnia' || selectedFormat === 'openapi')">
                    <small>Se exportará como una colección/spec con una sola petición.</small>
                </div>
            </div>

            <div class="modal__actions">
                <button class="btn btn--secondary" @click="emit('close')">
                    Cancelar
                </button>
                <div class="btn-group">
                    <button class="btn btn--secondary" @click="handleCopy" :disabled="isLoading">
                        {{ isLoading ? '...' : 'Copiar' }}
                    </button>
                    <button class="btn btn--primary" @click="handleSave" :disabled="isLoading">
                        {{ isLoading ? '...' : 'Guardar Archivo' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    backdrop-filter: blur(2px);
}

.modal {
    background: var(--bg-modal, #252526);
    border: 1px solid var(--border-color, #383838);
    border-radius: 6px;
    padding: 20px;
    min-width: 400px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    color: var(--text-primary, #ffffff);
}

.modal__title {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: 600;
}

.modal__content {
    margin-bottom: 24px;
}

.form-label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: var(--text-secondary);
}

.form-select {
    width: 100%;
    padding: 8px 12px;
    background-color: var(--input-bg, #1e1e1e);
    color: var(--text-primary, #ffffff);
    border: 1px solid var(--input-border, #3c3c3c);
    border-radius: 4px;
    font-family: inherit;
    font-size: 14px;
}

.preview-info {
    margin-top: 8px;
    color: var(--text-secondary);
    font-size: 12px;
}

.modal__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.btn-group {
    display: flex;
    gap: 12px;
}

.btn {
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    font-size: 13px;
    transition: background 0.2s;
}

.btn--secondary {
    background: var(--bg-secondary, #333333);
    color: var(--text-primary, #ffffff);
    border: 1px solid var(--border-color, #454545);
}

.btn--secondary:hover {
    background: var(--bg-hover, #3e3e42);
}

.btn--primary {
    background: var(--accent-color, #007acc);
    color: #ffffff;
}

.btn--primary:hover {
    filter: brightness(1.1);
}
</style>
