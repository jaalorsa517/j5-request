<script setup lang="ts">
import { ref, watch } from 'vue';

interface KeyValuePair {
    key: string;
    value: string;
    enabled: boolean;
}

interface Props {
    modelValue: Record<string, string>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: Record<string, string>];
}>();

// Convertir objeto a array de pares
const pairs = ref<KeyValuePair[]>([]);

function syncFromProps() {
    pairs.value = Object.entries(props.modelValue).map(([key, value]) => ({
        key,
        value,
        enabled: true,
    }));
    // Agregar fila vacía al final
    pairs.value.push({ key: '', value: '', enabled: true });
}

// Sincronizar al montar y cuando cambian las props
watch(() => props.modelValue, syncFromProps, { immediate: true });

function emitChanges() {
    const result: Record<string, string> = {};
    pairs.value.forEach(pair => {
        if (pair.key && pair.enabled) {
            result[pair.key] = pair.value;
        }
    });
    emit('update:modelValue', result);
}

function handleInput(index: number) {
    const pair = pairs.value[index];
    
    // Si es la última fila y se escribió algo, agregar nueva fila vacía
    if (index === pairs.value.length - 1 && (pair.key || pair.value)) {
        pairs.value.push({ key: '', value: '', enabled: true });
    }
    
    emitChanges();
}

function removePair(index: number) {
    pairs.value.splice(index, 1);
    emitChanges();
}
</script>

<template>
    <div class="keyValueEditor">
        <div class="keyValueEditor__header">
            <div class="keyValueEditor__cell keyValueEditor__cell--checkbox"></div>
            <div class="keyValueEditor__cell">Key</div>
            <div class="keyValueEditor__cell">Value</div>
            <div class="keyValueEditor__cell keyValueEditor__cell--actions"></div>
        </div>
        <div
            v-for="(pair, index) in pairs"
            :key="index"
            class="keyValueEditor__row"
        >
            <div class="keyValueEditor__cell keyValueEditor__cell--checkbox">
                <input
                    v-model="pair.enabled"
                    type="checkbox"
                    @change="emitChanges"
                />
            </div>
            <div class="keyValueEditor__cell">
                <input
                    v-model="pair.key"
                    type="text"
                    class="keyValueEditor__input"
                    placeholder="Key"
                    @input="handleInput(index)"
                />
            </div>
            <div class="keyValueEditor__cell">
                <input
                    v-model="pair.value"
                    type="text"
                    class="keyValueEditor__input"
                    placeholder="Value"
                    @input="handleInput(index)"
                />
            </div>
            <div class="keyValueEditor__cell keyValueEditor__cell--actions">
                <button
                    v-if="index < pairs.length - 1"
                    class="keyValueEditor__deleteButton"
                    @click="removePair(index)"
                >
                    ×
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.keyValueEditor {
    padding: 12px;
    background-color: #1e1e1e;
}

.keyValueEditor__header {
    display: grid;
    grid-template-columns: 40px 1fr 1fr 40px;
    gap: 8px;
    padding: 8px;
    font-weight: 600;
    color: #888;
    font-size: 12px;
    text-transform: uppercase;
}

.keyValueEditor__row {
    display: grid;
    grid-template-columns: 40px 1fr 1fr 40px;
    gap: 8px;
    padding: 4px 8px;
    align-items: center;
}

.keyValueEditor__cell {
    display: flex;
    align-items: center;
}

.keyValueEditor__cell--checkbox {
    justify-content: center;
}

.keyValueEditor__cell--actions {
    justify-content: center;
}

.keyValueEditor__input {
    width: 100%;
    padding: 6px 8px;
    background-color: #2d2d2d;
    color: #fff;
    border: 1px solid #444;
    border-radius: 4px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.keyValueEditor__input::placeholder {
    color: #666;
}

.keyValueEditor__deleteButton {
    width: 24px;
    height: 24px;
    background-color: transparent;
    color: #888;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 20px;
    line-height: 1;
    transition: all 0.2s;
}

.keyValueEditor__deleteButton:hover {
    background-color: #d32f2f;
    color: #fff;
}
</style>
