/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ResponseMeta from './ResponseMeta.vue';

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
        const wrapper = mount(ResponseMeta, { global: { plugins: [createMockPinia(null)] } });
        expect(wrapper.text()).toContain('No response yet');
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
            { status: 200, color: 'rgb(76, 175, 80)' }, // #4caf50
            { status: 301, color: 'rgb(255, 152, 0)' }, // #ff9800
            { status: 404, color: 'rgb(244, 67, 54)' }  // #f44336
        ];

        for (const c of cases) {
            const wrapper = mount(ResponseMeta, { global: { plugins: [createMockPinia({ status: c.status, statusText: 'ST' })] } });
            await wrapper.vm.$nextTick();
            const statusEl = wrapper.find('.responseMeta__value--status');
            expect(statusEl.element.style.color).toBe(c.color);
        }
    });

    it('formats large sizes correctly', async () => {
        const response = { status: 200, size: 2 * 1024 * 1024 }; // 2MB
        const wrapper = mount(ResponseMeta, { global: { plugins: [createMockPinia(response)] } });
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain('2.00 MB');
    });
});
