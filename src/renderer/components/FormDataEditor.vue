<script setup lang="ts">
import { ref, watch } from 'vue';

// Updated interface to support type (text/file)
interface FormDataPair {
    key: string;
    value: string; // For file: this is the path
    type: 'text' | 'file';
    enabled: boolean;
}

interface Props {
    modelValue: Record<string, string | { type: 'file', path: string }>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: Record<string, string | { type: 'file', path: string }>];
}>();

const pairs = ref<FormDataPair[]>([]);

function syncFromProps() {
    pairs.value = Object.entries(props.modelValue).map(([key, rawValue]) => {
        if (typeof rawValue === 'object' && rawValue !== null && 'type' in rawValue && rawValue.type === 'file') {
             return {
                key,
                value: rawValue.path,
                type: 'file',
                enabled: true
            };
        } else {
             return {
                key,
                value: String(rawValue),
                type: 'text',
                enabled: true
            };
        }
    });

    // Add empty row
    pairs.value.push({ key: '', value: '', type: 'text', enabled: true });
}

watch(() => props.modelValue, syncFromProps, { immediate: true });

function emitChanges() {
    const result: Record<string, string | { type: 'file', path: string }> = {};
    pairs.value.forEach(pair => {
        if (pair.key && pair.enabled) {
            if (pair.type === 'file') {
                result[pair.key] = { type: 'file', path: pair.value };
            } else {
                result[pair.key] = pair.value;
            }
        }
    });
    emit('update:modelValue', result);
}

function handleInput(index: number) {
    const pair = pairs.value[index];
    if (index === pairs.value.length - 1 && (pair.key || pair.value)) {
        pairs.value.push({ key: '', value: '', type: 'text', enabled: true });
    }
    emitChanges();
}

function removePair(index: number) {
    pairs.value.splice(index, 1);
    emitChanges();
}

async function selectFile(index: number) {
    const path = await window.electron.fs.selectFile();
    if (path) {
        pairs.value[index].value = path;
        handleInput(index);
    }
}
</script>

<template>
    <div class="formDataEditor">
        <div class="formDataEditor__header">
             <div class="cell checkbox"></div>
             <div class="cell">Key</div>
             <div class="cell">Type</div>
             <div class="cell">Value</div>
             <div class="cell actions"></div>
        </div>
        
        <div v-for="(pair, index) in pairs" :key="index" class="formDataEditor__row">
            <div class="cell checkbox">
                <input type="checkbox" v-model="pair.enabled" @change="emitChanges" />
            </div>
            
            <div class="cell">
                <input 
                    v-model="pair.key" 
                    placeholder="Key" 
                    class="input"
                    @input="handleInput(index)"
                />
            </div>
            
            <div class="cell type-cell">
                <select v-model="pair.type" class="select" @change="emitChanges">
                    <option value="text">Text</option>
                    <option value="file">File</option>
                </select>
            </div>
            
            <div class="cell value-cell">
                <template v-if="pair.type === 'file'">
                     <div class="file-input">
                         <span class="file-path" :title="pair.value">{{ pair.value || 'No file selected' }}</span>
                         <button class="file-btn" @click="selectFile(index)">Select File</button>
                     </div>
                </template>
                <template v-else>
                    <input 
                        v-model="pair.value" 
                        placeholder="Value" 
                        class="input"
                         @input="handleInput(index)"
                    />
                </template>
            </div>

             <div class="cell actions">
                <button
                    v-if="index < pairs.length - 1"
                    class="delete-btn"
                    @click="removePair(index)"
                >
                    ×
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.formDataEditor {
    padding: 12px;
    background-color: #1e1e1e;
}

.formDataEditor__header, .formDataEditor__row {
    display: grid;
    grid-template-columns: 40px 1fr 80px 2fr 40px;
    gap: 8px;
    align-items: center;
}

.formDataEditor__header {
    padding: 8px;
    font-weight: 600;
    color: #888;
    font-size: 11px;
    text-transform: uppercase;
}

.formDataEditor__row {
    padding: 4px 8px;
}

.cell {
    display: flex;
    align-items: center;
}

.cell.checkbox, .cell.actions {
    justify-content: center;
}

.input, .select {
    width: 100%;
    padding: 6px 8px;
    background-color: #2d2d2d;
    color: #fff;
    border: 1px solid #444;
    border-radius: 4px;
    font-family: inherit;
    box-sizing: border-box; 
    /* box-sizing essential because width: 100% */
}

.file-input {
    display: flex;
    width: 100%;
    background-color: #2d2d2d;
    border: 1px solid #444;
    border-radius: 4px;
    overflow: hidden;
}

.file-path {
    flex: 1;
    padding: 6px 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #ccc;
    font-style: italic;
    font-size: 13px;
    line-height: normal; /* Fix alignment */
}

.file-btn {
    padding: 0 12px;
    background-color: #444;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 12px;
    border-left: 1px solid #555;
    white-space: nowrap;
}

.file-btn:hover {
    background-color: #555;
}

.delete-btn {
    background: none;
    border: none;
    color: #888;
    font-size: 20px;
    cursor: pointer;
}

.delete-btn:hover {
    color: #d32f2f;
}
</style>
