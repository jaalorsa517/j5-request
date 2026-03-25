/**
 * @vitest-environment jsdom
 */
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import ConfirmModal from '@/renderer/components/ConfirmModal.vue';

describe('ConfirmModal', () => {
    it('renders when open', () => {
        const wrapper = mount(ConfirmModal, {
            props: {
                isOpen: true,
                title: 'Confirmar',
                message: '¿Estás seguro?',
                confirmText: 'Sí'
            }
        });
        expect(wrapper.find('.confirmModal').exists()).toBe(true);
        expect(wrapper.text()).toContain('Confirmar');
        expect(wrapper.text()).toContain('¿Estás seguro?');
        expect(wrapper.text()).toContain('Sí');
    });

    it('does not render when closed', () => {
        const wrapper = mount(ConfirmModal, {
            props: {
                isOpen: false,
                title: 'Confirmar',
                message: 'Msg'
            }
        });
        // v-if="isOpen" on root div
        expect(wrapper.html()).toBe('<!--v-if-->');
    });

    it('emits confirm event', async () => {
        const wrapper = mount(ConfirmModal, {
            props: {
                isOpen: true,
                title: 'Confirmar',
                message: 'Msg'
            }
        });
        // Find confirm button
        // Default is confirmModal__btn--primary
        await wrapper.find('.confirmModal__btn--primary').trigger('click');
        expect(wrapper.emitted('confirm')).toBeTruthy();
    });

    it('emits cancel event', async () => {
        const wrapper = mount(ConfirmModal, {
            props: {
                isOpen: true,
                title: 'Confirmar',
                message: 'Msg'
            }
        });
        // Cancel button is the first confirmModal__btn
        await wrapper.find('.confirmModal__btn').trigger('click');
        expect(wrapper.emitted('cancel')).toBeTruthy();
    });
});
