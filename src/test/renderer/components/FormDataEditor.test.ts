/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FormDataEditor from '@/renderer/components/FormDataEditor.vue';

// Mock electron
if (typeof window !== 'undefined') {
    (window as any).electron = {
        fs: {
            selectFile: vi.fn().mockResolvedValue('/mock/path.txt')
        }
    };
}

describe('FormDataEditor.vue', () => {
    it('renders initial data and allows adding text pairs', async () => {
        const modelValue = { 'name': 'John' };
        const wrapper = mount(FormDataEditor, {
            props: { modelValue }
        });

        expect(wrapper.findAll('.formDataEditor__row')).toHaveLength(2); // John + empty
        
        const inputs = wrapper.findAll('input.input');
        expect(inputs[0].element.value).toBe('name');
        expect(inputs[1].element.value).toBe('John');

        // Add row
        await inputs[2].setValue('age');
        expect(wrapper.findAll('.formDataEditor__row')).toHaveLength(3);
    });

    it('handles file types and file selection', async () => {
        const modelValue = { 'profile': { type: 'file' as const, path: '/old/path.jpg' } };
        const wrapper = mount(FormDataEditor, {
            props: { modelValue }
        });

        expect(wrapper.find('.file-path').text()).toBe('/old/path.jpg');

        // Change type to text
        const select = wrapper.find('select');
        await select.setValue('text');
        expect(wrapper.find('input[placeholder="Value"]').exists()).toBe(true);

        // Change back to file
        await select.setValue('file');
        
        // Select file
        await wrapper.find('.file-btn').trigger('click');
        expect(window.electron.fs.selectFile).toHaveBeenCalled();
        expect(wrapper.find('.file-path').text()).toBe('/mock/path.txt');
    });

    it('removes pairs and emits correctly', async () => {
        const modelValue = { 'k': 'v' };
        const wrapper = mount(FormDataEditor, {
            props: { modelValue }
        });

        await wrapper.find('.delete-btn').trigger('click');
        expect(wrapper.findAll('.formDataEditor__row')).toHaveLength(1); // only empty row left
        expect(wrapper.emitted('update:modelValue')![0][0]).toEqual({});
    });
});
