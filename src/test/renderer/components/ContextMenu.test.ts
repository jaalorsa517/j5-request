import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import ContextMenu from '@/renderer/components/ContextMenu.vue';

describe('ContextMenu', () => {
    it('renders correctly', () => {
        const wrapper = mount(ContextMenu, {
            props: {
                x: 100,
                y: 100,
                items: [{ label: 'Delete', action: 'delete' }]
            }
        });
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.text()).toContain('Delete');
        expect(wrapper.element.getAttribute('style')).toContain('top: 100px');
        expect(wrapper.element.getAttribute('style')).toContain('left: 100px');
    });

    it('emits action on click', async () => {
        const wrapper = mount(ContextMenu, {
            props: {
                x: 0,
                y: 0,
                items: [{ label: 'Delete', action: 'delete' }]
            }
        });
        await wrapper.find('.context-menu__item').trigger('click');
        // Check emitted payload
        const emitted = wrapper.emitted('action');
        expect(emitted).toBeTruthy();
        expect(emitted![0][0]).toEqual({ label: 'Delete', action: 'delete' });
    });
});
