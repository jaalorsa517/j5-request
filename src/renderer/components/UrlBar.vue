<script setup lang="ts">
import { ref } from 'vue';
import { useRequestStore } from '@/renderer/stores/request';
import { RequestMethod, J5Request } from '@/shared/types';
import ContextMenu, { MenuItem } from '@/renderer/components/ContextMenu.vue';
import ExportDialog from '@/renderer/components/ExportDialog.vue';

const requestStore = useRequestStore();

const methods: RequestMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

// Export Menu State
const showExportMenu = ref(false);
const exportMenuX = ref(0);
const exportMenuY = ref(0);
const exportButtonRef = ref<HTMLElement | null>(null);

// Export Dialog State
const showExportDialog = ref(false);
const requestForExport = ref<Partial<J5Request> | undefined>(undefined);

const exportMenuItems: MenuItem[] = [
    { label: 'Copiar como cURL', action: 'curl' },
    { label: 'Copiar como Fetch', action: 'fetch' },
    { label: 'Copiar como PowerShell', action: 'powershell' },
    { label: 'Exportar a archivo...', action: 'file' }
];

async function sendRequest() {
    await requestStore.execute();
}

function toggleExportMenu() {
    if (exportButtonRef.value) {
        const rect = exportButtonRef.value.getBoundingClientRect();
        exportMenuX.value = rect.left;
        exportMenuY.value = rect.bottom + 5;
        showExportMenu.value = !showExportMenu.value;
    }
}

async function handleExportAction(item: MenuItem) {
    showExportMenu.value = false;
    
    // Get current request data
    const request: Partial<J5Request> = {
        method: requestStore.method,
        url: requestStore.url,
        headers: { ...requestStore.headers },
        body: getRequestBody(),
        preRequestScript: requestStore.preRequestScript,
        postResponseScript: requestStore.postResponseScript,
        name: requestStore.name // Include name for filename suggestion
    };

    try {
        if (item.action === 'file') {
             requestForExport.value = request;
             showExportDialog.value = true;
             return;
        }

        const rawRequest = JSON.parse(JSON.stringify(request));
        const content = await window.electron.export.generate(rawRequest, item.action);
        await window.electron.export.toClipboard(content);
        
        // Notification
        const btn = exportButtonRef.value;
        if(btn) {
            const originalText = btn.innerText;
            btn.innerText = '¡Copiado!';
            setTimeout(() => {
                btn.innerText = originalText;
            }, 2000);
        }

    } catch (e) {
        console.error('Export failed', e);
        alert('Error al exportar: ' + e);
    }
}

function getRequestBody(): any {
    const type = requestStore.bodyType;
    const content = requestStore.body;
    
    if (type === 'none') return undefined;
    
    if (type === 'json') {
        try {
            return { type: 'json', content: JSON.parse(content || '{}') };
        } catch {
            return { type: 'json', content: content };
        }
    }
    
    if (type === 'form-data') {
        return { type: 'form-data', content: { ...requestStore.bodyFormData } };
    }
    
    return { type: 'raw', content: content };
}
</script>

<template>
    <div class="urlBar">
        <select v-model="requestStore.method" class="urlBar__methodSelector">
            <option v-for="method in methods" :key="method" :value="method">
                {{ method }}
            </option>
        </select>
        <input
            v-model="requestStore.url"
            type="text"
            class="urlBar__input"
            placeholder="https://api.example.com/endpoint"
        />
        <div class="urlBar__actions">
            <button 
                class="urlBar__button urlBar__button--primary" 
                @click="sendRequest"
                :disabled="!requestStore.url || requestStore.isLoading"
            >
                {{ requestStore.isLoading ? 'Enviando...' : 'Enviar' }}
            </button>
            <button 
                ref="exportButtonRef"
                class="urlBar__button urlBar__button--secondary"
                @click="toggleExportMenu"
                title="Exportar petición"
            >
                Exportar ▾
            </button>
        </div>

        <ContextMenu 
            v-if="showExportMenu"
            :x="exportMenuX"
            :y="exportMenuY"
            :items="exportMenuItems"
            @action="handleExportAction"
            @close="showExportMenu = false"
        />

        <ExportDialog 
            :is-open="showExportDialog" 
            :request="requestForExport"
            @close="showExportDialog = false"
        />
    </div>
</template>

<style scoped>
.urlBar {
    display: flex;
    gap: 8px;
    padding: 12px;
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
    width: 100%;
    box-sizing: border-box;
    align-items: center;
}

.urlBar__methodSelector {
    padding: 8px 12px;
    background-color: var(--input-bg);
    color: var(--text-primary);
    border: 1px solid var(--input-border);
    border-radius: 4px;
    cursor: pointer;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    height: 36px;
}

.urlBar__input {
    flex: 1;
    padding: 8px 12px;
    background-color: var(--input-bg);
    color: var(--text-primary);
    border: 1px solid var(--input-border);
    border-radius: 4px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    height: 36px;
    box-sizing: border-box;
}

.urlBar__input::placeholder {
    color: var(--text-secondary);
}

.urlBar__actions {
    display: flex;
    gap: 8px;
}

.urlBar__button {
    padding: 0 16px;
    height: 36px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
}

.urlBar__button--primary {
    background-color: var(--accent-color);
    color: var(--text-inverse);
}

.urlBar__button--primary:hover:not(:disabled) {
    background-color: var(--accent-hover);
}

.urlBar__button--secondary {
    background-color: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-primary);
}

.urlBar__button--secondary:hover {
    background-color: var(--bg-secondary);
}

.urlBar__button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
