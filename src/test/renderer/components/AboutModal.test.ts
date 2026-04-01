/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AboutModal from '@/renderer/components/AboutModal.vue';

// Mock Electron comprehensively
if (typeof window !== 'undefined') {
    (window as any).electron = {
        app: {
            getInfo: vi.fn().mockResolvedValue({ 
                name: 'J5-Request', 
                version: '1.0.0', 
                author: 'jaalorsa', 
                description: 'desc' 
            }),
            openExternal: vi.fn().mockResolvedValue(undefined),
            checkForUpdates: vi.fn().mockResolvedValue(undefined),
            onUpdaterStatus: vi.fn(() => () => {})
        }
    };
}

describe('AboutModal Definitive Fix', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('displays version and handles external links', async () => {
        const wrapper = mount(AboutModal, { props: { isOpen: true } });
        await flushPromises();
        
        expect(wrapper.text()).toContain('1.0.0');

        // Donation (primary)
        await wrapper.find('.aboutModal__actionBtn.primary').trigger('click');
        expect((window as any).electron.app.openExternal).toHaveBeenCalledWith(expect.stringContaining('paypal.me'));
    });

    it('handles update check and events', async () => {
        let statusCallback: any;
        ((window as any).electron.app.onUpdaterStatus as any).mockImplementation((cb: any) => {
            statusCallback = cb;
            return () => {};
        });

        const wrapper = mount(AboutModal, { props: { isOpen: true } });
        await flushPromises();

        // Check Btn
        await wrapper.find('.aboutModal__updateBtn').trigger('click');
        expect((window as any).electron.app.checkForUpdates).toHaveBeenCalled();

        // Status Event
        if (statusCallback) {
            statusCallback('downloading', 50);
            await wrapper.vm.$nextTick();
            expect(wrapper.text()).toContain('Descargando: 50%');
        }
    });

    it('opens issue report', async () => {
        const wrapper = mount(AboutModal, { props: { isOpen: true } });
        await flushPromises();
        await wrapper.find('.aboutModal__actionBtn.secondary').trigger('click');
        expect((window as any).electron.app.openExternal).toHaveBeenCalledWith(expect.stringContaining('issues/new'));
    });
});
