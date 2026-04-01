import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupIpc } from '@/main/ipc';
import { ipcMain, app, shell, dialog } from 'electron';
import { ExportService } from '@/main/services/ExportService';
import { FileSystemService } from '@/main/services/FileSystemService';
import { gitService } from '@/main/services/GitService';
import { RequestExecutor } from '@/main/services/RequestExecutor';
import { importService } from '@/main/services/ImportService';
import { ProjectConfigService } from '@/main/services/ProjectConfigService';
import { EnvironmentManager } from '@/main/services/EnvironmentManager';

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
            // Helper for tests to trigger handles
            _trigger: async (channel: string, ...args: any[]) => {
                if (handlers[channel]) return await handlers[channel](null, ...args);
                throw new Error(`No handler for ${channel}`);
            },
            _triggerOn: (channel: string, ...args: any[]) => {
                if (listeners[channel]) listeners[channel](null, ...args);
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

// Mock Services
vi.mock('@/main/services/ExportService');
vi.mock('@/main/services/FileSystemService');
vi.mock('@/main/services/GitService');
vi.mock('@/main/services/RequestExecutor');
vi.mock('@/main/services/ImportService');
vi.mock('@/main/services/ProjectConfigService');
vi.mock('@/main/services/EnvironmentManager');

describe('IPC Handlers', () => {
    let mockWindow: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockWindow = {
            isDestroyed: () => false,
            webContents: { send: vi.fn() }
        };
        setupIpc(mockWindow);
    });

    describe('App Handlers', () => {
        it('app:get-info should return app metadata', async () => {
            const info = await (ipcMain as any)._trigger('app:get-info');
            expect(info.name).toBe('J5-Request');
            expect(app.getVersion).toHaveBeenCalled();
        });

        it('app:openExternal should call shell', async () => {
            await (ipcMain as any)._trigger('app:openExternal', 'https://test.com');
            expect(shell.openExternal).toHaveBeenCalledWith('https://test.com');
        });
    });

    describe('FS Handlers', () => {
        it('fs:read-dir should call fsService', async () => {
            const spy = vi.spyOn(FileSystemService.prototype, 'readDirRecursive').mockResolvedValue([]);
            await (ipcMain as any)._trigger('fs:read-dir', '/some/path');
            expect(spy).toHaveBeenCalledWith('/some/path');
        });

        it('fs:select-folder should use electron dialog', async () => {
            const path = await (ipcMain as any)._trigger('fs:select-folder');
            expect(dialog.showOpenDialog).toHaveBeenCalled();
            expect(path).toBe('/opened/path');
        });
    });

    describe('Git Handlers', () => {
        it('git:status should call gitService', async () => {
            await (ipcMain as any)._trigger('git:status', '/repo');
            expect(gitService.getStatus).toHaveBeenCalledWith('/repo');
        });
    });

    describe('Request/Import Handlers', () => {
        it('request:execute should call requestExecutor', async () => {
            await (ipcMain as any)._trigger('request:execute', {}, {});
            expect(RequestExecutor.prototype.executeRequest).toHaveBeenCalled();
        });

        it('import:detect-format should call importService', async () => {
            await (ipcMain as any)._trigger('import:detect-format', 'curl ...');
            expect(importService.detectFormat).toHaveBeenCalledWith('curl ...');
        });
    });

    describe('Export Handlers', () => {
        it('export:clipboard should call exportService', async () => {
            await (ipcMain as any)._trigger('export:clipboard', 'content');
            expect(ExportService.prototype.exportToClipboard).toHaveBeenCalledWith('content');
        });

        it('export:generate should return generated format', async () => {
            vi.spyOn(ExportService.prototype, 'generateCurl').mockReturnValue('curl cmd');
            const result = await (ipcMain as any)._trigger('export:generate', {}, 'curl');
            expect(result).toBe('curl cmd');
        });
    });
});
