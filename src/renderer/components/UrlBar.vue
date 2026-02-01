<script setup lang="ts">
import { useRequestStore } from '../stores/request';
import { RequestMethod } from '../../shared/types';

const requestStore = useRequestStore();

const methods: RequestMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

async function sendRequest() {
    // Mock de respuesta HTTP
    const startTime = Date.now();
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
    
    const endTime = Date.now();
    
    // Generar respuesta mock
    const mockResponse = {
        userId: 1,
        id: Math.floor(Math.random() * 100),
        title: 'Mock Response',
        body: 'Esta es una respuesta simulada para probar la UI. En la Fase 4 se implementará el ejecutor real.',
        timestamp: new Date().toISOString(),
        requestedUrl: requestStore.url,
        method: requestStore.method,
    };
    
    requestStore.response = {
        status: 200,
        statusText: 'OK',
        time: endTime - startTime,
        size: JSON.stringify(mockResponse).length,
        body: JSON.stringify(mockResponse, null, 2),
    };
}
</script>

<template>
    <div class="urlBar">
        <select v-model="requestStore.method" class="urlBar__methodSelector">
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
        <button class="urlBar__sendButton" @click="sendRequest">
            Enviar
        </button>
    </div>
</template>

<style scoped>
.urlBar {
    display: flex;
    gap: 8px;
    padding: 12px;
    background-color: #1e1e1e;
    border-bottom: 1px solid #333;
    width: 100%;
    box-sizing: border-box;
}

.urlBar__methodSelector {
    padding: 8px 12px;
    background-color: #2d2d2d;
    color: #fff;
    border: 1px solid #444;
    border-radius: 4px;
    cursor: pointer;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.urlBar__input {
    flex: 1;
    padding: 8px 12px;
    background-color: #2d2d2d;
    color: #fff;
    border: 1px solid #444;
    border-radius: 4px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.urlBar__input::placeholder {
    color: #888;
}

.urlBar__sendButton {
    padding: 8px 24px;
    background-color: #0e639c;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.urlBar__sendButton:hover:not(:disabled) {
    background-color: #1177bb;
}

.urlBar__sendButton:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
