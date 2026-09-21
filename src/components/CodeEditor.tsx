import React from 'react';
import { Trash2, Copy, Check } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  onReset: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  onLanguageChange,
  onReset
}) => {
  const [copied, setCopied] = React.useState(false);

  const lines = code.split('\n');
  const lineCount = lines.length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="editor-pane">
      <div className="editor-toolbar">
        <div className="file-info">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '0.76rem',
              outline: 'none'
            }}
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
          <span>•</span>
          <span>{lineCount} lines</span>
          <span>•</span>
          <span>{(code.length / 1024).toFixed(1)} KB</span>
        </div>

        <div className="editor-actions">
          <button
            className="btn-action btn-ghost"
            onClick={handleCopy}
            title="Copy Source Code"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
          >
            {copied ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            className="btn-action btn-ghost"
            onClick={onReset}
            title="Clear Editor"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="editor-wrapper">
        <div className="line-numbers">
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
        />
      </div>
    </div>
  );
};
