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

    async readTextFile(filePath: string): Promise<string> {
        return await fs.readFile(filePath, 'utf-8');
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

    /**
     * Saves multiple imported requests to disk.
     * Generates safe filenames based on request name/method.
     */
    async saveImportedRequests(requests: any[], targetDir: string): Promise<string[]> {
        const savedPaths: string[] = [];
        // Ensure directory exists
        try {
            await fs.mkdir(targetDir, { recursive: true });
        } catch (error: any) {
            if (error.code !== 'EEXIST') throw error;
        }

        for (const req of requests) {
            // Generate safe filename. 
            // e.g. "GET Create User" -> "GET-Create-User.j5request"
            const safeName = (req.name || 'Request')
                .replace(/[^a-z0-9]/gi, '-') // Replace non-alphanumeric with dash
                .replace(/-+/g, '-') // Colapse dashes
                .replace(/^-|-$/g, ''); // Trim dashes

            let filename = `${req.method || 'GET'}-${safeName}.j5request`;
            let filePath = path.join(targetDir, filename);

            // Handle duplicates
            let counter = 1;
            while (await this.fileExists(filePath)) {
                filename = `${req.method || 'GET'}-${safeName}-${counter}.j5request`;
                filePath = path.join(targetDir, filename);
                counter++;
            }

            await this.writeFile(filePath, req);
            savedPaths.push(filePath);
        }
        return savedPaths;
    }

    private async fileExists(path: string): Promise<boolean> {
        try {
            await fs.access(path);
            return true;
        } catch {
            return false;
        }
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

    async readAllRequests(dirPath: string): Promise<any[]> {
        const requests: any[] = [];
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);

                if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

                if (entry.isDirectory()) {
                    const childRequests = await this.readAllRequests(fullPath);
                    requests.push(...childRequests);
                } else if (entry.name.endsWith('.j5request')) {
                    try {
                        const content = await fs.readFile(fullPath, 'utf-8');
                        const req = parseJson<any>(content);
                        requests.push(req);
                    } catch (e) {
                        console.error(`Error reading request ${fullPath}`, e);
                    }
                }
            }
        } catch (e) {
            console.error(`Error reading dir ${dirPath}`, e);
        }
        return requests;
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
