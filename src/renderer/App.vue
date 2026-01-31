<script setup lang="ts">
import { useSystemStore } from './stores/system'
import { onMounted } from 'vue'

const systemStore = useSystemStore()

onMounted(() => {
  console.log('App mounted')
})
</script>

<template>
  <div class="container">
    <h1>J5-Request</h1>
    <div class="status-panel">
      <div class="status-item">
        <span>Main Process:</span>
        <span class="status-value">{{ systemStore.mainStatus }}</span>
      </div>
      <div class="status-item">
        <span>Worker Process:</span>
        <span class="status-value">{{ systemStore.workerStatus }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  padding: 2rem;
}

.status-panel {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: inline-block;
  background-color: #f9f9f9;
  color: #333;
}

.status-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 0.5rem 0;
}

.status-value {
  font-weight: bold;
  color: #42b883;
}

@media (prefers-color-scheme: dark) {
  .status-panel {
    background-color: #2f2f2f;
    border-color: #444;
    color: #eee;
  }
}
</style>
