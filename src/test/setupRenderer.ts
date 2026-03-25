import { vi, beforeEach } from 'vitest';

// Mock window.electron only if window exists (renderer tests)
if (typeof window !== 'undefined') {
    (window as any).electron = {
        ipcRenderer: {
            send: vi.fn(),
            on: vi.fn(),
            invoke: vi.fn(),
            removeListener: vi.fn(),
            off: vi.fn(),
        },
        fs: {
            readDir: vi.fn(),
            readFile: vi.fn(),
            readTextFile: vi.fn(),
            writeFile: vi.fn(),
            writeTextFile: vi.fn(),
            createDirectory: vi.fn(),
            rename: vi.fn(),
            delete: vi.fn(),
            saveRequests: vi.fn(),
            readAllRequests: vi.fn(),
            selectFolder: vi.fn(),
            selectFile: vi.fn(),
            saveFileDialog: vi.fn(),
            watch: vi.fn(),
            onChanged: vi.fn(() => () => {}),
            getUserDataPath: vi.fn(),
            getGlobalsPath: vi.fn(),
            makeRelative: vi.fn(),
        },
        git: {
            getStatus: vi.fn(),
            isRepository: vi.fn(),
            initRepository: vi.fn(),
            stage: vi.fn(),
            unstage: vi.fn(),
            commit: vi.fn(),
            push: vi.fn(),
            pull: vi.fn(),
            checkout: vi.fn(),
            getBranches: vi.fn(),
            findRepos: vi.fn(),
            getFileContent: vi.fn(),
        },
        request: {
            execute: vi.fn()
        },
        import: {
            fromContent: vi.fn(),
            detectFormat: vi.fn(),
        },
        export: {
            toClipboard: vi.fn(),
            toFile: vi.fn(),
            generate: vi.fn()
        },
        ssl: {
            selectCertificateFile: vi.fn()
        },
        environment: {
            load: vi.fn(),
            save: vi.fn(),
        }
    };

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }))
    });

    // Mock alert
    (window as any).alert = vi.fn();
}

// Mock LocalStorage if needed (jsdom usually supports it, but ensure reset)
beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
        localStorage.clear();
    }
    vi.clearAllMocks();
});
