import { ipcMain } from 'electron'
import { copyFile } from 'fs/promises'
import { join, basename } from 'path'
import { existsSync, readFileSync } from 'fs'
import { IPC } from '../../shared/ipc-channels'

/** 注册文件管理相关的 IPC 处理器 */
export function registerFileManagerHandlers(): void {
  ipcMain.handle(IPC.FILE_COPY_TO_ASSET, async (_event, srcPath: string, projectDir: string) => {
    try {
      const assetsDir = join(projectDir, 'assets')
      const destPath = join(assetsDir, basename(srcPath))
      await copyFile(srcPath, destPath)
      return `assets/${basename(srcPath)}`
    } catch (err) {
      console.error('[文件管理] 复制素材文件失败：', err)
      throw err
    }
  })

  ipcMain.handle(IPC.FILE_READ_ASSET, async (_event, filePath: string) => {
    if (!existsSync(filePath)) {
      throw new Error(`文件不存在：${filePath}`)
    }
    return readFileSync(filePath)
  })

  ipcMain.handle(IPC.FILE_GET_THUMBNAIL, async (_event, filePath: string) => {
    // Phase 8 将实现真正的缩略图生成
    // 目前直接返回文件路径，让渲染进程自行加载
    console.warn('[文件管理] 缩略图生成尚未实现，直接返回路径：', filePath)
    return filePath
  })
}
