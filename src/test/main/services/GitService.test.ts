import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitService } from '@/main/services/GitService';
import simpleGit from 'simple-git';
import fs from 'fs/promises';

vi.mock('simple-git', () => ({
    default: vi.fn(),
    CheckRepoActions: { IS_REPO_ROOT: 'IS_REPO_ROOT' }
}));
vi.mock('fs/promises');

describe('GitService Final Branch Push', () => {
    let service: GitService;
    let mockGit: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockGit = {
            checkIsRepo: vi.fn(), status: vi.fn(), add: vi.fn(), reset: vi.fn(),
            commit: vi.fn(), push: vi.fn(), pull: vi.fn(), checkout: vi.fn(),
            branchLocal: vi.fn(), show: vi.fn(), rm: vi.fn(), init: vi.fn()
        };
        (simpleGit as any).mockReturnValue(mockGit);
        service = new GitService();
    });

    it('isRepository branches', async () => {
        (fs.stat as any).mockResolvedValue({ isDirectory: () => true });
        mockGit.checkIsRepo.mockResolvedValue(true);
        expect(await service.isRepository('/r')).toBe(true);

        (fs.stat as any).mockResolvedValue({ isDirectory: () => false });
        expect(await service.isRepository('/r')).toBe(false);

        (fs.stat as any).mockRejectedValue(new Error());
        expect(await service.isRepository('/r')).toBe(false);
    });

    it('getStatus branches', async () => {
        mockGit.status.mockResolvedValue({ modified: ['a'], deleted: ['b'], staged: ['c'], not_added: ['d'], current: 'main' });
        const res = await service.getStatus('/r');
        expect(res.current).toBe('main');
        expect(res.changed).toHaveLength(2);

        mockGit.status.mockResolvedValue({ modified: [], deleted: [], staged: [], not_added: [], current: undefined });
        expect((await service.getStatus('/r')).current).toBe('');
    });

    it('unstage branches', async () => {
        mockGit.reset.mockResolvedValue({});
        await service.unstage('/r', ['f']);
        
        mockGit.reset.mockRejectedValue(new Error('fatal: bad object HEAD'));
        await service.unstage('/r', ['f']);
        expect(mockGit.rm).toHaveBeenCalled();

        mockGit.reset.mockRejectedValue(new Error('other'));
        await expect(service.unstage('/r', ['f'])).rejects.toThrow();
    });

    it('findRepositories branches', async () => {
        vi.spyOn(service, 'isRepository').mockResolvedValue(true);
        (fs.readdir as any).mockResolvedValue([{ name: 'r', isDirectory: () => true }]);
        const res = await service.findRepositories('/w');
        expect(res).toHaveLength(2);

        (fs.readdir as any).mockRejectedValue(new Error());
        expect(await service.findRepositories('/w')).toHaveLength(1);
    });

    it('getFileContent branches', async () => {
        mockGit.show.mockResolvedValue('ok');
        expect(await service.getFileContent('/r', 'f')).toBe('ok');

        mockGit.show.mockRejectedValue(new Error('no válido'));
        expect(await service.getFileContent('/r', 'f')).toBe('');

        mockGit.show.mockRejectedValue(new Error('crash'));
        await expect(service.getFileContent('/r', 'f')).rejects.toThrow();
    });

    it('other methods', async () => {
        await service.initRepository('/r');
        await service.stage('/r', ['f']);
        await service.commit('/r', 'm');
        await service.push('/r');
        await service.pull('/r');
        await service.checkout('/r', 'b');
        mockGit.branchLocal.mockResolvedValue({ all: [] });
        await service.getBranches('/r');
    });
});
