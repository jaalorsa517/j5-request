/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import MainLayout from '@/renderer/components/MainLayout.vue';

// Mock child components
vi.mock('@/renderer/components/FileTree.vue', () => ({ default: { template: '<div>FileTree</div>' } }));
vi.mock('@/renderer/components/RequestPanel.vue', () => ({ default: { template: '<div>RequestPanel</div>' } }));
vi.mock('@/renderer/components/ResponsePanel.vue', () => ({ default: { template: '<div>ResponsePanel</div>' } }));
vi.mock('@/renderer/components/git/GitPanel.vue', () => ({ default: { template: '<div>GitPanel</div>' } }));
vi.mock('@/renderer/components/git/DiffEditor.vue', () => ({ default: { template: '<div>DiffEditor</div>' } }));
vi.mock('@/renderer/components/EnvironmentSelector.vue', () => ({ default: { template: '<div>EnvSelector</div>' } }));
vi.mock('@/renderer/components/EnvironmentManagerModal.vue', () => ({ default: { template: '<div>EnvModal</div>' } }));
vi.mock('@/renderer/components/ImportModal.vue', () => ({ default: { template: '<div>ImportModal</div>' } }));
vi.mock('@/renderer/components/ContextMenu.vue', () => ({ default: { template: '<div>ContextMenu</div>' } }));
vi.mock('@/renderer/components/ConfirmModal.vue', () => ({ default: { template: '<div>ConfirmModal</div>' } }));
vi.mock('@/renderer/components/ExportDialog.vue', () => ({ default: { template: '<div>ExportDialog</div>' } }));
vi.mock('@/renderer/components/AboutModal.vue', () => ({ default: { template: '<div>AboutModal</div>' } }));
vi.mock('@/renderer/components/RequestTabBar.vue', () => ({ default: { template: '<div>TabBar</div>' } }));

// Mock Electron comprehensively
if (typeof window !== 'undefined') {
    (window as any).electron = {
        fs: { 
            selectFolder: vi.fn().mockResolvedValue('/mock/path'),
            getGlobalsPath: vi.fn().mockResolvedValue('/mock/globals.json'),
            readTextFile: vi.fn().mockResolvedValue('{}'),
            writeFile: vi.fn().mockResolvedValue(undefined),
            readDir: vi.fn().mockResolvedValue([]),
            readFile: vi.fn().mockResolvedValue({}),
            deleteFile: vi.fn().mockResolvedValue(undefined),
            deleteDirectory: vi.fn().mockResolvedValue(undefined),
            readAllRequests: vi.fn().mockResolvedValue([{ id: '1' }])
        },
        git: {
            getFileContent: vi.fn().mockResolvedValue('content'),
            getStatus: vi.fn().mockResolvedValue({ isRepo: true, staged: [], modified: [] })
        },
        app: {
            getInfo: vi.fn().mockResolvedValue({ version: '1.0.0' })
        }
    };
    vi.stubGlobal('navigator', { userAgent: 'Linux' });
}

describe('MainLayout Component Direct VM Coverage', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it('covers methods by direct access', async () => {
        const wrapper = mount(MainLayout);
        const vm = wrapper.vm as any;

        // 1. Filesystem & Modals
        await vm.openFolder();
        vm.openCreateModal();
        vm.newRequestName = 'Req';
        await vm.confirmCreateRequest();
        await vm.saveRequest();
        vm.openImportModal();
        vm.handleImported(1);

        // 2. Context Menu & Actions (Pass MenuItem object)
        const mockFile = { path: '/f.json', name: 'f', type: 'file' };
        vm.handleNodeContextMenu({ clientX: 0, clientY: 0 } as any, mockFile);
        
        await vm.handleContextMenuAction({ label: 'Delete', action: 'delete' });
        expect(vm.showDeleteConfirm).toBe(true);
        await vm.confirmDelete();

        await vm.handleContextMenuAction({ label: 'Export', action: 'export' });
        expect(vm.showExportDialog).toBe(true);

        const mockDir = { path: '/d', name: 'd', type: 'directory' };
        vm.handleNodeContextMenu({ clientX: 0, clientY: 0 } as any, mockDir);
        await vm.handleContextMenuAction({ label: 'Export', action: 'export' });

        // 3. Diff & Tabs
        await vm.handleOpenDiff('f.json', '/repo');
        vm.closeDiff();

        // 4. Activity
        vm.activeActivity = 'git';
        vm.activeActivity = 'explorer';
    });

    it('covers all keyboard shortcuts and escape logic', async () => {
        const wrapper = mount(MainLayout);
        const vm = wrapper.vm as any;

        // Open everything
        vm.showNewRequestModal = true;
        vm.showImportModal = true;
        vm.showExportDialog = true;
        vm.showAboutModal = true;
        vm.showDiff = true;

        const shortcuts = [
            { key: 'Escape', ctrl: false },
            { key: 'Escape', ctrl: false },
            { key: 'Escape', ctrl: false },
            { key: 'Escape', ctrl: false },
            { key: 'Escape', ctrl: false },
            { key: 't', ctrl: true },
            { key: 'w', ctrl: true },
            { key: 's', ctrl: true }
        ];

        shortcuts.forEach(s => {
            const event = new KeyboardEvent('keydown', { key: s.key, ctrlKey: s.ctrl });
            window.dispatchEvent(event);
        });

        expect(vm.showAboutModal).toBe(false);
    });

    it('handles method error branches', async () => {
        const wrapper = mount(MainLayout);
        const vm = wrapper.vm as any;
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        // openFolder error
        (window as any).electron.fs.selectFolder.mockRejectedValueOnce(new Error('fail'));
        await vm.openFolder();

        // export empty dir
        (window as any).electron.fs.readAllRequests.mockResolvedValueOnce([]);
        vm.handleNodeContextMenu({ clientX: 0, clientY: 0 } as any, { type: 'directory', path: 'p' });
        await vm.handleContextMenuAction({ action: 'export' });

        // read file error in export
        (window as any).electron.fs.readFile.mockRejectedValueOnce(new Error('read fail'));
        vm.handleNodeContextMenu({ clientX: 0, clientY: 0 } as any, { type: 'file', path: 'f' });
        await vm.handleContextMenuAction({ action: 'export' });

        // delete error
        (window as any).electron.fs.deleteFile.mockRejectedValueOnce(new Error('del fail'));
        vm.itemToDelete = { path: 'p', type: 'file' };
        await vm.confirmDelete();

        // open diff error
        (window as any).electron.fs.readTextFile.mockRejectedValueOnce(new Error('diff fail'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        await vm.handleOpenDiff('f', 'r');
        consoleSpy.mockRestore();

        expect(alertSpy).toHaveBeenCalled();
        alertSpy.mockRestore();
    });
});
