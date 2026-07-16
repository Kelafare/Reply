import { app, BrowserWindow, shell, Menu } from 'electron'
import { join } from 'path'
import { registerDialogHandlers } from './ipc-handlers/dialog'
import { registerFileManagerHandlers } from './ipc-handlers/file-manager'
import { registerProjectIOHandlers } from './ipc-handlers/project-io'

let mainWindow: BrowserWindow | null = null

/** 构建中文应用菜单 */
function buildMenu(): void {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    // macOS 应用菜单
    ...(isMac
      ? [
          {
            label: 'TRPG 漫画工作室',
            submenu: [
              { role: 'about' as const, label: '关于' },
              { type: 'separator' as const },
              { role: 'quit' as const, label: '退出' },
            ],
          },
        ]
      : []),

    // 文件
    {
      label: '文件',
      submenu: [
        {
          label: '新建项目',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu:new-project'),
        },
        {
          label: '打开项目',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow?.webContents.send('menu:open-project'),
        },
        { type: 'separator' },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('menu:save'),
        },
        {
          label: '另存为…',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow?.webContents.send('menu:save-as'),
        },
        { type: 'separator' },
        ...(isMac ? [] : [{ role: 'quit' as const, label: '退出' }]),
      ],
    },

    // 编辑
    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo',
        },
        {
          label: '重做',
          accelerator: 'CmdOrCtrl+Shift+Z',
          role: 'redo',
        },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      ],
    },

    // 视图
    {
      label: '视图',
      submenu: [
        {
          label: '放大',
          accelerator: 'CmdOrCtrl+=',
          click: () => mainWindow?.webContents.send('menu:zoom-in'),
        },
        {
          label: '缩小',
          accelerator: 'CmdOrCtrl+-',
          click: () => mainWindow?.webContents.send('menu:zoom-out'),
        },
        {
          label: '重置视图',
          accelerator: 'CmdOrCtrl+0',
          click: () => mainWindow?.webContents.send('menu:zoom-reset'),
        },
        { type: 'separator' },
        { label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' },
      ],
    },

    // 帮助
    {
      label: '帮助',
      submenu: [
        {
          label: '关于 TRPG 漫画工作室',
          click: () => {
            const { dialog } = require('electron')
            dialog.showMessageBox({
              type: 'info',
              title: '关于',
              message: 'TRPG 漫画工作室',
              detail: '为 TRPG 跑团 Replay 创作者打造的动态漫画桌面应用。\n版本 0.1.0',
            })
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1280,
    minHeight: 720,
    title: 'TRPG 漫画工作室',
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

  // 开发模式加载 HMR URL，生产模式加载文件
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // 设置中文菜单
  buildMenu()

  // 注册 IPC 处理器——必须在 whenReady 回调中，确保 ipcMain 可用
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
