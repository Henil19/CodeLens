import React, { useState } from 'react';
import { Copy, Check, ArrowRight, Download } from 'lucide-react';
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

  return (
    <div className="diff-container">
      <div className="diff-toolbar">
        <div>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Unified Patch View</span>{' '}
          <span style={{ color: 'var(--text-faint)', fontSize: '0.74rem' }}>
            ({lines.filter((l) => l.type === 'addition').length} additions,{' '}
            {lines.filter((l) => l.type === 'deletion').length} deletions)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem' }}>
          <button className="btn-action btn-ghost" onClick={handleDownloadPatch} style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
            <Download size={13} />
            <span>.patch</span>
          </button>
          <button className="btn-action btn-ghost" onClick={handleCopyDiff} style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
            {copied ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button className="btn-action btn-primary" onClick={handleApply} style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
            {applied ? <Check size={13} /> : <ArrowRight size={13} />}
            <span>{applied ? 'Applied to Editor!' : 'Apply Refactor'}</span>
          </button>
        </div>
      </div>

      <div className="diff-board">
        {lines.map((line, idx) => (
          <div key={idx} className={`diff-line ${line.type}`}>
            {line.content}
          </div>
        ))}
      </div>
    </div>
  );
};
