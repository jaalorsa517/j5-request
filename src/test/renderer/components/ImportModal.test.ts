/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ImportModal from '@/renderer/components/ImportModal.vue';
import { useFileSystemStore } from '@/renderer/stores/file-system';

// Mock Electron comprehensively
if (typeof window !== 'undefined') {
    (window as any).electron = {
        import: {
            detectFormat: vi.fn().mockResolvedValue({ format: 'curl', confidence: 1 }),
            fromContent: vi.fn().mockResolvedValue({
                success: true,
                requests: [{ id: '1' }],
                errors: [],
                warnings: ['Mock Warning']
            })
        },
        fs: {
            selectFile: vi.fn().mockResolvedValue('/mock/file.json'),
            readTextFile: vi.fn().mockResolvedValue('content'),
            saveRequests: vi.fn().mockResolvedValue(['/path/1.j5request']),
            watch: vi.fn(),
            unwatch: vi.fn(),
            onChanged: vi.fn().mockReturnValue(() => {}),
            readDir: vi.fn().mockResolvedValue([])
        }
    };
    vi.useFakeTimers();
}

describe('ImportModal Final Unified Integration', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it('covers the entire successful import flow', async () => {
        const fsStore = useFileSystemStore();
        fsStore.currentPath = '/project';
        const wrapper = mount(ImportModal);

        const textarea = wrapper.find('.importModal__textarea');
        await textarea.setValue('curl http://api.com');
        await textarea.trigger('input');
        await flushPromises();

        await wrapper.find('.importModal__button--primary').trigger('click');
        await flushPromises();
        
        vi.runAllTimers();
        await flushPromises();
        
        expect(wrapper.emitted('imported')).toBeTruthy();
    });

    it('covers error paths and warnings', async () => {
        const wrapper = mount(ImportModal);
        
        // Populate warnings via import
        await wrapper.find('.importModal__textarea').setValue('data');
        await wrapper.find('.importModal__button--primary').trigger('click');
        await flushPromises();
        
        expect(wrapper.find('.importModal__warnings').exists()).toBe(true);

        // Fail import content
        (window as any).electron.import.fromContent.mockResolvedValueOnce({
            success: false,
            requests: [],
            errors: ['Error Mock'],
            warnings: []
        });
        await wrapper.find('.importModal__button--primary').trigger('click');
        await flushPromises();
        expect(wrapper.find('.importModal__errors').text()).toContain('Error Mock');
    });

    it('covers error catch blocks and empty paste', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (window as any).electron.import.detectFormat.mockRejectedValueOnce(new Error('detect fail'));
        
        const wrapper = mount(ImportModal);
        const vm = wrapper.vm as any;

        // Empty paste
        vm.pasteContent = '  ';
        await vm.detectFormat();
        expect(vm.detectedFormat).toBeNull();

        // Error in detectFormat
        vm.pasteContent = 'something';
        await vm.detectFormat();
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    it('covers missing requests branch in performImport', async () => {
        (window as any).electron.import.fromContent.mockResolvedValueOnce({
            success: true,
            requests: [],
            errors: [],
            warnings: []
        });

        const wrapper = mount(ImportModal);
        await wrapper.find('.importModal__textarea').setValue('spec');
        await wrapper.find('.importModal__button--primary').trigger('click');
        await flushPromises();

        expect(wrapper.find('.importModal__errors').text()).toContain('No se encontraron requests');
    });
});
