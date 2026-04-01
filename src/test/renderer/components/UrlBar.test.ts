/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import UrlBar from '@/renderer/components/UrlBar.vue';
import { useRequestStore } from '@/renderer/stores/request';

describe('UrlBar.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (window as any).electron = {
            export: {
                generate: vi.fn().mockResolvedValue('mock content'),
                toClipboard: vi.fn().mockResolvedValue(undefined)
            }
        };
        // Mock getBoundingClientRect for toggleExportMenu
        (HTMLElement.prototype as any).getBoundingClientRect = vi.fn(() => ({
            left: 0, top: 0, bottom: 0, right: 0, width: 0, height: 0
        }));
    });

    it('renders with store values', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const store = useRequestStore();
        store.method = 'POST';
        store.url = 'https://api.test';

        const wrapper = mount(UrlBar, {
            global: { plugins: [pinia] }
        });

        expect(wrapper.find('select').element.value).toBe('POST');
        expect(wrapper.find('input[type="text"]').element.value).toBe('https://api.test');
    });

    it('calls store.execute when Send button is clicked', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const store = useRequestStore();
        store.url = 'https://api.test';
        
        const wrapper = mount(UrlBar, {
            global: { plugins: [pinia] }
        });

        await wrapper.find('.urlBar__btn--primary').trigger('click');
        expect(store.execute).toHaveBeenCalled();
    });

    it('toggles export menu', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const wrapper = mount(UrlBar, {
            global: { plugins: [pinia] }
        });

        const exportBtn = wrapper.find('.urlBar__btn--secondary');
        await exportBtn.trigger('click');
        
        expect(wrapper.findComponent({ name: 'ContextMenu' }).exists()).toBe(true);
    });

    it('handles export action curl', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const store = useRequestStore();
        store.method = 'GET';
        store.url = 'http://test.com';
        store.bodyType = 'none';

        const wrapper = mount(UrlBar, {
            global: { plugins: [pinia] }
        });

        // Open menu
        await wrapper.find('.urlBar__btn--secondary').trigger('click');
        
        // Find and click curl option
        const contextMenu = wrapper.getComponent({ name: 'ContextMenu' });
        await contextMenu.vm.$emit('action', { action: 'curl' });
        await flushPromises();

        expect(window.electron.export.generate).toHaveBeenCalled();
        expect(window.electron.export.toClipboard).toHaveBeenCalledWith('mock content');
    });

    it('handles export to file', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const wrapper = mount(UrlBar, {
            global: { plugins: [pinia] }
        });

        await wrapper.find('.urlBar__btn--secondary').trigger('click');
        const contextMenu = wrapper.getComponent({ name: 'ContextMenu' });
        await contextMenu.vm.$emit('action', { action: 'file' });
        
        expect(wrapper.findComponent({ name: 'ExportDialog' }).props('isOpen')).toBe(true);
    });

    it('correctly builds request body for export', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const store = useRequestStore();
        store.method = 'POST';
        store.url = 'http://test.com';
        store.bodyType = 'json';
        store.body = '{"a":1}';

        const wrapper = mount(UrlBar, {
            global: { plugins: [pinia] }
        });

        await wrapper.find('.urlBar__btn--secondary').trigger('click');
        const contextMenu = wrapper.getComponent({ name: 'ContextMenu' });
        await contextMenu.vm.$emit('action', { action: 'curl' });
        
        const expectedBody = { type: 'json', content: { a: 1 } };
        const generateCall = (window.electron.export.generate as any).mock.calls[0][0];
        expect(generateCall.body).toEqual(expectedBody);
    });
});
