"use strict";
const electron = require("electron");
const path = require("path");
const promises = require("fs/promises");
const fs = require("fs");
const IPC = {
  // Project I/O
  PROJECT_CREATE: "project:create",
  PROJECT_OPEN: "project:open",
  PROJECT_SAVE: "project:save",
  PROJECT_SAVE_AS: "project:saveAs",
  // Dialogs
  DIALOG_SELECT_DIRECTORY: "dialog:selectDirectory",
  // File operations
  FILE_COPY_TO_ASSET: "file:copyToAsset",
  FILE_READ_ASSET: "file:readAsset",
  FILE_GET_THUMBNAIL: "file:getThumbnail"
};
function registerDialogHandlers() {
  electron.ipcMain.handle(IPC.DIALOG_SELECT_DIRECTORY, async () => {
    const result = await electron.dialog.showOpenDialog({
      properties: ["openDirectory"],
      title: "选择文件夹"
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });
}
function registerFileManagerHandlers() {
  electron.ipcMain.handle(IPC.FILE_COPY_TO_ASSET, async (_event, srcPath, projectDir) => {
    try {
      const assetsDir = path.join(projectDir, "assets");
      const destPath = path.join(assetsDir, path.basename(srcPath));
      await promises.copyFile(srcPath, destPath);
      return `assets/${path.basename(srcPath)}`;
    } catch (err) {
      console.error("[文件管理] 复制素材文件失败：", err);
      throw err;
    }
  });
  electron.ipcMain.handle(IPC.FILE_READ_ASSET, async (_event, filePath) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在：${filePath}`);
    }
    return fs.readFileSync(filePath);
  });
  electron.ipcMain.handle(IPC.FILE_GET_THUMBNAIL, async (_event, filePath) => {
    console.warn("[文件管理] 缩略图生成尚未实现，直接返回路径：", filePath);
    return filePath;
  });
}
function registerProjectIOHandlers() {
  electron.ipcMain.handle(IPC.PROJECT_CREATE, async (_event, _dirPath, _name) => {
    console.warn("[项目 IO] PROJECT_CREATE 尚未实现（Phase 7）");
    return { error: "PROJECT_CREATE 尚未实现" };
  });
  electron.ipcMain.handle(IPC.PROJECT_OPEN, async (_event, _dirPath) => {
    console.warn("[项目 IO] PROJECT_OPEN 尚未实现（Phase 7）");
    return { error: "PROJECT_OPEN 尚未实现" };
  });
  electron.ipcMain.handle(IPC.PROJECT_SAVE, async (_event, _dirPath, _data) => {
    console.warn("[项目 IO] PROJECT_SAVE 尚未实现（Phase 7）");
    return { error: "PROJECT_SAVE 尚未实现" };
  });
  electron.ipcMain.handle(IPC.PROJECT_SAVE_AS, async (_event, _oldDir, _newDir, _data) => {
    console.warn("[项目 IO] PROJECT_SAVE_AS 尚未实现（Phase 7）");
    return { error: "PROJECT_SAVE_AS 尚未实现" };
  });
}
let mainWindow = null;
function buildMenu() {
  const isMac = process.platform === "darwin";
  const template = [
    // macOS 应用菜单
    ...isMac ? [
      {
        label: "TRPG 漫画工作室",
        submenu: [
          { role: "about", label: "关于" },
          { type: "separator" },
          { role: "quit", label: "退出" }
        ]
      }
    ] : [],
    // 文件
    {
      label: "文件",
      submenu: [
        {
          label: "新建项目",
          accelerator: "CmdOrCtrl+N",
          click: () => mainWindow?.webContents.send("menu:new-project")
        },
        {
          label: "打开项目",
          accelerator: "CmdOrCtrl+O",
          click: () => mainWindow?.webContents.send("menu:open-project")
        },
        { type: "separator" },
        {
          label: "保存",
          accelerator: "CmdOrCtrl+S",
          click: () => mainWindow?.webContents.send("menu:save")
        },
        {
          label: "另存为…",
          accelerator: "CmdOrCtrl+Shift+S",
          click: () => mainWindow?.webContents.send("menu:save-as")
        },
        { type: "separator" },
        ...isMac ? [] : [{ role: "quit", label: "退出" }]
      ]
    },
    // 编辑
    {
      label: "编辑",
      submenu: [
        {
          label: "撤销",
          accelerator: "CmdOrCtrl+Z",
          role: "undo"
        },
        {
          label: "重做",
          accelerator: "CmdOrCtrl+Shift+Z",
          role: "redo"
        },
        { type: "separator" },
        { label: "剪切", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "复制", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "粘贴", accelerator: "CmdOrCtrl+V", role: "paste" }
      ]
    },
    // 视图
    {
      label: "视图",
      submenu: [
        {
          label: "放大",
          accelerator: "CmdOrCtrl+=",
          click: () => mainWindow?.webContents.send("menu:zoom-in")
        },
        {
          label: "缩小",
          accelerator: "CmdOrCtrl+-",
          click: () => mainWindow?.webContents.send("menu:zoom-out")
        },
        {
          label: "重置视图",
          accelerator: "CmdOrCtrl+0",
          click: () => mainWindow?.webContents.send("menu:zoom-reset")
        },
        { type: "separator" },
        { label: "开发者工具", accelerator: "F12", role: "toggleDevTools" }
      ]
    },
    // 帮助
    {
      label: "帮助",
      submenu: [
        {
          label: "关于 TRPG 漫画工作室",
          click: () => {
            const { dialog } = require("electron");
            dialog.showMessageBox({
              type: "info",
              title: "关于",
              message: "TRPG 漫画工作室",
              detail: "为 TRPG 跑团 Replay 创作者打造的动态漫画桌面应用。\n版本 0.1.0"
            });
          }
        }
      ]
    }
  ];
  const menu = electron.Menu.buildFromTemplate(template);
  electron.Menu.setApplicationMenu(menu);
}
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1600,
    height: 1e3,
    minWidth: 1280,
    minHeight: 720,
    title: "TRPG 漫画工作室",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (!electron.app.isPackaged && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  buildMenu();
  registerDialogHandlers();
  registerFileManagerHandlers();
  registerProjectIOHandlers();
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
