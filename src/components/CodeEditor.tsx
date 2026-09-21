import React, { useState } from 'react';
import { Trash2, Copy, Check, Wand2, ZoomIn, ZoomOut, AlignLeft } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  onReset: () => void;
  onToast?: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  onLanguageChange,
  onReset,
  onToast
}) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<number>(13.5);
  const [wrapLines, setWrapLines] = useState<boolean>(false);

  const lines = code.split('\n');
  const lineCount = lines.length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    if (onToast) onToast('success', 'Source code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormat = () => {
    const rawLines = code.split('\n');
    let indent = 0;
    const formatted = rawLines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
        indent = Math.max(0, indent - 1);
      }
      const indented = '  '.repeat(indent) + trimmed;
      if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
        indent++;
      }
      return indented;
    }).join('\n');

    onChange(formatted);
    if (onToast) onToast('info', 'Code auto-formatted & cleaned');
  };

  return (
    <div className="editor-pane">
      <div className="editor-toolbar">
        <div className="file-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="dropdown-select"
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.74rem' }}
          >
            <option value="typescript">TypeScript (.ts)</option>
            <option value="javascript">JavaScript (.js)</option>
            <option value="python">Python (.py)</option>
            <option value="go">Go (.go)</option>
            <option value="rust">Rust (.rs)</option>
            <option value="java">Java (.java)</option>
            <option value="cpp">C++ (.cpp)</option>
            <option value="sql">SQL (.sql)</option>
          </select>
          <span className="stat-pill" style={{ color: 'var(--text-muted)' }}>
            <strong>{lineCount}</strong> lines
          </span>
          <span className="stat-pill" style={{ color: 'var(--text-muted)' }}>
            <strong>{(code.length / 1024).toFixed(1)}</strong> KB
          </span>
        </div>

        <div className="editor-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            className="btn-secondary"
            onClick={handleFormat}
            title="Auto-Format & Indent Code"
            style={{ padding: '0.22rem 0.55rem', fontSize: '0.74rem' }}
          >
            <Wand2 size={12} color="var(--accent-indigo)" />
            <span>Format</span>
          </button>

          <button
            className="btn-secondary"
            onClick={() => setWrapLines(!wrapLines)}
            title={wrapLines ? 'Disable Line Wrap' : 'Enable Line Wrap'}
            style={{ padding: '0.22rem 0.45rem', fontSize: '0.74rem', color: wrapLines ? 'var(--accent-primary)' : undefined }}
          >
            <AlignLeft size={12} />
          </button>

          <button
            className="btn-secondary"
            onClick={() => setFontSize((s) => Math.max(11, s - 1))}
            title="Decrease Font Size"
            style={{ padding: '0.22rem 0.45rem', fontSize: '0.74rem' }}
          >
            <ZoomOut size={12} />
          </button>

          <button
            className="btn-secondary"
            onClick={() => setFontSize((s) => Math.min(18, s + 1))}
            title="Increase Font Size"
            style={{ padding: '0.22rem 0.45rem', fontSize: '0.74rem' }}
          >
            <ZoomIn size={12} />
          </button>

          <button
            className="btn-secondary"
            onClick={handleCopy}
            title="Copy Source Code"
            style={{ padding: '0.22rem 0.55rem', fontSize: '0.74rem' }}
          >
            {copied ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            className="btn-secondary"
            onClick={onReset}
            title="Clear Editor"
            style={{ padding: '0.22rem 0.5rem', fontSize: '0.74rem' }}
          >
            <Trash2 size={12} color="var(--accent-rose)" />
          </button>
        </div>
      </div>

      <div className="editor-wrapper">
        <div className="line-numbers" style={{ fontSize: `${fontSize}px` }}>
          {Array.from({ length: Math.max(lineCount, 15) }, (_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>
        <textarea
          className="code-textarea"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          placeholder="Paste or write code here to analyze..."
          style={{
            fontSize: `${fontSize}px`,
            whiteSpace: wrapLines ? 'pre-wrap' : 'pre'
          }}
        />
      </div>
    </div>
  );
};
