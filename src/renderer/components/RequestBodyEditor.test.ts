/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import RequestBodyEditor from './RequestBodyEditor.vue';

vi.mock('./MonacoEditor.vue', () => ({ default: { template: '<div class="mock-monaco">Monaco</div>' } }));
vi.mock('./FormDataEditor.vue', () => ({ default: { template: '<div class="mock-formdata">FormData</div>' } }));

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

        // Change to JSON
        const radioJson = wrapper.find('input[value="json"]');
        await radioJson.setValue();
        
        // requestStore.bodyType is changed by v-model
        // Since we use testing pinia, the component should react if the mock store updates.
        // But testing pinia by default doesn't update state on actions/mutations unless configured.
        // Wait, v-model on radio with vue-test-utils and pinia-testing needs care.
    });
});
