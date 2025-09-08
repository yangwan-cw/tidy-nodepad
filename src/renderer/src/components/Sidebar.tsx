import { useState } from 'react'
import './Sidebar.css'

interface FileItem {
  name: string
  path: string
  isDirectory: boolean
  children?: FileItem[]
  isExpanded?: boolean
}

interface SidebarProps {
  isVisible: boolean
  onFileSelect: (filePath: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible, onFileSelect }) => {
  const [currentDirectory, setCurrentDirectory] = useState<string>('')
  const [fileTree, setFileTree] = useState<FileItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const loadDirectory = async (dirPath?: string) => {
    try {
      setLoading(true)
      const result = await window.api.readDirectory(dirPath)
      if (result.success && result.files) {
        setFileTree(result.files)
        setCurrentDirectory(result.path || '')
      }
    } catch (error) {
      console.error('Error loading directory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDirectorySelect = async () => {
    try {
      const result = await window.api.selectDirectory()
      if (result.success && result.path) {
        await loadDirectory(result.path)
      }
    } catch (error) {
      console.error('Error selecting directory:', error)
    }
  }

  const toggleDirectory = async (item: FileItem, index: number) => {
    if (!item.isDirectory) return

    const newTree = [...fileTree]
    const targetItem = newTree[index]

    if (targetItem.isExpanded) {
      targetItem.isExpanded = false
      targetItem.children = []
    } else {
      try {
        const result = await window.api.readDirectory(item.path)
        if (result.success && result.files) {
          targetItem.children = result.files
          targetItem.isExpanded = true
        }
      } catch (error) {
        console.error('Error expanding directory:', error)
      }
    }

    setFileTree(newTree)
  }

  const handleFileClick = (item: FileItem) => {
    if (!item.isDirectory) {
      onFileSelect(item.path)
    }
  }

  const renderFileItem = (item: FileItem, index: number, depth: number = 0) => {
    return (
      <div key={item.path} className="file-item-container">
        <div
          className={`file-item ${item.isDirectory ? 'directory' : 'file'}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => item.isDirectory ? toggleDirectory(item, index) : handleFileClick(item)}
        >
          <span className="file-icon">
            {item.isDirectory ? (
              item.isExpanded ? '📂' : '📁'
            ) : (
              getFileIcon(item.name)
            )}
          </span>
          <span className="file-name">{item.name}</span>
        </div>
        {item.isExpanded && item.children && (
          <div className="file-children">
            {item.children.map((child, childIndex) =>
              renderFileItem(child, childIndex, depth + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  const getFileIcon = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'txt':
        return '📄'
      case 'md':
        return '📝'
      case 'js':
      case 'ts':
        return '📜'
      case 'json':
        return '⚙️'
      case 'css':
        return '🎨'
      case 'html':
        return '🌐'
      default:
        return '📄'
    }
  }

  return (
    <div className={`sidebar ${!isVisible ? 'hidden' : ''}`}>
      <div className="sidebar-header">
        <h3>Explorer</h3>
        <button onClick={handleDirectorySelect} className="btn-icon" title="Open Folder">
          📁
        </button>
      </div>

      <div className="sidebar-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : currentDirectory ? (
          <div className="directory-info">
            <div className="current-path" title={currentDirectory}>
              {currentDirectory.split(/[\\/]/).pop() || currentDirectory}
            </div>
            <div className="file-tree">
              {fileTree.map((item, index) => renderFileItem(item, index))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>No folder opened</p>
            <button onClick={handleDirectorySelect} className="btn btn-secondary">
              Open Folder
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar