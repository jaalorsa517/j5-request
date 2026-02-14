import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGitStore } from '@/renderer/stores/git';

// Mock window.electron
const mockGit = {
    findRepos: vi.fn(),
    getStatus: vi.fn(),
    stage: vi.fn(),
    unstage: vi.fn(),
    commit: vi.fn(),
    push: vi.fn(),
    pull: vi.fn(),
    checkout: vi.fn(),
    getBranches: vi.fn(),
};

vi.stubGlobal('window', {
    electron: {
        git: mockGit
    }
});

describe('Git Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it('should initialize with default state', () => {
        const store = useGitStore();
        expect(store.repositories).toEqual([]);
        expect(store.selectedRepo).toBe('');
        expect(store.loading).toBe(false);
    });

    it('should load repositories and select first one', async () => {
        const store = useGitStore();
        const repos = ['/path/to/repo1', '/path/to/repo2'];
        mockGit.findRepos.mockResolvedValue(repos);
        mockGit.getStatus.mockResolvedValue({ current: 'main' });
        mockGit.getBranches.mockResolvedValue(['main']);

        await store.loadRepositories('/path/to/workspace');

        expect(mockGit.findRepos).toHaveBeenCalledWith('/path/to/workspace');
        expect(store.repositories).toEqual(repos);
        expect(store.selectedRepo).toBe(repos[0]);
        expect(mockGit.getStatus).toHaveBeenCalledWith(repos[0]);
    });

    it('should select repo', async () => {
        const store = useGitStore();
        store.repositories = ['/repo1', '/repo2'];
        mockGit.getStatus.mockResolvedValue({ current: 'dev' });
        mockGit.getBranches.mockResolvedValue(['main', 'dev']);

        await store.selectRepo('/repo2');

        expect(store.selectedRepo).toBe('/repo2');
        expect(mockGit.getStatus).toHaveBeenCalledWith('/repo2');
        expect(store.currentBranch).toBe('dev');
    });

    it('should checkout branch', async () => {
        const store = useGitStore();
        store.selectedRepo = '/repo1';
        mockGit.getStatus.mockResolvedValue({ current: 'feature' });
        mockGit.getBranches.mockResolvedValue(['main', 'feature']);

        await store.checkout('feature');

        expect(mockGit.checkout).toHaveBeenCalledWith('/repo1', 'feature');
        expect(store.currentBranch).toBe('feature');
    });

    it('should stage files', async () => {
        const store = useGitStore();
        store.selectedRepo = '/repo1';

        await store.stage(['file1']);

        expect(mockGit.stage).toHaveBeenCalledWith('/repo1', ['file1']);
        expect(mockGit.getStatus).toHaveBeenCalled();
    });

    it('should unstage files', async () => {
        const store = useGitStore();
        store.selectedRepo = '/repo1';

        await store.unstage(['file1']);

        expect(mockGit.unstage).toHaveBeenCalledWith('/repo1', ['file1']);
        expect(mockGit.getStatus).toHaveBeenCalled();
    });

    it('should commit', async () => {
        const store = useGitStore();
        store.selectedRepo = '/repo1';

        await store.commit('message');

        expect(mockGit.commit).toHaveBeenCalledWith('/repo1', 'message');
        expect(mockGit.getStatus).toHaveBeenCalled();
    });

    it('should push', async () => {
        const store = useGitStore();
        store.selectedRepo = '/repo1';

        await store.push();

        expect(mockGit.push).toHaveBeenCalledWith('/repo1');
        expect(mockGit.getStatus).toHaveBeenCalled();
    });

    it('should pull', async () => {
        const store = useGitStore();
        store.selectedRepo = '/repo1';

        await store.pull();

        expect(mockGit.pull).toHaveBeenCalledWith('/repo1');
        expect(mockGit.getStatus).toHaveBeenCalled();
    });

    it('should return empty branch name if status is null', () => {
        const store = useGitStore();
        store.status = null;
        expect(store.currentBranch).toBe('');
    });

    it('should handle stage error', async () => {
        const store = useGitStore();
        store.selectedRepo = '/repo1';
        mockGit.stage.mockRejectedValue(new Error('Stage error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await store.stage(['file1']);

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should handle unstage error', async () => {
        const store = useGitStore();
        store.selectedRepo = '/repo1';
        mockGit.unstage.mockRejectedValue(new Error('Unstage error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await store.unstage(['file1']);

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should not update status if no repo is selected', async () => {
        const store = useGitStore();
        store.selectedRepo = '';
        await store.updateStatus();
        expect(mockGit.getStatus).not.toHaveBeenCalled();
    });

    it('should guard all actions when no repo selected', async () => {
        const store = useGitStore();
        store.selectedRepo = '';
        
        await store.checkout('b');
        await store.stage([]);
        await store.unstage([]);
        await store.commit('m');
        await store.push();
        await store.pull();
        
        expect(mockGit.getStatus).not.toHaveBeenCalled();
    });

    it('should handle checkout error', async () => {
        const store = useGitStore();
        store.selectedRepo = '/repo1';
        mockGit.checkout.mockRejectedValue(new Error('Checkout error'));
        
        await expect(store.checkout('branch')).rejects.toThrow('Checkout error'); 
    });
});
