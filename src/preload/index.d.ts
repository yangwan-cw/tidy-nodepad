import { ElectronAPI } from '@electron-toolkit/preload'

interface FileAPI {
  saveFile: (content: string, filePath?: string) => Promise<{
    success: boolean
    filePath?: string
    canceled?: boolean
    error?: string
  }>
  openFile: () => Promise<{
    success: boolean
    content?: string
    filePath?: string
    canceled?: boolean
    error?: string
  }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: FileAPI
  }
}
