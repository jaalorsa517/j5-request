import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { J5Request, RequestMethod } from '../../shared/types';
import { useFileSystemStore } from './file-system';
import { useEnvironmentStore } from './environment';

export const useRequestStore = defineStore('request', () => {
    // Estado de la petición actual
    const id = ref<string>('');
    const name = ref<string>('');
    const method = ref<RequestMethod>('GET');
    const url = ref<string>('');
    const headers = ref<Record<string, string>>({});
    const params = ref<Record<string, string>>({});
    const body = ref<string>('');
    const bodyFormData = ref<Record<string, string | { type: 'file', path: string }>>({});
    const bodyType = ref<'json' | 'text' | 'xml' | 'form-data' | 'none'>('json');
    const preRequestScript = ref<string>('');
    const postResponseScript = ref<string>('');
    const isLoading = ref<boolean>(false);

    // Estado de la respuesta
    const response = ref<{
        status: number;
        statusText: string;
        headers: Record<string, string | string[]>;
        time: number;
        size: number;
        body: string;
    } | null>(null);

    // Estado original (para detectar cambios)
    const originalState = ref<string>('');

    // Computed: Detectar cambios sin guardar
    const isDirty = computed(() => {
        // Check changes including bodyType
        const currentState = JSON.stringify({
            id: id.value,
            name: name.value,
            method: method.value,
            url: url.value,
            headers: headers.value,
            params: params.value,
            body: body.value,
            bodyFormData: bodyFormData.value,
            bodyType: bodyType.value,
            preRequestScript: preRequestScript.value,
            postResponseScript: postResponseScript.value,
        });
        return currentState !== originalState.value;
    });

    // Acción: Cargar desde archivo
    function loadFromFile(request: J5Request) {
        id.value = request.id;
        name.value = request.name;
        method.value = request.method;
        url.value = request.url;
        headers.value = { ...request.headers };
        params.value = { ...request.params };
        preRequestScript.value = request.preRequestScript || '';
        postResponseScript.value = request.postResponseScript || '';
        body.value = request.body?.content
            ? (typeof request.body.content === 'string'
                ? request.body.content
                : JSON.stringify(request.body.content, null, 2))
            : '';

        // Map J5RequestBody types to internal types
        if (request.body?.type === 'json' || request.body?.type === 'raw') {
            bodyType.value = 'json'; // Default to json for raw for now, or check content
        } else if (request.body?.type === 'form-data') {
            bodyType.value = 'form-data';
            if (typeof request.body.content === 'object' && request.body.content !== null) {
                // Assuming content matches internal structure, if not it might need migration/validation
                bodyFormData.value = { ...request.body.content as Record<string, string | { type: 'file', path: string }> };
            }
        } else if (!request.body) {
            bodyType.value = 'none';
        } else {
            // Fallback
            bodyType.value = 'text';
        }

        // Guardar estado original
        originalState.value = JSON.stringify({
            id: id.value,
            name: name.value,
            method: method.value,
            url: url.value,
            headers: headers.value,
            params: params.value,
            body: body.value,
            bodyType: bodyType.value,
            preRequestScript: preRequestScript.value,
            postResponseScript: postResponseScript.value,
        });

        // Limpiar respuesta anterior
        response.value = null;
    }

    // Acción: Guardar a archivo
    async function saveToFile() {
        const fsStore = useFileSystemStore();

        if (!fsStore.selectedFilePath) {
            throw new Error('No hay archivo seleccionado');
        }

        const request: J5Request = {
            id: id.value,
            name: name.value,
            method: method.value,
            url: url.value,
            headers: headers.value,
            params: params.value,
            preRequestScript: preRequestScript.value,
            postResponseScript: postResponseScript.value,
        };

        // Agregar body si existe y no es 'none'
        if (bodyType.value !== 'none') {
            if (bodyType.value === 'json') {
                if (body.value.trim()) {
                    try {
                        request.body = {
                            type: 'json',
                            content: JSON.parse(body.value),
                        };
                    } catch {
                        request.body = {
                            type: 'raw',
                            content: body.value,
                        };
                    }
                }
            } else if (bodyType.value === 'form-data') {
                request.body = {
                    type: 'form-data',
                    content: { ...bodyFormData.value }
                };
            } else {
                if (body.value.trim()) {
                    request.body = {
                        type: 'raw', // J5Request types are limited, map text/xml to raw for now
                        content: body.value,
                    };
                }
            }
        }

        // Actualizar selectedFile en FileSystemStore
        fsStore.selectedFile = request;

        // Guardar a disco
        await fsStore.saveRequest();

        // Actualizar estado original después de guardar
        originalState.value = JSON.stringify({
            id: id.value,
            name: name.value,
            method: method.value,
            url: url.value,
            headers: headers.value,
            params: params.value,
            body: body.value,
            bodyType: bodyType.value,
            preRequestScript: preRequestScript.value,
            postResponseScript: postResponseScript.value,
        });
    }

    // Acción: Limpiar estado
    function reset() {
        id.value = '';
        name.value = '';
        method.value = 'GET';
        url.value = '';
        headers.value = {};
        params.value = {};
        body.value = '';
        bodyFormData.value = {};
        bodyType.value = 'json';
        preRequestScript.value = '';
        postResponseScript.value = '';
        originalState.value = '';
    }

    // Acción: Ejecutar petición
    async function execute() {
        isLoading.value = true;
        try {
            // Construir objeto request básico
            const reqData: Partial<J5Request> = {
                id: id.value || 'temp',
                method: method.value,
                url: url.value,
                headers: headers.value,
                params: params.value,
                preRequestScript: preRequestScript.value,
                postResponseScript: postResponseScript.value,
            };

            if (bodyType.value !== 'none') {
                if (bodyType.value === 'json' && body.value.trim()) {
                    try {
                        reqData.body = {
                            type: 'json',
                            content: JSON.parse(body.value),
                        };
                    } catch {
                        reqData.body = {
                            type: 'raw',
                            content: body.value,
                        };
                    }
                } else if (bodyType.value === 'form-data') {
                    reqData.body = {
                        type: 'form-data',
                        content: { ...bodyFormData.value }
                    };
                } else if (body.value.trim()) {
                    reqData.body = {
                        type: 'raw',
                        content: body.value,
                    };
                }
            }

            const envStore = useEnvironmentStore();
            const currentEnv = envStore.currentVariables; // Already flattened global + active

            // Deep clone to remove Proxy wrappers before sending to Electron
            const plainRequest = JSON.parse(JSON.stringify(reqData));

            const result = await window.electron.request.execute(plainRequest, currentEnv);

            if (result.success && result.response) {
                // Update environment variables from script execution
                if (result.environment) {
                    envStore.updateVariablesFromExecution(result.environment);
                }

                const res = result.response;
                response.value = {
                    status: res.status,
                    statusText: res.statusText,
                    headers: res.headers,
                    time: res.time,
                    // Si es objeto, serializar, si es string dejarlo
                    size: typeof res.data === 'string' ? res.data.length : JSON.stringify(res.data).length,
                    body: typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2),
                };
            } else {
                // Manejo de errores de ejecución (DNS, Network Error, etc)
                response.value = {
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
            response.value = {
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
        loadFromFile,
        saveToFile,
        reset,
        execute,
    };
});
