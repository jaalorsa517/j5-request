import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { J5Request, RequestMethod } from '../../shared/types';
import { useFileSystemStore } from './file-system';

export const useRequestStore = defineStore('request', () => {
    // Estado de la petición actual
    const id = ref<string>('');
    const name = ref<string>('');
    const method = ref<RequestMethod>('GET');
    const url = ref<string>('');
    const headers = ref<Record<string, string>>({});
    const params = ref<Record<string, string>>({});
    const body = ref<string>('');

    // Estado de la respuesta
    const response = ref<{
        status: number;
        statusText: string;
        time: number;
        size: number;
        body: string;
    } | null>(null);

    // Estado original (para detectar cambios)
    const originalState = ref<string>('');

    // Computed: Detectar cambios sin guardar
    const isDirty = computed(() => {
        const currentState = JSON.stringify({
            id: id.value,
            name: name.value,
            method: method.value,
            url: url.value,
            headers: headers.value,
            params: params.value,
            body: body.value,
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
        body.value = request.body?.content
            ? (typeof request.body.content === 'string'
                ? request.body.content
                : JSON.stringify(request.body.content, null, 2))
            : '';

        // Guardar estado original
        originalState.value = JSON.stringify({
            id: id.value,
            name: name.value,
            method: method.value,
            url: url.value,
            headers: headers.value,
            params: params.value,
            body: body.value,
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
        };

        // Agregar body si existe
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
        response.value = null;
        originalState.value = '';
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
        response,

        // Computed
        isDirty,

        // Acciones
        loadFromFile,
        saveToFile,
        reset,
    };
});
