import { ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-channels'

export function registerProjectIOHandlers(): void {
  ipcMain.handle(IPC.PROJECT_CREATE, async (_event, _dirPath: string, _name: string) => {
    console.warn('[project-io] PROJECT_CREATE not yet implemented (Phase 7)')
    return { error: 'PROJECT_CREATE not yet implemented' }
  })

  ipcMain.handle(IPC.PROJECT_OPEN, async (_event, _dirPath: string) => {
    console.warn('[project-io] PROJECT_OPEN not yet implemented (Phase 7)')
    return { error: 'PROJECT_OPEN not yet implemented' }
  })

  ipcMain.handle(IPC.PROJECT_SAVE, async (_event, _dirPath: string, _data: string) => {
    console.warn('[project-io] PROJECT_SAVE not yet implemented (Phase 7)')
    return { error: 'PROJECT_SAVE not yet implemented' }
  })

  ipcMain.handle(IPC.PROJECT_SAVE_AS, async (_event, _oldDir: string, _newDir: string, _data: string) => {
    console.warn('[project-io] PROJECT_SAVE_AS not yet implemented (Phase 7)')
    return { error: 'PROJECT_SAVE_AS not yet implemented' }
  })
}
