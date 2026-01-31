import { app, BrowserWindow, utilityProcess } from 'electron'

import { fileURLToPath } from 'node:url'
import path from 'node:path'


const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let workerProcess: Electron.UtilityProcess | null = null

function createWorker() {
  // In dev, worker might be in a different place or need handling?
  // vite-plugin-electron builds everything to dist-electron.
  // We assume worker.js is output there.
  // Note: Extension might be .mjs or .js depending on build. Trying .js first as it's common.
  // However, since preload is .mjs in the template, maybe worker is too?
  // Let's try to detect or fallback.
  const workerPath = path.join(__dirname, 'worker.js')

  console.log('Spawning worker from:', workerPath)

  workerProcess = utilityProcess.fork(workerPath, [], {
    stdio: 'inherit',
  })

  workerProcess.on('spawn', () => {
    console.log('Worker process spawned successfully')
    workerProcess?.postMessage({ type: 'ping', payload: 'Hello from Main' })
  })

  workerProcess.on('message', (message) => {
    console.log('Main received message from worker:', message)
  })

  workerProcess.on('exit', (code) => {
    console.log('Worker process exited with code:', code)
    workerProcess = null
  })
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWorker()
  createWindow()
})
