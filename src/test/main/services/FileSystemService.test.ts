import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileSystemService } from '@/main/services/FileSystemService';
import fs from 'fs/promises';

// Strict mock for fs/promises to ensure consistency across environments
vi.mock('fs/promises', () => ({
    default: {
        readdir: vi.fn().mockResolvedValue([]),
        readFile: vi.fn().mockResolvedValue('{}'),
        writeFile: vi.fn().mockResolvedValue(undefined),
        unlink: vi.fn().mockResolvedValue(undefined),
        rm: vi.fn().mockResolvedValue(undefined),
        mkdir: vi.fn().mockResolvedValue(undefined)
    }
}));

// Mock chokidar to prevent any system resource usage
vi.mock('chokidar', () => ({
    default: {
        watch: vi.fn(() => ({
            on: vi.fn().mockReturnThis(),
            close: vi.fn().mockResolvedValue(undefined)
        }))
    }
}));

describe('FileSystemService Definitive Validation', () => {
    let service: FileSystemService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new FileSystemService();
    });

    it('reads directory recursively safely', async () => {
        (fs.readdir as any).mockResolvedValueOnce([
            { name: 'req.j5request', isDirectory: () => false, isFile: () => true },
            { name: 'folder', isDirectory: () => true, isFile: () => false }
        ]).mockResolvedValue([]); // Break recursion for 'folder'

        const res = await service.readDirRecursive('/root');
        expect(res).toHaveLength(2);
    });

    it('handles JSON reading and writing', async () => {
        (fs.readFile as any).mockResolvedValue('{"ok": true}');
        const data = await service.readFile('/file.json');
        expect(data.ok).toBe(true);

        await service.writeFile('/file.json', { a: 1 });
        expect(fs.writeFile).toHaveBeenCalled();
    });

    it('generates safe imported file paths', async () => {
        const reqs = [{ name: 'Test Request /', method: 'GET' }];
        const paths = await service.saveImportedRequests(reqs as any, '/tmp');
        expect(paths[0]).toContain('GET-Test-Request.j5request');
    });
});
