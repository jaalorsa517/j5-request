/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import UrlBar from '@/renderer/components/UrlBar.vue';
import { useRequestStore } from '@/renderer/stores/request';

// Mock child components
vi.mock('@/renderer/components/ContextMenu.vue', () => ({ default: { template: '<div>ContextMenu</div>' } }));
vi.mock('@/renderer/components/ExportDialog.vue', () => ({ default: { template: '<div>ExportDialog</div>' } }));

// Mock Electron
if (typeof window !== 'undefined') {
    (window as any).electron = {
        export: {
            generate: vi.fn().mockResolvedValue('content'),
            toClipboard: vi.fn().mockResolvedValue(undefined)
        }
    };
}

describe('UrlBar Final Coverage', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it('syncs method and url with store', async () => {
        const store = useRequestStore();
        const wrapper = mount(UrlBar);

        // Method
        const select = wrapper.find('.urlBar__method');
        await select.setValue('PATCH');
        expect(store.method).toBe('PATCH');

        // URL
        const input = wrapper.find('.urlBar__input');
        await input.setValue('http://test.com');
        expect(store.url).toBe('http://test.com');

        // Send
        const sendBtn = wrapper.find('.urlBar__btn--primary');
        await sendBtn.trigger('click');
        // Verified by store call line coverage
    });

    it('handles export menu and actions', async () => {
        const store = useRequestStore();
        store.url = 'http://api.com';
        store.bodyType = 'json';
        store.body = '{"a":1}';
        
        const wrapper = mount(UrlBar);
        const vm = wrapper.vm as any;

        // Toggle menu
        const exportBtn = wrapper.find('.urlBar__btn--secondary');
        // Mock getBoundingClientRect for toggleExportMenu
        exportBtn.element.getBoundingClientRect = vi.fn().mockReturnValue({ left: 0, bottom: 0 });
        await exportBtn.trigger('click');
        expect(vm.showExportMenu).toBe(true);

        // Handle Export Action (curl)
        await vm.handleExportAction({ label: 'cURL', action: 'curl' });
        expect(window.electron.export.generate).toHaveBeenCalled();

        // Handle Export Action (file)
        await vm.handleExportAction({ label: 'File', action: 'file' });
        expect(vm.showExportDialog).toBe(true);
    });

    it('covers getRequestBody branches', async () => {
        const store = useRequestStore();
        const wrapper = mount(UrlBar);
        const vm = wrapper.vm as any;

        // json success
        store.bodyType = 'json';
        store.body = '{"x":1}';
        expect(vm.getRequestBody().content).toEqual({x:1});

        // json fail
        store.body = 'invalid';
        expect(vm.getRequestBody().content).toBe('invalid');

        // form-data
        store.bodyType = 'form-data';
        store.bodyFormData = { k: 'v' };
        expect(vm.getRequestBody().content).toEqual({k:'v'});

        // none
        store.bodyType = 'none';
        expect(vm.getRequestBody()).toBeUndefined();

        // other (raw)
        store.bodyType = 'text';
        store.body = 'txt';
        expect(vm.getRequestBody().type).toBe('raw');
    });

    it('handles export failure gracefully', async () => {
        const store = useRequestStore();
        store.url = 'u';
        (window as any).electron.export.generate.mockRejectedValueOnce(new Error('fail'));
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        
        const wrapper = mount(UrlBar);
        await (wrapper.vm as any).handleExportAction({ label: 'cURL', action: 'curl' });
        
        expect(alertSpy).toHaveBeenCalled();
        alertSpy.mockRestore();
    });

    it('shows copy notification success', async () => {
        vi.useFakeTimers();
        const wrapper = mount(UrlBar);
        const vm = wrapper.vm as any;
        
        // Setup ref
        const btn = document.createElement('button');
        btn.innerText = 'Exportar';
        vm.exportButtonRef = btn;

        await vm.handleExportAction({ label: 'cURL', action: 'curl' });
        expect(btn.innerText).toBe('¡Copiado!');
        
        vi.runAllTimers();
        expect(btn.innerText).toBe('Exportar');
        vi.useRealTimers();
    });
});
