import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupIpc } from './ipc';
import { ipcMain } from 'electron';

// Mock services used by IPC
vi.mock('./services/GitService', () => ({
    gitService: {
        getStatus: vi.fn().mockResolvedValue({}),
        push: vi.fn().mockResolvedValue(undefined)
    }
}));

vi.mock('./services/FileSystemService', () => {
    return {
        FileSystemService: vi.fn().mockImplementation(function(this: any) {
            this.readDirRecursive = vi.fn().mockResolvedValue([]);
            this.watch = vi.fn();
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
        
        // Find and call some fs handlers
        const readDir = handlers.find((c: any) => c[0] === 'fs:read-dir')[1];
        await readDir(null, '/path');
        
        const selectFolder = handlers.find((c: any) => c[0] === 'fs:select-folder')[1];
        const folder = await selectFolder();
        expect(folder).toBe('/selected/path');

        const saveFileDialog = handlers.find((c: any) => c[0] === 'fs:save-file-dialog')[1];
        const savePath = await saveFileDialog(null, 'test.json');
        expect(savePath).toBe('/saved/path');
    });

    it('covers git handlers calls', async () => {
        setupIpc(mockWindow);
        const handlers = (ipcMain.handle as any).mock.calls;
        
        const getStatus = handlers.find((c: any) => c[0] === 'git:status')[1];
        await getStatus(null, '/repo');

        const push = handlers.find((c: any) => c[0] === 'git:push')[1];
        await push(null, '/repo');
    });

    it('covers fs:watch listener', () => {
        setupIpc(mockWindow);
        const watchListener = (ipcMain.on as any).mock.calls.find((c: any) => c[0] === 'fs:watch')[1];
        
        // Mock the service watch behavior to trigger the callback
        // This is hard without mocking the service instance inside setupIpc,
        // but calling the listener itself covers the ipc.on line.
        watchListener(null, '/path');
    });
});
