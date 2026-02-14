import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/renderer/style.css'
import App from '@/renderer/App.vue'

const app = createApp(App)

app.use(createPinia())

app.mount('#app').$nextTick(() => {
  // Use contextBridge
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
})
