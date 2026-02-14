/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import RequestEditor from './RequestEditor.vue';
import { useFileSystemStore } from '../stores/file-system';

describe('RequestEditor.vue', () => {
    it('renders empty state', () => {
        const pinia = createTestingPinia({ 
            createSpy: vi.fn,
            initialState: { 'file-system': { selectedFile: null } } 
        });
        const wrapper = mount(RequestEditor, { global: { plugins: [pinia] } });
        expect(wrapper.text()).toContain('Select a request definition file');
    });

    it('renders editor and triggers save', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
            initialState: {
                'file-system': {
                    selectedFile: { name: 'Test', method: 'GET', url: 'http://test.com' }
                }
            }
        });
        const wrapper = mount(RequestEditor, { global: { plugins: [pinia] } });
        
        expect(wrapper.text()).toContain('Test');
        
        // Trigger v-model updates
        await wrapper.find('.method-select').setValue('POST');
        await wrapper.find('.url-input').setValue('http://new.com');

        const store = useFileSystemStore();
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        
        await wrapper.find('.save-btn').trigger('click');
        expect(store.saveRequest).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith('Saved!');
    });
});
