/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GitCommitBox from '@/renderer/components/git/GitCommitBox.vue';

describe('GitCommitBox.vue', () => {
    it('emits commit event when button is clicked', async () => {
        const wrapper = mount(GitCommitBox);
        const input = wrapper.find('.git-commit-box__input');
        await input.setValue('feat: test');
        
        await wrapper.find('.git-commit-box__btn--primary').trigger('click');
        expect(wrapper.emitted('commit')).toBeTruthy();
        expect(wrapper.emitted('commit')![0]).toEqual(['feat: test']);
        expect(input.element.value).toBe(''); // cleared after commit
    });

    it('emits sync event when button is clicked', async () => {
        const wrapper = mount(GitCommitBox);
        await wrapper.find('.git-commit-box__btn--secondary').trigger('click');
        expect(wrapper.emitted('sync')).toBeTruthy();
    });
});
