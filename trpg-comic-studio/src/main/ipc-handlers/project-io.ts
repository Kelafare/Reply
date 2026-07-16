import { ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-channels'

/** 注册项目读写相关的 IPC 处理器（Phase 7 实现） */
export function registerProjectIOHandlers(): void {
  ipcMain.handle(IPC.PROJECT_CREATE, async (_event, _dirPath: string, _name: string) => {
    console.warn('[项目 IO] PROJECT_CREATE 尚未实现（Phase 7）')
    return { error: 'PROJECT_CREATE 尚未实现' }
  })

  ipcMain.handle(IPC.PROJECT_OPEN, async (_event, _dirPath: string) => {
    console.warn('[项目 IO] PROJECT_OPEN 尚未实现（Phase 7）')
    return { error: 'PROJECT_OPEN 尚未实现' }
  })

  ipcMain.handle(IPC.PROJECT_SAVE, async (_event, _dirPath: string, _data: string) => {
    console.warn('[项目 IO] PROJECT_SAVE 尚未实现（Phase 7）')
    return { error: 'PROJECT_SAVE 尚未实现' }
  })

  ipcMain.handle(IPC.PROJECT_SAVE_AS, async (_event, _oldDir: string, _newDir: string, _data: string) => {
    console.warn('[项目 IO] PROJECT_SAVE_AS 尚未实现（Phase 7）')
    return { error: 'PROJECT_SAVE_AS 尚未实现' }
  })
}
