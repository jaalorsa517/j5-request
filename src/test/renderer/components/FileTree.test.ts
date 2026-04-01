/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import FileTree from '@/renderer/components/FileTree.vue';
import { useFileSystemStore } from '@/renderer/stores/file-system';

describe('FileTree.vue Real Recursion', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('emits node-contextmenu from deep child', async () => {
        const entries = [{ 
            path: '/p', name: 'p', type: 'directory', 
            children: [{ path: '/p/f', name: 'f', type: 'file' }] 
        }];
        const wrapper = mount(FileTree, {
            props: { entries: entries as any },
            global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
        });

        // Trigger right click on the deep child file entry
        // The first .file-entry is the directory 'p', the second is the file 'f'
        const fileEntry = wrapper.findAll('.file-entry')[1];
        await fileEntry.trigger('contextmenu');
        
        expect(wrapper.emitted('node-contextmenu')).toBeTruthy();
        const emitArgs = wrapper.emitted('node-contextmenu')![0];
        expect((emitArgs[1] as any).path).toBe('/p/f');
    });

    it('handles directory selection branch', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const store = useFileSystemStore();
        const entries = [{ path: '/dir', name: 'dir', type: 'directory' }];
        
        const wrapper = mount(FileTree, {
            props: { entries: entries as any },
            global: { plugins: [pinia] }
        });

        await wrapper.find('.file-entry').trigger('click');
        expect(store.selectFile).not.toHaveBeenCalled();
    });
});
