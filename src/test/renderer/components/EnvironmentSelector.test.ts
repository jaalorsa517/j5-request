/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import EnvironmentSelector from '@/renderer/components/EnvironmentSelector.vue';
import { useEnvironmentStore } from '@/renderer/stores/environment';

// Mock electron
if (typeof window !== 'undefined') {
    (window as any).electron = {
        fs: {
            selectFile: vi.fn().mockResolvedValue('/test/env.json'),
            getGlobalsPath: vi.fn().mockResolvedValue('/mock/globals.json'),
            readFile: vi.fn().mockResolvedValue({ id: '1', name: 'File Env', variables: [] })
        },
        environment: {
            load: vi.fn().mockResolvedValue({ id: '1', name: 'File Env', variables: [] })
        }
    };
}

describe('EnvironmentSelector Sane Integration', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it('renders and opens manager', async () => {
        const store = useEnvironmentStore();
        store.activeEnvironment = { id: '1', name: 'Prod', variables: [] };

        const wrapper = mount(EnvironmentSelector);
        expect(wrapper.text()).toContain('Prod');

        await wrapper.find('.current-env').trigger('click');
        expect(store.showManager).toBe(true);
    });

    it('handles selection cancellation without errors', async () => {
        const wrapper = mount(EnvironmentSelector);

        (window.electron.fs.selectFile as any).mockResolvedValueOnce(null);

        await wrapper.find('button[title="Open Environment File"]').trigger('click');
        await flushPromises();

        // Check if any NEW calls were made after mounting (initial call was before spy or could be cleared)
        // Actually, just verify it doesn't crash.
        expect(window.electron.fs.selectFile).toHaveBeenCalled();
    });

    it('handles errors gracefully', async () => {
        (window.electron.fs.selectFile as any).mockRejectedValueOnce(new Error('fail'));
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

        const wrapper = mount(EnvironmentSelector);
        await wrapper.find('button[title="Open Environment File"]').trigger('click');
        await flushPromises();

        expect(alertSpy).toHaveBeenCalled();
        alertSpy.mockRestore();
    });
});
