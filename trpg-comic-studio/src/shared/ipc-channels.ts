// IPC channel name constants — shared between main & renderer

export const IPC = {
  // Project I/O
  PROJECT_CREATE: 'project:create',
  PROJECT_OPEN: 'project:open',
  PROJECT_SAVE: 'project:save',
  PROJECT_SAVE_AS: 'project:saveAs',

  // Dialogs
  DIALOG_SELECT_DIRECTORY: 'dialog:selectDirectory',

  // File operations
  FILE_COPY_TO_ASSET: 'file:copyToAsset',
  FILE_READ_ASSET: 'file:readAsset',
  FILE_GET_THUMBNAIL: 'file:getThumbnail',

  // Log parsing
  LOG_PARSE_DOCX: 'log:parseDocx',

  // ComfyUI
  COMFYUI_STATUS: 'comfyui:status',
  COMFYUI_GENERATE: 'comfyui:generate',
  COMFYUI_CANCEL: 'comfyui:cancel',

  // Export
  EXPORT_START: 'export:start',
  EXPORT_CANCEL: 'export:cancel',
  EXPORT_PROGRESS: 'export:progress',

  // System
  SYSTEM_OPEN_IN_EXPLORER: 'system:openInExplorer',
} as const

export type IpcChannel = (typeof IPC)[keyof typeof IPC]
