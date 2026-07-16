import { ipcMain, dialog } from 'electron'
import { IPC } from '../../shared/ipc-channels'

export function registerDialogHandlers(): void {
  ipcMain.handle(IPC.DIALOG_SELECT_DIRECTORY, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: '选择文件夹',
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  })
}
