/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AboutModal from '@/renderer/components/AboutModal.vue';

describe('AboutModal.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (window as any).electron = {
            app: {
                getInfo: vi.fn().mockResolvedValue({
                    name: 'J5-Request',
                    version: '1.2.3',
                    author: 'jaalorsa',
                    description: 'Test Description'
                }),
                openExternal: vi.fn(),
                checkForUpdates: vi.fn(),
                onUpdaterStatus: vi.fn(() => vi.fn())
            }
        };
    });

    it('renders app info when open', async () => {
        const wrapper = mount(AboutModal, {
            props: { isOpen: true }
        });

        // Wait for onMounted info fetch
        await new Promise(resolve => setTimeout(resolve, 0));
        await wrapper.vm.$nextTick();

        expect(wrapper.text()).toContain('J5-Request');
        expect(wrapper.text()).toContain('1.2.3');
        expect(wrapper.text()).toContain('jaalorsa');
    });

    it('calls openExternal when donation button is clicked', async () => {
        const wrapper = mount(AboutModal, {
            props: { isOpen: true }
        });
        
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const donateBtn = wrapper.findAll('.aboutModal__actionBtn').find(b => b.text().includes('Donar'));
        await donateBtn?.trigger('click');

        expect(window.electron.app.openExternal).toHaveBeenCalledWith(expect.stringContaining('paypal.me'));
    });

    it('calls checkForUpdates when update button is clicked', async () => {
        const wrapper = mount(AboutModal, {
            props: { isOpen: true }
        });

        const updateBtn = wrapper.find('.aboutModal__updateBtn');
        await updateBtn.trigger('click');

        expect(window.electron.app.checkForUpdates).toHaveBeenCalled();
    });

    it('displays updater status correctly', async () => {
        let statusCallback: any;
        (window.electron.app.onUpdaterStatus as any).mockImplementation((cb: any) => {
            statusCallback = cb;
            return vi.fn();
        });

        const wrapper = mount(AboutModal, {
            props: { isOpen: true }
        });

        await new Promise(resolve => setTimeout(resolve, 0));

        // Simulate downloading
        statusCallback('downloading', 45);
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain('Descargando: 45%');

        // Simulate ready
        statusCallback('ready');
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain('Actualización lista');
    });

    it('emits close when close button is clicked', async () => {
        const wrapper = mount(AboutModal, {
            props: { isOpen: true }
        });

        await wrapper.find('.aboutModal__close').trigger('click');
        expect(wrapper.emitted()).toHaveProperty('close');
    });
});
