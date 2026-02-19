/// <reference types="vite/client" />
import { J5FileEntry, J5Request } from '@/shared/types';

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare global {
    interface Window {
        ipcRenderer: import('electron').IpcRenderer
        electron: {
            fs: {
                readDir: (path: string) => Promise<J5FileEntry[]>;
                readFile: (path: string) => Promise<J5Request>;
                readTextFile: (path: string) => Promise<string>;
                writeFile: (path: string, content: any) => Promise<void>;
                createDirectory: (path: string) => Promise<void>;
                rename: (oldPath: string, newPath: string) => Promise<void>;
                delete: (path: string) => Promise<void>;
                saveRequests: (requests: any[], targetDir: string) => Promise<string[]>;
                readAllRequests: (path: string) => Promise<J5Request[]>;
                selectFolder: () => Promise<string | null>;
                selectFile: () => Promise<string | null>;
                saveFileDialog: (defaultName?: string) => Promise<string | null>;
                watch: (path: string) => void;
                onChanged: (callback: (event: string, path: string) => void) => () => void;
                getUserDataPath: () => Promise<string>;
                getGlobalsPath: () => Promise<string>;
            };
            git: {
                getStatus: (path: string) => Promise<import('../shared/types').GitStatus>;
                isRepository: (path: string) => Promise<boolean>;
                initRepository: (path: string) => Promise<void>;
                stage: (path: string, files: string[]) => Promise<void>;
                unstage: (path: string, files: string[]) => Promise<void>;
                commit: (path: string, message: string) => Promise<void>;
                push: (path: string) => Promise<void>;
                pull: (path: string) => Promise<void>;
                checkout: (path: string, branch: string) => Promise<void>;
                getBranches: (path: string) => Promise<string[]>;
                findRepos: (workspacePath: string) => Promise<string[]>;
                getFileContent: (repoPath: string, filePath: string, ref: string) => Promise<string>;
            };
            request: {
                execute: (request: Partial<J5Request>, environment: Record<string, string>) => Promise<any>;
            };
            import: {
                fromContent: (content: string, options?: any) => Promise<import('@/shared/import-types').ImportResult>;
                detectFormat: (content: string) => Promise<import('@/shared/import-types').FormatDetectionResult>;
            };
            export: {
                toClipboard: (content: string) => Promise<void>;
                toFile: (content: string, defaultName?: string) => Promise<string | null>;
                generate: (request: Partial<J5Request> | J5Request[], format: string) => Promise<string>;
            };
        }
    }
}
