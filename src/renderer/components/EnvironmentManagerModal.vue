<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useEnvironmentStore } from '@/renderer/stores/environment';
import { J5EnvironmentVariable } from '@/shared/types';

const store = useEnvironmentStore();
const componentKey = ref(0);

const selectedScope = ref<'globals' | 'environment'>('environment');

// If no active environment, default to globals
watch(() => store.activeEnvironment, (val) => {
    if (!val) selectedScope.value = 'globals';
    else selectedScope.value = 'environment';
}, { immediate: true });

const targetEnv = computed(() => {
    return selectedScope.value === 'globals' ? store.globals : store.activeEnvironment;
});

const newVarKey = ref('');
const newVarValue = ref('');
const newVarSecret = ref(false);

function addVariable() {
    if (!newVarKey.value || !targetEnv.value) return;

    try {
        console.log('Adding variable:', newVarKey.value, 'to', selectedScope.value);
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

async function save() {
    // Auto-add pending variable if user forgot to click +
    if (newVarKey.value) {
        addVariable();
    }

    try {
        if (selectedScope.value === 'globals') {
            console.log('Saving globals, count:', store.globals.variables.length);
            await store.saveGlobals();
        } else {
            if (!store.activeEnvironment) return; 
            await store.saveActiveEnvironment();
            // Force re-render of the editor part to ensure fresh bindings
            componentKey.value++;
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
                        @click="selectedScope = 'globals'"
                    >
                        Globals
                    </div>
                     <div 
                        class="scope-item" 
                        :class="{ active: selectedScope === 'environment' }"
                        @click="selectedScope = 'environment'"
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

                    <div v-else class="env-editor" :key="componentKey">
                         <div class="env-info" v-if="selectedScope === 'environment'">
                            <label>Name: <input v-model="store.activeEnvironment!.name" /></label>
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
                                     <select v-model="v.type">
                                         <option value="default">Default</option>
                                         <option value="secret">Secret</option>
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
    background: #252526;
    width: 800px;
    height: 600px;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    border: 1px solid #444;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

.envModal__header {
    padding: 16px;
    border-bottom: 1px solid #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.envModal__header h3 {
    margin: 0;
    color: #fff;
}

.close-btn {
    background: none;
    border: none;
    color: #ccc;
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
    background: #1e1e1e;
    border-right: 1px solid #333;
    display: flex;
    flex-direction: column;
}

.scope-item {
    padding: 12px 16px;
    cursor: pointer;
    color: #ccc;
    font-size: 13px;
    border-left: 2px solid transparent;
}

.scope-item:hover {
    background: #2a2a2a;
}

.scope-item.active {
    background: #252526;
    border-left-color: #0e639c;
    color: white;
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
.env-badge.warning { color: #d97706; }

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
    border-top: 1px solid #333;
    display: flex;
    gap: 12px;
}

.spacer {
    flex: 1;
}

button {
    padding: 8px 16px;
    background: #0e639c;
    border: none;
    color: white;
    border-radius: 4px;
    cursor: pointer;
}
button:hover { background: #1177bb; }

.no-env {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #888;
    gap: 16px;
}

.env-info {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.env-info label {
    color: #ccc;
    display: flex;
    gap: 8px;
    align-items: center;
}
.env-info input {
    background: #333;
    border: 1px solid #444;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
}

.path {
    color: #888;
    font-size: 12px;
    font-family: monospace;
}

.unsaved-badge {
    background: #d97706;
    color: white;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 10px;
}

/* Table */
.vars-table {
    display: flex;
    flex-direction: column;
    border: 1px solid #333;
}

.vars-header, .vars-row {
    display: grid;
    grid-template-columns: 40px 1fr 1fr 100px 40px;
    gap: 1px;
    background: #333; /* Gap color */
}

.vars-header > div, .vars-row > div {
    background: #1e1e1e;
    padding: 8px;
    display: flex;
    align-items: center;
}

.vars-header > div {
    font-weight: bold;
    color: #ccc;
    font-size: 12px;
}

.col-enabled, .col-actions { justify-content: center; }

input[type="text"], input[type="password"], select {
    width: 100%;
    background: transparent;
    border: none;
    color: white;
    font-family: inherit;
}
input:focus, select:focus { outline: 1px solid #0e639c; }

.new-row input {
    font-style: italic;
}

.vars-row .col-actions button {
    background: none;
    color: #888;
    padding: 0;
    font-size: 18px;
}
.vars-row .col-actions button:hover { color: #d32f2f; }
</style>
