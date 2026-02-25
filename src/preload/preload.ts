import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

// Custom File System API
contextBridge.exposeInMainWorld('electron', {
  fs: {
    readDir: (path: string) => ipcRenderer.invoke('fs:read-dir', path),
    readFile: (path: string) => ipcRenderer.invoke('fs:read-file', path),
    readTextFile: (path: string) => ipcRenderer.invoke('fs:read-text-file', path),
    writeFile: (path: string, content: any) => ipcRenderer.invoke('fs:write-file', path, content),
    writeTextFile: (path: string, content: string) => ipcRenderer.invoke('fs:write-text-file', path, content),
    createDirectory: (path: string) => ipcRenderer.invoke('fs:create-dir', path),
    rename: (oldPath: string, newPath: string) => ipcRenderer.invoke('fs:rename', oldPath, newPath),
    delete: (path: string) => ipcRenderer.invoke('fs:delete', path),
    saveRequests: (requests: any[], targetDir: string) => ipcRenderer.invoke('fs:save-requests', requests, targetDir),
    readAllRequests: (path: string) => ipcRenderer.invoke('fs:read-all-requests', path),
    selectFolder: () => ipcRenderer.invoke('fs:select-folder'),
    selectFile: () => ipcRenderer.invoke('fs:select-file'),
    saveFileDialog: (defaultName?: string) => ipcRenderer.invoke('fs:save-file-dialog', defaultName),
    watch: (path: string) => ipcRenderer.send('fs:watch', path),
    onChanged: (callback: (event: string, path: string) => void) => {
      const listener = (_e: any, event: string, path: string) => callback(event, path);
      ipcRenderer.on('fs:changed', listener);
      return () => ipcRenderer.removeListener('fs:changed', listener);
    },
    getUserDataPath: () => ipcRenderer.invoke('app:get-user-data-path'),
    getGlobalsPath: () => ipcRenderer.invoke('app:get-globals-path'),
    makeRelative: (root: string, file: string) => ipcRenderer.invoke('fs:relative-path', root, file),
  },
  git: {
    getStatus: (path: string) => ipcRenderer.invoke('git:status', path),
    isRepository: (path: string) => ipcRenderer.invoke('git:is-repository', path),
    initRepository: (path: string) => ipcRenderer.invoke('git:init-repository', path),
    stage: (path: string, files: string[]) => ipcRenderer.invoke('git:stage', path, files),
    unstage: (path: string, files: string[]) => ipcRenderer.invoke('git:unstage', path, files),
    commit: (path: string, message: string) => ipcRenderer.invoke('git:commit', path, message),
    push: (path: string) => ipcRenderer.invoke('git:push', path),
    pull: (path: string) => ipcRenderer.invoke('git:pull', path),
    checkout: (path: string, branch: string) => ipcRenderer.invoke('git:checkout', path, branch),
    getBranches: (path: string) => ipcRenderer.invoke('git:get-branches', path),
    findRepos: (path: string) => ipcRenderer.invoke('git:find-repos', path),
    getFileContent: (path: string, filePath: string, ref: string) => ipcRenderer.invoke('git:get-file-content', path, filePath, ref),
  },
  request: {
    execute: (request: any, environment: any, projectRoot?: string) => ipcRenderer.invoke('request:execute', request, environment, projectRoot)
  },
  import: {
    fromContent: (content: string, options?: any) => ipcRenderer.invoke('import:from-content', content, options),
    detectFormat: (content: string) => ipcRenderer.invoke('import:detect-format', content),
  },
  export: {
    toClipboard: (content: string) => ipcRenderer.invoke('export:clipboard', content),
    toFile: (content: string, defaultName?: string) => ipcRenderer.invoke('export:file', content, defaultName),
    generate: (request: any, format: string) => ipcRenderer.invoke('export:generate', request, format)
  },
  ssl: {
    selectCertificateFile: () => ipcRenderer.invoke('fs:select-cert-file')
  },
  environment: {
    load: (filePath: string, projectPath?: string) => ipcRenderer.invoke('environment:load', filePath, projectPath),
    save: (filePath: string, env: any, projectPath?: string) => ipcRenderer.invoke('environment:save', filePath, env, projectPath),
  }
})
