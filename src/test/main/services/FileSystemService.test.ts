import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileSystemService } from '@/main/services/FileSystemService';
import fs from 'fs/promises';
import chokidar from 'chokidar';
import path from 'path';

vi.mock('fs/promises');
vi.mock('chokidar');

describe('FileSystemService', () => {
    let fileSystemService: FileSystemService;

    beforeEach(() => {
        vi.clearAllMocks();
        fileSystemService = new FileSystemService();
    });

    describe('readDirRecursive', () => {
        it('should read directory recursively and return file entries', async () => {
            const dirPath = '/test/dir';
            const mockEntries = [
                {
                    name: 'subdir',
                    isDirectory: () => true,
                    isFile: () => false
                },
                {
                    name: 'file.j5request',
                    isDirectory: () => false,
                    isFile: () => true
                },
                {
                    name: '.hidden',
                    isDirectory: () => false,
                    isFile: () => true
                },
                {
                    name: 'node_modules',
                    isDirectory: () => true,
                    isFile: () => false
                }
            ];

            const mockSubDirEntries = [
                {
                    name: 'subfile.j5request',
                    isDirectory: () => false,
                    isFile: () => true
                }
            ];

            (fs.readdir as any).mockImplementation(async (path: string) => {
                if (path === dirPath) return mockEntries;
                if (path === '/test/dir/subdir') return mockSubDirEntries;
                return [];
            });

            const result = await fileSystemService.readDirRecursive(dirPath);

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('subdir');
            expect(result[0].type).toBe('directory');
            expect(result[0].children).toHaveLength(1);
            expect(result[0].children![0].name).toBe('subfile.j5request');

            expect(result[1].name).toBe('file.j5request');
            expect(result[1].type).toBe('file');
        });

        it('should sort directories before files and then by name', async () => {
            const dirPath = '/test/dir';
            const mockEntries = [
                { name: 'b.j5request', isDirectory: () => false },
                { name: 'subdirB', isDirectory: () => true },
                { name: 'a.j5request', isDirectory: () => false },
                { name: 'subdirA', isDirectory: () => true },
            ] as any;

            // Use mockImplementation to prevent infinite recursion
            (fs.readdir as any).mockImplementation(async (p: string) => {
                if (p === dirPath) return mockEntries;
                return []; // Subdirectories are empty
            });

            const result = await fileSystemService.readDirRecursive(dirPath);

            expect(result[0].name).toBe('subdirA');
            expect(result[1].name).toBe('subdirB');
            expect(result[2].name).toBe('a.j5request');
            expect(result[3].name).toBe('b.j5request');
        });

        it('should handle errors gracefully', async () => {
            (fs.readdir as any).mockRejectedValue(new Error('Access denied'));
            const result = await fileSystemService.readDirRecursive('/error/path');
            expect(result).toEqual([]);
        });

        it('should return empty array for null root', async () => {
            const result = await (fileSystemService as any).readDirRecursive(null);
            expect(result).toEqual([]);
        });
    });

    describe('readFile', () => {
        it('should read and parse JSON file', async () => {
            const filePath = '/test/file.json';
            const content = JSON.stringify({ key: 'value' });
            (fs.readFile as any).mockResolvedValue(content);

            const result = await fileSystemService.readFile(filePath);
            expect(result).toEqual({ key: 'value' });
            expect(fs.readFile).toHaveBeenCalledWith(filePath, 'utf-8');
        });
    });

    describe('writeFile', () => {
        it('should serialize and write JSON to file, ensuring directory exists', async () => {
            const filePath = '/test/dir/file.json';
            const content = { key: 'value' };

            await fileSystemService.writeFile(filePath, content);

            expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(filePath), { recursive: true });
            expect(fs.writeFile).toHaveBeenCalledWith(
                filePath,
                expect.stringContaining('"key": "value"'),
                'utf-8'
            );
        });
    });

    describe('createDirectory', () => {
        it('should create directory recursively', async () => {
            const dirPath = '/test/new/dir';
            await fileSystemService.createDirectory(dirPath);
            expect(fs.mkdir).toHaveBeenCalledWith(dirPath, { recursive: true });
        });
    });

    describe('renamePath', () => {
        it('should rename file or directory', async () => {
            const oldPath = '/test/old';
            const newPath = '/test/new';
            await fileSystemService.renamePath(oldPath, newPath);
            expect(fs.rename).toHaveBeenCalledWith(oldPath, newPath);
        });
    });

    describe('deletePath', () => {
        it('should delete file or directory recursively and forcefully', async () => {
            const pathToDelete = '/test/delete';
            await fileSystemService.deletePath(pathToDelete);
            expect(fs.rm).toHaveBeenCalledWith(pathToDelete, { recursive: true, force: true });
        });
    });

    describe('watch', () => {
        it('should start watching directory', () => {
            const dirPath = '/test/watch';
            const callback = vi.fn();
            const mockWatcher = {
                on: vi.fn(),
                close: vi.fn()
            };
            (chokidar.watch as any).mockReturnValue(mockWatcher);

            fileSystemService.watch(dirPath, callback);

            expect(chokidar.watch).toHaveBeenCalledWith(dirPath, expect.any(Object));
            expect(mockWatcher.on).toHaveBeenCalledWith('all', expect.any(Function));

            // simulate event
            const eventHandler = mockWatcher.on.mock.calls[0][1];
            eventHandler('change', '/test/watch/file.txt');
            expect(callback).toHaveBeenCalledWith('change', '/test/watch/file.txt');
        });

        it('should stop previous watcher before starting new one', () => {
            const dirPath1 = '/test/watch1';
            const dirPath2 = '/test/watch2';
            const callback = vi.fn();
            const mockWatcher1 = {
                on: vi.fn(),
                close: vi.fn()
            };
            const mockWatcher2 = {
                on: vi.fn(),
                close: vi.fn()
            };

            (chokidar.watch as any)
                .mockReturnValueOnce(mockWatcher1)
                .mockReturnValueOnce(mockWatcher2);

            fileSystemService.watch(dirPath1, callback);
            fileSystemService.watch(dirPath2, callback);

            expect(mockWatcher1.close).toHaveBeenCalled();
            expect(chokidar.watch).toHaveBeenCalledTimes(2);
        });
    });

    describe('stopWatch', () => {
        it('should close watcher if exists', () => {
            const dirPath = '/test/watch';
            const callback = vi.fn();
            const mockWatcher = {
                on: vi.fn(),
                close: vi.fn()
            };
            (chokidar.watch as any).mockReturnValue(mockWatcher);

            fileSystemService.watch(dirPath, callback);
            fileSystemService.stopWatch();

            expect(mockWatcher.close).toHaveBeenCalled();
        });

        it('should do nothing if no watcher exists', () => {
            expect(() => fileSystemService.stopWatch()).not.toThrow();
        });
    });
});
