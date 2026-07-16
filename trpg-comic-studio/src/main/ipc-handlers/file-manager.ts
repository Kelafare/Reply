import { ipcMain } from 'electron'
import { copyFile } from 'fs/promises'
import { join, basename } from 'path'
import { existsSync, readFileSync } from 'fs'
import { IPC } from '../../shared/ipc-channels'

export function registerFileManagerHandlers(): void {
  ipcMain.handle(IPC.FILE_COPY_TO_ASSET, async (_event, srcPath: string, projectDir: string) => {
    try {
      const assetsDir = join(projectDir, 'assets')
      const destPath = join(assetsDir, basename(srcPath))
      await copyFile(srcPath, destPath)
      return `assets/${basename(srcPath)}`
    } catch (err) {
      console.error('Failed to copy file to asset:', err)
      throw err
    }
  })

  ipcMain.handle(IPC.FILE_READ_ASSET, async (_event, filePath: string) => {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }
    return readFileSync(filePath)
  })

  ipcMain.handle(IPC.FILE_GET_THUMBNAIL, async (_event, filePath: string) => {
    // Phase 8 will implement real thumbnail generation
    // For now, return the file path so renderer can load the image directly
    console.warn('[file-manager] getThumbnail not fully implemented, returning path:', filePath)
    return filePath
  })
}
