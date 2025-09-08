import { useState, useEffect, useRef } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import './CodeEditor.css'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  theme?: 'light' | 'dark'
  placeholder?: string
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  theme = 'light',
  placeholder = 'Start typing your code here...'
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlighterRef = useRef<HTMLDivElement>(null)

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)
  }

  const handleTextareaFocus = () => {
    setIsEditing(true)
  }

  const handleTextareaBlur = () => {
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    // 处理Tab键缩进
    if (e.key === 'Tab') {
      e.preventDefault()
      const selectedText = value.substring(start, end)
      
      if (e.shiftKey) {
        // Shift+Tab: 减少缩进
        if (selectedText.includes('\n')) {
          // 多行选择
          const lines = selectedText.split('\n')
          const unindentedLines = lines.map(line => 
            line.startsWith('  ') ? line.substring(2) : line
          )
          const newSelectedText = unindentedLines.join('\n')
          const newValue = value.substring(0, start) + newSelectedText + value.substring(end)
          onChange(newValue)
          
          setTimeout(() => {
            textarea.selectionStart = start
            textarea.selectionEnd = start + newSelectedText.length
          }, 0)
        } else {
          // 单行：移除前面的缩进
          const lineStart = value.lastIndexOf('\n', start - 1) + 1
          const lineText = value.substring(lineStart, start)
          if (lineText.endsWith('  ')) {
            const newValue = value.substring(0, lineStart) + 
                           lineText.substring(0, lineText.length - 2) + 
                           value.substring(start)
            onChange(newValue)
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start - 2
            }, 0)
          }
        }
      } else {
        // Tab: 增加缩进
        if (selectedText.includes('\n')) {
          // 多行选择
          const lines = selectedText.split('\n')
          const indentedLines = lines.map(line => '  ' + line)
          const newSelectedText = indentedLines.join('\n')
          const newValue = value.substring(0, start) + newSelectedText + value.substring(end)
          onChange(newValue)
          
          setTimeout(() => {
            textarea.selectionStart = start
            textarea.selectionEnd = start + newSelectedText.length
          }, 0)
        } else {
          // 单行缩进
          const newValue = value.substring(0, start) + '  ' + value.substring(end)
          onChange(newValue)
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 2
          }, 0)
        }
      }
    }
    
    // 处理Enter键自动缩进
    else if (e.key === 'Enter') {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const currentLine = value.substring(lineStart, start)
      const indent = currentLine.match(/^(\s*)/)?.[1] || ''
      
      if (indent) {
        e.preventDefault()
        const newValue = value.substring(0, start) + '\n' + indent + value.substring(end)
        onChange(newValue)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length
        }, 0)
      }
    }
    
    // 处理括号自动补全
    else if (['(', '[', '{', '"', "'"].includes(e.key)) {
      const pairs: { [key: string]: string } = {
        '(': ')',
        '[': ']',
        '{': '}',
        '"': '"',
        "'": "'"
      }
      
      if (start === end) { // 没有选中文本
        e.preventDefault()
        const pair = pairs[e.key]
        const newValue = value.substring(0, start) + e.key + pair + value.substring(end)
        onChange(newValue)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1
        }, 0)
      }
    }
  }

  // 同步滚动
  const handleScroll = () => {
    if (textareaRef.current && highlighterRef.current) {
      const textarea = textareaRef.current
      const highlighter = highlighterRef.current.querySelector('pre')
      if (highlighter) {
        highlighter.scrollTop = textarea.scrollTop
        highlighter.scrollLeft = textarea.scrollLeft
      }
    }
  }

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.addEventListener('scroll', handleScroll)
      return () => textarea.removeEventListener('scroll', handleScroll)
    }
    return undefined
  }, [])

  const getLanguageForHighlighter = (lang: string): string => {
    const languageMap: { [key: string]: string } = {
      'txt': 'text',
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'jsx',
      'tsx': 'tsx',
      'json': 'json',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'sh': 'bash',
      'sql': 'sql',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'toml',
      'ini': 'ini',
      'dockerfile': 'docker'
    }
    return languageMap[lang.toLowerCase()] || 'text'
  }

  const highlighterLanguage = getLanguageForHighlighter(language)
  const shouldHighlight = highlighterLanguage !== 'text' && value.trim().length > 0

  return (
    <div className="code-editor">
      <div className="code-editor-container">
        {shouldHighlight && (
          <div 
            ref={highlighterRef}
            className={`code-highlighter ${isEditing ? 'editing' : ''}`}
          >
            <SyntaxHighlighter
              language={highlighterLanguage}
              style={theme === 'dark' ? vscDarkPlus : vs}
              customStyle={{
                margin: 0,
                padding: '20px',
                background: 'transparent',
                fontSize: '14px',
                fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                lineHeight: '1.6',
                overflow: 'visible'
              }}
              codeTagProps={{
                style: {
                  fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace"
                }
              }}
            >
              {value || ' '}
            </SyntaxHighlighter>
          </div>
        )}
        
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onFocus={handleTextareaFocus}
          onBlur={handleTextareaBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`code-textarea ${shouldHighlight ? 'with-highlight' : 'plain'}`}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  )
}

export default CodeEditor