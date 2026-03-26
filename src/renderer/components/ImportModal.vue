<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ImportFormat } from '@/shared/import-types';
import { useFileSystemStore } from '@/renderer/stores/file-system';

const emit = defineEmits<{
  close: [];
  imported: [count: number];
}>();

const fsStore = useFileSystemStore();

// Tab activo
const activeTab = ref<'paste' | 'file'>('paste');

// Estado del contenido
const pasteContent = ref('');
const selectedFile = ref<string | null>(null);

// Formato
const detectedFormat = ref<ImportFormat | null>(null);
const manualFormat = ref<ImportFormat | null>(null);
const formatConfidence = ref(0);

// Estado de importación
const isImporting = ref(false);
const importProgress = ref('');
const errors = ref<string[]>([]);
const warnings = ref<string[]>([]);

// Formatos disponibles
const availableFormats: { value: ImportFormat; label: string }[] = [
  { value: 'curl', label: 'cURL' },
  { value: 'openapi', label: 'OpenAPI 3.x' },
  { value: 'postman', label: 'Postman Collection' },
  { value: 'insomnia', label: 'Insomnia Collection' },
  { value: 'fetch', label: 'JavaScript Fetch' },
  { value: 'powershell', label: 'PowerShell' },
];

// Formato actual (manual o detectado)
const currentFormat = computed(() => manualFormat.value || detectedFormat.value);

// Detectar formato automáticamente
async function detectFormat() {
  if (!pasteContent.value.trim()) {
    detectedFormat.value = null;
    formatConfidence.value = 0;
    return;
  }

  try {
    const result = await window.electron.import.detectFormat(pasteContent.value);
    detectedFormat.value = result.format;
    formatConfidence.value = result.confidence;
  } catch (error) {
    console.error('Error detecting format:', error);
    detectedFormat.value = null;
    formatConfidence.value = 0;
  }
}

// Seleccionar archivo
async function selectFile() {
  const filePath = await window.electron.fs.selectFile();
  if (filePath) {
    selectedFile.value = filePath;
    // Leer contenido del archivo para detectar formato
    try {
      // Usar readTextFile para leer contenido raw sin intentar parsear JSON
      const content = await window.electron.fs.readTextFile(filePath);
      pasteContent.value = content;
      await detectFormat();
    } catch (error) {
      console.error('Error reading file:', error);
      errors.value.push('No se pudo leer el archivo seleccionado');
    }
  }
}

// Importar desde contenido
async function importFromPaste() {
  if (!pasteContent.value.trim()) {
    errors.value = ['Por favor ingresa contenido para importar'];
    return;
  }

  await performImport(pasteContent.value);
}

// Importar desde archivo
async function importFromFile() {
  if (!selectedFile.value) {
    errors.value = ['Por favor selecciona un archivo'];
    return;
  }

  await performImport(pasteContent.value);
}

// Realizar importación
async function performImport(content: string) {
  isImporting.value = true;
  errors.value = [];
  warnings.value = [];
  importProgress.value = 'Importando...';

  try {
    const result = await window.electron.import.fromContent(content, {
      format: currentFormat.value || undefined,
    });

    errors.value = result.errors;
    warnings.value = result.warnings;

    if (result.success && result.requests.length > 0) {
      if (!fsStore.currentPath) {
        errors.value.push('Debes tener una carpeta abierta para guardar los requests importados.');
        importProgress.value = 'Error al importar';
        isImporting.value = false;
        return;
      }

      importProgress.value = `Guardando ${result.requests.length} archivo(s)...`;
      
      const savedPaths = await window.electron.fs.saveRequests(result.requests, fsStore.currentPath);
      
      importProgress.value = `✓ ${savedPaths.length} archivo(s) guardado(s) exitosamente`;
      
      // Emitir evento de importación exitosa tras breve pausa
      setTimeout(async () => {
        emit('imported', savedPaths.length);
        if (fsStore.currentPath) {
             await fsStore.openDirectory(fsStore.currentPath);
        }
        emit('close');
        isImporting.value = false;
      }, 1500);
      
    } else if (errors.value.length > 0) {
      importProgress.value = 'Error al importar';
      isImporting.value = false;
    } else {
      errors.value.push('No se encontraron requests válidos para importar');
      importProgress.value = 'Error al importar';
      isImporting.value = false;
    }
  } catch (error) {
    console.error('Import error:', error);
    errors.value.push(error instanceof Error ? error.message : 'Error desconocido');
    importProgress.value = 'Error al importar';
    isImporting.value = false;
  }
}

// Cerrar modal
function close() {
  emit('close');
}
</script>

<template>
  <div class="importModal__overlay" @click.self="close">
    <div class="importModal__container">
      <div class="importModal__header">
        <h2>Importar Requests</h2>
        <button class="importModal__closeButton" @click="close">×</button>
      </div>

      <div class="importModal__tabs">
        <button
          :class="['importModal__tab', { 'importModal__tab--active': activeTab === 'paste' }]"
          @click="activeTab = 'paste'"
        >
          Pegar
        </button>
        <button
          :class="['importModal__tab', { 'importModal__tab--active': activeTab === 'file' }]"
          @click="activeTab = 'file'"
        >
          Archivo
        </button>
      </div>

      <div class="importModal__content">
        <!-- Tab: Pegar -->
        <div v-if="activeTab === 'paste'" class="importModal__tabContent">
          <textarea
            v-model="pasteContent"
            class="importModal__textarea"
            placeholder="Pega aquí tu cURL, colección de Postman, especificación OpenAPI, código fetch, etc..."
            @input="detectFormat"
          />

          <!-- Formato detectado -->
          <div v-if="detectedFormat && !manualFormat" class="importModal__formatDetected">
            <span class="importModal__formatLabel">Formato detectado:</span>
            <strong>{{ availableFormats.find(f => f.value === detectedFormat)?.label }}</strong>
            <span class="importModal__confidence">({{ Math.round(formatConfidence * 100) }}% confianza)</span>
          </div>

          <div class="importModal__actions">
            <button
              class="importModal__button importModal__button--primary importModal__button--full"
              :disabled="isImporting || !pasteContent.trim()"
              @click="importFromPaste"
            >
              {{ isImporting ? 'Importando...' : 'Importar' }}
            </button>
          </div>
        </div>

        <!-- Tab: Archivo -->
        <div v-if="activeTab === 'file'" class="importModal__tabContent">
          <div class="importModal__filePicker">
            <button
              class="importModal__button importModal__button--full"
              @click="selectFile"
            >
              {{ selectedFile ? 'Seleccionado: ' + selectedFile : 'Seleccionar Archivo' }}
            </button>
          </div>

          <div class="importModal__actions">
            <button
              class="importModal__button importModal__button--primary importModal__button--full"
              :disabled="isImporting || !selectedFile"
              @click="importFromFile"
            >
              {{ isImporting ? 'Importando...' : 'Importar' }}
            </button>
          </div>
        </div>

        <!-- Selector manual de formato -->
        <div class="importModal__formatSelector">
          <label class="importModal__label">
            Formato (opcional - se detecta automáticamente):
          </label>
          <select
            v-model="manualFormat"
            class="importModal__select"
          >
            <option :value="null">Auto-detectar</option>
            <option
              v-for="format in availableFormats"
              :key="format.value"
              :value="format.value"
            >
              {{ format.label }}
            </option>
          </select>
        </div>

        <!-- Progreso -->
        <div v-if="importProgress" class="importModal__progress">
          {{ importProgress }}
        </div>

        <!-- Warnings -->
        <div v-if="warnings.length > 0" class="importModal__warnings">
          <strong>Advertencias:</strong>
          <ul>
            <li v-for="(warning, index) in warnings" :key="index">
              {{ warning }}
            </li>
          </ul>
        </div>

        <!-- Errores -->
        <div v-if="errors.length > 0" class="importModal__errors">
          <strong>Errores:</strong>
          <ul>
            <li v-for="(error, index) in errors" :key="index">
              {{ error }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.importModal__overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85); /* Aún más oscuro */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.importModal__container {
  background: var(--bg-modal);
  color: var(--text-primary);
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-color);
}

.importModal__header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.importModal__header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.importModal__closeButton {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--text-primary);
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.importModal__closeButton:hover {
  color: var(--accent-color);
}

.importModal__tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.importModal__tab {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.importModal__tab:hover {
  background: var(--bg-tertiary);
}

.importModal__tab--active {
  border-bottom-color: var(--accent-color);
  color: var(--accent-color);
}

.importModal__content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.importModal__textarea {
  width: 100%;
  min-height: 250px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  resize: vertical;
}

.importModal__textarea:focus {
  outline: none;
  border-color: var(--accent-color);
}

.importModal__formatDetected {
  padding: 10px;
  background: rgba(14, 99, 156, 0.1); 
  border-left: 3px solid var(--accent-color);
  border-radius: 4px;
  font-size: 0.875rem;
}

.importModal__formatLabel {
  color: var(--text-secondary);
  margin-right: 8px;
}

.importModal__confidence {
  color: var(--text-secondary);
  margin-left: 8px;
  font-size: 0.8rem;
}

.importModal__filePicker {
  display: flex;
  align-items: center;
  gap: 12px;
}

.importModal__actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.importModal__button--full {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.importModal__formatSelector {
  margin-top: 16px;
}

.importModal__label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.importModal__select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.importModal__select option {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.importModal__button {
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.importModal__button:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--accent-color);
}

.importModal__button--primary {
  background: var(--accent-color);
  color: var(--text-inverse);
  border-color: var(--accent-color);
}

.importModal__button--primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.importModal__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.importModal__progress {
  padding: 12px;
  background: rgba(14, 99, 156, 0.1);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.875rem;
  margin-top: 16px;
}

.importModal__warnings {
  padding: 12px;
  background: rgba(245, 158, 11, 0.1);
  border-left: 3px solid var(--warning-color);
  border-radius: 4px;
  margin-top: 16px;
  font-size: 0.875rem;
}

.importModal__errors {
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid var(--error-color);
  border-radius: 4px;
  margin-top: 16px;
  font-size: 0.875rem;
}

.importModal__button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--brand-primary);
}

.importModal__button--primary {
  background: var(--brand-primary);
  color: white;
  border-color: var(--brand-primary);
}

.importModal__button--primary:hover:not(:disabled) {
  background: var(--brand-secondary);
}

.importModal__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.importModal__progress {
  padding: 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 0.875rem;
  margin-top: 16px;
}

.importModal__warnings {
  padding: 12px;
  background: rgba(245, 158, 11, 0.1);
  border-left: 3px solid #f59e0b;
  border-radius: 4px;
  margin-top: 16px;
  font-size: 0.875rem;
}

.importModal__warnings ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.importModal__errors {
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
  border-radius: 4px;
  margin-top: 16px;
  font-size: 0.875rem;
}

.importModal__errors ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}
</style>
