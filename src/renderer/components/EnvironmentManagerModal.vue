<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEnvironmentStore } from '@/renderer/stores/environment';

const store = useEnvironmentStore();

const selectedScope = ref<'globals' | 'environment'>('globals');

function setScope(scope: 'globals' | 'environment') {
    selectedScope.value = scope;
}

const targetEnv = computed(() => {
    return selectedScope.value === 'globals' ? store.globals : store.activeEnvironment;
});

const newVarKey = ref('');
const newVarValue = ref('');
const newVarSecret = ref(false);

function checkCollabSecretWarning(): boolean {
    if (selectedScope.value === 'environment') {
        const warned = localStorage.getItem('j5_notified_secret_collab');
        if (!warned) {
            alert(
                '🔒 Modo Seguro Activado:\n\n' +
                'Esta variable se encriptará de forma segura en disco.\n' +
                'Se generará un archivo "environment.key" en la carpeta del proyecto para cifrarlo.\n\n' +
                '⚠️ IMPORTANTE COLABORACIÓN:\n' +
                '- Agrega "environment.key" a tu .gitignore (no lo subas al repo).\n' +
                '- Comparte este archivo de manera segura con tu equipo para que puedan abrir el ambiente.'
            );
            localStorage.setItem('j5_notified_secret_collab', 'true');
        }
    }
    return true; // Continuar siempre después del warning
}

function addVariable() {
    if (!newVarKey.value || !targetEnv.value) return;

    // Warning al agregar variable secret en Globals
    if (selectedScope.value === 'globals' && newVarSecret.value) {
        const proceed = confirm(
            '⚠️ Las variables tipo "Secret" en Globals NO se encriptan en disco.\n\n' +
            'Los Globals están protegidos por permisos del sistema operativo, pero si necesitas ' +
            'protección adicional, considera usar un Environment local del proyecto.\n\n' +
            '¿Deseas continuar?'
        );
        if (!proceed) return;
    } else if (newVarSecret.value) {
        checkCollabSecretWarning();
    }

    try {
        targetEnv.value.variables.push({
            key: newVarKey.value,
            value: newVarValue.value,
            type: newVarSecret.value ? 'secret' : 'default',
            enabled: true
        });

        newVarKey.value = '';
        newVarValue.value = '';
        newVarSecret.value = false;
    } catch (e) {
        console.error('Error adding variable:', e);
        alert('Failed to add variable');
    }
}

function removeVariable(index: number) {
    if (targetEnv.value) {
        targetEnv.value.variables.splice(index, 1);
    }
}

/**
 * Muestra warning al cambiar tipo a 'secret' en Globals.
 */
function onTypeChange(variable: { key: string; value: string; type: 'default' | 'secret'; enabled: boolean }, newType: string) {
    if (selectedScope.value === 'globals' && newType === 'secret') {
        const proceed = confirm(
            '⚠️ Las variables tipo "Secret" en Globals NO se encriptan.\n\n' +
            'Considera usar un Environment local del proyecto para protección adicional.\n\n' +
            '¿Continuar?'
        );
        if (!proceed) {
            variable.type = 'default';
            return;
        }
    } else if (newType === 'secret') {
        checkCollabSecretWarning();
    }
    
    variable.type = newType as 'default' | 'secret';
}

async function save() {
    // Auto-add pending variable if user forgot to click +
    if (newVarKey.value) {
        addVariable();
    }

    try {
        if (selectedScope.value === 'globals') {
            await store.saveGlobals();
        } else {
            if (!store.activeEnvironment) return; 
            await store.saveActiveEnvironment();
        }
    } catch (e: any) {
        alert('Error saving: ' + e.message);
    }
}

</script>

<template>
    <div class="envModalOverlay" @click.self="store.showManager = false">
        <div class="envModal">
            <div class="envModal__header">
                <h3>Environment Manager</h3>
                <button class="close-btn" @click="store.showManager = false">×</button>
            </div>
            
            <div class="envModal__body">
                <!-- Sidebar -->
                <div class="envModal__sidebar">
                    <div 
                        class="scope-item" 
                        :class="{ active: selectedScope === 'globals' }"
                        @click="setScope('globals')"
                    >
                        Globals
                    </div>
                     <div 
                        class="scope-item" 
                        :class="{ active: selectedScope === 'environment' }"
                        @click="setScope('environment')"
                    >
                        Active Env
                        <span v-if="store.activeEnvironment" class="env-badge">{{ store.activeEnvironment.name }}</span>
                        <span v-else class="env-badge warning">None</span>
                    </div>
                </div>

                    <!-- Content -->
                <div class="envModal__content">
                    <!-- Environment Info (Name/Path) only for active env -->
                    <div v-if="selectedScope === 'environment' && !store.activeEnvironment" class="no-env">
                         <p>No active environment selected.</p>
                        <button @click="store.createNewEnvironment('New Environment')">Create New</button>
                    </div>

                    <div v-else class="env-editor">
                         <div class="env-info" v-if="selectedScope === 'environment' && store.activeEnvironment">
                            <label>Name: <input v-model="store.activeEnvironment.name" /></label>
                            <span v-if="store.activeEnvironmentPath" class="path">{{ store.activeEnvironmentPath }}</span>
                            <span v-else class="unsaved-badge">Unsaved</span>
                        </div>
                        <div class="env-info" v-if="selectedScope === 'globals'">
                             <label>Global Variables (Shared across all projects/requests)</label>
                        </div>
                        
                        <div class="vars-table" v-if="targetEnv">
                            <div class="vars-header">
                                <div class="col-enabled"></div>
                                <div class="col-key">Key</div>
                                <div class="col-value">Value</div>
                                <div class="col-type">Type</div>
                                <div class="col-actions"></div>
                            </div>
                            
                            <div v-for="(v, index) in targetEnv.variables" :key="index" class="vars-row">
                                 <div class="col-enabled">
                                     <input type="checkbox" v-model="v.enabled" />
                                 </div>
                                 <div class="col-key">
                                     <input v-model="v.key" />
                                 </div>
                                 <div class="col-value">
                                     <input v-model="v.value" :type="v.type === 'secret' ? 'password' : 'text'" />
                                 </div>
                                 <div class="col-type">
                                     <select :value="v.type" @change="onTypeChange(v, ($event.target as HTMLSelectElement).value)">
                                         <option value="default">Default</option>
                                         <option value="secret">Secret 🔒</option>
                                     </select>
                                 </div>
                                 <div class="col-actions">
                                     <button @click="removeVariable(index)">×</button>
                                 </div>
                            </div>
                            
                            <!-- Add new -->
                            <div class="vars-row new-row">
                                 <div class="col-enabled"></div>
                                 <div class="col-key">
                                     <input v-model="newVarKey" placeholder="New Key" @keyup.enter="addVariable" />
                                 </div>
                                 <div class="col-value">
                                     <input v-model="newVarValue" :type="newVarSecret ? 'password' : 'text'" placeholder="Value" @keyup.enter="addVariable" />
                                 </div>
                                 <div class="col-type">
                                      <select v-model="newVarSecret">
                                         <option :value="false">Default</option>
                                         <option :value="true">Secret</option>
                                     </select>
                                 </div>
                                 <div class="col-actions">
                                     <button @click="addVariable" :disabled="!newVarKey">+</button>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="envModal__footer" v-if="targetEnv">
                 <button v-if="selectedScope === 'environment'" @click="store.closeEnvironment()">Close Environment</button>
                <div class="spacer"></div>
                <button @click="save">Save</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.envModalOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
}

.envModal {
    background: var(--bg-modal);
    width: 800px;
    height: 600px;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    border: 1px solid var(--input-border);
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

.envModal__header {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.envModal__header h3 {
    margin: 0;
    color: var(--text-primary);
}

.close-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 24px;
    cursor: pointer;
}

/* Body Layout */
.envModal__body {
    flex: 1;
    display: flex;
    overflow: hidden;
}

.envModal__sidebar {
    width: 200px;
    background: var(--bg-primary);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
}

.scope-item {
    padding: 12px 16px;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 13px;
    border-left: 2px solid transparent;
}

.scope-item:hover {
    background: var(--bg-secondary);
}

.scope-item.active {
    background: var(--bg-modal);
    border-left-color: var(--accent-color);
    color: var(--text-primary);
    font-weight: 500;
}

.env-badge {
    display: block;
    font-size: 11px;
    opacity: 0.7;
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.env-badge.warning { color: var(--accent-dirty); }

.envModal__content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

/* Footer */
.envModal__footer {
    padding: 16px;
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 12px;
}

.spacer {
    flex: 1;
}

button {
    padding: 8px 16px;
    background: var(--accent-color);
    border: none;
    color: var(--text-inverse);
    border-radius: 4px;
    cursor: pointer;
}
button:hover { background: var(--accent-hover); }

.no-env {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-secondary);
    gap: 16px;
}

.env-info {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.env-info label {
    color: var(--text-secondary);
    display: flex;
    gap: 8px;
    align-items: center;
}
.env-info input {
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--text-primary);
    padding: 4px 8px;
    border-radius: 4px;
}

.path {
    color: var(--text-secondary);
    font-size: 12px;
    font-family: monospace;
}

.unsaved-badge {
    background: var(--accent-dirty);
    color: var(--text-inverse);
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 10px;
}

/* Table */
.vars-table {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
}

.vars-header, .vars-row {
    display: grid;
    grid-template-columns: 40px 1fr 1fr 100px 40px;
    gap: 1px;
    background: var(--border-color); /* Gap color */
}

.vars-header > div, .vars-row > div {
    background: var(--bg-modal);
    padding: 8px;
    display: flex;
    align-items: center;
}

.vars-header > div {
    font-weight: bold;
    color: var(--text-secondary);
    font-size: 12px;
}

.col-enabled, .col-actions { justify-content: center; }

input[type="text"], input[type="password"], select {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-family: inherit;
}
input:focus, select:focus { outline: 1px solid var(--accent-color); }
select option {
    background-color: var(--bg-modal);
    color: var(--text-primary);
}

.new-row input {
    font-style: italic;
}

.vars-row .col-actions button {
    background: none;
    color: var(--text-secondary);
    padding: 0;
    font-size: 18px;
}
.vars-row .col-actions button:hover { color: var(--error-color); }
</style>
