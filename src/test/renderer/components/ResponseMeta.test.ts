/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ResponseMeta from '@/renderer/components/ResponseMeta.vue';

describe('ResponseMeta.vue', () => {
    function createMockPinia(response: any = null) {
        return createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                request: {
                    tabs: [{
                        id: '1',
                        request: {},
                        response: response,
                        originalState: '{}'
                    }],
                    activeTabId: '1'
                }
            }
        });
    }

        it('renders empty state', () => {

            const wrapper = mount(ResponseMeta, {

                global: { plugins: [createMockPinia(null)] }

            });

            expect(wrapper.text()).toContain('No response yet');

            // Check computed values for null response (can't easily check internal computed but check they don't crash)

        });

    it('renders status, time and size', async () => {
        const response = {
            status: 200,
            statusText: 'OK',
            time: 123,
            size: 1024
        };
        const wrapper = mount(ResponseMeta, { global: { plugins: [createMockPinia(response)] } });
        
        await wrapper.vm.$nextTick();

        expect(wrapper.text()).toContain('200 OK');
        expect(wrapper.text()).toContain('123 ms');
        expect(wrapper.text()).toContain('1.00 KB');
    });

    it('shows correct status colors', async () => {
        const cases = [
            { status: 200, color: 'var(--success-color)' }, 
            { status: 301, color: 'var(--warning-color)' }, 
            { status: 404, color: 'var(--error-color)' },
            { status: 0, color: 'var(--error-color)' }
        ];

        for (const c of cases) {
            const wrapper = mount(ResponseMeta, { global: { plugins: [createMockPinia({ status: c.status, statusText: 'ST' })] } });
            await wrapper.vm.$nextTick();
            const statusEl = wrapper.find('.responseMeta__value--status');
            expect(statusEl.element.style.color).toBe(c.color);
        }
    });

    it('formats large sizes correctly', async () => {
        const cases = [
            { size: 500, expected: '500 B' },
            { size: 2048, expected: '2.00 KB' },
            { size: 2 * 1024 * 1024, expected: '2.00 MB' }
        ];

        for (const c of cases) {
            const wrapper = mount(ResponseMeta, { global: { plugins: [createMockPinia({ status: 200, size: c.size })] } });
            await wrapper.vm.$nextTick();
            expect(wrapper.text()).toContain(c.expected);
        }
    });
});
