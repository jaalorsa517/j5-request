/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RequestTabs from './RequestTabs.vue';

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

    it('renders all tab buttons', () => {
        const wrapper = mount(RequestTabs);
        const buttons = wrapper.findAll('.requestTabs__tab');
        expect(buttons).toHaveLength(5);
        expect(buttons.map(b => b.text())).toEqual(['Params', 'Headers', 'Body', 'Pre-req', 'Tests']);
    });
});
