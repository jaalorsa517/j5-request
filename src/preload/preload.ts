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
    writeFile: (path: string, content: any) => ipcRenderer.invoke('fs:write-file', path, content),
    createDirectory: (path: string) => ipcRenderer.invoke('fs:create-dir', path),
    rename: (oldPath: string, newPath: string) => ipcRenderer.invoke('fs:rename', oldPath, newPath),
    delete: (path: string) => ipcRenderer.invoke('fs:delete', path),
    selectFolder: () => ipcRenderer.invoke('fs:select-folder'),
    watch: (path: string) => ipcRenderer.send('fs:watch', path),
    onChanged: (callback: (event: string, path: string) => void) => {
      const listener = (_e: any, event: string, path: string) => callback(event, path);
      ipcRenderer.on('fs:changed', listener);
      return () => ipcRenderer.off('fs:changed', listener);
    }
  }
})
