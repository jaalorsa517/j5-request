/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ResponsePanel from './ResponsePanel.vue';

vi.mock('./ResponseMeta.vue', () => ({ default: { template: '<div>Meta</div>' } }));
vi.mock('./ResponseBodyViewer.vue', () => ({ default: { template: '<div>Body</div>' } }));

describe('ResponsePanel.vue', () => {
    it('renders meta and body viewer', () => {
        const wrapper = mount(ResponsePanel);
        expect(wrapper.text()).toContain('Meta');
        expect(wrapper.text()).toContain('Body');
    });
});
