/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GitChangesList from './GitChangesList.vue';

describe('GitChangesList.vue', () => {
    it('renders changes and emits events', async () => {
        const status = {
            changed: ['mod.txt'],
            staged: ['staged.txt'],
            untracked: ['new.txt'],
            current: 'main'
        };
        const wrapper = mount(GitChangesList, {
            props: { status }
        });

        expect(wrapper.text()).toContain('mod.txt');
        expect(wrapper.text()).toContain('staged.txt');
        expect(wrapper.text()).toContain('new.txt');

        // Click stage
        const changeItems = wrapper.findAll('.git-file-item');
        const untrackedItem = changeItems.find(i => i.text().includes('new.txt'));
        await untrackedItem?.find('.git-item-action').trigger('click');
        expect(wrapper.emitted('stage')).toBeTruthy();

        // Click unstage
        const stagedItem = changeItems.find(i => i.text().includes('staged.txt'));
        await stagedItem?.find('.git-item-action').trigger('click');
        expect(wrapper.emitted('unstage')).toBeTruthy();

        // Stage All
        await wrapper.find('button[title="Stage All"]').trigger('click');
        expect(wrapper.emitted('stage')!.length).toBe(2);

        // Unstage All
        await wrapper.find('button[title="Unstage All"]').trigger('click');
        expect(wrapper.emitted('unstage')!.length).toBe(2);

        // Click file name to open diff
        await wrapper.find('.git-file-name').trigger('click');
        expect(wrapper.emitted('openDiff')).toBeTruthy();
    });
});
