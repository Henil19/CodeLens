import React, { useState } from 'react';
import { Copy, Check, ArrowRight, Download, Columns, AlignJustify } from 'lucide-react';
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
    a.download = 'solution.patch';
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 1rem',
          fontSize: '0.8rem',
          color: '#cbd5e1'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span>💡 <strong>Patch Overview:</strong></span>
          <span style={{ color: '#6ee7b7' }}>+{additions} additions</span>
          <span>•</span>
          <span style={{ color: '#fda4af' }}>-{deletions} removals</span>
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          Click &ldquo;Apply Complete Refactor&rdquo; to automatically patch your editor code.
        </div>
      </div>

      <div className="diff-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>View Mode:</span>
          <div className="filter-pills" style={{ display: 'inline-flex' }}>
            <button
              className={`filter-pill ${viewMode === 'unified' ? 'active' : ''}`}
              onClick={() => setViewMode('unified')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <AlignJustify size={12} />
              <span>Unified Diff</span>
            </button>
            <button
              className={`filter-pill ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Columns size={12} />
              <span>Split Comparison</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem' }}>
          <button
            className="btn-action btn-ghost"
            onClick={handleDownloadPatch}
            title="Download Git .patch file"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
          >
            <Download size={13} />
            <span>.patch</span>
          </button>
          <button
            className="btn-action btn-ghost"
            onClick={handleCopyDiff}
            title="Copy patch content to clipboard"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
          >
            {copied ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            className="btn-action btn-primary"
            onClick={handleApply}
            title="Replace editor code with this hardened implementation"
            style={{ fontSize: '0.76rem', padding: '0.3rem 0.75rem' }}
          >
            {applied ? <Check size={14} /> : <ArrowRight size={14} />}
            <span>{applied ? '✓ Applied to Editor!' : 'Apply Complete Refactor'}</span>
          </button>
        </div>
      </div>

      {viewMode === 'unified' ? (
        <div className="diff-board">
          {lines.map((line, idx) => (
            <div key={idx} className={`diff-line ${line.type}`}>
              {line.content}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#fda4af',
                marginBottom: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Current Flawed Implementation:</span>
            </div>
            <pre
              className="code-fix-block"
              style={{ maxHeight: '450px', overflowY: 'auto', margin: 0 }}
            >
              <code>{originalCode}</code>
            </pre>
          </div>
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#6ee7b7',
                marginBottom: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Hardened Refactored Solution:</span>
            </div>
            <pre
              className="code-fix-block"
              style={{ maxHeight: '450px', overflowY: 'auto', margin: 0 }}
            >
              <code>{refactoredCode}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
