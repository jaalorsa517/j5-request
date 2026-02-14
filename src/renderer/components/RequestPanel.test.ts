/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import RequestPanel from './RequestPanel.vue';

// Mock child components to keep it simple and avoid Monaco issues
vi.mock('./UrlBar.vue', () => ({ default: { template: '<div id="mock-urlbar">UrlBar</div>' } }));
vi.mock('./RequestTabs.vue', () => ({ 
    default: { 
        template: '<div id="mock-tabs"><slot name="params"/><slot name="headers"/><slot name="body"/><slot name="pre-request"/><slot name="tests"/></div>' 
    } 
}));
vi.mock('./KeyValueEditor.vue', () => ({ default: { template: '<div class="mock-kv">KV</div>' } }));
vi.mock('./RequestBodyEditor.vue', () => ({ default: { template: '<div id="mock-body">Body</div>' } }));
vi.mock('./MonacoEditor.vue', () => ({ default: { template: '<div class="mock-monaco">Monaco</div>' } }));

describe('RequestPanel.vue', () => {
    it('renders and provides slots to tabs', () => {
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
        expect(wrapper.findAll('.mock-kv')).toHaveLength(2); // params and headers
        expect(wrapper.find('#mock-body').exists()).toBe(true);
        expect(wrapper.findAll('.mock-monaco')).toHaveLength(2); // pre and post scripts
    });
});
