/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import GitPanel from './GitPanel.vue';
import { useGitStore } from '../../stores/git';
import { useFileSystemStore } from '../../stores/file-system';

// Mock child components
vi.mock('./GitRepositoryItem.vue', () => ({ 
    default: { 
        name: 'GitRepositoryItem',
        template: '<div class="mock-repo">Repo</div>',
        emits: ['checkout', 'refresh']
    } 
}));
vi.mock('./GitChangesList.vue', () => ({ 
    default: { 
        name: 'GitChangesList',
        template: '<div class="mock-changes">Changes</div>',
        emits: ['stage', 'unstage', 'openDiff']
    } 
}));
vi.mock('./GitCommitBox.vue', () => ({ 
    default: { 
        name: 'GitCommitBox',
        template: '<div class="mock-commit">Commit</div>',
        emits: ['commit', 'sync']
    } 
}));

describe('GitPanel.vue', () => {
    it('renders empty state when no repo is selected', () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                git: { selectedRepo: null, loading: false }
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

    it('handles checkout event', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                git: { selectedRepo: '/path', status: { current: 'main' } }
            }
        });
        const wrapper = mount(GitPanel, { global: { plugins: [pinia] } });
        const store = useGitStore();
        
        const repoItem = wrapper.getComponent({ name: 'GitRepositoryItem' });
        await repoItem.vm.$emit('checkout', 'dev');
        expect(store.checkout).toHaveBeenCalledWith('dev');
    });

    it('handles commit event', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                git: { selectedRepo: '/path', status: { current: 'main' } }
            }
        });
        const wrapper = mount(GitPanel, { global: { plugins: [pinia] } });
        const store = useGitStore();
        
        const commitBox = wrapper.getComponent({ name: 'GitCommitBox' });
        await commitBox.vm.$emit('commit', 'msg');
        expect(store.commit).toHaveBeenCalledWith('msg');

        await commitBox.vm.$emit('sync');
        expect(store.sync).toHaveBeenCalled();
    });

    it('handles retry button when empty', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                git: { selectedRepo: '' },
                'file-system': { currentPath: '/some/path' }
            }
        });
        const wrapper = mount(GitPanel, { global: { plugins: [pinia] } });
        const store = useGitStore();

        await wrapper.find('.git-btn-retry').trigger('click');
        expect(store.loadRepositories).toHaveBeenCalledWith('/some/path');
    });

    it('calls loadRepositories on mounted if currentPath exists', () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                'file-system': { currentPath: '/some/path' }
            }
        });
        mount(GitPanel, { global: { plugins: [pinia] } });
        const store = useGitStore();
        expect(store.loadRepositories).toHaveBeenCalledWith('/some/path');
    });

    it('watches currentPath and reloads repositories', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                'file-system': { currentPath: '' }
            }
        });
        const wrapper = mount(GitPanel, { global: { plugins: [pinia] } });
        const fsStore = useFileSystemStore();
        const gitStore = useGitStore();

        (fsStore as any).currentPath = '/new/path';
        await wrapper.vm.$nextTick();
        
        expect(gitStore.loadRepositories).toHaveBeenCalledWith('/new/path');
    });

    it('handles stage and unstage events', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                git: { selectedRepo: '/path', status: { current: 'main' } }
            }
        });
        const wrapper = mount(GitPanel, { global: { plugins: [pinia] } });
        const store = useGitStore();
        
        const changesList = wrapper.getComponent({ name: 'GitChangesList' });
        await changesList.vm.$emit('stage', ['f1']);
        expect(store.stage).toHaveBeenCalledWith(['f1']);

        await changesList.vm.$emit('unstage', ['f1']);
        expect(store.unstage).toHaveBeenCalledWith(['f1']);
    });

    it('emits openDiff when handleOpenDiff is called', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                git: { selectedRepo: '/repo/path', status: { current: 'main' } }
            }
        });
        const wrapper = mount(GitPanel, { global: { plugins: [pinia] } });
        
        const changesList = wrapper.getComponent({ name: 'GitChangesList' });
        await changesList.vm.$emit('openDiff', 'file.txt');

        expect(wrapper.emitted('openDiff')).toBeTruthy();
        expect(wrapper.emitted('openDiff')![0]).toEqual(['file.txt', '/repo/path']);
    });
});
