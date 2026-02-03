<script setup lang="ts">
import { useRequestStore } from '../stores/request';
import { RequestMethod } from '../../shared/types';

const requestStore = useRequestStore();

const methods: RequestMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

async function sendRequest() {
    await requestStore.execute();
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
        <button 
            class="urlBar__sendButton" 
            @click="sendRequest"
            :disabled="!requestStore.url || requestStore.isLoading"
        >
            {{ requestStore.isLoading ? 'Enviando...' : 'Enviar' }}
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
