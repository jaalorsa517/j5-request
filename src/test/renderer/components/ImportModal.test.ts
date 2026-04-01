/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ImportModal from '@/renderer/components/ImportModal.vue';

describe('ImportModal.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (window as any).electron = {
            import: {
                detectFormat: vi.fn().mockResolvedValue({ format: 'curl', confidence: 0.9 }),
                fromContent: vi.fn().mockResolvedValue({ success: true, requests: [{ name: 'Req' }], errors: [], warnings: [] })
            },
            fs: {
                selectFile: vi.fn().mockResolvedValue('/path/file.txt'),
                readTextFile: vi.fn().mockResolvedValue('curl https://api.com'),
                saveRequests: vi.fn().mockResolvedValue(['/saved/1']),
                openDirectory: vi.fn().mockResolvedValue(undefined)
            }
        };
    });

    it('switches tabs', async () => {
        const wrapper = mount(ImportModal, {
            global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
        });

        const tabs = wrapper.findAll('.importModal__tab');
        await tabs[1].trigger('click');
        expect(wrapper.find('.importModal__filePicker').exists()).toBe(true);

        await tabs[0].trigger('click');
        expect(wrapper.find('.importModal__textarea').exists()).toBe(true);
    });

    it('detects format on input', async () => {
        const wrapper = mount(ImportModal, {
            global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
        });

        const textarea = wrapper.find('.importModal__textarea');
        await textarea.setValue('curl test');
        await flushPromises();

        expect(window.electron.import.detectFormat).toHaveBeenCalledWith('curl test');
        expect(wrapper.text()).toContain('cURL');
    });

    it('performs import from paste', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: { 'file-system': { currentPath: '/work' } }
        });
        const wrapper = mount(ImportModal, {
            global: { plugins: [pinia] }
        });

        await wrapper.find('.importModal__textarea').setValue('curl test');
        await wrapper.find('.importModal__button--primary').trigger('click');
        
        await flushPromises();

        expect(window.electron.import.fromContent).toHaveBeenCalled();
        expect(window.electron.fs.saveRequests).toHaveBeenCalled();
        expect(wrapper.text()).toContain('archivo(s) guardado(s)');
    });

    it('handles file selection and import', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: { 'file-system': { currentPath: '/work' } }
        });
        const wrapper = mount(ImportModal, {
            global: { plugins: [pinia] }
        });

        // Go to file tab
        await wrapper.findAll('.importModal__tab')[1].trigger('click');
        
        // Click select file button
        await wrapper.find('.importModal__filePicker button').trigger('click');
        await flushPromises();

        expect(window.electron.fs.selectFile).toHaveBeenCalled();
        expect(window.electron.fs.readTextFile).toHaveBeenCalledWith('/path/file.txt');

        // Click import
        await wrapper.find('.importModal__button--primary').trigger('click');
        await flushPromises();

        expect(window.electron.import.fromContent).toHaveBeenCalled();
    });

    it('shows error if no folder is open', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: { 'file-system': { currentPath: null } }
        });
        const wrapper = mount(ImportModal, {
            global: { plugins: [pinia] }
        });

        await wrapper.find('.importModal__textarea').setValue('data');
        await wrapper.find('.importModal__button--primary').trigger('click');
        await flushPromises();

        expect(wrapper.text()).toContain('Debes tener una carpeta abierta');
    });
});
