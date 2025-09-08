import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import CodeEditor from './CodeEditor'
import { getLanguageInfo, supportedLanguages, LanguageInfo } from '../utils/languageDetector'
import './Notepad.css'

interface NotepadProps {}

const Notepad: React.FC<NotepadProps> = () => {
  const [content, setContent] = useState<string>('')
  const [fileName, setFileName] = useState<string>('Untitled')
  const [filePath, setFilePath] = useState<string>('')
  const [isModified, setIsModified] = useState<boolean>(false)
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true)
  const [currentLanguage, setCurrentLanguage] = useState<LanguageInfo>(
    supportedLanguages.find(lang => lang.language === 'text')!
  )
  const [editorTheme, setEditorTheme] = useState<'light' | 'dark'>('light')

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setIsModified(true)
    
    // 自动检测语言（仅在内容变化时，不是文件打开时）
    if (fileName === 'Untitled' && newContent.trim().length > 10) {
      const detectedLanguage = getLanguageInfo(fileName, newContent)
      if (detectedLanguage.language !== currentLanguage.language) {
        setCurrentLanguage(detectedLanguage)
      }
    }
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
        const newFileName = result.filePath?.split(/[\\/]/).pop() || 'Untitled'
        setContent(result.content)
        setFilePath(result.filePath || '')
        setFileName(newFileName)
        setIsModified(false)
        
        // 检测文件语言
        const detectedLanguage = getLanguageInfo(newFileName, result.content)
        setCurrentLanguage(detectedLanguage)
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
    setCurrentLanguage(supportedLanguages.find(lang => lang.language === 'text')!)
  }

  const handleFileSelect = async (selectedFilePath: string) => {
    try {
      if (isModified) {
        const shouldContinue = confirm('You have unsaved changes. Continue without saving?')
        if (!shouldContinue) return
      }

      const result = await window.api.openFile(selectedFilePath)
      if (result.success && result.content !== undefined) {
        const newFileName = result.filePath?.split(/[\\/]/).pop() || 'Untitled'
        setContent(result.content)
        setFilePath(result.filePath || '')
        setFileName(newFileName)
        setIsModified(false)
        
        // 检测文件语言
        const detectedLanguage = getLanguageInfo(newFileName, result.content)
        setCurrentLanguage(detectedLanguage)
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

  const handleLanguageChange = (language: string) => {
    const langInfo = supportedLanguages.find(lang => lang.language === language)
    if (langInfo) {
      setCurrentLanguage(langInfo)
    }
  }

  const toggleTheme = () => {
    setEditorTheme(editorTheme === 'light' ? 'dark' : 'light')
  }

  // Listen for menu events
  useEffect(() => {
    const handleMenuNew = () => handleNew()
    const handleMenuOpen = () => handleOpen()
    const handleMenuSave = () => handleSave()
    const handleMenuToggleSidebar = () => toggleSidebar()
    const handleMenuToggleTheme = () => toggleTheme()

    window.electron.ipcRenderer.on('menu-new', handleMenuNew)
    window.electron.ipcRenderer.on('menu-open', handleMenuOpen)
    window.electron.ipcRenderer.on('menu-save', handleMenuSave)
    window.electron.ipcRenderer.on('menu-toggle-sidebar', handleMenuToggleSidebar)
    window.electron.ipcRenderer.on('menu-toggle-theme', handleMenuToggleTheme)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('menu-new')
      window.electron.ipcRenderer.removeAllListeners('menu-open')
      window.electron.ipcRenderer.removeAllListeners('menu-save')
      window.electron.ipcRenderer.removeAllListeners('menu-toggle-sidebar')
      window.electron.ipcRenderer.removeAllListeners('menu-toggle-theme')
    }
  }, [content, filePath, isModified, sidebarVisible])

  return (
    <div className={`notepad-container ${editorTheme === 'dark' ? 'dark-theme' : ''}`}>
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
          <button onClick={toggleTheme} className="btn btn-icon" title="Toggle Theme">
            {editorTheme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        
        <div className="notepad-title">
          Tidy Notepad
        </div>
        
        <div className="notepad-file-info">
          <select 
            value={currentLanguage.language} 
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="language-selector"
            title="Select Language"
          >
            {supportedLanguages.map(lang => (
              <option key={lang.language} value={lang.language}>
                {lang.displayName}
              </option>
            ))}
          </select>
          <span className="file-name">{fileName}{isModified ? ' *' : ''}</span>
        </div>
      </div>
      
      <div className="notepad-main">
        <Sidebar 
          isVisible={sidebarVisible} 
          onFileSelect={handleFileSelect}
        />
        
        <div className="notepad-editor">
          <CodeEditor
            value={content}
            onChange={handleContentChange}
            language={currentLanguage.language}
            theme={editorTheme}
            placeholder="Start typing your code here..."
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