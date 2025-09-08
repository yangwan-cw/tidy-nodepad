import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  saveFile: (content: string, filePath?: string) => 
    electronAPI.ipcRenderer.invoke('save-file', content, filePath),
  openFile: (filePath?: string) => 
    electronAPI.ipcRenderer.invoke('open-file', filePath),
  readDirectory: (dirPath?: string) =>
    electronAPI.ipcRenderer.invoke('read-directory', dirPath),
  selectDirectory: () =>
    electronAPI.ipcRenderer.invoke('select-directory')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
