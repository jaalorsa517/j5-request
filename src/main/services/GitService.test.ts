import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitService } from './GitService';
import simpleGit from 'simple-git';
import fs from 'fs/promises';

vi.mock('simple-git');
vi.mock('fs/promises');

describe('GitService', () => {
    let service: GitService;
    let mockGit: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockGit = {
            checkIsRepo: vi.fn(),
            status: vi.fn(),
            add: vi.fn(),
            reset: vi.fn(),
            commit: vi.fn(),
            push: vi.fn(),
            pull: vi.fn(),
            checkout: vi.fn(),
            branchLocal: vi.fn(),
            show: vi.fn(),
        };
        (simpleGit as any).mockReturnValue(mockGit);
        service = new GitService();
    });

    it('should check if path is a repo', async () => {
        mockGit.checkIsRepo.mockResolvedValue(true);
        const result = await service.isRepo('/path/to/repo');
        expect(result).toBe(true);
        expect(simpleGit).toHaveBeenCalledWith('/path/to/repo');
    });

    it('should get status', async () => {
        const mockStatus = {
            modified: ['file1.ts'],
            deleted: ['file2.ts'],
            staged: ['file3.ts'],
            not_added: ['file4.ts'],
            current: 'main'
        };
        mockGit.status.mockResolvedValue(mockStatus);

        const status = await service.getStatus('/repo');

        expect(status.changed).toEqual(['file1.ts', 'file2.ts']);
        expect(status.staged).toEqual(['file3.ts']);
        expect(status.untracked).toEqual(['file4.ts']);
        expect(status.current).toBe('main');
    });

    it('should stage files', async () => {
        await service.stage('/repo', ['file1.ts']);
        expect(mockGit.add).toHaveBeenCalledWith(['file1.ts']);
    });

    it('should unstage files', async () => {
        await service.unstage('/repo', ['file1.ts']);
        expect(mockGit.reset).toHaveBeenCalledWith(['HEAD', 'file1.ts']);
    });

    it('should commit changes', async () => {
        await service.commit('/repo', 'commit message');
        expect(mockGit.commit).toHaveBeenCalledWith('commit message');
    });

    it('should push changes', async () => {
        await service.push('/repo');
        expect(mockGit.push).toHaveBeenCalled();
    });

    it('should pull changes', async () => {
        await service.pull('/repo');
        expect(mockGit.pull).toHaveBeenCalled();
    });

    it('should checkout branch', async () => {
        await service.checkout('/repo', 'feature-branch');
        expect(mockGit.checkout).toHaveBeenCalledWith('feature-branch');
    });

    it('should get branches', async () => {
        mockGit.branchLocal.mockResolvedValue({ all: ['main', 'dev'] });
        const branches = await service.getBranches('/repo');
        expect(branches).toEqual(['main', 'dev']);
    });

    it('should get file content', async () => {
        mockGit.show.mockResolvedValue('content');
        const content = await service.getFileContent('/repo', 'file.ts');
        expect(content).toBe('content');
        expect(mockGit.show).toHaveBeenCalledWith(['HEAD:file.ts']);
    });

    it('should find repositories recursively (shallow)', async () => {
        const mockEntries = [
            { name: 'repo1', isDirectory: () => true, isFile: () => false },
            { name: 'not-repo', isDirectory: () => true, isFile: () => false },
            { name: 'file.txt', isDirectory: () => false, isFile: () => true }
        ] as any[];

        (fs.readdir as any).mockResolvedValue(mockEntries);

        // Spy on isRepo to control which are detected as repos
        const isRepoSpy = vi.spyOn(service, 'isRepo');
        isRepoSpy.mockImplementation(async (path) => {
            return path === '/workspace' || path.includes('repo1');
        });

        const repos = await service.findRepositories('/workspace');

        expect(repos).toContain('/workspace');
        expect(repos.some(r => r.includes('repo1'))).toBe(true);
        expect(repos.some(r => r.includes('not-repo'))).toBe(false);
    });

    it('should return false if isRepo throws', async () => {
        mockGit.checkIsRepo.mockRejectedValue(new Error('Git error'));
        const result = await service.isRepo('/path/to/repo');
        expect(result).toBe(false);
    });

    it('should handle errors in findRepositories', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const isRepoSpy = vi.spyOn(service, 'isRepo');
        isRepoSpy.mockResolvedValue(false);

        // Mock fs.readdir to fail so it goes to catch block
        (fs.readdir as any).mockRejectedValue(new Error('Permission denied'));

        const repos = await service.findRepositories('/workspace');

        expect(repos).toEqual([]);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should handle absolute path in getFileContent', async () => {
        mockGit.show.mockResolvedValue('content');
        // Repo at /repo, file at /repo/subdir/file.ts
        await service.getFileContent('/repo', '/repo/subdir/file.ts');
        // path.relative('/repo', '/repo/subdir/file.ts') -> 'subdir/file.ts'
        expect(mockGit.show).toHaveBeenCalledWith(['HEAD:subdir/file.ts']);
    });

    it('should handle missing current branch in status', async () => {
        const mockStatus = {
            modified: [], deleted: [], staged: [], not_added: [], current: null
        };
        mockGit.status.mockResolvedValue(mockStatus);
        const status = await service.getStatus('/repo');
        expect(status.current).toBe('');
    });
});
