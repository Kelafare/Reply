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
      console.error("Failed to copy file to asset:", err);
      throw err;
    }
  });
  electron.ipcMain.handle(IPC.FILE_READ_ASSET, async (_event, filePath) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return fs.readFileSync(filePath);
  });
  electron.ipcMain.handle(IPC.FILE_GET_THUMBNAIL, async (_event, filePath) => {
    console.warn("[file-manager] getThumbnail not fully implemented, returning path:", filePath);
    return filePath;
  });
}
function registerProjectIOHandlers() {
  electron.ipcMain.handle(IPC.PROJECT_CREATE, async (_event, _dirPath, _name) => {
    console.warn("[project-io] PROJECT_CREATE not yet implemented (Phase 7)");
    return { error: "PROJECT_CREATE not yet implemented" };
  });
  electron.ipcMain.handle(IPC.PROJECT_OPEN, async (_event, _dirPath) => {
    console.warn("[project-io] PROJECT_OPEN not yet implemented (Phase 7)");
    return { error: "PROJECT_OPEN not yet implemented" };
  });
  electron.ipcMain.handle(IPC.PROJECT_SAVE, async (_event, _dirPath, _data) => {
    console.warn("[project-io] PROJECT_SAVE not yet implemented (Phase 7)");
    return { error: "PROJECT_SAVE not yet implemented" };
  });
  electron.ipcMain.handle(IPC.PROJECT_SAVE_AS, async (_event, _oldDir, _newDir, _data) => {
    console.warn("[project-io] PROJECT_SAVE_AS not yet implemented (Phase 7)");
    return { error: "PROJECT_SAVE_AS not yet implemented" };
  });
}
let mainWindow = null;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1600,
    height: 1e3,
    minWidth: 1280,
    minHeight: 720,
    title: "TRPG Comic Studio",
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
