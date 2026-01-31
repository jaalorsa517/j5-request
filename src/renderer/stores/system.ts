import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSystemStore = defineStore('system', () => {
    const workerStatus = ref('Unknown')
    const mainStatus = ref('Connected')

    function setWorkerStatus(status: string) {
        workerStatus.value = status
    }

    return { workerStatus, mainStatus, setWorkerStatus }
})
