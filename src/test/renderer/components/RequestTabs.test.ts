/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RequestTabs from '@/renderer/components/RequestTabs.vue';

describe('RequestTabs.vue', () => {
    it('renders tabs and switches active one', async () => {
        const wrapper = mount(RequestTabs, {
            slots: {
                body: '<div id="body-content">Body</div>',
                headers: '<div id="headers-content">Headers</div>'
            }
        });

        // Initial tab is body
        expect(wrapper.find('#body-content').exists()).toBe(true);
        expect(wrapper.find('#headers-content').exists()).toBe(false);

        // Click headers
        const buttons = wrapper.findAll('.requestTabs__tab');
        const headersBtn = buttons.find(b => b.text() === 'Headers');
        await headersBtn?.trigger('click');

        expect(wrapper.find('#body-content').exists()).toBe(false);
        expect(wrapper.find('#headers-content').exists()).toBe(true);
    });

    it('renders all tab buttons and switches correctly', async () => {
        const wrapper = mount(RequestTabs, {
            slots: {
                params: '<div>Params</div>',
                headers: '<div>Headers</div>',
                body: '<div>Body</div>',
                'pre-request': '<div>Pre-req</div>',
                tests: '<div>Tests</div>'
            }
        });
        const buttons = wrapper.findAll('.requestTabs__tab');
        expect(buttons).toHaveLength(5);
        expect(buttons.map(b => b.text())).toEqual(['Params', 'Headers', 'Body', 'Pre-req', 'Tests']);

        // Switch to all tabs
        const tabNames = ['Params', 'Headers', 'Body', 'Pre-req', 'Tests'];
        for (let i = 0; i < buttons.length; i++) {
            await buttons[i].trigger('click');
            expect(wrapper.text()).toContain(tabNames[i]);
        }
    });
});
