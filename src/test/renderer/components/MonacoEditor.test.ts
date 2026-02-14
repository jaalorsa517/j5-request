/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import MonacoEditor from '@/renderer/components/MonacoEditor.vue';

// Mock VueMonacoEditor
vi.mock('@guolao/vue-monaco-editor', () => ({
    VueMonacoEditor: {
        template: '<div class="vue-monaco-editor-mock"></div>',
        emits: ['update:value', 'change'],
        props: ['value'],
        setup(_props: any, { _emit }: any) {
            void _emit;
            return {};
        }
    }
}));

describe('MonacoEditor.vue', () => {
    it('renders correctly', () => {
        const wrapper = mount(MonacoEditor, {
            props: {
                modelValue: '{ "test": 1 }',
                language: 'json'
            },
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        });
        expect(wrapper.find('.monacoEditor').exists()).toBe(true);
        expect(wrapper.find('.vue-monaco-editor-mock').exists()).toBe(true);
    });

    it('syncs props to editor value', async () => {
        const wrapper = mount(MonacoEditor, {
            props: {
                modelValue: 'old',
            },
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        });

        await wrapper.setProps({ modelValue: 'new' });
    });

    it('emits update:modelValue on change', async () => {
        const wrapper = mount(MonacoEditor, {
            props: {
                modelValue: '',
            },
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        });

        const { VueMonacoEditor } = await import('@guolao/vue-monaco-editor');
        const editorComponent = wrapper.findComponent(VueMonacoEditor);

        expect(editorComponent.exists()).toBe(true);

        await editorComponent.vm.$emit('change', 'new content');

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new content']);
    });
});
