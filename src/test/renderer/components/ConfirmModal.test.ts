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
                title: 'Confirm',
                message: 'Are you sure?',
                confirmText: 'Yes'
            }
        });
        expect(wrapper.find('.modal').exists()).toBe(true);
        expect(wrapper.text()).toContain('Confirm');
        expect(wrapper.text()).toContain('Are you sure?');
        expect(wrapper.text()).toContain('Yes');
    });

    it('does not render when closed', () => {
        const wrapper = mount(ConfirmModal, {
            props: {
                isOpen: false,
                title: 'Confirm',
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
                title: 'Confirm',
                message: 'Msg'
            }
        });
        // Find confirm button
        // Default is btn--primary
        await wrapper.find('.btn--primary').trigger('click');
        expect(wrapper.emitted('confirm')).toBeTruthy();
    });

    it('emits cancel event', async () => {
        const wrapper = mount(ConfirmModal, {
            props: {
                isOpen: true,
                title: 'Confirm',
                message: 'Msg'
            }
        });
        await wrapper.find('.btn--secondary').trigger('click');
        expect(wrapper.emitted('cancel')).toBeTruthy();
    });
});
