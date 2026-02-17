<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

export type MenuItem = {
    label: string;
    action: string; // identificador único
    danger?: boolean;
};

const props = defineProps<{
    x: number;
    y: number;
    items: MenuItem[];
}>();

const emit = defineEmits<{
    (e: 'action', item: MenuItem): void;
    (e: 'close'): void;
}>();

const menuRef = ref<HTMLElement | null>(null);

function handleClickOutside(event: MouseEvent) {
    if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
        emit('close');
    }
}

onMounted(() => {
    // Usamos setTimeout para evitar que el clic que abre el menú lo cierre inmediatamente si se propaga
    setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('contextmenu', handleClickOutside);
    }, 0);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('contextmenu', handleClickOutside);
});
</script>

<template>
    <div 
        ref="menuRef"
        class="context-menu"
        :style="{ top: `${y}px`, left: `${x}px` }"
    >
        <div 
            v-for="item in items" 
            :key="item.action"
            class="context-menu__item"
            :class="{ 'context-menu__item--danger': item.danger }"
            @click.stop="emit('action', item)"
        >
            {{ item.label }}
        </div>
    </div>
</template>

<style scoped>
.context-menu {
    position: fixed;
    z-index: 1000;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    min-width: 150px;
    padding: 4px 0;
    overflow: hidden;
}

.context-menu__item {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 13px;
    color: var(--text-primary);
    transition: background-color 0.1s;
    user-select: none;
}

.context-menu__item:hover {
    background-color: var(--item-hover-bg, #3a3d41);
}

.context-menu__item--danger {
    color: #ff5555;
}

.context-menu__item--danger:hover {
    background-color: rgba(255, 85, 85, 0.15);
}
</style>
