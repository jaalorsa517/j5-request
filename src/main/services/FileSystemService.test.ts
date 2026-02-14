import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileSystemService } from './FileSystemService';
import fs from 'fs/promises';
import chokidar from 'chokidar';


// Mock dependencies
vi.mock('fs/promises');
vi.mock('chokidar');

describe('FileSystemService', () => {
    let service: FileSystemService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new FileSystemService();
    });

    afterEach(() => {
        service.stopWatch();
    });

    describe('readDirRecursive', () => {
        it('should read directory recursively and filter hidden/node_modules', async () => {
            const mockEntries = [
                { name: 'file1.j5request', isDirectory: () => false, isFile: () => true },
                { name: 'subdir', isDirectory: () => true, isFile: () => false },
                { name: '.hidden', isDirectory: () => false, isFile: () => true },
                { name: 'node_modules', isDirectory: () => true, isFile: () => false },
                { name: 'other.txt', isDirectory: () => false, isFile: () => true }
            ] as any[];

            const mockSubEntries = [
                { name: 'file2.j5request', isDirectory: () => false, isFile: () => true }
            ] as any[];

            (fs.readdir as any)
                .mockResolvedValueOnce(mockEntries)
                .mockResolvedValueOnce(mockSubEntries);

            const results = await service.readDirRecursive('/test/root');

            expect(results).toHaveLength(2); // subdir and file1.j5request

            // subdir should be first (directory)
            expect(results[0].name).toBe('subdir');
            expect(results[0].type).toBe('directory');
            expect(results[0].children).toHaveLength(1);
            expect(results[0].children![0].name).toBe('file2.j5request');

            // file1.j5request should be second
            expect(results[1].name).toBe('file1.j5request');
            expect(results[1].type).toBe('file');

            // .hidden, node_modules, and other.txt should be filtered
        });

        it('should sort entries by type (directory first) then name', async () => {

            // Override filter logic in mock impl if relying on names ending with j5request?
            // Wait, FileSystemService logic line 31: else if (entry.name.endsWith('.j5request')) results.push...
            // So .txt files are filtered out unless they are inside dir?
            // "RF-01: Filter out hidden files and node_modules".
            // Implementation:
            // if (... hidden ...) continue;
            // if (isDirectory) ... recurse ... push directory
            // else if (entry.name.endsWith('.j5request')) push file

            // So to test file sorting, I need 2 .j5request files!

            const mockEntriesSort = [
                { name: 'b.j5request', isDirectory: () => false, isFile: () => true },
                { name: 'a.j5request', isDirectory: () => false, isFile: () => true },
                { name: 'dir2', isDirectory: () => true, isFile: () => false },
                { name: 'dir1', isDirectory: () => true, isFile: () => false },
            ] as any[];

            (fs.readdir as any).mockResolvedValue(mockEntriesSort);
            // Mock recursion for dirs to return empty

            // The implementation calls `this.readDirRecursive`. If I spy on instance method, it works.
            // But simpler: just mock fs.readdir to return different things for different paths?
            (fs.readdir as any).mockImplementation(async (path: string) => {
                if (path === '/test/root') return mockEntriesSort;
                return [];
            });

            const results = await service.readDirRecursive('/test/root');

            expect(results).toHaveLength(4);
            expect(results[0].name).toBe('dir1');
            expect(results[1].name).toBe('dir2');
            expect(results[2].name).toBe('a.j5request');
            expect(results[3].name).toBe('b.j5request');
        });

        it('should handle errors gracefully', async () => {
            (fs.readdir as any).mockRejectedValue(new Error('Access denied'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const results = await service.readDirRecursive('/test/root');

            expect(results).toEqual([]);
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('readFile', () => {
        it('should read and parse JSON file', async () => {
            const content = '{"key": "value"}';
            (fs.readFile as any).mockResolvedValue(content);

            const result = await service.readFile('/path/to/file.json');
            expect(result).toEqual({ key: 'value' });
            expect(fs.readFile).toHaveBeenCalledWith('/path/to/file.json', 'utf-8');
        });
    });

    describe('writeFile', () => {
        it('should write serialized JSON to file', async () => {
            const content = { key: 'value' };
            const filePath = '/path/to/file.json';

            await service.writeFile(filePath, content);

            expect(fs.mkdir).toHaveBeenCalledWith('/path/to', { recursive: true });
            expect(fs.writeFile).toHaveBeenCalledWith(filePath, expect.stringContaining('"key": "value"'), 'utf-8');
        });
    });

    describe('createDirectory', () => {
        it('should create directory recursively', async () => {
            await service.createDirectory('/path/to/dir');
            expect(fs.mkdir).toHaveBeenCalledWith('/path/to/dir', { recursive: true });
        });
    });

    describe('renamePath', () => {
        it('should rename path', async () => {
            await service.renamePath('/old', '/new');
            expect(fs.rename).toHaveBeenCalledWith('/old', '/new');
        });
    });

    describe('deletePath', () => {
        it('should delete path recursively', async () => {
            await service.deletePath('/path/to/delete');
            expect(fs.rm).toHaveBeenCalledWith('/path/to/delete', { recursive: true, force: true });
        });
    });

    describe('watch', () => {
        it('should set up watcher', () => {
            const mockWatcher = {
                on: vi.fn(),
                close: vi.fn()
            };
            (chokidar.watch as any).mockReturnValue(mockWatcher);

            const onChange = vi.fn();
            service.watch('/path', onChange);

            expect(chokidar.watch).toHaveBeenCalledWith('/path', expect.any(Object));
            expect(mockWatcher.on).toHaveBeenCalledWith('all', expect.any(Function));
        });

        it('should stop existing watcher before starting new one', () => {
            const mockWatcher = {
                on: vi.fn(),
                close: vi.fn()
            };
            (chokidar.watch as any).mockReturnValue(mockWatcher);

            service.watch('/path1', vi.fn());
            service.watch('/path2', vi.fn());

            expect(mockWatcher.close).toHaveBeenCalledTimes(1);
        });
    });

});
