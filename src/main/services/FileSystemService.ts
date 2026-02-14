import fs from 'fs/promises';
import path from 'path';
import chokidar from 'chokidar';
import { J5FileEntry } from '@/shared/types';
import { parseJson, serializeJson } from '@/shared/utils/json-helpers';

export class FileSystemService {
    private watcher: ReturnType<typeof chokidar.watch> | null = null;

    async readDirRecursive(dirPath: string): Promise<J5FileEntry[]> {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            const results: J5FileEntry[] = [];

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);

                // RF-01: Filter out hidden files and node_modules
                if (entry.name.startsWith('.') || entry.name === 'node_modules') {
                    continue;
                }

                if (entry.isDirectory()) {
                    const children = await this.readDirRecursive(fullPath);
                    results.push({
                        name: entry.name,
                        path: fullPath,
                        type: 'directory',
                        children
                    });
                } else if (entry.name.endsWith('.j5request')) {
                    results.push({
                        name: entry.name,
                        path: fullPath,
                        type: 'file'
                    });
                }
            }

            // Sort directories first, then files
            return results.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'directory' ? -1 : 1;
            });
        } catch (error) {
            console.error(`Error reading directory ${dirPath}:`, error);
            return [];
        }
    }

    async readFile(filePath: string): Promise<any> {
        const content = await fs.readFile(filePath, 'utf-8');
        return parseJson<any>(content);
    }

    /**
     * Writes a request to disk.
     * RNF-01: Uses serializeJson for deterministic sorting.
     */
    async writeFile(filePath: string, content: any): Promise<void> {
        const stringContent = serializeJson(content);
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filePath, stringContent, 'utf-8');
    }

    async createDirectory(dirPath: string): Promise<void> {
        await fs.mkdir(dirPath, { recursive: true });
    }

    async renamePath(oldPath: string, newPath: string): Promise<void> {
        await fs.rename(oldPath, newPath);
    }

    async deletePath(pathToDelete: string): Promise<void> {
        await fs.rm(pathToDelete, { recursive: true, force: true });
    }

    watch(dirPath: string, onChange: (event: string, path: string) => void) {
        this.stopWatch();

        this.watcher = chokidar.watch(dirPath, {
            ignored: /(^|[\/\\])(\..|node_modules)/,
            persistent: true,
            ignoreInitial: true,
            depth: 99
        });

        this.watcher.on('all', (event: string, path: string) => {
            onChange(event, path);
        });
    }

    stopWatch() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }
    }
}
