/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import DiffEditor from '@/renderer/components/git/DiffEditor.vue';

// Mock Monaco Diff Editor
vi.mock('@guolao/vue-monaco-editor', () => ({
    VueMonacoDiffEditor: {
        template: '<div class="vue-monaco-diff-editor-mock"></div>',
        props: ['original', 'modified', 'language', 'theme', 'options']
    }
}));

describe('DiffEditor.vue', () => {
    it('renders and passes props to monaco', () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                theme: { theme: 'dark' }
            }
        });

        const wrapper = mount(DiffEditor, {
            props: {
                original: 'old',
                modified: 'new',
                language: 'json'
            },
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.find('.diff-editor-container').exists()).toBe(true);
        expect(wrapper.find('.vue-monaco-diff-editor-mock').exists()).toBe(true);
    });
});
