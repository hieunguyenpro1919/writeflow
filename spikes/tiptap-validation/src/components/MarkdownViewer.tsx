import React, { useState } from 'react';

interface MarkdownViewerProps {
  markdown: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ markdown }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = markdown ? markdown.split('\n').length : 0;
  const charCount = markdown.length;

  return (
    <div className="viewer-container">
      <div className="viewer-header">
        <div className="viewer-title">
          <span>Khung Phải: Chuỗi Markdown Thô (Real-time)</span>
          <span className="api-badge">editor.storage.markdown.getMarkdown()</span>
        </div>
        <div className="viewer-actions">
          <span className="stats-badge">
            {lineCount} dòng · {charCount} ký tự
          </span>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? '✓ Đã sao chép' : 'Sao chép Markdown'}
          </button>
        </div>
      </div>
      <div className="viewer-content">
        <pre className="code-block">
          <code>{markdown || '/* (Trống) Hãy nhập nội dung vào khung bên trái */'}</code>
        </pre>
      </div>
    </div>
  );
};
