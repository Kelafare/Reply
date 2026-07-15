"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Project I/O
  createProject: (dirPath, name) => electron.ipcRenderer.invoke("project:create", dirPath, name),
  openProject: (dirPath) => electron.ipcRenderer.invoke("project:open", dirPath),
  saveProject: (dirPath, data) => electron.ipcRenderer.invoke("project:save", dirPath, data),
  saveAsProject: (oldDir, newDir, data) => electron.ipcRenderer.invoke("project:saveAs", oldDir, newDir, data),
  // File operations
  selectDirectory: () => electron.ipcRenderer.invoke("dialog:selectDirectory"),
  copyFileToAsset: (srcPath, projectDir) => electron.ipcRenderer.invoke("file:copyToAsset", srcPath, projectDir),
  readAssetFile: (filePath) => electron.ipcRenderer.invoke("file:readAsset", filePath),
  getAssetThumbnail: (filePath) => electron.ipcRenderer.invoke("file:getThumbnail", filePath),
  // Log parsing
  parseDocxLog: (filePath) => electron.ipcRenderer.invoke("log:parseDocx", filePath),
  // ComfyUI
  comfyuiStatus: () => electron.ipcRenderer.invoke("comfyui:status"),
  comfyuiGenerate: (workflow) => electron.ipcRenderer.invoke("comfyui:generate", workflow),
  comfyuiCancel: (jobId) => electron.ipcRenderer.invoke("comfyui:cancel", jobId),
  // FFmpeg Export
  startExport: (config) => electron.ipcRenderer.invoke("export:start", config),
  cancelExport: () => electron.ipcRenderer.invoke("export:cancel"),
  onExportProgress: (callback) => electron.ipcRenderer.on("export:progress", (_event, progress) => callback(progress)),
  // System
  openInExplorer: (dirPath) => electron.ipcRenderer.invoke("system:openInExplorer", dirPath),
  getPlatform: () => process.platform
});
