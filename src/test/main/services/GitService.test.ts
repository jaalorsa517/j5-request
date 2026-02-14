import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitService } from '@/main/services/GitService';
import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';

// Mock simple-git
vi.mock('simple-git', () => {
    return {
        default: vi.fn(),
        CheckRepoActions: {
            IS_REPO_ROOT: 'IS_REPO_ROOT'
        }
    };
});

vi.mock('fs/promises');

describe('GitService', () => {
    let gitService: GitService;
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

        // Setup the mock for the default export
        (simpleGit as any).mockReturnValue(mockGit);

        gitService = new GitService();
    });

    describe('isRepo', () => {
        it('should return true if directory is a git repo', async () => {
            mockGit.checkIsRepo.mockResolvedValue(true);
            const result = await gitService.isRepo('/test/repo');
            expect(result).toBe(true);
            expect(simpleGit).toHaveBeenCalledWith('/test/repo');
        });

        it('should return false if check fails', async () => {
            mockGit.checkIsRepo.mockRejectedValue(new Error('Not a repo'));
            const result = await gitService.isRepo('/test/repo');
            expect(result).toBe(false);
        });
    });

    describe('getStatus', () => {
        it('should return git status', async () => {
            const mockStatus = {
                modified: ['file1.txt'],
                deleted: ['file2.txt'],
                staged: ['file3.txt'],
                not_added: ['file4.txt'],
                current: 'main'
            };
            mockGit.status.mockResolvedValue(mockStatus);

            const result = await gitService.getStatus('/test/repo');

            expect(result).toEqual({
                changed: ['file1.txt', 'file2.txt'],
                staged: ['file3.txt'],
                untracked: ['file4.txt'],
                current: 'main'
            });
        });

        it('should handle empty current branch', async () => {
            const mockStatus = {
                modified: [], deleted: [], staged: [], not_added: [],
                current: undefined
            };
            mockGit.status.mockResolvedValue(mockStatus);
            const result = await gitService.getStatus('/test/repo');
            expect(result.current).toBe('');
        });
    });

    describe('stage', () => {
        it('should stage files', async () => {
            const files = ['file1.txt'];
            await gitService.stage('/test/repo', files);
            expect(mockGit.add).toHaveBeenCalledWith(files);
        });
    });

    describe('unstage', () => {
        it('should unstage files', async () => {
            const files = ['file1.txt'];
            await gitService.unstage('/test/repo', files);
            expect(mockGit.reset).toHaveBeenCalledWith(['HEAD', ...files]);
        });
    });

    describe('commit', () => {
        it('should commit changes', async () => {
            const message = 'Initial commit';
            await gitService.commit('/test/repo', message);
            expect(mockGit.commit).toHaveBeenCalledWith(message);
        });
    });

    describe('push', () => {
        it('should push changes', async () => {
            await gitService.push('/test/repo');
            expect(mockGit.push).toHaveBeenCalled();
        });
    });

    describe('pull', () => {
        it('should pull changes', async () => {
            await gitService.pull('/test/repo');
            expect(mockGit.pull).toHaveBeenCalled();
        });
    });

    describe('checkout', () => {
        it('should checkout branch', async () => {
            const branch = 'dev';
            await gitService.checkout('/test/repo', branch);
            expect(mockGit.checkout).toHaveBeenCalledWith(branch);
        });
    });

    describe('getBranches', () => {
        it('should return list of branches', async () => {
            const mockBranches = {
                all: ['main', 'dev']
            };
            mockGit.branchLocal.mockResolvedValue(mockBranches);
            const result = await gitService.getBranches('/test/repo');
            expect(result).toEqual(['main', 'dev']);
        });
    });

    describe('findRepositories', () => {
        it('should find repositories in workspace', async () => {
            const workspacePath = '/test/workspace';

            // Mock isRepo
            // Since isRepo calls this.getGit -> simpleGit, we can mock via simpleGit or spyOn isRepo.
            // Spying on isRepo is easier to control logic.
            const isRepoSpy = vi.spyOn(gitService, 'isRepo');

            isRepoSpy.mockImplementation(async (repoPath) => {
                if (repoPath === workspacePath) return true;
                if (repoPath === path.join(workspacePath, 'repo1')) return true;
                return false;
            });

            // Mock fs.readdir
            const mockEntries = [
                {
                    name: 'repo1',
                    isDirectory: () => true
                },
                {
                    name: 'not_repo',
                    isDirectory: () => true
                },
                {
                    name: 'file.txt',
                    isDirectory: () => false
                }
            ];

            (fs.readdir as any).mockResolvedValue(mockEntries);

            const result = await gitService.findRepositories(workspacePath);

            expect(result).toContain(workspacePath);
            expect(result).toContain(path.join(workspacePath, 'repo1'));
            // Should not contain not_repo
            expect(result.length).toBe(2);
        });

        it('should handle scan errors gracefully', async () => {
            const workspacePath = '/test/workspace';
            (fs.readdir as any).mockRejectedValue(new Error('Scan failed'));
            
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const result = await gitService.findRepositories(workspacePath);
            
            expect(result).toEqual([]);
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error scanning workspace'), expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe('getFileContent', () => {
        it('should return file content from git', async () => {
            const repoPath = '/test/repo';
            const filePath = 'file.txt';
            const ref = 'HEAD';
            const content = 'file content';

            mockGit.show.mockResolvedValue(content);

            const result = await gitService.getFileContent(repoPath, filePath, ref);

            expect(result).toBe(content);
            expect(mockGit.show).toHaveBeenCalledWith([`${ref}:${filePath}`]);
        });

        it('should handle absolute paths correctly', async () => {
            const repoPath = '/test/repo';
            const filePath = '/test/repo/file.txt';

            // Assuming path.relative works as expected in the test environment (might be OS dependent but usually works)
            // But we can verify that it was called with *some* relative path if we want to be strict,
            // or just rely on path.relative logic.

            // Mock path.relative behavior if needed, but path is a real module.
            // If the test runs on linux/mac and code uses windows paths it might be tricky, but here we use standard paths.

            await gitService.getFileContent(repoPath, filePath);

            // Expected relative path 'file.txt'
            expect(mockGit.show).toHaveBeenCalledWith(['HEAD:file.txt']);
        });
    });
});
