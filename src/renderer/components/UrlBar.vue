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
        <div class="urlBar__container">
            <select v-model="requestStore.method" class="urlBar__method" :class="`urlBar__method--${requestStore.method.toLowerCase()}`">
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
        </div>
        <div class="urlBar__actions">
            <button 
                class="urlBar__btn urlBar__btn--primary" 
                @click="sendRequest"
                :disabled="!requestStore.url || requestStore.isLoading"
            >
                <span v-if="requestStore.isLoading">Enviando...</span>
                <span v-else>✈️ Enviar</span>
            </button>
            <button 
                ref="exportButtonRef"
                class="urlBar__btn urlBar__btn--secondary"
                @click="toggleExportMenu"
                title="Exportar petición"
            >
                <span>Exportar</span>
                <span class="urlBar__btn-icon">▾</span>
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
    gap: 12px;
    padding: 16px;
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--border-subtle);
    width: 100%;
    align-items: center;
}

.urlBar__container {
    flex: 1;
    display: flex;
    background-color: var(--input-bg);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    overflow: hidden;
    transition: all var(--transition-fast);
}

.urlBar__container:focus-within {
    border-color: var(--accent-blue);
    box-shadow: 0 0 0 2px var(--accent-blue-soft);
}

.urlBar__method {
    padding: 0 16px;
    height: 38px;
    background-color: var(--bg-tertiary);
    border: none;
    border-right: 1px solid var(--border-subtle);
    color: var(--text-primary);
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    outline: none;
    appearance: none;
    text-align: center;
}

.urlBar__method--get { color: var(--accent-green); }
.urlBar__method--post { color: var(--accent-orange); }
.urlBar__method--put { color: var(--accent-blue); }
.urlBar__method--delete { color: var(--accent-red); }

.urlBar__input {
    flex: 1;
    border: none;
    background: transparent;
    height: 38px;
    border-radius: 0;
}

.urlBar__input:focus {
    box-shadow: none;
}

.urlBar__actions {
    display: flex;
    gap: 8px;
}

.urlBar__btn {
    height: 40px;
    white-space: nowrap;
}

.urlBar__btn--primary {
    background-color: var(--accent-blue);
    color: #ffffff;
    border: none;
    min-width: 100px;
}

.urlBar__btn--primary:hover:not(:disabled) {
    background-color: var(--brand-secondary);
    box-shadow: 0 4px 12px var(--accent-blue-soft);
}

.urlBar__btn--secondary {
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
}

.urlBar__btn-icon {
    font-size: 10px;
    margin-left: 4px;
}
</style>

