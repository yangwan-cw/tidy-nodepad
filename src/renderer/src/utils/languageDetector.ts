export interface LanguageInfo {
  language: string
  displayName: string
  extensions: string[]
}

export const supportedLanguages: LanguageInfo[] = [
  { language: 'javascript', displayName: 'JavaScript', extensions: ['.js', '.mjs'] },
  { language: 'typescript', displayName: 'TypeScript', extensions: ['.ts'] },
  { language: 'jsx', displayName: 'React JSX', extensions: ['.jsx'] },
  { language: 'tsx', displayName: 'React TSX', extensions: ['.tsx'] },
  { language: 'json', displayName: 'JSON', extensions: ['.json'] },
  { language: 'xml', displayName: 'XML', extensions: ['.xml', '.svg'] },
  { language: 'html', displayName: 'HTML', extensions: ['.html', '.htm'] },
  { language: 'css', displayName: 'CSS', extensions: ['.css'] },
  { language: 'scss', displayName: 'SCSS', extensions: ['.scss'] },
  { language: 'sass', displayName: 'Sass', extensions: ['.sass'] },
  { language: 'less', displayName: 'Less', extensions: ['.less'] },
  { language: 'markdown', displayName: 'Markdown', extensions: ['.md', '.markdown'] },
  { language: 'python', displayName: 'Python', extensions: ['.py', '.pyw'] },
  { language: 'java', displayName: 'Java', extensions: ['.java'] },
  { language: 'c', displayName: 'C', extensions: ['.c', '.h'] },
  { language: 'cpp', displayName: 'C++', extensions: ['.cpp', '.cxx', '.cc', '.hpp'] },
  { language: 'csharp', displayName: 'C#', extensions: ['.cs'] },
  { language: 'php', displayName: 'PHP', extensions: ['.php'] },
  { language: 'ruby', displayName: 'Ruby', extensions: ['.rb'] },
  { language: 'go', displayName: 'Go', extensions: ['.go'] },
  { language: 'rust', displayName: 'Rust', extensions: ['.rs'] },
  { language: 'bash', displayName: 'Shell', extensions: ['.sh', '.bash', '.zsh'] },
  { language: 'sql', displayName: 'SQL', extensions: ['.sql'] },
  { language: 'yaml', displayName: 'YAML', extensions: ['.yaml', '.yml'] },
  { language: 'toml', displayName: 'TOML', extensions: ['.toml'] },
  { language: 'ini', displayName: 'INI', extensions: ['.ini', '.cfg'] },
  { language: 'dockerfile', displayName: 'Dockerfile', extensions: ['dockerfile'] },
  { language: 'text', displayName: 'Plain Text', extensions: ['.txt'] }
]

export const detectLanguageFromFilename = (filename: string): LanguageInfo => {
  const lowerFilename = filename.toLowerCase()
  
  // 特殊文件名检测
  if (lowerFilename === 'dockerfile' || lowerFilename.startsWith('dockerfile.')) {
    return supportedLanguages.find(lang => lang.language === 'dockerfile')!
  }
  
  // 扩展名检测
  for (const langInfo of supportedLanguages) {
    for (const ext of langInfo.extensions) {
      if (lowerFilename.endsWith(ext.toLowerCase())) {
        return langInfo
      }
    }
  }
  
  // 默认返回纯文本
  return supportedLanguages.find(lang => lang.language === 'text')!
}

export const detectLanguageFromContent = (content: string): LanguageInfo => {
  const trimmedContent = content.trim()
  
  if (!trimmedContent) {
    return supportedLanguages.find(lang => lang.language === 'text')!
  }
  
  // JSON 检测
  if ((trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) ||
      (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'))) {
    try {
      JSON.parse(trimmedContent)
      return supportedLanguages.find(lang => lang.language === 'json')!
    } catch {
      // 不是有效的JSON
    }
  }
  
  // XML 检测
  if (trimmedContent.startsWith('<?xml') || 
      (trimmedContent.startsWith('<') && trimmedContent.includes('>'))) {
    return supportedLanguages.find(lang => lang.language === 'xml')!
  }
  
  // HTML 检测
  if (trimmedContent.includes('<!DOCTYPE html') || 
      trimmedContent.includes('<html') ||
      trimmedContent.includes('<head>') ||
      trimmedContent.includes('<body>')) {
    return supportedLanguages.find(lang => lang.language === 'html')!
  }
  
  // CSS 检测
  if (trimmedContent.includes('{') && trimmedContent.includes('}') && 
      (trimmedContent.includes(':') || trimmedContent.includes('@'))) {
    const cssPattern = /[a-zA-Z-]+\s*:\s*[^;]+;/
    if (cssPattern.test(trimmedContent)) {
      return supportedLanguages.find(lang => lang.language === 'css')!
    }
  }
  
  // JavaScript/TypeScript 检测
  const jsKeywords = ['function', 'const', 'let', 'var', 'class', 'import', 'export', 'require']
  const tsKeywords = ['interface', 'type', 'enum', 'namespace', 'declare']
  
  const hasJsKeywords = jsKeywords.some(keyword => 
    new RegExp(`\\b${keyword}\\b`).test(trimmedContent)
  )
  const hasTsKeywords = tsKeywords.some(keyword => 
    new RegExp(`\\b${keyword}\\b`).test(trimmedContent)
  )
  
  if (hasTsKeywords) {
    return supportedLanguages.find(lang => lang.language === 'typescript')!
  }
  if (hasJsKeywords) {
    return supportedLanguages.find(lang => lang.language === 'javascript')!
  }
  
  // Python 检测
  const pythonKeywords = ['def ', 'class ', 'import ', 'from ', 'if __name__']
  if (pythonKeywords.some(keyword => trimmedContent.includes(keyword))) {
    return supportedLanguages.find(lang => lang.language === 'python')!
  }
  
  // Markdown 检测
  if (trimmedContent.includes('# ') || trimmedContent.includes('## ') || 
      trimmedContent.includes('```') || trimmedContent.includes('**')) {
    return supportedLanguages.find(lang => lang.language === 'markdown')!
  }
  
  // 默认返回纯文本
  return supportedLanguages.find(lang => lang.language === 'text')!
}

export const getLanguageInfo = (filename: string, content: string): LanguageInfo => {
  // 优先使用文件名检测
  const filenameDetected = detectLanguageFromFilename(filename)
  if (filenameDetected.language !== 'text') {
    return filenameDetected
  }
  
  // 如果文件名检测不出来，使用内容检测
  return detectLanguageFromContent(content)
}