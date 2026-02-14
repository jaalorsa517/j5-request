/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import KeyValueEditor from '@/renderer/components/KeyValueEditor.vue';

describe('KeyValueEditor.vue', () => {
    it('renders initial data and a trailing empty row', () => {
        const modelValue = { 'key1': 'val1' };
        const wrapper = mount(KeyValueEditor, {
            props: { modelValue }
        });

        const rows = wrapper.findAll('.keyValueEditor__row');
        expect(rows).toHaveLength(2); // 1 from props + 1 empty
        
        const inputs = rows[0].findAll('input[type="text"]');
        expect(inputs[0].element.value).toBe('key1');
        expect(inputs[1].element.value).toBe('val1');
    });

    it('adds a new row when the last one is edited', async () => {
        const wrapper = mount(KeyValueEditor, {
            props: { modelValue: {} }
        });

        const initialRows = wrapper.findAll('.keyValueEditor__row');
        expect(initialRows).toHaveLength(1);

        const lastRowInput = initialRows[0].find('input[placeholder="Key"]');
        await lastRowInput.setValue('newKey');
        
        // Vue should trigger handleInput and add row
        expect(wrapper.findAll('.keyValueEditor__row')).toHaveLength(2);
    });

    it('removes a row and emits changes', async () => {
        const wrapper = mount(KeyValueEditor, {
            props: { modelValue: { 'k1': 'v1', 'k2': 'v2' } }
        });

        // Rows: k1, k2, empty. Length 3.
        expect(wrapper.findAll('.keyValueEditor__row')).toHaveLength(3);

        const deleteBtn = wrapper.find('.keyValueEditor__deleteButton');
        await deleteBtn.trigger('click');

        expect(wrapper.findAll('.keyValueEditor__row')).toHaveLength(2);
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        const emitted = wrapper.emitted('update:modelValue')![0][0];
        expect(emitted).toEqual({ 'k2': 'v2' });
    });

    it('updates when checkbox is toggled', async () => {
        const wrapper = mount(KeyValueEditor, {
            props: { modelValue: { 'k1': 'v1' } }
        });

        const checkbox = wrapper.find('input[type="checkbox"]');
        await checkbox.setValue(false);

        expect(wrapper.emitted('update:modelValue')![0][0]).toEqual({});
    });
});
