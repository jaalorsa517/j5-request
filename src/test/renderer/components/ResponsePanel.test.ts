/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ResponsePanel from '@/renderer/components/ResponsePanel.vue';

vi.mock('@/renderer/components/ResponseMeta.vue', () => ({ default: { template: '<div>Meta</div>' } }));
vi.mock('@/renderer/components/ResponseBodyViewer.vue', () => ({ default: { template: '<div>Body</div>' } }));

describe('ResponsePanel.vue', () => {
    it('renders meta and body viewer', () => {
        const wrapper = mount(ResponsePanel);
        expect(wrapper.text()).toContain('Meta');
        expect(wrapper.text()).toContain('Body');
    });
});
