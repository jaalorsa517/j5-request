/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import RequestPanel from '@/renderer/components/RequestPanel.vue';
import { useRequestStore } from '@/renderer/stores/request';

// Mock child components to keep it simple and avoid Monaco issues
vi.mock('@/renderer/components/UrlBar.vue', () => ({ default: { template: '<div id="mock-urlbar">UrlBar</div>' } }));
vi.mock('@/renderer/components/RequestTabs.vue', () => ({ 
    default: { 
        template: '<div id="mock-tabs"><slot name="params"/><slot name="headers"/><slot name="body"/><slot name="pre-request"/><slot name="tests"/></div>' 
    } 
}));
vi.mock('@/renderer/components/KeyValueEditor.vue', () => ({ 
    default: { 
        name: 'KeyValueEditor',
        template: '<div class="mock-kv">KV</div>',
        emits: ['update:modelValue']
    } 
}));
vi.mock('@/renderer/components/RequestBodyEditor.vue', () => ({ default: { template: '<div id="mock-body">Body</div>' } }));
vi.mock('@/renderer/components/MonacoEditor.vue', () => ({ 
    default: { 
        name: 'MonacoEditor',
        template: '<div class="mock-monaco">Monaco</div>',
        emits: ['update:modelValue']
    } 
}));

describe('RequestPanel.vue', () => {
    it('renders and covers update events', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                request: {
                    params: {},
                    headers: {},
                    preRequestScript: '',
                    postResponseScript: ''
                }
            }
        });

        const wrapper = mount(RequestPanel, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.find('#mock-urlbar').exists()).toBe(true);
        expect(wrapper.find('#mock-tabs').exists()).toBe(true);

        const store = useRequestStore();
        
        // Test updates to cover anonymous functions in template
        const kvEditors = wrapper.findAllComponents({ name: 'KeyValueEditor' });
        await kvEditors[0].vm.$emit('update:modelValue', { p1: 'v1' });
        expect(store.params).toEqual({ p1: 'v1' });

        await kvEditors[1].vm.$emit('update:modelValue', { h1: 'v1' });
        expect(store.headers).toEqual({ h1: 'v1' });

        const monacoEditors = wrapper.findAllComponents({ name: 'MonacoEditor' });
        await monacoEditors[0].vm.$emit('update:modelValue', 'pre');
        expect(store.preRequestScript).toBe('pre');

        await monacoEditors[1].vm.$emit('update:modelValue', 'post');
        expect(store.postResponseScript).toBe('post');
    });
});
