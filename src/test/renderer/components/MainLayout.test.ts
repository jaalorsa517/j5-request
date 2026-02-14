/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import MainLayout from '@/renderer/components/MainLayout.vue';
import { useFileSystemStore } from '@/renderer/stores/file-system';
import { useRequestStore } from '@/renderer/stores/request';

// Mock all heavy child components
vi.mock('@/renderer/components/FileTree.vue', () => ({ default: { template: '<div>FileTree</div>' } }));
vi.mock('@/renderer/components/RequestPanel.vue', () => ({ default: { template: '<div>RequestPanel</div>' } }));
vi.mock('@/renderer/components/ResponsePanel.vue', () => ({ default: { template: '<div>ResponsePanel</div>' } }));
vi.mock('@/renderer/components/git/GitPanel.vue', () => ({ default: { template: '<div>GitPanel</div>' } }));
vi.mock('@/renderer/components/git/DiffEditor.vue', () => ({ default: { template: '<div>DiffEditor</div>' } }));
vi.mock('@/renderer/components/EnvironmentSelector.vue', () => ({ default: { template: '<div>EnvSelector</div>' } }));
vi.mock('@/renderer/components/EnvironmentManagerModal.vue', () => ({ default: { template: '<div>EnvManager</div>' } }));
vi.mock('@/renderer/components/RequestTabBar.vue', () => ({ default: { template: '<div>TabBar</div>' } }));

// Mock heavy dependencies
if (typeof window !== 'undefined') {
    (window as any).electron = {
        fs: {
            selectFolder: vi.fn(),
            getGlobalsPath: vi.fn().mockResolvedValue('/mock/globals.json'),
            readFile: vi.fn().mockResolvedValue({ variables: [] }),
            writeFile: vi.fn(),
        },
        git: {
            getFileContent: vi.fn(),
        }
    };
}

describe('MainLayout.vue', () => {
    beforeEach(() => {
        vi.stubGlobal('alert', vi.fn());
    });

    it('renders sidebar and workspace', () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                'file-system': { rootEntry: [], currentPath: null, selectedFile: null },
                request: { isDirty: false },
                environment: { showManager: false }
            }
        });

        const wrapper = mount(MainLayout, {
            global: { plugins: [pinia] }
        });

        expect(wrapper.find('.activityBar').exists()).toBe(true);
        expect(wrapper.find('.mainLayout__sidebar').exists()).toBe(true);
        expect(wrapper.find('.mainLayout__workspace').exists()).toBe(true);
    });

    it('triggers openFolder action', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const wrapper = mount(MainLayout, { global: { plugins: [pinia] } });
        const fsStore = useFileSystemStore();

        (window.electron.fs.selectFolder as any).mockResolvedValue('/selected/path');

        const openBtn = wrapper.findAll('.mainLayout__actionButton').find(b => b.text().includes('Open'));
        await openBtn?.trigger('click');
        
        expect(window.electron.fs.selectFolder).toHaveBeenCalled();
        // selectFolder returns mock path, openDirectory should be called
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(fsStore.openDirectory).toHaveBeenCalledWith('/selected/path'); 
    });

    it('opens and confirms new request modal', async () => {
        const pinia = createTestingPinia({ 
            createSpy: vi.fn,
            initialState: { 'file-system': { currentPath: '/some/path' } }
        });
        const wrapper = mount(MainLayout, { global: { plugins: [pinia] } });
        const fsStore = useFileSystemStore();

        // Open modal
        const newBtn = wrapper.findAll('.mainLayout__actionButton').find(b => b.text().includes('New'));
        await newBtn?.trigger('click');
        expect(wrapper.find('.mainLayout__modalOverlay').exists()).toBe(true);

        // Input name and confirm
        const input = wrapper.find('.mainLayout__modalInput');
        await input.setValue('test-req');
        await wrapper.findAll('.mainLayout__modalActions button').find(b => b.text() === 'Create')?.trigger('click');

        expect(fsStore.createRequest).toHaveBeenCalledWith('test-req');
        expect(wrapper.find('.mainLayout__modalOverlay').exists()).toBe(false);
    });

    it('does nothing in confirmCreateRequest if name is empty', async () => {
        const pinia = createTestingPinia({ 
            createSpy: vi.fn,
            initialState: { 'file-system': { currentPath: '/some/path' } }
        });
        const wrapper = mount(MainLayout, { global: { plugins: [pinia] } });
        const fsStore = useFileSystemStore();

        // Open modal
        const newBtn = wrapper.findAll('.mainLayout__actionButton').find(b => b.text().includes('New'));
        await newBtn?.trigger('click');
        
        // Confirm with empty name
        const createBtn = wrapper.findAll('.mainLayout__modalActions button').find(b => b.text() === 'Create');
        await createBtn?.trigger('click');

        expect(fsStore.createRequest).not.toHaveBeenCalled();
        expect(wrapper.find('.mainLayout__modalOverlay').exists()).toBe(true);
    });

    it('handles error in confirmCreateRequest', async () => {
        const pinia = createTestingPinia({ 
            createSpy: vi.fn,
            initialState: { 'file-system': { currentPath: '/some/path' } }
        });
        const wrapper = mount(MainLayout, { global: { plugins: [pinia] } });
        const fsStore = useFileSystemStore();

        (fsStore.createRequest as any).mockRejectedValue(new Error('fail'));

        // Open modal
        const newBtn = wrapper.findAll('.mainLayout__actionButton').find(b => b.text().includes('New'));
        await newBtn?.trigger('click');
        
        // Input and confirm
        await wrapper.find('.mainLayout__modalInput').setValue('req');
        const createBtn = wrapper.findAll('.mainLayout__modalActions button').find(b => b.text() === 'Create');
        await createBtn?.trigger('click');
        await flushPromises();

        expect(window.alert).toHaveBeenCalledWith('Error creating request: fail');
    });

    it('switches between explorer and git activities', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const wrapper = mount(MainLayout, { global: { plugins: [pinia] } });

        const buttons = wrapper.findAll('.activityBar__item');
        
        // Switch to Git
        await buttons[1].trigger('click');
        expect(wrapper.text()).toContain('GitPanel');
        expect(wrapper.text()).not.toContain('Open'); 

        // Switch back to Explorer
        await buttons[0].trigger('click');
        expect(wrapper.text()).toContain('FileTree');
        expect(wrapper.text()).toContain('Open');
    });

    it('triggers saveRequest action', async () => {
        const pinia = createTestingPinia({ 
            createSpy: vi.fn,
            initialState: { 'file-system': { selectedFile: { id: '1' } } }
        });
        const wrapper = mount(MainLayout, { global: { plugins: [pinia] } });
        const requestStore = useRequestStore();

        const saveBtn = wrapper.findAll('.mainLayout__actionButton').find(b => b.text().includes('Save'));
        await saveBtn?.trigger('click');
        expect(requestStore.saveToFile).toHaveBeenCalled();
    });

    it('handles error in openFolder', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const wrapper = mount(MainLayout, { global: { plugins: [pinia] } });
        
        (window.electron.fs.selectFolder as any).mockRejectedValue(new Error('fail'));

        const openBtn = wrapper.findAll('.mainLayout__actionButton').find(b => b.text().includes('Open'));
        await openBtn?.trigger('click');
        await flushPromises();

        expect(window.alert).toHaveBeenCalledWith('Error opening folder: fail');
    });

    it('handles error in saveRequest', async () => {
        const pinia = createTestingPinia({ 
            createSpy: vi.fn,
            initialState: { 'file-system': { selectedFile: { id: '1' } } }
        });
        const wrapper = mount(MainLayout, { global: { plugins: [pinia] } });
        const requestStore = useRequestStore();
        
        (requestStore.saveToFile as any).mockRejectedValue(new Error('fail'));

        const saveBtn = wrapper.findAll('.mainLayout__actionButton').find(b => b.text().includes('Save'));
        await saveBtn?.trigger('click');
        await flushPromises();

        expect(window.alert).toHaveBeenCalledWith('Error saving request: fail');
    });

    it('handles openDiff event from GitPanel', async () => {
        const pinia = createTestingPinia({ 
            createSpy: vi.fn,
            initialState: {
                theme: { theme: 'dark' }
            }
        });
        const wrapper = mount(MainLayout, { global: { plugins: [pinia] } });

        // Switch to Git activity
        await wrapper.findAll('.activityBar__item')[1].trigger('click');

        const gitPanel = wrapper.getComponent({ name: 'GitPanel' });
        
        (window.electron.git.getFileContent as any).mockResolvedValue('original content');
        (window.electron.fs.readFile as any).mockResolvedValue('modified content');

        await gitPanel.vm.$emit('openDiff', 'file.json', '/repo/path');
        
        // Wait for async handleOpenDiff and UI update
        await new Promise(resolve => setTimeout(resolve, 0));
        await wrapper.vm.$nextTick();

        expect(window.electron.git.getFileContent).toHaveBeenCalled();
        expect(wrapper.text()).toContain('DiffEditor');
        expect(wrapper.text()).toContain('Close Diff');

        // Close diff
        await wrapper.find('.close-diff-btn').trigger('click');
        expect(wrapper.text()).not.toContain('DiffEditor');
    });

    it('handles error in handleOpenDiff', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const wrapper = mount(MainLayout, { global: { plugins: [pinia] } });

        await wrapper.findAll('.activityBar__item')[1].trigger('click');
        const gitPanel = wrapper.getComponent({ name: 'GitPanel' });
        
        (window.electron.git.getFileContent as any).mockRejectedValue(new Error('fail'));

        await gitPanel.vm.$emit('openDiff', 'file.json', '/repo/path');
        await flushPromises();

        expect(window.alert).toHaveBeenCalledWith('Error opening diff: fail');
    });
});
