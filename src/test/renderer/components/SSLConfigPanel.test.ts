/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import SSLConfigPanel from '@/renderer/components/SSLConfigPanel.vue';

describe('SSLConfigPanel.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (window as any).electron = {
            ssl: {
                selectCertificateFile: vi.fn().mockResolvedValue('/abs/path/cert.pem')
            },
            fs: {
                makeRelative: vi.fn().mockResolvedValue('certs/cert.pem'),
                readTextFile: vi.fn().mockResolvedValue('dummy content'),
                writeTextFile: vi.fn().mockResolvedValue(undefined)
            }
        };
        vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
    });

    it('renders correctly with initial state', () => {
        const wrapper = mount(SSLConfigPanel, {
            props: { modelValue: { rejectUnauthorized: true, ca: [] } },
            global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
        });

        expect(wrapper.text()).toContain('CA Certificates');
        expect(wrapper.text()).toContain('No Custom CA certificates');
        expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(true);
    });

    it('shows security banner when verification is disabled', () => {
        const wrapper = mount(SSLConfigPanel, {
            props: { modelValue: { rejectUnauthorized: false } },
            global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
        });

        expect(wrapper.find('.security-banner').exists()).toBe(true);
        expect(wrapper.text()).toContain('SSL Verification Disabled');
    });

    it('adds CA certificate', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: { 'file-system': { currentPath: '/project' } }
        });
        const wrapper = mount(SSLConfigPanel, {
            props: { modelValue: { ca: [] } },
            global: { plugins: [pinia] }
        });

        await wrapper.find('.btn-add').trigger('click');
        
        // Wait for async path processing
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(window.electron.ssl.selectCertificateFile).toHaveBeenCalled();
        expect(wrapper.emitted('update:modelValue')?.[0][0].ca).toContain('certs/cert.pem');
    });

    it('removes CA certificate', async () => {
        const wrapper = mount(SSLConfigPanel, {
            props: { modelValue: { ca: ['cert1.pem', 'cert2.pem'] } },
            global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
        });

        await wrapper.findAll('.btn-remove')[0].trigger('click');

        expect(wrapper.emitted('update:modelValue')?.[0][0].ca).toEqual(['cert2.pem']);
    });

    it('toggles rejectUnauthorized', async () => {
        const wrapper = mount(SSLConfigPanel, {
            props: { modelValue: { rejectUnauthorized: true } },
            global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
        });

        const checkbox = wrapper.find('input[type="checkbox"]');
        await checkbox.setValue(false);

        expect(wrapper.emitted('update:modelValue')?.[0][0].rejectUnauthorized).toBe(false);
    });

    it('handles client certificate selection', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: { 'file-system': { currentPath: '/project' } }
        });
        const wrapper = mount(SSLConfigPanel, {
            props: { modelValue: {} },
            global: { plugins: [pinia] }
        });

        await wrapper.findAll('.btn-secondary')[0].trigger('click'); // First browse button is client cert
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(wrapper.emitted('update:modelValue')?.[0][0].clientCert).toBe('certs/cert.pem');
    });
});
