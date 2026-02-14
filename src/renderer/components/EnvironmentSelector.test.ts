/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import EnvironmentSelector from './EnvironmentSelector.vue';
import { useEnvironmentStore } from '../stores/environment';

// Mock electron
if (typeof window !== 'undefined') {
    (window as any).electron = {
        fs: {
            selectFile: vi.fn().mockResolvedValue('/test/env.json'),
            getGlobalsPath: vi.fn().mockResolvedValue('/mock/globals.json'),
            readFile: vi.fn().mockResolvedValue({ variables: [] })
        }
    };
}

describe('EnvironmentSelector.vue', () => {
    it('renders current environment name', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                environment: {
                    activeEnvironment: { id: '1', name: 'Prod', variables: [] }
                }
            }
        });

        const wrapper = mount(EnvironmentSelector, { global: { plugins: [pinia] } });
        expect(wrapper.text()).toContain('Prod');
    });

    it('opens manager on click', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const wrapper = mount(EnvironmentSelector, { global: { plugins: [pinia] } });
        const store = useEnvironmentStore();

        await wrapper.find('.current-env').trigger('click');
        expect(store.showManager).toBe(true);
    });

    it('triggers file selection on open icon click', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const wrapper = mount(EnvironmentSelector, { global: { plugins: [pinia] } });
        const store = useEnvironmentStore();

        await wrapper.find('button[title="Open Environment File"]').trigger('click');
        expect(window.electron.fs.selectFile).toHaveBeenCalled();
        // Wait for store action
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(store.loadEnvironmentFromFile).toHaveBeenCalledWith('/test/env.json');
    });
});
