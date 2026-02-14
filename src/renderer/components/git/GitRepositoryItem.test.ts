/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GitRepositoryItem from './GitRepositoryItem.vue';

describe('GitRepositoryItem.vue', () => {
    it('renders repo info and emits events', async () => {
        const wrapper = mount(GitRepositoryItem, {
            props: {
                repoPath: '/repo/path',
                currentBranch: 'main',
                branches: ['main', 'dev']
            }
        });

        expect(wrapper.text()).toContain('path');
        expect(wrapper.text()).toContain('main');

        // Change branch
        const select = wrapper.find('.git-repo-item__select');
        await select.setValue('dev');
        expect(wrapper.emitted('checkout')).toBeTruthy();
        expect(wrapper.emitted('checkout')![0]).toEqual(['dev']);

        // Click refresh
        await wrapper.find('.git-repo-item__action-btn').trigger('click');
        expect(wrapper.emitted('refresh')).toBeTruthy();
    });
});
