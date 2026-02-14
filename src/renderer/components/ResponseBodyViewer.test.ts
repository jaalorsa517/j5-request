/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ResponseBodyViewer from './ResponseBodyViewer.vue';

vi.mock('./MonacoEditor.vue', () => ({ 
    default: { 
        template: '<div class="mock-monaco">{{ modelValue }} ({{ language }})</div>',
        props: ['modelValue', 'language']
    } 
}));

describe('ResponseBodyViewer.vue', () => {
    function createMockPinia(response: any = null) {
        return createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                request: {
                    tabs: [{
                        id: 'tab-1',
                        name: 'Test Tab',
                        request: { method: 'GET', url: '', headers: {}, params: {}, body: '', bodyType: 'json' },
                        response: response,
                        originalState: '{}'
                    }],
                    activeTabId: 'tab-1'
                }
            }
        });
    }

    it('renders empty message when no response', () => {
        const pinia = createMockPinia(null);
        const wrapper = mount(ResponseBodyViewer, { global: { plugins: [pinia] } });
        expect(wrapper.text()).toContain('Send a request to see the response');
    });

    it('renders body and toggles format mode', async () => {
        const response = {
            body: '{"foo":"bar"}',
            headers: { 'content-type': 'application/json' }
        };
        const pinia = createMockPinia(response);
        const wrapper = mount(ResponseBodyViewer, { global: { plugins: [pinia] } });

        // Wait for computed properties
        await wrapper.vm.$nextTick();

        // Pretty mode (default)
        const monaco = wrapper.find('.mock-monaco');
        expect(monaco.exists()).toBe(true);
        expect(monaco.text()).toContain('"foo": "bar"');
        expect(monaco.text()).toContain('(json)');

        // Switch to Raw
        const rawBtn = wrapper.findAll('.action-btn').find(b => b.text() === 'Raw');
        await rawBtn?.trigger('click');
        expect(wrapper.find('.mock-monaco').text()).toContain('{"foo":"bar"}');
    });

    it('renders headers tab', async () => {
        const response = {
            body: '',
            headers: { 'X-Test': 'Value', 'Content-Type': 'text/plain' }
        };
        const pinia = createMockPinia(response);
        const wrapper = mount(ResponseBodyViewer, { global: { plugins: [pinia] } });

        // Switch to Headers tab
        const headerBtn = wrapper.findAll('.tab').find(b => b.text().includes('Headers'));
        await headerBtn?.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.headers-table').exists()).toBe(true);
        expect(wrapper.text()).toContain('X-Test');
        expect(wrapper.text()).toContain('Value');
    });

    it('detects language correctly', async () => {
        const cases = [
            { body: '{"a":1}', lang: 'json' },
            { body: '<xml></xml>', lang: 'xml' },
            { body: 'just text', lang: 'plaintext' },
            { body: '{ invalid json', lang: 'json' }
        ];

        for (const c of cases) {
            const pinia = createMockPinia({ body: c.body });
            const wrapper = mount(ResponseBodyViewer, { global: { plugins: [pinia] } });
            await wrapper.vm.$nextTick();
            expect(wrapper.find('.mock-monaco').text()).toContain(`(${c.lang})`);
        }
    });

    it('handles invalid JSON in pretty mode gracefully', async () => {
        const body = '{ "bad": json }';
        const pinia = createMockPinia({ body });
        const wrapper = mount(ResponseBodyViewer, { global: { plugins: [pinia] } });
        await wrapper.vm.$nextTick();
        // Should show raw body because JSON.parse fails
        expect(wrapper.find('.mock-monaco').text()).toContain(body);
    });
});
