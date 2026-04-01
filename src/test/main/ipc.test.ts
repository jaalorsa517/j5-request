import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupIpc } from '@/main/ipc';
import { ipcMain, app, dialog } from 'electron';
import { FileSystemService } from '@/main/services/FileSystemService';
import { GitService } from '@/main/services/GitService';
import { RequestExecutor } from '@/main/services/RequestExecutor';
import { ImportService } from '@/main/services/ImportService';
import { ProjectConfigService } from '@/main/services/ProjectConfigService';

// Mock Electron
vi.mock('electron', () => {
    const handlers: Record<string, Function> = {};
    const listeners: Record<string, Function> = {};
    
    return {
        ipcMain: {
            handle: vi.fn((channel, listener) => {
                handlers[channel] = listener;
            }),
            on: vi.fn((channel, listener) => {
                listeners[channel] = listener;
            }),
            _trigger: async (channel: string, ...args: any[]) => {
                if (handlers[channel]) return await handlers[channel]({ sender: { send: vi.fn() } }, ...args);
                return null;
            },
            _triggerOn: (channel: string, ...args: any[]) => {
                if (listeners[channel]) listeners[channel]({ sender: { send: vi.fn() } }, ...args);
            }
        },
        app: {
            getPath: vi.fn().mockReturnValue('/mock/path'),
            getVersion: vi.fn().mockReturnValue('1.0.0'),
            getAppPath: vi.fn().mockReturnValue('/app/path')
        },
        shell: {
            openExternal: vi.fn().mockResolvedValue(undefined)
        },
        dialog: {
            showSaveDialog: vi.fn().mockResolvedValue({ canceled: false, filePath: '/saved/path' }),
            showOpenDialog: vi.fn().mockResolvedValue({ canceled: false, filePaths: ['/opened/path'] })
        },
        BrowserWindow: vi.fn()
    };
});

// Mock electron-updater
vi.mock('electron-updater', () => ({
    autoUpdater: {
        checkForUpdatesAndNotify: vi.fn().mockResolvedValue(undefined)
    }
}));

// Mock Services
vi.mock('@/main/services/ExportService');
vi.mock('@/main/services/FileSystemService');
vi.mock('@/main/services/GitService');
vi.mock('@/main/services/RequestExecutor');
vi.mock('@/main/services/ImportService');
vi.mock('@/main/services/ProjectConfigService');
vi.mock('@/main/services/EnvironmentManager');

describe('IPC Handlers Exhaustive', () => {
    let mockWindow: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockWindow = {
            isDestroyed: () => false,
            webContents: { send: vi.fn() }
        };
        setupIpc(mockWindow);
    });

    it('triggers all app handlers', async () => {
        await (ipcMain as any)._trigger('app:get-user-data-path');
        await (ipcMain as any)._trigger('app:get-globals-path');
        await (ipcMain as any)._trigger('app:get-info');
        await (ipcMain as any)._trigger('app:openExternal', 'url');
        await (ipcMain as any)._trigger('app:checkForUpdates');
        
        expect(app.getPath).toHaveBeenCalled();
    });

    it('triggers all fs handlers', async () => {
        await (ipcMain as any)._trigger('fs:read-dir', '/p');
        await (ipcMain as any)._trigger('fs:read-file', '/p');
        await (ipcMain as any)._trigger('fs:read-text-file', '/p');
        await (ipcMain as any)._trigger('fs:write-file', '/p', {});
        await (ipcMain as any)._trigger('fs:write-text-file', '/p', '');
        await (ipcMain as any)._trigger('fs:create-dir', '/p');
        await (ipcMain as any)._trigger('fs:rename', '/old', '/new');
        await (ipcMain as any)._trigger('fs:delete', '/p');
        await (ipcMain as any)._trigger('fs:save-requests', [], '/p');
        await (ipcMain as any)._trigger('fs:read-all-requests', '/p');
        await (ipcMain as any)._trigger('fs:select-folder');
        await (ipcMain as any)._trigger('fs:select-file');
        await (ipcMain as any)._trigger('fs:save-file-dialog');
        await (ipcMain as any)._trigger('fs:select-cert-file');
        await (ipcMain as any)._trigger('fs:relative-path', '/root', '/file');
        
        expect(FileSystemService.prototype.readDirRecursive).toHaveBeenCalled();
    });

    it('triggers fs:watch and handles events', async () => {
        let watchCallback: any;
        vi.spyOn(FileSystemService.prototype, 'watch').mockImplementation((_p, cb) => {
            watchCallback = cb;
        });

        await (ipcMain as any)._triggerOn('fs:watch', '/path');
        expect(FileSystemService.prototype.watch).toHaveBeenCalled();

        // Trigger a change
        watchCallback('change', '/path/file.txt');
        expect(mockWindow.webContents.send).toHaveBeenCalledWith('fs:changed', 'change', '/path/file.txt');
    });

    it('triggers all git handlers', async () => {
        const handlers = [
            'git:status', 'git:is-repository', 'git:init-repository', 
            'git:stage', 'git:unstage', 'git:commit', 'git:push', 
            'git:pull', 'git:checkout', 'git:get-branches', 
            'git:find-repos', 'git:get-file-content'
        ];

        for (const h of handlers) {
            await (ipcMain as any)._trigger(h, '/repo', 'arg');
        }

        expect(GitService.prototype.getStatus).toHaveBeenCalled();
    });

    it('triggers request execution with projectRoot', async () => {
        vi.spyOn(ProjectConfigService.prototype, 'loadProjectConfig').mockResolvedValue({ 
            ssl: { rejectUnauthorized: false } 
        } as any);

        await (ipcMain as any)._trigger('request:execute', { sslConfig: {} }, {}, '/root');
        
        expect(ProjectConfigService.prototype.loadProjectConfig).toHaveBeenCalledWith('/root');
        expect(RequestExecutor.prototype.executeRequest).toHaveBeenCalled();
    });

    it('triggers export:file and handles cancel', async () => {
        (dialog.showSaveDialog as any).mockResolvedValueOnce({ canceled: true });
        const result = await (ipcMain as any)._trigger('export:file', 'content');
        expect(result).toBeNull();
    });

    it('triggers all export and import handlers', async () => {
        const formats = ['curl', 'fetch', 'powershell', 'postman', 'insomnia', 'openapi'];
        for (const f of formats) {
            await (ipcMain as any)._trigger('export:generate', {}, f);
        }
        
        await (ipcMain as any)._trigger('import:from-content', 'content', {});
        await (ipcMain as any)._trigger('import:detect-format', 'content');
        
        expect(ImportService.prototype.importFromContent).toHaveBeenCalled();
    });
});
