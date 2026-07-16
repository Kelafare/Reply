import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { registerDialogHandlers } from './ipc-handlers/dialog'
import { registerFileManagerHandlers } from './ipc-handlers/file-manager'
import { registerProjectIOHandlers } from './ipc-handlers/project-io'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1280,
    minHeight: 720,
    title: 'TRPG Comic Studio',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for dev, load file for production
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Register IPC handlers — must be inside whenReady so ipcMain is available
  registerDialogHandlers()
  registerFileManagerHandlers()
  registerProjectIOHandlers()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
