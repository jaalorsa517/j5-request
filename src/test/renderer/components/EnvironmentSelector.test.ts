/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import EnvironmentSelector from '@/renderer/components/EnvironmentSelector.vue';
import { useEnvironmentStore } from '@/renderer/stores/environment';

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

    it('does nothing in openEnv if selection is canceled', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const wrapper = mount(EnvironmentSelector, { global: { plugins: [pinia] } });
        const store = useEnvironmentStore();
        
        (window.electron.fs.selectFile as any).mockResolvedValue(null);

        await wrapper.find('button[title="Open Environment File"]').trigger('click');
        await flushPromises();
        
        expect(store.loadEnvironmentFromFile).not.toHaveBeenCalled();
    });

    it('handles error in openEnv', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const wrapper = mount(EnvironmentSelector, { global: { plugins: [pinia] } });
        
        (window.electron.fs.selectFile as any).mockRejectedValue(new Error('fail'));
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        await wrapper.find('button[title="Open Environment File"]').trigger('click');
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(alertSpy).toHaveBeenCalledWith('Error loading environment');
    });
});
