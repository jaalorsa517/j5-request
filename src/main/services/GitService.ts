import simpleGit, { SimpleGit, CheckRepoActions } from 'simple-git';
import path from 'path';
import fs from 'fs/promises';

export interface GitStatus {
    changed: string[];
    staged: string[];
    untracked: string[];
    current: string;
}

export class GitService {

    private getGit(repoPath: string): SimpleGit {
        return simpleGit(repoPath);
    }

    async isRepo(repoPath: string): Promise<boolean> {
        try {
            const git = this.getGit(repoPath);
            return await git.checkIsRepo(CheckRepoActions.IS_REPO_ROOT);
        } catch (e) {
            return false;
        }
    }

    async getStatus(repoPath: string): Promise<GitStatus> {
        const git = this.getGit(repoPath);
        const status = await git.status();

        return {
            changed: status.modified.concat(status.deleted),
            staged: status.staged,
            untracked: status.not_added,
            current: status.current || '',
        };
    }

    async stage(repoPath: string, files: string[]): Promise<void> {
        const git = this.getGit(repoPath);
        await git.add(files);
    }

    async unstage(repoPath: string, files: string[]): Promise<void> {
        const git = this.getGit(repoPath);
        await git.reset(['HEAD', ...files]);
    }

    async commit(repoPath: string, message: string): Promise<void> {
        const git = this.getGit(repoPath);
        await git.commit(message);
    }

    async push(repoPath: string): Promise<void> {
        const git = this.getGit(repoPath);
        await git.push();
    }

    async pull(repoPath: string): Promise<void> {
        const git = this.getGit(repoPath);
        await git.pull();
    }

    async checkout(repoPath: string, branch: string): Promise<void> {
        const git = this.getGit(repoPath);
        await git.checkout(branch);
    }

    async getBranches(repoPath: string): Promise<string[]> {
        const git = this.getGit(repoPath);
        const branches = await git.branchLocal();
        return branches.all;
    }

    async findRepositories(workspacePath: string): Promise<string[]> {
        // Simple discovery: check if workspace itself is a repo
        const repos: string[] = [];

        // Check root
        if (await this.isRepo(workspacePath)) {
            repos.push(workspacePath);
        }

        // Check first level children (common case: workspace is a folder of repos)
        // We don't recurse deeply to avoid performance issues
        try {
            const entries = await fs.readdir(workspacePath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const childPath = path.join(workspacePath, entry.name);
                    if (await this.isRepo(childPath)) { // Re-using isRepo check
                        repos.push(childPath);
                    }
                }
            }
        } catch (err) {
            console.error(`Error scanning workspace for repos: ${workspacePath}`, err);
        }

        return repos;
    }

    async getFileContent(repoPath: string, filePath: string, ref: string = 'HEAD'): Promise<string> {
        const git = this.getGit(repoPath);
        // git show ref:path/to/file
        // filePath needs to be relative to repo root. 
        // If repoPath is absolute and filePath is absolute, we need to make it relative.
        const relativePath = path.isAbsolute(filePath) ? path.relative(repoPath, filePath) : filePath;

        return await git.show([`${ref}:${relativePath}`]);
    }
}

export const gitService = new GitService();
