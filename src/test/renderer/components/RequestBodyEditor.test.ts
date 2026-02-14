/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import RequestBodyEditor from '@/renderer/components/RequestBodyEditor.vue';

vi.mock('@/renderer/components/MonacoEditor.vue', () => ({ 
    default: { 
        template: '<div class="mock-monaco">{{ language }}</div>',
        props: ['language']
    } 
}));
vi.mock('@/renderer/components/FormDataEditor.vue', () => ({ default: { template: '<div class="mock-formdata">FormData</div>' } }));

describe('RequestBodyEditor.vue', () => {
    it('renders radio buttons and switches content', async () => {
        const pinia = createTestingPinia({ 
            createSpy: vi.fn,
            initialState: {
                request: {
                    tabs: [{
                        id: '1',
                        request: { bodyType: 'none', body: '', bodyFormData: {} }
                    }],
                    activeTabId: '1'
                }
            }
        });

        const wrapper = mount(RequestBodyEditor, {
            global: { plugins: [pinia] }
        });

        // Initial: none
        expect(wrapper.text()).toContain('This request has no body');

        // Click each radio button to trigger v-model functions
        const radios = wrapper.findAll('input[type="radio"]');
        for (const radio of radios) {
            await radio.setValue();
        }
    });

    it('renders json editor', () => {
        const pinia = createTestingPinia({ 
            createSpy: vi.fn,
            initialState: {
                request: {
                    tabs: [{
                        id: '1',
                        request: { bodyType: 'json', body: '{}' }
                    }],
                    activeTabId: '1'
                }
            }
        });
        const wrapper = mount(RequestBodyEditor, { global: { plugins: [pinia] } });
        expect(wrapper.find('.mock-monaco').text()).toBe('json');
    });

    it('renders xml editor', () => {
        const pinia = createTestingPinia({ 
            createSpy: vi.fn,
            initialState: {
                request: {
                    tabs: [{
                        id: '1',
                        request: { bodyType: 'xml', body: '<xml/>' }
                    }],
                    activeTabId: '1'
                }
            }
        });
        const wrapper = mount(RequestBodyEditor, { global: { plugins: [pinia] } });
        expect(wrapper.find('.mock-monaco').text()).toBe('xml');
    });

    it('renders default text editor', () => {
        const pinia = createTestingPinia({ 
            createSpy: vi.fn,
            initialState: {
                request: {
                    tabs: [{
                        id: '1',
                        request: { bodyType: 'text', body: 'text' }
                    }],
                    activeTabId: '1'
                }
            }
        });
        const wrapper = mount(RequestBodyEditor, { global: { plugins: [pinia] } });
        expect(wrapper.find('.mock-monaco').text()).toBe('plaintext');
    });

    it('renders form-data editor', () => {
        const pinia = createTestingPinia({ 
            createSpy: vi.fn,
            initialState: {
                request: {
                    tabs: [{
                        id: '1',
                        request: { bodyType: 'form-data', bodyFormData: {} }
                    }],
                    activeTabId: '1'
                }
            }
        });
        const wrapper = mount(RequestBodyEditor, { global: { plugins: [pinia] } });
        expect(wrapper.find('.mock-formdata').exists()).toBe(true);
    });
});
