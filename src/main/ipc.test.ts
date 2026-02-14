import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupIpc } from './ipc';
import { ipcMain } from 'electron';

// Mock services used by IPC
vi.mock('./services/GitService', () => ({
    gitService: {
        getStatus: vi.fn().mockResolvedValue({}),
        push: vi.fn().mockResolvedValue(undefined),
        stage: vi.fn().mockResolvedValue(undefined),
        unstage: vi.fn().mockResolvedValue(undefined),
        commit: vi.fn().mockResolvedValue(undefined),
        pull: vi.fn().mockResolvedValue(undefined),
        checkout: vi.fn().mockResolvedValue(undefined),
        getBranches: vi.fn().mockResolvedValue([]),
        findRepositories: vi.fn().mockResolvedValue([]),
        getFileContent: vi.fn().mockResolvedValue(''),
    }
}));

vi.mock('./services/FileSystemService', () => {
    return {
        FileSystemService: vi.fn().mockImplementation(function(this: any) {
            this.readDirRecursive = vi.fn().mockResolvedValue([]);
            this.readFile = vi.fn().mockResolvedValue({});
            this.writeFile = vi.fn().mockResolvedValue(undefined);
            this.createDirectory = vi.fn().mockResolvedValue(undefined);
            this.renamePath = vi.fn().mockResolvedValue(undefined);
            this.deletePath = vi.fn().mockResolvedValue(undefined);
            this.watch = vi.fn((path, cb) => cb('change', path));
            this.stopWatch = vi.fn();
        })
    };
});

vi.mock('./services/RequestExecutor', () => {
    return {
        RequestExecutor: vi.fn().mockImplementation(function(this: any) {
            this.executeRequest = vi.fn().mockResolvedValue({});
        })
    };
});

vi.mock('electron', () => {
    const handlers: Record<string, Function> = {};
    const listeners: Record<string, Function> = {};
    return {
        ipcMain: {
            handle: vi.fn((channel, handler) => { handlers[channel] = handler; }),
            on: vi.fn((channel, listener) => { listeners[channel] = listener; }),
            _invoke: (channel: string, ...args: any[]) => handlers[channel](null, ...args),
            _emit: (channel: string, ...args: any[]) => listeners[channel](null, ...args)
        },
        app: {
            getPath: vi.fn().mockReturnValue('/mock/user/data')
        },
        dialog: {
            showOpenDialog: vi.fn().mockResolvedValue({ canceled: false, filePaths: ['/selected/path'] }),
            showSaveDialog: vi.fn().mockResolvedValue({ canceled: false, filePath: '/saved/path' })
        }
    };
});

describe('IPC setup', () => {
    let mockWindow: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockWindow = {
            isDestroyed: vi.fn().mockReturnValue(false),
            webContents: {
                send: vi.fn()
            }
        };
    });

    it('registers all handles', () => {
        setupIpc(mockWindow);
        expect(ipcMain.handle).toHaveBeenCalled();
        expect(ipcMain.on).toHaveBeenCalledWith('fs:watch', expect.any(Function));
    });

    it('covers app handlers', async () => {
        setupIpc(mockWindow);
        const getGlobalsPath = (ipcMain.handle as any).mock.calls.find((c: any) => c[0] === 'app:get-globals-path')[1];
        const result = await getGlobalsPath();
        expect(result).toContain('globals.json');
    });

    it('covers fs handlers calls', async () => {
        setupIpc(mockWindow);
        const handlers = (ipcMain.handle as any).mock.calls;
        
        // Find and call fs handlers
        await handlers.find((c: any) => c[0] === 'fs:read-dir')[1](null, '/path');
        await handlers.find((c: any) => c[0] === 'fs:read-file')[1](null, '/path');
        await handlers.find((c: any) => c[0] === 'fs:write-file')[1](null, '/path', {});
        await handlers.find((c: any) => c[0] === 'fs:create-dir')[1](null, '/path');
        await handlers.find((c: any) => c[0] === 'fs:rename')[1](null, '/old', '/new');
        await handlers.find((c: any) => c[0] === 'fs:delete')[1](null, '/path');
        
        const selectFolder = handlers.find((c: any) => c[0] === 'fs:select-folder')[1];
        const folder = await selectFolder();
        expect(folder).toBe('/selected/path');

        const selectFile = handlers.find((c: any) => c[0] === 'fs:select-file')[1];
        const file = await selectFile();
        expect(file).toBe('/selected/path');

        const saveFileDialog = handlers.find((c: any) => c[0] === 'fs:save-file-dialog')[1];
        const savePath = await saveFileDialog(null, 'test.json');
        expect(savePath).toBe('/saved/path');
    });

    it('covers canceled dialogs', async () => {
        setupIpc(mockWindow);
        const handlers = (ipcMain.handle as any).mock.calls;
        const { dialog } = await import('electron');
        
        (dialog.showOpenDialog as any).mockResolvedValueOnce({ canceled: true, filePaths: [] });
        const selectFolder = handlers.find((c: any) => c[0] === 'fs:select-folder')[1];
        expect(await selectFolder()).toBeNull();

        (dialog.showOpenDialog as any).mockResolvedValueOnce({ canceled: true, filePaths: [] });
        const selectFile = handlers.find((c: any) => c[0] === 'fs:select-file')[1];
        expect(await selectFile()).toBeNull();

        (dialog.showSaveDialog as any).mockResolvedValueOnce({ canceled: true, filePath: '' });
        const saveFileDialog = handlers.find((c: any) => c[0] === 'fs:save-file-dialog')[1];
        expect(await saveFileDialog()).toBeNull();
    });

    it('covers git handlers calls', async () => {
        setupIpc(mockWindow);
        const handlers = (ipcMain.handle as any).mock.calls;
        
        await handlers.find((c: any) => c[0] === 'git:status')[1](null, '/repo');
        await handlers.find((c: any) => c[0] === 'git:stage')[1](null, '/repo', []);
        await handlers.find((c: any) => c[0] === 'git:unstage')[1](null, '/repo', []);
        await handlers.find((c: any) => c[0] === 'git:commit')[1](null, '/repo', 'msg');
        await handlers.find((c: any) => c[0] === 'git:push')[1](null, '/repo');
        await handlers.find((c: any) => c[0] === 'git:pull')[1](null, '/repo');
        await handlers.find((c: any) => c[0] === 'git:checkout')[1](null, '/repo', 'branch');
        await handlers.find((c: any) => c[0] === 'git:get-branches')[1](null, '/repo');
        await handlers.find((c: any) => c[0] === 'git:find-repos')[1](null, '/path');
        await handlers.find((c: any) => c[0] === 'git:get-file-content')[1](null, '/repo', 'file', 'HEAD');
    });

    it('covers request handlers calls', async () => {
        setupIpc(mockWindow);
        const handlers = (ipcMain.handle as any).mock.calls;
        await handlers.find((c: any) => c[0] === 'request:execute')[1](null, {}, {});
    });

    it('covers fs:watch listener', () => {
        setupIpc(mockWindow);
        const watchListener = (ipcMain.on as any).mock.calls.find((c: any) => c[0] === 'fs:watch')[1];
        watchListener(null, '/path');
        expect(mockWindow.webContents.send).toHaveBeenCalled();

        // Test destroyed window branch
        mockWindow.isDestroyed.mockReturnValue(true);
        watchListener(null, '/path');
        expect(mockWindow.webContents.send).toHaveBeenCalledTimes(1); // not called again
    });
});
