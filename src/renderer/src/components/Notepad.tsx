import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import './Notepad.css'

interface NotepadProps {}

const Notepad: React.FC<NotepadProps> = () => {
  const [content, setContent] = useState<string>('')
  const [fileName, setFileName] = useState<string>('Untitled')
  const [filePath, setFilePath] = useState<string>('')
  const [isModified, setIsModified] = useState<boolean>(false)
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true)

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
    setIsModified(true)
  }

  const handleSave = async () => {
    try {
      const result = await window.api.saveFile(content, filePath)
      if (result.success && result.filePath) {
        setFilePath(result.filePath)
        setFileName(result.filePath.split(/[\\/]/).pop() || 'Untitled')
        setIsModified(false)
      } else if (result.error) {
        alert(`Error saving file: ${result.error}`)
      }
    } catch (error) {
      console.error('Error saving file:', error)
      alert('Error saving file')
    }
  }

  const handleOpen = async () => {
    try {
      const result = await window.api.openFile()
      if (result.success && result.content !== undefined) {
        setContent(result.content)
        setFilePath(result.filePath || '')
        setFileName(result.filePath?.split(/[\\/]/).pop() || 'Untitled')
        setIsModified(false)
      } else if (result.error) {
        alert(`Error opening file: ${result.error}`)
      }
    } catch (error) {
      console.error('Error opening file:', error)
      alert('Error opening file')
    }
  }

  const handleNew = () => {
    if (isModified) {
      const shouldContinue = confirm('You have unsaved changes. Continue without saving?')
      if (!shouldContinue) return
    }
    setContent('')
    setFileName('Untitled')
    setFilePath('')
    setIsModified(false)
  }

  const handleFileSelect = async (selectedFilePath: string) => {
    try {
      if (isModified) {
        const shouldContinue = confirm('You have unsaved changes. Continue without saving?')
        if (!shouldContinue) return
      }

      const result = await window.api.openFile(selectedFilePath)
      if (result.success && result.content !== undefined) {
        setContent(result.content)
        setFilePath(result.filePath || '')
        setFileName(result.filePath?.split(/[\\/]/).pop() || 'Untitled')
        setIsModified(false)
      } else if (result.error) {
        alert(`Error opening file: ${result.error}`)
      }
    } catch (error) {
      console.error('Error opening selected file:', error)
      alert('Error opening file')
    }
  }

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  // Listen for menu events
  useEffect(() => {
    const handleMenuNew = () => handleNew()
    const handleMenuOpen = () => handleOpen()
    const handleMenuSave = () => handleSave()
    const handleMenuToggleSidebar = () => toggleSidebar()

    window.electron.ipcRenderer.on('menu-new', handleMenuNew)
    window.electron.ipcRenderer.on('menu-open', handleMenuOpen)
    window.electron.ipcRenderer.on('menu-save', handleMenuSave)
    window.electron.ipcRenderer.on('menu-toggle-sidebar', handleMenuToggleSidebar)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('menu-new')
      window.electron.ipcRenderer.removeAllListeners('menu-open')
      window.electron.ipcRenderer.removeAllListeners('menu-save')
      window.electron.ipcRenderer.removeAllListeners('menu-toggle-sidebar')
    }
  }, [content, filePath, isModified, sidebarVisible])

  return (
    <div className="notepad-container">
      <div className="notepad-header">
        <div className="notepad-actions">
          <button onClick={toggleSidebar} className="btn btn-icon" title="Toggle Sidebar">
            {sidebarVisible ? '📂' : '📁'}
          </button>
          <button onClick={handleNew} className="btn btn-secondary">
            New
          </button>
          <button onClick={handleOpen} className="btn btn-secondary">
            Open
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Save
          </button>
        </div>
        
        <div className="notepad-title">
          Tidy Notepad
        </div>
        
        <div className="notepad-file-info">
          <span className="file-name">{fileName}{isModified ? ' *' : ''}</span>
        </div>
      </div>
      
      <div className="notepad-main">
        <Sidebar 
          isVisible={sidebarVisible} 
          onFileSelect={handleFileSelect}
        />
        
        <div className="notepad-editor">
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Start typing your notes here..."
            className="notepad-textarea"
            spellCheck={false}
          />
        </div>
      </div>
      
      <div className="notepad-status">
        <span>Characters: {content.length}</span>
        <span>Lines: {content.split('\n').length}</span>
      </div>
    </div>
  )
}

export default Notepad