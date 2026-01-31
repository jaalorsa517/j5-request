import { ipcMain, BrowserWindow } from 'electron';
import { FileSystemService } from './services/FileSystemService';

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
}
