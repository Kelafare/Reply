import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods for renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Project I/O
  createProject: (dirPath: string, name: string) =>
    ipcRenderer.invoke('project:create', dirPath, name),
  openProject: (dirPath: string) =>
    ipcRenderer.invoke('project:open', dirPath),
  saveProject: (dirPath: string, data: string) =>
    ipcRenderer.invoke('project:save', dirPath, data),
  saveAsProject: (oldDir: string, newDir: string, data: string) =>
    ipcRenderer.invoke('project:saveAs', oldDir, newDir, data),

  // File operations
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
  copyFileToAsset: (srcPath: string, projectDir: string) =>
    ipcRenderer.invoke('file:copyToAsset', srcPath, projectDir),
  readAssetFile: (filePath: string) =>
    ipcRenderer.invoke('file:readAsset', filePath),
  getAssetThumbnail: (filePath: string) =>
    ipcRenderer.invoke('file:getThumbnail', filePath),

  // Log parsing
  parseDocxLog: (filePath: string) =>
    ipcRenderer.invoke('log:parseDocx', filePath),

  // ComfyUI
  comfyuiStatus: () => ipcRenderer.invoke('comfyui:status'),
  comfyuiGenerate: (workflow: object) =>
    ipcRenderer.invoke('comfyui:generate', workflow),
  comfyuiCancel: (jobId: string) =>
    ipcRenderer.invoke('comfyui:cancel', jobId),

  // FFmpeg Export
  startExport: (config: object) =>
    ipcRenderer.invoke('export:start', config),
  cancelExport: () => ipcRenderer.invoke('export:cancel'),
  onExportProgress: (callback: (progress: number) => void) =>
    ipcRenderer.on('export:progress', (_event, progress) => callback(progress)),

  // System
  openInExplorer: (dirPath: string) =>
    ipcRenderer.invoke('system:openInExplorer', dirPath),
  getPlatform: () => process.platform,
})
