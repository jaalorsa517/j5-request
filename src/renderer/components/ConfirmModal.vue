<script setup lang="ts">
defineProps<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
}>();

const emit = defineEmits<{
    (e: 'confirm'): void;
    (e: 'cancel'): void;
}>();
</script>

<template>
    <div v-if="isOpen" class="confirmModal" @click.self="emit('cancel')">
        <div class="confirmMogemini cli dal__content">
            <h3 class="confirmModal__title">{{ title }}</h3>
            <p class="confirmModal__message">{{ message }}</p>
            <div class="confirmModal__actions">
                <button class="confirmModal__btn" @click="emit('cancel')">
                    {{ cancelText || 'Cancelar' }}
                </button>
                <button 
                    class="confirmModal__btn" 
                    :class="danger ? 'confirmModal__btn--danger' : 'confirmModal__btn--primary'" 
                    @click="emit('confirm')"
                >
                    {{ confirmText || 'Confirmar' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.confirmModal {
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
    z-index: 2000;
}

.confirmModal__content {
    background: var(--bg-modal);
    padding: 24px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-standard);
    width: 400px;
    max-width: 90vw;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.confirmModal__title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.confirmModal__message {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
}

.confirmModal__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
}

.confirmModal__btn {
    padding: 8px 16px;
    font-size: 14px;
}

.confirmModal__btn--primary {
    background-color: var(--accent-blue);
    color: #ffffff;
    border: none;
}

.confirmModal__btn--primary:hover {
    background-color: #2563eb;
}

.confirmModal__btn--danger {
    background-color: var(--error);
    color: #ffffff;
    border: none;
}

.confirmModal__btn--danger:hover {
    background-color: #dc2626;
}
</style>

