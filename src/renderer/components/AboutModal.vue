<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import logo from '@/renderer/assets/logo.png';

defineProps<{
    isOpen: boolean;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
}>();

interface AppInfo {
    name: string;
    version: string;
    author: string;
    description: string;
}

const appInfo = ref<AppInfo | null>(null);
const updateStatus = ref<'idle' | 'checking' | 'available' | 'uptodate' | 'downloading' | 'ready' | 'error'>('idle');
const downloadPercent = ref(0);
const errorMessage = ref('');
let cleanupUpdater: (() => void) | null = null;

onMounted(async () => {
    if ((window as any).electron?.app?.getInfo) {
        appInfo.value = await (window as any).electron.app.getInfo();
    }

    if ((window as any).electron?.app?.onUpdaterStatus) {
        cleanupUpdater = (window as any).electron.app.onUpdaterStatus((status: any, data: any) => {
            updateStatus.value = status;
            if (status === 'downloading') downloadPercent.value = Math.round(data || 0);
            if (status === 'error') errorMessage.value = data || 'Error desconocido';
        });
    }
});

onUnmounted(() => {
    if (cleanupUpdater) cleanupUpdater();
});

const openDonation = () => {
    if ((window as any).electron?.app?.openExternal) {
        (window as any).electron.app.openExternal('https://paypal.me/jaalorsa');
    }
};

const checkUpdates = () => {
    if ((window as any).electron?.app?.checkForUpdates) {
        (window as any).electron.app.checkForUpdates();
    }
};

const openReportIssue = () => {
    if ((window as any).electron?.app?.openExternal) {
        const version = appInfo.value?.version || 'unknown';
        const title = encodeURIComponent(`[Bug] Reportado desde v${version}`);
        const body = encodeURIComponent(`\n\n---\n**App Version:** ${version}\n**OS:** ${navigator.platform}`);
        const url = `https://github.com/jaalorsa517/j5-request/issues/new?title=${title}&body=${body}`;
        (window as any).electron.app.openExternal(url);
    }
};

const getStatusText = () => {
    switch (updateStatus.value) {
        case 'checking': return 'Buscando actualizaciones...';
        case 'available': return 'Nueva versión encontrada. Descargando...';
        case 'uptodate': return 'La aplicación está actualizada.';
        case 'downloading': return `Descargando: ${downloadPercent.value}%`;
        case 'ready': return 'Actualización lista. Reinicia para aplicar.';
        case 'error': return 'Error al buscar actualizaciones.';
        default: return '';
    }
};
</script>

<template>
    <div v-if="isOpen" class="aboutModal" @click.self="emit('close')">
        <div class="aboutModal__content glass">
            <div class="aboutModal__header">
                <div class="aboutModal__titleGroup">
                    <img :src="logo" alt="Logo" class="aboutModal__logo">
                    <h3 class="aboutModal__title">{{ appInfo?.name || 'J5-Request' }}</h3>
                </div>
                <button class="aboutModal__close" @click="emit('close')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="aboutModal__body">
                <div class="aboutModal__info">
                    <div class="aboutModal__field">
                        <span class="aboutModal__label">Versión</span>
                        <span class="aboutModal__value">{{ appInfo?.version || '1.0.0' }}</span>
                    </div>
                    <div class="aboutModal__field">
                        <span class="aboutModal__label">Autor</span>
                        <span class="aboutModal__value">{{ appInfo?.author || 'jaalorsa' }}</span>
                    </div>
                    <p class="aboutModal__description">
                        {{ appInfo?.description || 'Cliente HTTP API as Code minimalista y colaborativo.' }}
                    </p>
                </div>

                <div class="aboutModal__updater">
                    <div class="aboutModal__updaterHeader">
                        <span class="aboutModal__label">Actualizaciones</span>
                        <button 
                            class="aboutModal__updateBtn" 
                            @click="checkUpdates" 
                            :disabled="updateStatus === 'checking' || updateStatus === 'downloading'"
                        >
                            {{ updateStatus === 'idle' || updateStatus === 'uptodate' || updateStatus === 'error' ? 'Buscar ahora' : 'Buscando...' }}
                        </button>
                    </div>
                    <p v-if="updateStatus !== 'idle'" class="aboutModal__status" :class="`aboutModal__status--${updateStatus}`">
                        {{ getStatusText() }}
                    </p>
                </div>
                
                <div class="aboutModal__funding">
                    <h4 class="aboutModal__subtitle">Soporte y Apoyo</h4>
                    <p class="aboutModal__fundingText">
                        Si encuentras un error o tienes una sugerencia, repórtalo en GitHub. Si te gusta el proyecto, considera apoyarlo.
                    </p>
                    <div class="aboutModal__actions">
                        <button class="aboutModal__actionBtn secondary" @click="openReportIssue">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"></path>
                            </svg>
                            Reportar problema
                        </button>
                        <button class="aboutModal__actionBtn primary" @click="openDonation">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.062 8.447c-.727-2.125-2.534-3.499-5.422-4.125l-.421-.101-.328 2.063.421.071c2.148.421 2.898 1.414 3.031 2.921.141 1.625-.664 2.821-2.391 3.563-1.031.438-2.227.601-3.562.484l-.531-.039-.422 2.641.531.047c2.375.219 4.281.016 5.688-.601 2.156-.953 3.656-3.141 3.406-6.924z"/>
                                <path d="M13.547 15.009c-1.344-.117-2.656-.281-3.938-.492l-.531-.086-.422 2.641.531.094c1.461.258 2.961.445 4.5.578l.421-2.656-.561-.079z"/>
                                <path d="M8.531 3.415C6.469 3.095 5 4.251 4.25 6.649c-.648 2.094-.469 4.148.531 6.101.938 1.836 2.375 3.141 4.281 3.875l-.422 2.641c-2.828-.906-4.906-2.656-6.234-5.25-1.313-2.547-1.469-5.188-.469-7.906C3.125 3.095 5.562 1.251 8.953 1.345l-.422 2.07z"/>
                            </svg>
                            Donar
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="aboutModal__footer">
                <button class="aboutModal__btn" @click="emit('close')">Cerrar</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.aboutModal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--bg-overlay);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2100;
}

.aboutModal__content {
    background: var(--bg-modal);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-standard);
    width: 440px;
    max-width: 90vw;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.aboutModal__header {
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-subtle);
}

.aboutModal__titleGroup {
    display: flex;
    align-items: center;
    gap: 12px;
}

.aboutModal__logo {
    width: 32px;
    height: 32px;
}

.aboutModal__title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.aboutModal__close {
    background: transparent;
    border: none;
    padding: 4px;
    color: var(--text-tertiary);
    cursor: pointer;
    border-radius: var(--radius-sm);
    display: flex;
}

.aboutModal__close:hover {
    color: var(--text-primary);
    background: var(--border-subtle);
}

.aboutModal__body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.aboutModal__info {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.aboutModal__field {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.aboutModal__label {
    font-size: 13px;
    color: var(--text-tertiary);
}

.aboutModal__value {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
}

.aboutModal__description {
    margin: 8px 0 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-secondary);
}

.aboutModal__updater {
    border-top: 1px solid var(--border-subtle);
    padding-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.aboutModal__updaterHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.aboutModal__updateBtn {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    color: var(--text-primary);
    padding: 4px 12px;
    font-size: 12px;
    border-radius: var(--radius-sm);
    cursor: pointer;
}

.aboutModal__updateBtn:hover:not(:disabled) {
    background: var(--steel);
}

.aboutModal__updateBtn:disabled {
    opacity: 0.5;
    cursor: default;
}

.aboutModal__status {
    margin: 0;
    font-size: 12px;
    color: var(--text-secondary);
}

.aboutModal__status--ready {
    color: var(--success);
    font-weight: 600;
}

.aboutModal__status--error {
    color: var(--error);
}

.aboutModal__funding {
    background: var(--accent-blue-soft);
    padding: 16px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-subtle);
}

.aboutModal__subtitle {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--accent-blue);
}

.aboutModal__fundingText {
    margin: 0 0 16px;
    font-size: 13px;
    line-height: 1.4;
    color: var(--text-secondary);
}

.aboutModal__actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.aboutModal__actionBtn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.aboutModal__footer {
    padding: 16px 24px;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid var(--border-subtle);
}

.aboutModal__btn {
    padding: 8px 24px;
}
</style>
