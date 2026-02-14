import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { J5Request, RequestMethod, RequestTab, RequestState, ResponseState } from '../../shared/types';
import { useFileSystemStore } from './file-system';
import { useEnvironmentStore } from './environment';
import { generateUUID } from '../../shared/utils/uuid';

export const useRequestStore = defineStore('request', () => {
    // Estado de Pestañas
    const tabs = ref<RequestTab[]>([]);
    const activeTabId = ref<string>('');

    // Estado global de carga (podría ser por pestaña si quisiéramos)
    const isLoading = ref<boolean>(false);

    // Inicializar con una pestaña por defecto si no hay
    function initDefaultTab() {
        if (tabs.value.length === 0) {
            const newTab = createNewTab();
            tabs.value.push(newTab);
            activeTabId.value = newTab.id;
        }
    }

    // Helper: Crear nueva pestaña vacía
    function createNewTab(): RequestTab {
        const id = generateUUID();
        const emptyRequest: RequestState = {
            id: generateUUID(), // ID de la petición interna
            name: '',
            method: 'GET',
            url: '',
            headers: {},
            params: {},
            body: '',
            bodyFormData: {},
            bodyType: 'json',
            preRequestScript: '',
            postResponseScript: ''
        };

        return {
            id,
            name: 'Sin Título',
            request: emptyRequest,
            response: null,
            isDirty: false,
            originalState: JSON.stringify(emptyRequest)
        };
    }

    // Asegurar inicialización
    initDefaultTab();

    // Computed: Pestaña Activa
    const activeTab = computed(() => {
        return tabs.value.find(t => t.id === activeTabId.value) || tabs.value[0];
    });

    // --- Proxies para mantener compatibilidad y reactividad con componentes existentes ---
    // Todos estos actúan sobre activeTab.request

    const id = computed({
        get: () => activeTab.value.request.id,
        set: (v) => activeTab.value.request.id = v
    });

    const name = computed({
        get: () => activeTab.value.name,
        set: (v) => activeTab.value.name = v
    });

    const method = computed({
        get: () => activeTab.value.request.method,
        set: (v) => activeTab.value.request.method = v
    });

    const url = computed({
        get: () => activeTab.value.request.url,
        set: (v) => activeTab.value.request.url = v
    });

    const headers = computed({
        get: () => activeTab.value.request.headers,
        set: (v) => activeTab.value.request.headers = v
    });

    const params = computed({
        get: () => activeTab.value.request.params,
        set: (v) => activeTab.value.request.params = v
    });

    const body = computed({
        get: () => activeTab.value.request.body,
        set: (v) => activeTab.value.request.body = v
    });

    const bodyFormData = computed({
        get: () => activeTab.value.request.bodyFormData,
        set: (v) => activeTab.value.request.bodyFormData = v
    });

    const bodyType = computed({
        get: () => activeTab.value.request.bodyType,
        set: (v) => activeTab.value.request.bodyType = v
    });

    const preRequestScript = computed({
        get: () => activeTab.value.request.preRequestScript,
        set: (v) => activeTab.value.request.preRequestScript = v
    });

    const postResponseScript = computed({
        get: () => activeTab.value.request.postResponseScript,
        set: (v) => activeTab.value.request.postResponseScript = v
    });

    // Response Proxy
    const response = computed({
        get: () => activeTab.value.response,
        set: (v) => activeTab.value.response = v
    });

    // Helper: Snapshot actual de la request ACTIVA
    function snapshotRequest(req: RequestState) {
        return JSON.stringify(req);
    }

    // Computed: Detectar cambios sin guardar (Dirty)
    const isDirty = computed(() => {
        // Comprobar si el estado actual de la request difiere del originalState guardado en la pestaña
        const currentSnapshot = snapshotRequest(activeTab.value.request);
        return currentSnapshot !== activeTab.value.originalState;
    });


    // --- Acciones de Pestañas ---

    function addTab() {
        const newTab = createNewTab();
        tabs.value.push(newTab);
        activeTabId.value = newTab.id;
    }

    function closeTab(tabId: string) {
        const index = tabs.value.findIndex(t => t.id === tabId);
        if (index === -1) return;

        // Si cerramos la pestaña activa, cambiar a otra
        if (tabId === activeTabId.value) {
            // Intentar ir a la anterior, o a la siguiente, o crear una nueva si era la única
            if (tabs.value.length > 1) {
                // Si hay más pestañas
                const newIndex = index > 0 ? index - 1 : index + 1; // Preferir la de la izquierda, si no la de la derecha (que ahora será el indice actual tras borrar)
                // Wait, if I delete current, next becomes current index.
                // If I delete last, index-1 is new last.
                // Logic:
                // [A, B, C] -> Close B (idx 1). New active should be A (idx 0) or C (idx 1)?
                // Browsers usually go to the one executed right before, code editors usually go left.
                // Lets go to left (index-1) if exists, else right (index+1 effectively becomes index).

                let nextActiveId = '';
                if (index > 0) {
                    nextActiveId = tabs.value[index - 1].id;
                } else {
                    nextActiveId = tabs.value[index + 1].id;
                }
                activeTabId.value = nextActiveId;
            } else {
                // Era la única, creamos una nueva antes de borrar? O reseteamos?
                // Mejor crear una nueva y borrar esta, para mantener siempre 1.
                const newTab = createNewTab();
                tabs.value.push(newTab);
                activeTabId.value = newTab.id;
            }
        }

        // Eliminar la pestaña
        tabs.value.splice(index, 1);
    }

    function setActiveTab(tabId: string) {
        const tab = tabs.value.find(t => t.id === tabId);
        if (tab) {
            activeTabId.value = tabId;

            // Sync FileSystem selection
            const fsStore = useFileSystemStore();
            fsStore.selectedFilePath = tab.filePath || null;

            if (tab.filePath) {
                // Construct minimal J5Request for fsStore (mainly for 'selectedFile' existence check in UI)
                // We could construct fully but 'saveToFile' handles the full construction for saving.
                const reqState = tab.request;
                const req: J5Request = {
                    id: reqState.id,
                    name: reqState.name,
                    method: reqState.method,
                    url: reqState.url,
                    headers: reqState.headers,
                    params: reqState.params,
                    preRequestScript: reqState.preRequestScript,
                    postResponseScript: reqState.postResponseScript,
                    // Body population omitted for brevity as it's computed logic, 
                    // and 'selectedFile' is mostly used for "is selected" check in MainLayout.
                    // IMPORTANT: If MainLayout uses selectedFile properties for display, this might be incomplete.
                    // RequestEditor used selectedFile, but we moved to RequestPanel using RequestStore.
                    // So MainLayout only uses it for "Save" button enable state.
                };
                fsStore.selectedFile = req;
            } else {
                fsStore.selectedFile = null;
            }
        }
    }


    // --- Acciones Existentes (Refactorizadas para usar activeTab) ---

    // Acción: Cargar desde archivo
    function loadFromFile(request: J5Request, filePath?: string) {
        // En lugar de resetear todo, actualizamos la pestaña activa con los datos del archivo

        const currentTab = activeTab.value;

        // Mapear J5Request a RequestState
        const newRequestState: RequestState = {
            id: request.id,
            name: request.name,
            method: request.method,
            url: request.url,
            headers: { ...request.headers },
            params: { ...request.params },
            preRequestScript: request.preRequestScript || '',
            postResponseScript: request.postResponseScript || '',
            body: '',
            bodyFormData: {},
            bodyType: 'json'
        };

        // Procesar body
        if (request.body?.type === 'json' || request.body?.type === 'raw') {
            newRequestState.bodyType = 'json';
            newRequestState.body = request.body.content
                ? (typeof request.body.content === 'string'
                    ? request.body.content
                    : JSON.stringify(request.body.content, null, 2))
                : '';
        } else if (request.body?.type === 'form-data') {
            newRequestState.bodyType = 'form-data';
            if (typeof request.body.content === 'object' && request.body.content !== null) {
                newRequestState.bodyFormData = { ...request.body.content as Record<string, string | { type: 'file', path: string }> };
            }
        } else if (!request.body) {
            newRequestState.bodyType = 'none';
        } else {
            newRequestState.bodyType = 'text';
            newRequestState.body = typeof request.body?.content === 'string' ? request.body.content : '';
        }

        // Actualizar la pestaña activa
        currentTab.request = newRequestState;
        currentTab.name = request.name;
        if (filePath) currentTab.filePath = filePath;
        currentTab.response = null;

        // Actualizar originalState
        currentTab.originalState = snapshotRequest(newRequestState);
    }

    // Acción: Guardar a archivo
    async function saveToFile() {
        // Usar filePath de la pestaña activa si existe, sino intentar usar FileSystemStore (select or save as)
        // Por compatibilidad con flujo actual, si no tiene filePath, confiamos en FileSystemStore.selectedFilePath
        // Si tiene filePath, usamos ese.

        const fsStore = useFileSystemStore();
        const tab = activeTab.value;
        const targetPath = tab.filePath || fsStore.selectedFilePath;

        if (!targetPath) {
            throw new Error('No hay archivo seleccionado');
        }

        const reqState = tab.request;

        const request: J5Request = {
            id: reqState.id,
            name: tab.name,
            method: reqState.method,
            url: reqState.url,
            headers: reqState.headers,
            params: reqState.params,
            preRequestScript: reqState.preRequestScript,
            postResponseScript: reqState.postResponseScript,
        };

        // Agregar body si existe y no es 'none'
        if (reqState.bodyType !== 'none') {
            if (reqState.bodyType === 'json') {
                if (reqState.body.trim()) {
                    try {
                        request.body = {
                            type: 'json',
                            content: JSON.parse(reqState.body),
                        };
                    } catch {
                        request.body = {
                            type: 'raw',
                            content: reqState.body,
                        };
                    }
                }
            } else if (reqState.bodyType === 'form-data') {
                request.body = {
                    type: 'form-data',
                    content: { ...reqState.bodyFormData }
                };
            } else {
                if (reqState.body.trim()) {
                    request.body = {
                        type: 'raw',
                        content: reqState.body,
                    };
                }
            }
        }

        // Guardar a disco
        // Si usamos targetPath directo, saltamos fsStore.saveRequest que usa selectedFile + selectedFilePath
        // Pero queremos mantener fsStore updated si coincide

        await window.electron.fs.writeFile(targetPath, request);

        // Actualizar estado original después de guardar
        tab.originalState = snapshotRequest(reqState);
    }

    // Acción: Limpiar estado (Resetear pestaña activa a estado inicial vacío)
    function reset() {
        const resetReq = createNewTab().request; // Crear una nueva request vacía para obtener el template
        activeTab.value.request = resetReq;
        activeTab.value.name = 'Sin Título';
        activeTab.value.response = null;
        activeTab.value.originalState = snapshotRequest(resetReq);
    }

    // Acción: Ejecutar petición
    async function execute() {
        isLoading.value = true;
        try {
            const reqState = activeTab.value.request;

            // Construir objeto request básico
            const reqData: Partial<J5Request> = {
                id: reqState.id || 'temp',
                method: reqState.method,
                url: reqState.url,
                headers: reqState.headers,
                params: reqState.params,
                preRequestScript: reqState.preRequestScript,
                postResponseScript: reqState.postResponseScript,
            };

            if (reqState.bodyType !== 'none') {
                if (reqState.bodyType === 'json' && reqState.body.trim()) {
                    try {
                        reqData.body = {
                            type: 'json',
                            content: JSON.parse(reqState.body),
                        };
                    } catch {
                        reqData.body = {
                            type: 'raw',
                            content: reqState.body,
                        };
                    }
                } else if (reqState.bodyType === 'form-data') {
                    reqData.body = {
                        type: 'form-data',
                        content: { ...reqState.bodyFormData }
                    };
                } else if (reqState.body.trim()) {
                    reqData.body = {
                        type: 'raw',
                        content: reqState.body,
                    };
                }
            }

            const envStore = useEnvironmentStore();
            const currentEnv = envStore.currentVariables;

            // Deep clone to remove Proxy wrappers before sending to Electron
            const plainRequest = JSON.parse(JSON.stringify(reqData));

            const result = await window.electron.request.execute(plainRequest, currentEnv);

            if (result.success && result.response) {
                if (result.environment) {
                    envStore.updateVariablesFromExecution(result.environment);
                }

                const res = result.response;
                activeTab.value.response = {
                    status: res.status,
                    statusText: res.statusText,
                    headers: res.headers,
                    time: res.time,
                    size: typeof res.data === 'string' ? res.data.length : JSON.stringify(res.data).length,
                    body: typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2),
                };
            } else {
                activeTab.value.response = {
                    status: 0,
                    statusText: result.error || 'Error desconocido',
                    headers: {},
                    time: result.executionTime,
                    size: 0,
                    body: result.error || '',
                };
            }

        } catch (error: any) {
            console.error('Error executing request:', error);
            activeTab.value.response = {
                status: 0,
                statusText: 'Error Crítico',
                headers: {},
                time: 0,
                size: 0,
                body: error.message,
            };
        } finally {
            isLoading.value = false;
        }
    }

    return {
        // Estado
        tabs,
        activeTabId,
        activeTab,

        // Proxies (Estado Request Activa)
        id,
        name,
        method,
        url,
        headers,
        params,
        body,
        bodyFormData,
        bodyType,
        preRequestScript,
        postResponseScript,
        response,

        isLoading,

        // Computed
        isDirty,

        // Acciones
        addTab,
        closeTab,
        setActiveTab,
        loadFromFile,
        saveToFile,
        reset,
        execute,
    };
});
