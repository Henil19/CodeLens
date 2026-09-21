import React from 'react';
import { X, Sparkles, UserCheck, ShieldAlert, CheckCircle } from 'lucide-react';

interface QuickGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickGuide: React.FC<QuickGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(56, 189, 248, 0.08))',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '1rem 1.5rem',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Welcome to CodeLens Studio — How It Works
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}
          title="Dismiss Guide"
        >
          <X size={16} />
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        <div
          style={{
            background: 'rgba(10, 13, 20, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>STEP 1</span>
          </div>
          <h3 style={{ fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.25rem' }}>Select Preset or Paste Code</h3>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Choose a preloaded challenge from the top dropdown or write/paste your own code directly.
          </p>
        </div>

        <div
          style={{
            background: 'rgba(10, 13, 20, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>STEP 2</span>
            <UserCheck size={14} color="var(--accent-indigo)" />
          </div>
          <h3 style={{ fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.25rem' }}>Switch Reviewer Personas</h3>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Click Alex (Staff Systems), Elena (Security Auditor), Marcus (Clean Architect), or Dr. Wei (CS Researcher).
          </p>
        </div>

        <div
          style={{
            background: 'rgba(10, 13, 20, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)' }}>STEP 3</span>
            <ShieldAlert size={14} color="var(--accent-amber)" />
          </div>
          <h3 style={{ fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.25rem' }}>Audit Findings & Complexity</h3>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Review line-anchored CWE tags, memory leak flags, Big-O bounds, invariants, and RFC citations.
          </p>
        </div>

        <div
          style={{
            background: 'rgba(10, 13, 20, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>STEP 4</span>
            <CheckCircle size={14} color="var(--accent-emerald)" />
          </div>
          <h3 style={{ fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.25rem' }}>1-Click Apply Refactor</h3>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Go to the Diff tab and click &ldquo;Apply Complete Refactor&rdquo; to patch the editor and watch the Health Score jump to 100%!
          </p>
        </div>
      </div>
    </div>
  );
};
