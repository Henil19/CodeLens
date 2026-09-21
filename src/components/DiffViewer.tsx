import React, { useState } from 'react';
import { Copy, Check, ArrowRight, Download, Columns, AlignJustify, Sparkles } from 'lucide-react';
import { generateUnifiedDiff } from '../engine/diff';

interface DiffViewerProps {
  originalCode: string;
  refactoredCode: string;
  onApplyRefactor: (newCode: string) => void;
  language: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalCode,
  refactoredCode,
  onApplyRefactor,
  language
}) => {
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');

  const { diffText, lines } = generateUnifiedDiff(
    originalCode,
    refactoredCode,
    `source.${language === 'typescript' ? 'ts' : language === 'python' ? 'py' : language === 'go' ? 'go' : 'rs'}`
  );

  const handleCopyDiff = async () => {
    await navigator.clipboard.writeText(diffText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPatch = () => {
    const blob = new Blob([diffText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hardened_solution.patch';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApply = () => {
    onApplyRefactor(refactoredCode);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  const additions = lines.filter((l) => l.type === 'addition').length;
  const deletions = lines.filter((l) => l.type === 'deletion').length;

  return (
    <div className="diff-container">
      {/* Overview & Action Toolbar */}
      <div className="diff-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="filter-pills">
            <button
              className={`filter-pill ${viewMode === 'unified' ? 'active' : ''}`}
              onClick={() => setViewMode('unified')}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <AlignJustify size={13} />
              <span>Unified Diff</span>
            </button>
            <button
              className={`filter-pill ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Columns size={13} />
              <span>Side-by-Side</span>
            </button>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>+{additions}</span>
            {' / '}
            <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>-{deletions}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn-secondary"
            onClick={handleDownloadPatch}
            title="Download Git .patch file"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem' }}
          >
            <Download size={13} />
            <span>.patch</span>
          </button>
          <button
            className="btn-secondary"
            onClick={handleCopyDiff}
            title="Copy patch content to clipboard"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem' }}
          >
            {copied ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            className="btn-primary"
            onClick={handleApply}
            title="Replace editor code with this hardened refactor"
            style={{ padding: '0.38rem 0.95rem', fontSize: '0.78rem' }}
          >
            {applied ? <Check size={14} /> : <Sparkles size={14} />}
            <span>{applied ? '✓ Applied to Editor!' : 'Apply All Fixes'}</span>
          </button>
        </div>
      </div>

      {/* Diff Table Board */}
      {viewMode === 'unified' ? (
        <div className="diff-board-container">
          <div className="diff-board-header">
            <span>UNIFIED PATCH PREVIEW</span>
            <span>🟢 GREEN = ADDITIONS · 🔴 RED = DELETIONS</span>
          </div>
          <div className="diff-table">
            {lines.map((line, idx) => {
              if (line.type === 'meta') {
                return (
                  <div key={idx} className="diff-row meta">
                    {line.content}
                  </div>
                );
              }

              const marker = line.type === 'addition' ? '+' : line.type === 'deletion' ? '-' : ' ';
              const textOnly = line.content.startsWith('+') || line.content.startsWith('-') || line.content.startsWith(' ')
                ? line.content.slice(1)
                : line.content;

              return (
                <div key={idx} className={`diff-row ${line.type}`}>
                  <div className="diff-gutter-old">
                    {line.type !== 'addition' ? line.oldLineNumber ?? '' : ''}
                  </div>
                  <div className="diff-gutter-new">
                    {line.type !== 'deletion' ? line.newLineNumber ?? '' : ''}
                  </div>
                  <div className="diff-marker">{marker}</div>
                  <div className="diff-content">{textOnly}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="diff-split-grid">
          <div className="diff-split-card">
            <div className="diff-split-header before">
              <span>Original (Flawed)</span>
              <span>Before Fix</span>
            </div>
            <div style={{ display: 'flex', maxHeight: '480px', overflowY: 'auto' }}>
              <div className="line-numbers">
                {originalCode.split('\n').map((_, i) => (
                  <div key={i + 1}>{i + 1}</div>
                ))}
              </div>
              <pre className="code-fix-block" style={{ flex: 1, margin: 0, border: 'none', background: 'transparent' }}>
                <code>{originalCode}</code>
              </pre>
            </div>
          </div>

          <div className="diff-split-card">
            <div className="diff-split-header after">
              <span>Hardened (Refactored)</span>
              <span style={{ color: 'var(--accent-emerald)' }}>Production Ready</span>
            </div>
            <div style={{ display: 'flex', maxHeight: '480px', overflowY: 'auto' }}>
              <div className="line-numbers">
                {refactoredCode.split('\n').map((_, i) => (
                  <div key={i + 1}>{i + 1}</div>
                ))}
              </div>
              <pre className="code-fix-block" style={{ flex: 1, margin: 0, border: 'none', background: 'transparent' }}>
                <code>{refactoredCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
