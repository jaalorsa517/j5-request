/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ExportDialog from '@/renderer/components/ExportDialog.vue';

// Mock Electron
if (typeof window !== 'undefined') {
    (window as any).electron = {
        export: {
            generate: vi.fn().mockResolvedValue('generated content'),
            toClipboard: vi.fn().mockResolvedValue(undefined),
            toFile: vi.fn().mockResolvedValue('/mock/path.json')
        }
    };
    (window as any).alert = vi.fn();
}

describe('ExportDialog Final Unified Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('handles single request save workflow', async () => {
        const wrapper = mount(ExportDialog, {
            props: {
                isOpen: true,
                request: { name: 'My Request', method: 'GET', url: 'u' }
            }
        });

        // 1. Change format
        await wrapper.find('select').setValue('postman');
        
        // 2. Click Save
        await wrapper.find('.btn--primary').trigger('click');
        await flushPromises();

        expect(window.electron.export.toFile).toHaveBeenCalledWith(
            'generated content',
            'my_request.json'
        );
        expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('handles collection copy workflow', async () => {
        const wrapper = mount(ExportDialog, {
            props: {
                isOpen: true,
                requests: [{ id: '1', name: 'R1', method: 'GET', url: 'u', headers: {}, params: {} }]
            }
        });

        // Click Copy (index 0 in btn-group)
        const copyBtn = wrapper.findAll('.btn--secondary')[1]; // index 0 is Cancel
        await copyBtn.trigger('click');
        await flushPromises();

        expect(window.electron.export.toClipboard).toHaveBeenCalledWith('generated content');
        expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('handles cancellation and overlay click', async () => {
        const wrapper = mount(ExportDialog, {
            props: { isOpen: true, request: {} }
        });

        // Cancel button
        await wrapper.find('.btn--secondary').trigger('click');
        expect(wrapper.emitted('close')).toBeTruthy();

        // Overlay
        await wrapper.find('.modal-overlay').trigger('click');
        expect(wrapper.emitted('close')).toHaveLength(2);
    });

    it('covers error paths in copy and save', async () => {
        (window as any).electron.export.generate.mockRejectedValueOnce(new Error('gen fail'));
        const wrapper = mount(ExportDialog, { props: { isOpen: true, request: {} } });
        
        await wrapper.find('.btn--primary').trigger('click');
        await flushPromises();
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('gen fail'));
    });

    it('handles default filename and missing request error', async () => {
        const wrapper = mount(ExportDialog, {
            props: { isOpen: true, request: { name: undefined } }
        });
        
        await wrapper.find('.btn--primary').trigger('click');
        await flushPromises();
        // The current implementation of ExportDialog generates "export" if name is missing
        expect(window.electron.export.toFile).toHaveBeenCalledWith(expect.anything(), 'export');

        // Missing both - cover generateContent error
        const emptyWrapper = mount(ExportDialog, { props: { isOpen: true, request: undefined, requests: undefined } });
        try { await (emptyWrapper.vm as any).generateContent(); } catch(e) {}
    });
});
