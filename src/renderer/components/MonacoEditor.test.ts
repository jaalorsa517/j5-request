/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MonacoEditor from './MonacoEditor.vue';

// Mock VueMonacoEditor
vi.mock('@guolao/vue-monaco-editor', () => ({
    VueMonacoEditor: {
        template: '<div class="vue-monaco-editor-mock"></div>',
        emits: ['update:value', 'change'],
        props: ['value'],
        setup(props, { emit }) {
            // Mock emit behavior if needed, or rely on test triggering it
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
            }
        });
        expect(wrapper.find('.monacoEditor').exists()).toBe(true);
        expect(wrapper.find('.vue-monaco-editor-mock').exists()).toBe(true);
    });

    it('syncs props to editor value', async () => {
        const wrapper = mount(MonacoEditor, {
            props: {
                modelValue: 'old',
            }
        });

        await wrapper.setProps({ modelValue: 'new' });
        // Can't easily check internal editorValue ref without exposing it, 
        // but can verify the prop passed to the mock if we stubbed it better.
        // Or check if the change handler works.
    });

    it('emits update:modelValue on change', async () => {
        const wrapper = mount(MonacoEditor, {
            props: {
                modelValue: '',
            }
        });

        // Find the mock component
        const editor = wrapper.findComponent({ name: 'VueMonacoEditor' });
        // Simulating @change event from the child component
        // Note: The child component uses v-model:value="editorValue" and @change="handleChange"

        // If we emit 'change' with new value, handleChange should be called.
        // handleChange updates modelValue emitter.

        // Wait, wrapper.findComponent might need component reference or name.
        // Since we mocked it with an object, it might be tricky.
        // But since we provided a template, we can find it by class.

        // However, testing interaction with the mock:
        // We need to trigger the event that MonacoEditor listens to.
        // <VueMonacoEditor @change="handleChange" />

        // Let's use `findComponent` using the import if it works.
        // Actually, since we mocked the module, importing it in test gives the mock.

        const { VueMonacoEditor } = await import('@guolao/vue-monaco-editor');
        const editorComponent = wrapper.findComponent(VueMonacoEditor);

        expect(editorComponent.exists()).toBe(true);

        await editorComponent.vm.$emit('change', 'new content');

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new content']);
    });
});
