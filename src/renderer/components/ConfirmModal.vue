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
    <div v-if="isOpen" class="modal-overlay" @click.self="emit('cancel')">
        <div class="modal">
            <h3 class="modal__title">{{ title }}</h3>
            <p class="modal__message">{{ message }}</p>
            <div class="modal__actions">
                <button class="btn btn--secondary" @click="emit('cancel')">
                    {{ cancelText || 'Cancelar' }}
                </button>
                <button 
                    class="btn" 
                    :class="danger ? 'btn--danger' : 'btn--primary'" 
                    @click="emit('confirm')"
                >
                    {{ confirmText || 'Confirmar' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    backdrop-filter: blur(2px);
}

.modal {
    background: var(--bg-modal, #252526);
    border: 1px solid var(--border-color, #383838);
    border-radius: 6px;
    padding: 20px;
    min-width: 350px;
    max-width: 500px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    color: var(--text-primary, #ffffff);
}

.modal__title {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
}

.modal__message {
    margin-bottom: 24px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-secondary, #cccccc);
    word-break: break-word;
}

.modal__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.btn {
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    font-size: 13px;
    transition: background 0.2s;
}

.btn--secondary {
    background: var(--bg-secondary, #333333);
    color: var(--text-primary, #ffffff);
    border: 1px solid var(--border-color, #454545);
}

.btn--secondary:hover {
    background: var(--bg-hover, #3e3e42);
}

.btn--primary {
    background: var(--accent-color, #007acc);
    color: #ffffff;
}

.btn--primary:hover {
    filter: brightness(1.1);
}

.btn--danger {
    background: #d32f2f;
    color: #ffffff;
}

.btn--danger:hover {
    background: #b71c1c;
}
</style>
