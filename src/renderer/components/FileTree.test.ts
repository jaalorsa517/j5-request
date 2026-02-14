/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import FileTree from './FileTree.vue';
import { useFileSystemStore } from '../stores/file-system';

describe('FileTree.vue', () => {
    it('renders entries and calls selectFile on file click', async () => {
        const entries = [
            { name: 'dir', type: 'directory' as const, path: '/dir', children: [
                { name: 'file', type: 'file' as const, path: '/dir/file' }
            ]}
        ];

        const pinia = createTestingPinia({ createSpy: vi.fn });
        const wrapper = mount(FileTree, {
            props: { entries },
            global: { plugins: [pinia] }
        });

        const store = useFileSystemStore();

        expect(wrapper.text()).toContain('dir');
        expect(wrapper.text()).toContain('file');

        // Click file
        const fileEntry = wrapper.findAll('.file-entry').find(e => e.text().includes('file'));
        await fileEntry?.trigger('click');

        expect(store.selectFile).toHaveBeenCalledWith('/dir/file');
    });

    it('handles recursive rendering', () => {
        const entries = [
            { name: 'root', type: 'directory' as const, path: '/root', children: [
                { name: 'sub', type: 'directory' as const, path: '/root/sub', children: [
                    { name: 'leaf', type: 'file' as const, path: '/root/sub/leaf' }
                ]}
            ]}
        ];

        const pinia = createTestingPinia({ createSpy: vi.fn });
        const wrapper = mount(FileTree, {
            props: { entries },
            global: { plugins: [pinia] }
        });

        expect(wrapper.text()).toContain('leaf');
        // Check indentation logic via depth
        const lists = wrapper.findAll('ul');
        expect(lists).toHaveLength(3); // one for each level
    });
});
