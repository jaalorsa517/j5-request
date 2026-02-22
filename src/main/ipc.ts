import { ipcMain, BrowserWindow, app } from 'electron';
import path from 'path';
import { FileSystemService } from '@/main/services/FileSystemService';
import { gitService } from '@/main/services/GitService';
import { RequestExecutor } from '@/main/services/RequestExecutor';
import { importService } from '@/main/services/ImportService';
import { ProjectConfigService, mergeSSLConfigs } from '@/main/services/ProjectConfigService';
import { makeRelativePath } from '@/main/utils/pathUtils';

import { ExportService } from '@/main/services/ExportService';

const fsService = new FileSystemService();
const requestExecutor = new RequestExecutor();
const exportService = new ExportService();
const projectConfigService = new ProjectConfigService();

export function setupIpc(mainWindow: BrowserWindow) {
    // ... existing handlers ...

    // Export Handlers
    ipcMain.handle('export:clipboard', async (_, content: string) => {
        return exportService.exportToClipboard(content);
    });

    ipcMain.handle('export:file', async (_, content: string, defaultPath?: string) => {
        const { dialog } = await import('electron');
        const result = await dialog.showSaveDialog(mainWindow, {
            defaultPath: defaultPath
        });

        if (result.canceled || !result.filePath) {
            return null;
        }

        await exportService.exportToFile(content, result.filePath);
        return result.filePath;
    });

    ipcMain.handle('export:generate', async (_, request: any, format: string) => {
        // Handle single request vs array - for now assuming single request passed from UI
        // If request is not array, wrap it for collection formats
        const requests = Array.isArray(request) ? request : [request];
        const singleRequest = Array.isArray(request) ? request[0] : request;

        switch (format) {
            // Text formats (Single Request)
            case 'curl': return exportService.generateCurl(singleRequest);
            case 'fetch': return exportService.generateFetch(singleRequest);
            case 'powershell': return exportService.generatePowerShell(singleRequest);

            // Collection formats (Array)
            case 'postman': return JSON.stringify(exportService.generatePostmanCollection(requests), null, 2);
            case 'insomnia': return JSON.stringify(exportService.generateInsomniaCollection(requests), null, 2);
            case 'openapi':
                return JSON.stringify(exportService.generateOpenAPI(requests, {
                    title: 'J5 Request Export',
                    version: '1.0.0',
                    description: 'Exported from J5 Request'
                }), null, 2);

            default: throw new Error(`Unknown format: ${format}`);
        }
    });

    ipcMain.handle('app:get-user-data-path', () => {
        return app.getPath('userData');
    });

    ipcMain.handle('app:get-globals-path', () => {
        return path.join(app.getPath('userData'), 'globals.json');
    });
    ipcMain.handle('fs:read-dir', async (_, path: string) => {
        return fsService.readDirRecursive(path);
    });

    ipcMain.handle('fs:read-file', async (_, path: string) => {
        return fsService.readFile(path);
    });

    ipcMain.handle('fs:read-text-file', async (_, path: string) => {
        return fsService.readTextFile(path);
    });

    ipcMain.handle('fs:write-file', async (_, path: string, content: any) => {
        return fsService.writeFile(path, content);
    });

    ipcMain.handle('fs:write-text-file', async (_, path: string, content: string) => {
        return fsService.writeTextFile(path, content);
    });

    ipcMain.handle('fs:create-dir', async (_, path: string) => {
        return fsService.createDirectory(path);
    });

    ipcMain.handle('fs:rename', async (_, oldPath: string, newPath: string) => {
        return fsService.renamePath(oldPath, newPath);
    });

    ipcMain.handle('fs:delete', async (_, path: string) => {
        return fsService.deletePath(path);
    });

    ipcMain.handle('fs:save-requests', async (_, requests: any[], targetDir: string) => {
        return fsService.saveImportedRequests(requests, targetDir);
    });

    ipcMain.handle('fs:read-all-requests', async (_, path: string) => {
        return fsService.readAllRequests(path);
    });

    ipcMain.handle('fs:select-folder', async () => {
        const { dialog } = await import('electron');
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        });
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        return result.filePaths[0];
    });

    ipcMain.handle('fs:select-file', async () => {
        const { dialog } = await import('electron');
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile']
        });
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        return result.filePaths[0];
    });

    ipcMain.handle('fs:save-file-dialog', async (_, defaultName?: string) => {
        const { dialog } = await import('electron');
        const result = await dialog.showSaveDialog(mainWindow, {
            defaultPath: defaultName,
            filters: [
                { name: 'JSON', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        if (result.canceled || !result.filePath) {
            return null;
        }
        return result.filePath;
    });

    ipcMain.on('fs:watch', (_, path: string) => {
        fsService.watch(path, (event, changedPath) => {
            if (!mainWindow.isDestroyed()) {
                mainWindow.webContents.send('fs:changed', event, changedPath);
            }
        });
    });

    // Git Handlers

    // Git Handlers

    ipcMain.handle('git:status', async (_, repoPath: string) => {
        return gitService.getStatus(repoPath);
    });

    ipcMain.handle('git:is-repository', async (_, repoPath: string) => {
        return gitService.isRepository(repoPath);
    });

    ipcMain.handle('git:init-repository', async (_, repoPath: string) => {
        return gitService.initRepository(repoPath);
    });

    ipcMain.handle('git:stage', async (_, repoPath: string, files: string[]) => {
        return gitService.stage(repoPath, files);
    });

    ipcMain.handle('git:unstage', async (_, repoPath: string, files: string[]) => {
        return gitService.unstage(repoPath, files);
    });

    ipcMain.handle('git:commit', async (_, repoPath: string, message: string) => {
        return gitService.commit(repoPath, message);
    });

    ipcMain.handle('git:push', async (_, repoPath: string) => {
        return gitService.push(repoPath);
    });

    ipcMain.handle('git:pull', async (_, repoPath: string) => {
        return gitService.pull(repoPath);
    });

    ipcMain.handle('git:checkout', async (_, repoPath: string, branch: string) => {
        return gitService.checkout(repoPath, branch);
    });

    ipcMain.handle('git:get-branches', async (_, repoPath: string) => {
        return gitService.getBranches(repoPath);
    });

    ipcMain.handle('git:find-repos', async (_, workspacePath: string) => {
        return gitService.findRepositories(workspacePath);
    });

    ipcMain.handle('git:get-file-content', async (_, repoPath: string, filePath: string, ref: string) => {
        return gitService.getFileContent(repoPath, filePath, ref);
    });

    // Request Executor
    ipcMain.handle('request:execute', async (_, request: any, environment: any, projectRoot?: string) => {
        let finalRequest = request;
        console.log("EXECUTE REQUEST - projectRoot provided from UI:", projectRoot);
        if (projectRoot) {
            const projectConfig = await projectConfigService.loadProjectConfig(projectRoot);
            console.log("Project config loaded:", projectConfig);
            if (projectConfig?.ssl) {
                const mergedSSL = mergeSSLConfigs(projectConfig.ssl, request.sslConfig);
                console.log("Merged SSL:", mergedSSL);
                finalRequest = { ...request, sslConfig: mergedSSL };
            }
        }
        return requestExecutor.executeRequest(finalRequest, environment, projectRoot);
    });

    ipcMain.handle('fs:select-cert-file', async () => {
        const { dialog } = await import('electron');
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile', 'showHiddenFiles'],
            filters: [
                { name: 'Certificates', extensions: ['pem', 'crt', 'cer', 'key', 'p12', 'pfx'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        return result.filePaths[0];
    });

    ipcMain.handle('fs:relative-path', (_, projectRoot: string, file: string) => {
        return makeRelativePath(file, projectRoot);
    });

    // Import Handlers
    ipcMain.handle('import:from-content', async (_, content: string, options?: any) => {
        return importService.importFromContent(content, options);
    });

    ipcMain.handle('import:detect-format', async (_, content: string) => {
        return importService.detectFormat(content);
    });
}
