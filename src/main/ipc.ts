import { ipcMain, BrowserWindow } from 'electron';
import { FileSystemService } from './services/FileSystemService';
import { gitService } from './services/GitService';

const fsService = new FileSystemService();

export function setupIpc(mainWindow: BrowserWindow) {
    ipcMain.handle('fs:read-dir', async (_, path: string) => {
        return fsService.readDirRecursive(path);
    });

    ipcMain.handle('fs:read-file', async (_, path: string) => {
        return fsService.readFile(path);
    });

    ipcMain.handle('fs:write-file', async (_, path: string, content: any) => {
        return fsService.writeFile(path, content);
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
}
