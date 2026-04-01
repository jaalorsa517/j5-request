/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import SSLConfigPanel from '@/renderer/components/SSLConfigPanel.vue';
import { useFileSystemStore } from '@/renderer/stores/file-system';

// Mock Electron
if (typeof window !== 'undefined') {
    (window as any).electron = {
        fs: { 
            makeRelative: vi.fn().mockResolvedValue('rel/path.pem'),
            readTextFile: vi.fn().mockResolvedValue('content'),
            writeTextFile: vi.fn().mockResolvedValue(undefined)
        },
        ssl: {
            selectCertificateFile: vi.fn().mockResolvedValue('/abs/path.pem')
        }
    };
    (window as any).confirm = vi.fn().mockReturnValue(true);
}

describe('SSLConfigPanel Final Push', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it('covers all functional branches', async () => {
        const fsStore = useFileSystemStore();
        fsStore.currentPath = '/abs'; 

        const wrapper = mount(SSLConfigPanel, {
            props: { modelValue: { ca: ['ca1'], clientCert: 'c', clientKey: 'k', rejectUnauthorized: true } }
        });

        // 1. Selection & Relative path
        await wrapper.find('.btn-add').trigger('click');
        await flushPromises();
        
        // 2. Clearing
        const clearButtons = wrapper.findAll('.btn-text');
        await clearButtons[0].trigger('click'); // clear cert
        await clearButtons[1].trigger('click'); // clear key
        
        // 3. Removal
        await wrapper.find('.btn-remove').trigger('click');
        
        // 4. Checkbox
        await wrapper.find('input[type="checkbox"]').setValue(false);

        expect(wrapper.emitted('update:modelValue')).toBeDefined();
    });

    it('covers error paths and confirmations', async () => {
        const fsStore = useFileSystemStore();
        fsStore.currentPath = '/project';
        
        // Confirm copy external
        (window.electron.fs.makeRelative as any).mockResolvedValueOnce('../other.pem');
        (window as any).confirm.mockReturnValueOnce(true);
        const wrapper = mount(SSLConfigPanel, { props: { modelValue: { ca: [] } } });
        await wrapper.find('.btn-add').trigger('click');
        await flushPromises();
        expect(window.electron.fs.writeTextFile).toHaveBeenCalled();

        // Cancel copy external
        (window.electron.fs.makeRelative as any).mockResolvedValueOnce('../other2.pem');
        (window as any).confirm.mockReturnValueOnce(false);
        await wrapper.find('.btn-add').trigger('click');
        await flushPromises();

        // MakeRelative Error
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (window.electron.fs.makeRelative as any).mockRejectedValueOnce(new Error('fail'));
        await wrapper.find('.btn-add').trigger('click');
        await flushPromises();
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('covers CA list management and duplicates', async () => {
        const fsStore = useFileSystemStore();
        fsStore.currentPath = '/abs';
        
        const wrapper = mount(SSLConfigPanel, {
            props: { modelValue: { ca: ['rel/path.pem'] } }
        });

        // 1. Try add duplicate
        await wrapper.find('.btn-add').trigger('click');
        await flushPromises();
        // Emitted should not contain a second 'rel/path.pem' 
        // Based on logic: if (!currentCAs.includes(processed)) update(...)
        // Since we are using emitted(), let's check if update was called
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();

        // 2. Remove
        await wrapper.find('.btn-remove').trigger('click');
        expect((wrapper.emitted('update:modelValue')![0][0] as any).ca).toHaveLength(0);
    });
});
