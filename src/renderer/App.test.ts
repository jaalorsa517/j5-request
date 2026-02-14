/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from './App.vue';
import { createTestingPinia } from '@pinia/testing';

vi.mock('./components/MainLayout.vue', () => ({ default: { template: '<div>MainLayout</div>' } }));

describe('App.vue', () => {
    it('renders MainLayout', () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const wrapper = mount(App, {
            global: { plugins: [pinia] }
        });
        expect(wrapper.text()).toContain('MainLayout');
    });
});
