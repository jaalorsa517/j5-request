import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { J5Environment } from '@/shared/types';

export const useEnvironmentStore = defineStore('environment', () => {

    const activeEnvironment = ref<J5Environment | null>(null);
    const activeEnvironmentPath = ref<string | null>(null);
    const showManager = ref(false);

    // Initial empty environment
    const globals = ref<J5Environment>({
        id: 'globals',
        name: 'Globals',
        variables: []
    });

    const currentVariables = computed(() => {
        const vars: Record<string, string> = {};

        // 1. Add Globals
        globals.value.variables.forEach(v => {
            if (v.enabled) vars[v.key] = v.value;
        });

        // 2. Add Active Environment (overrides globals)
        if (activeEnvironment.value) {
            activeEnvironment.value.variables.forEach(v => {
                if (v.enabled) vars[v.key] = v.value;
            });
        }

        return vars;
    });

    async function loadEnvironmentFromFile(path: string) {
        try {
            // Obtener projectPath del file-system store para soporte de encriptación
            const { useFileSystemStore } = await import('@/renderer/stores/file-system');
            const fsStore = useFileSystemStore();
            const projectPath = fsStore.currentPath ?? undefined;

            const content = await window.electron.environment.load(path, projectPath);

            // Deep clone to ensure mutability and avoid IPC readonly issues
            const clonedContent = JSON.parse(JSON.stringify(content));

            // Validate basic structure
            if (clonedContent && typeof clonedContent === 'object') {
                const env = clonedContent as unknown as J5Environment;
                if (!Array.isArray(env.variables)) {
                    env.variables = [];
                }
                activeEnvironment.value = env;
                activeEnvironmentPath.value = path;
            } else {
                throw new Error('Invalid environment file format');
            }
        } catch (error: any) {
            console.error('Failed to load environment', error);
            // Detectar errores de desencriptación y mostrar mensaje claro
            if (error?.message?.includes('desencriptación') || error?.message?.includes('llave')) {
                window.alert(`Error de encriptación: ${error.message}`);
            }
            throw error;
        }
    }

    async function saveActiveEnvironment() {
        if (!activeEnvironment.value) return;

        if (!activeEnvironmentPath.value) {
            // New environment: Prompt for save location
            const defaultName = (activeEnvironment.value.name || 'environment').toLowerCase().replace(/\s+/g, '_') + '.json';
            const path = await window.electron.fs.saveFileDialog(defaultName);
            if (!path) return; // User cancelled

            activeEnvironmentPath.value = path;
        }

        // Obtener projectPath del file-system store para soporte de encriptación
        const { useFileSystemStore } = await import('@/renderer/stores/file-system');
        const fsStore = useFileSystemStore();
        const projectPath = fsStore.currentPath ?? undefined;

        // Save usando el canal dedicado de environment (con encriptación automática)
        // Clone to plain object to remove Vue Proxies which cause "An object could not be cloned" IPC error
        const plainEnv = JSON.parse(JSON.stringify(activeEnvironment.value));
        await window.electron.environment.save(activeEnvironmentPath.value, plainEnv, projectPath);

        // Reload from disk to ensure fresh state and reactivity
        await loadEnvironmentFromFile(activeEnvironmentPath.value);
    }

    function createNewEnvironment(name: string) {
        activeEnvironment.value = {
            id: crypto.randomUUID(),
            name,
            variables: []
        };
        activeEnvironmentPath.value = null; // Needs saving
    }

    function closeEnvironment() {
        activeEnvironment.value = null;
        activeEnvironmentPath.value = null;
    }

    async function loadGlobals() {
        try {
            const globalsPath = await window.electron.fs.getGlobalsPath();

            try {
                const content = await window.electron.fs.readFile(globalsPath);
                // Deep clone
                const clonedContent = JSON.parse(JSON.stringify(content));

                if (clonedContent && typeof clonedContent === 'object') {
                    const env = clonedContent as unknown as J5Environment;
                    if (!Array.isArray(env.variables)) env.variables = [];
                    globals.value = env;
                }
            } catch (e) {
                // File likely doesn't exist, which is fine for first run
            }
        } catch (e) {
            console.error('Failed to load globals', e);
        }
    }

    async function saveGlobals() {
        console.log('Saving globals...');
        try {
            const globalsPath = await window.electron.fs.getGlobalsPath();
            console.log('Globals path:', globalsPath);

            // Clone
            const plainEnv = JSON.parse(JSON.stringify(globals.value));
            console.log('Writing globals content:', plainEnv);
            await window.electron.fs.writeFile(globalsPath, plainEnv);
            console.log('Globals saved successfully');
        } catch (e) {
            console.error('Failed to save globals', e);
            window.alert('Error saving globals: ' + (e as any).message);
        }
    }

    // Load globals immediately
    loadGlobals();

    function updateVariablesFromExecution(newValues: Record<string, string>) {
        // We need to compare newValues with current state to find updates
        // Hierarchy: Active Environment > Globals

        const targetEnv = activeEnvironment.value || globals.value;
        const fallbackEnv = activeEnvironment.value ? globals.value : null;

        for (const [key, value] of Object.entries(newValues)) {
            let found = false;

            // 1. Try to update in target (Active)
            if (targetEnv) {
                const v = targetEnv.variables.find(v => v.key === key);
                if (v) {
                    if (v.value !== value) {
                        v.value = value;
                    }
                    found = true;
                }
            }

            // 2. Try to update in fallback (Globals) if active exists
            if (!found && fallbackEnv) {
                const v = fallbackEnv.variables.find(v => v.key === key);
                if (v) {
                    if (v.value !== value) {
                        v.value = value;
                    }
                    found = true;
                }
            }

            // 3. If new, add to target (Active)
            if (!found && targetEnv) {
                targetEnv.variables.push({
                    key,
                    value,
                    type: 'default',
                    enabled: true
                });
            }
        }
    }

    return {
        activeEnvironment,
        activeEnvironmentPath,
        showManager,
        globals,
        currentVariables,
        loadEnvironmentFromFile,
        saveActiveEnvironment,
        createNewEnvironment,
        closeEnvironment,
        saveGlobals,
        updateVariablesFromExecution
    };
});
