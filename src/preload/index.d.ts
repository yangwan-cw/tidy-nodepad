import { ElectronAPI } from '@electron-toolkit/preload'

interface FileItem {
  name: string
  path: string
  isDirectory: boolean
}

interface FileAPI {
  saveFile: (content: string, filePath?: string) => Promise<{
    success: boolean
    filePath?: string
    canceled?: boolean
    error?: string
  }>
  openFile: (filePath?: string) => Promise<{
    success: boolean
    content?: string
    filePath?: string
    canceled?: boolean
    error?: string
  }>
  readDirectory: (dirPath?: string) => Promise<{
    success: boolean
    files?: FileItem[]
    path?: string
    error?: string
  }>
  selectDirectory: () => Promise<{
    success: boolean
    path?: string
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
