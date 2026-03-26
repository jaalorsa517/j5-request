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
            <header class="envModal__header">
                <h3>Gestor de Entornos</h3>
                <button class="envModal__close" @click="store.showManager = false">×</button>
            </header>
            
            <div class="envModal__body">
                <!-- Sidebar -->
                <nav class="envModal__sidebar">
                    <div 
                        class="envModal__scopeItem" 
                        :class="{ 'envModal__scopeItem--active': selectedScope === 'globals' }"
                        @click="setScope('globals')"
                    >
                        🌎 Globales
                    </div>
                     <div 
                        class="envModal__scopeItem" 
                        :class="{ 'envModal__scopeItem--active': selectedScope === 'environment' }"
                        @click="setScope('environment')"
                    >
                        🌲 Entorno Activo
                        <span v-if="store.activeEnvironment" class="envModal__badge">{{ store.activeEnvironment.name }}</span>
                        <span v-else class="envModal__badge envModal__badge--warning">Ninguno</span>
                    </div>
                </nav>

                    <!-- Content -->
                <main class="envModal__content">
                    <div v-if="selectedScope === 'environment' && !store.activeEnvironment" class="envModal__empty">
                         <p>No hay un entorno activo seleccionado.</p>
                        <button class="primary" @click="store.createNewEnvironment('Nuevo Entorno')">Crear Nuevo</button>
                    </div>

                    <div v-else class="envModal__editor">
                         <div class="envModal__info" v-if="selectedScope === 'environment' && store.activeEnvironment">
                            <label class="envModal__label">Nombre: <input v-model="store.activeEnvironment.name" class="envModal__input" /></label>
                            <span v-if="store.activeEnvironmentPath" class="envModal__path">{{ store.activeEnvironmentPath }}</span>
                            <span v-else class="envModal__unsaved-badge">Sin Guardar</span>
                        </div>
                        <div class="envModal__info" v-if="selectedScope === 'globals'">
                             <label class="envModal__label">Variables Globales (Compartidas en todos los proyectos)</label>
                        </div>
                        
                        <div class="envModal__table" v-if="targetEnv">
                            <div class="envModal__tableHeader">
                                <div class="envModal__col envModal__col--enabled"></div>
                                <div class="envModal__col envModal__col--key">Clave</div>
                                <div class="envModal__col envModal__col--value">Valor</div>
                                <div class="envModal__col envModal__col--type">Tipo</div>
                                <div class="envModal__col envModal__col--actions"></div>
                            </div>
                            
                            <div class="envModal__tableBody">
                                <div v-for="(v, index) in targetEnv.variables" :key="index" class="envModal__row">
                                    <div class="envModal__col envModal__col--enabled">
                                        <input type="checkbox" v-model="v.enabled" />
                                    </div>
                                    <div class="envModal__col envModal__col--key">
                                        <input v-model="v.key" class="envModal__cellInput" />
                                    </div>
                                    <div class="envModal__col envModal__col--value">
                                        <input v-model="v.value" :type="v.type === 'secret' ? 'password' : 'text'" class="envModal__cellInput" />
                                    </div>
                                    <div class="envModal__col envModal__col--type">
                                        <select :value="v.type" @change="onTypeChange(v, ($event.target as HTMLSelectElement).value)" class="envModal__cellSelect">
                                            <option value="default">Estándar</option>
                                            <option value="secret">Secreto 🔒</option>
                                        </select>
                                    </div>
                                    <div class="envModal__col envModal__col--actions">
                                        <button class="envModal__rowBtn" @click="removeVariable(index)">×</button>
                                    </div>
                                </div>
                                
                                <!-- Add new -->
                                <div class="envModal__row envModal__row--new">
                                    <div class="envModal__col envModal__col--enabled"></div>
                                    <div class="envModal__col envModal__col--key">
                                        <input v-model="newVarKey" placeholder="Nueva clave..." @keyup.enter="addVariable" class="envModal__cellInput" />
                                    </div>
                                    <div class="envModal__col envModal__col--value">
                                        <input v-model="newVarValue" :type="newVarSecret ? 'password' : 'text'" placeholder="Valor..." @keyup.enter="addVariable" class="envModal__cellInput" />
                                    </div>
                                    <div class="envModal__col envModal__col--type">
                                        <select v-model="newVarSecret" class="envModal__cellSelect">
                                            <option :value="false">Estándar</option>
                                            <option :value="true">Secreto</option>
                                        </select>
                                    </div>
                                    <div class="envModal__col envModal__col--actions">
                                        <button class="envModal__rowBtn" @click="addVariable" :disabled="!newVarKey">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <footer class="envModal__footer" v-if="targetEnv">
                 <button v-if="selectedScope === 'environment'" @click="store.closeEnvironment()">Cerrar Entorno</button>
                <div class="envModal__spacer"></div>
                <button class="primary" @click="save">Guardar Cambios</button>
            </footer>
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
    background: var(--bg-overlay);
    backdrop-filter: blur(8px);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
}

.envModal {
    background: var(--bg-modal);
    width: 900px;
    height: 700px;
    max-width: 95vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-standard);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
    overflow: hidden;
}

.envModal__header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--bg-secondary);
}

.envModal__header h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
}

.envModal__close {
    background: none;
    border: none;
    color: var(--text-tertiary);
    font-size: 24px;
    cursor: pointer;
    transition: color var(--transition-fast);
}

.envModal__close:hover {
    color: var(--text-primary);
}

/* Body Layout */
.envModal__body {
    flex: 1;
    display: flex;
    overflow: hidden;
}

.envModal__sidebar {
    width: 240px;
    background-color: var(--bg-secondary);
    border-right: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    padding: 12px 0;
}

.envModal__scopeItem {
    padding: 12px 24px;
    cursor: pointer;
    color: var(--text-tertiary);
    font-size: 14px;
    font-weight: 500;
    transition: all var(--transition-fast);
    border-left: 3px solid transparent;
}

.envModal__scopeItem:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
}

.envModal__scopeItem--active {
    background-color: var(--accent-blue-soft);
    border-left-color: var(--accent-blue);
    color: var(--accent-blue);
}

.envModal__badge {
    display: block;
    font-size: 11px;
    opacity: 0.7;
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.envModal__badge--warning { color: var(--warning); }

.envModal__content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-primary);
}

/* Footer */
.envModal__footer {
    padding: 16px 24px;
    border-top: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: var(--bg-secondary);
}

.envModal__spacer {
    flex: 1;
}

.envModal__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-tertiary);
    gap: 20px;
}

.envModal__info {
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.envModal__label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
}

.envModal__input {
    width: 100%;
}

.envModal__path {
    color: var(--text-tertiary);
    font-size: 12px;
    font-family: monospace;
}

.envModal__unsaved-badge {
    background: var(--warning);
    color: #ffffff;
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 10px;
    width: fit-content;
}

/* Table */
.envModal__table {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    overflow: hidden;
}

.envModal__tableHeader {
    display: grid;
    grid-template-columns: 48px 1fr 1fr 120px 48px;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-subtle);
}

.envModal__tableHeader .envModal__col {
    padding: 12px;
    font-weight: 600;
    font-size: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.envModal__row {
    display: grid;
    grid-template-columns: 48px 1fr 1fr 120px 48px;
    border-bottom: 1px solid var(--border-subtle);
    transition: background-color var(--transition-fast);
}

.envModal__row:last-child {
    border-bottom: none;
}

.envModal__row:hover:not(.envModal__row--new) {
    background-color: var(--bg-secondary);
}

.envModal__row--new {
    background-color: var(--bg-tertiary);
}

.envModal__col {
    padding: 8px;
    display: flex;
    align-items: center;
}

.envModal__col--enabled { justify-content: center; }
.envModal__col--actions { justify-content: center; }

.envModal__cellInput, .envModal__cellSelect {
    width: 100%;
    background: transparent !important;
    border: none !important;
    color: var(--text-primary);
    padding: 4px 8px;
    font-size: 13px;
}

.envModal__cellInput:focus, .envModal__cellSelect:focus {
    outline: none;
    background-color: var(--bg-tertiary) !important;
    border-radius: var(--radius-sm);
}

.envModal__rowBtn {
    background: none;
    border: none;
    color: var(--text-tertiary);
    font-size: 18px;
    padding: 0;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
}

.envModal__rowBtn:hover:not(:disabled) {
    background-color: var(--error);
    color: #ffffff;
    transform: none;
}

.envModal__rowBtn:disabled {
    opacity: 0.3;
}
</style>

