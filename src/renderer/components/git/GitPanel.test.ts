/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import GitPanel from './GitPanel.vue';

// Mock subcomponents
vi.mock('./GitRepositoryItem.vue', () => ({ default: { template: '<div class="mock-repo">RepoItem</div>' } }));
vi.mock('./GitChangesList.vue', () => ({ default: { template: '<div class="mock-changes">Changes</div>' } }));
vi.mock('./GitCommitBox.vue', () => ({ default: { template: '<div class="mock-commit">CommitBox</div>' } }));

describe('GitPanel.vue', () => {
    it('renders empty message when no repo selected', () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                git: { selectedRepo: '', loading: false, status: null }
            }
        });

        const wrapper = mount(GitPanel, { global: { plugins: [pinia] } });
        expect(wrapper.text()).toContain('No git repository found');
    });

    it('renders git content when repo is selected', () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                git: { selectedRepo: '/path/to/repo', loading: false, status: { current: 'main' } }
            }
        });

        const wrapper = mount(GitPanel, { global: { plugins: [pinia] } });
        expect(wrapper.find('.mock-repo').exists()).toBe(true);
        expect(wrapper.find('.mock-changes').exists()).toBe(true);
        expect(wrapper.find('.mock-commit').exists()).toBe(true);
    });
});
