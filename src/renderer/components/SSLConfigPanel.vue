<script setup lang="ts">
import { SSLConfig } from '@/shared/types';
import { computed } from 'vue';
import { useFileSystemStore } from '@/renderer/stores/file-system';

const fsStore = useFileSystemStore();

const props = defineProps<{
    modelValue: SSLConfig | undefined
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: SSLConfig): void
}>();

// Ensure we always have an object to work with, even if prop is undefined (though store initializes it)
const config = computed(() => props.modelValue || { rejectUnauthorized: true });

function update(changes: Partial<SSLConfig>) {
    emit('update:modelValue', { ...config.value, ...changes });
}

async function processPath(absolutePath: string): Promise<string> {
    const projectRoot = fsStore.currentPath;
    if (projectRoot) {
        try {
            const relative = await window.electron.fs.makeRelative(projectRoot, absolutePath);
            // If relative path starts with '..', it's outside the project
            if (relative.startsWith('..')) {
                 if (confirm('The certificate is outside the project directory. To ensure portability, it is recommended to copy it to the project\'s ".j5certs" folder.\n\nDo you want to copy it now?')) {
                     const filename = absolutePath.split(/[/\\]/).pop();
                     if (filename) {
                         const separator = navigator.userAgent.includes('Win') ? '\\' : '/';
                         const certsDir = `${projectRoot}${separator}.j5certs`;
                         const targetPath = `${certsDir}${separator}${filename}`;
                         
                         const content = await window.electron.fs.readTextFile(absolutePath);
                         await window.electron.fs.writeTextFile(targetPath, content);
                         
                         return `.j5certs/${filename}`;
                     }
                 }
            }
            return relative;
        } catch (e) {
            console.error('Failed to make relative path', e);
        }
    }
    return absolutePath;
}

async function selectCA() {
    const path = await window.electron.ssl.selectCertificateFile();
    if (path) {
        const processed = await processPath(path);
        const currentCAs = config.value.ca || [];
        // Avoid duplicates?
        if (!currentCAs.includes(processed)) {
             update({ ca: [...currentCAs, processed] });
        }
    }
}

function removeCA(index: number) {
    const currentCAs = config.value.ca || [];
    const newCAs = [...currentCAs];
    newCAs.splice(index, 1);
    update({ ca: newCAs });
}

async function selectClientCert() {
    const path = await window.electron.ssl.selectCertificateFile();
    if (path) {
        const processed = await processPath(path);
        update({ clientCert: processed });
    }
}

async function selectClientKey() {
    const path = await window.electron.ssl.selectCertificateFile();
    if (path) {
        const processed = await processPath(path);
        update({ clientKey: processed });
    }
}

function toggleRejectUnauthorized(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    update({ rejectUnauthorized: checked });
}
</script>

<template>
    <div class="ssl-panel">
        <div v-if="config.rejectUnauthorized === false" class="security-banner">
            <span class="icon">⚠️</span>
            <div class="message">
                <strong>SSL Verification Disabled</strong>
                <p>This request accepts invalid or self-signed certificates. Your connection is not secure.</p>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h4>CA Certificates</h4>
                <button class="btn-add" @click="selectCA">+ Add CA</button>
            </div>
            <div v-if="!config.ca || config.ca.length === 0" class="empty-list">
                No Custom CA certificates
            </div>
            <div v-else class="file-list">
                <div v-for="(ca, index) in config.ca" :key="index" class="file-row">
                    <span class="file-path" :title="ca">{{ ca }}</span>
                    <button class="btn-remove" @click="removeCA(index)">✕</button>
                </div>
            </div>
        </div>

        <div class="section">
             <h4>Client Certificate (mTLS)</h4>
             <div class="form-group">
                <label>Certificate File (CRT/PEM)</label>
                <div class="input-with-action">
                    <input type="text" :value="config.clientCert || ''" readonly placeholder="No file selected" />
                    <button class="btn-secondary" @click="selectClientCert">Browse</button>
                    <button v-if="config.clientCert" class="btn-text" @click="update({ clientCert: undefined })">Clear</button>
                </div>
            </div>
            <div class="form-group">
                <label>Key File (KEY/PEM)</label>
                <div class="input-with-action">
                    <input type="text" :value="config.clientKey || ''" readonly placeholder="No file selected" />
                    <button class="btn-secondary" @click="selectClientKey">Browse</button>
                    <button v-if="config.clientKey" class="btn-text" @click="update({ clientKey: undefined })">Clear</button>
                </div>
            </div>
        </div>

        <div class="section">
            <h4>Security Settings</h4>
            <label class="checkbox-label">
                <input 
                    type="checkbox" 
                    :checked="config.rejectUnauthorized !== false" 
                    @change="toggleRejectUnauthorized" 
                />
                <span>Verify SSL Certificates (Strict)</span>
            </label>
        </div>
    </div>
</template>

<style scoped>
.ssl-panel {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    color: var(--text-primary);
}

.security-banner {
    background-color: rgba(220, 53, 69, 0.15);
    border: 1px solid rgba(220, 53, 69, 0.5);
    color: #ff6b6b;
    padding: 0.75rem;
    border-radius: 4px;
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
}

.security-banner .icon {
    font-size: 1.2rem;
}

.security-banner strong {
    display: block;
    margin-bottom: 0.25rem;
}

.security-banner p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.9;
}

.section h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
}

.section-header h4 {
    margin: 0;
    border: none;
    padding: 0;
}

.btn-add {
    background: none;
    border: 1px dashed var(--border-color);
    color: var(--accent-color);
    cursor: pointer;
    padding: 2px 8px;
    font-size: 0.8rem;
    border-radius: 3px;
}

.file-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.file-row {
    display: flex;
    align-items: center;
    background: var(--bg-secondary);
    padding: 0.5rem;
    border-radius: 4px;
}

.file-path {
    flex: 1;
    font-family: monospace;
    font-size: 0.85rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    direction: rtl; /* Show end of path */
    text-align: left;
}

.btn-remove {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    margin-left: 0.5rem;
}

.btn-remove:hover {
    color: #ff6b6b;
}

.empty-list {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-style: italic;
    padding: 0.5rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    font-size: 0.85rem;
    margin-bottom: 0.4rem;
    color: var(--text-secondary);
}

.input-with-action {
    display: flex;
    gap: 0.5rem;
}

.input-with-action input {
    flex: 1;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.4rem 0.6rem;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.85rem;
}

.btn-secondary {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 0 0.8rem;
    border-radius: 3px;
    cursor: pointer;
    white-space: nowrap;
}

.btn-secondary:hover {
    border-color: var(--accent-color);
}

.btn-text {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.85rem;
}

.btn-text:hover {
    color: var(--text-primary);
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
}
</style>
