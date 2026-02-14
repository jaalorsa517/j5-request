import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGitStore } from './git';

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

    it('should sync', async () => {
        const store = useGitStore();
        store.selectedRepo = '/repo1';

        await store.sync();

        expect(mockGit.pull).toHaveBeenCalled();
        expect(mockGit.push).toHaveBeenCalled();
        // Called twice: once after pull, once after push
        expect(mockGit.getStatus).toHaveBeenCalledTimes(2);
    });
});
