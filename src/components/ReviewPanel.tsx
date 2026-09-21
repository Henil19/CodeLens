import React, { useState } from 'react';
import { CodeIssue, Severity, PersonaId } from '../types';
import { PERSONAS } from '../engine/personas';
import { AlertCircle, AlertTriangle, Info, Zap, ChevronDown, ChevronRight, Check, CheckCircle2, ArrowRight } from 'lucide-react';

interface ReviewPanelProps {
  issues: CodeIssue[];
  summary: string;
  activeLens: PersonaId;
  onSelectLens: (lensId: PersonaId) => void;
  onApplyFix?: (fixSnippet: string) => void;
  onViewDiffTab?: () => void;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  issues,
  summary,
  activeLens,
  onSelectLens,
  onApplyFix,
  onViewDiffTab
}) => {
  const [filter, setFilter] = useState<Severity | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(issues.length > 0 ? issues[0].id : null);
  const [appliedFixes, setAppliedFixes] = useState<Record<string, boolean>>({});

  const filteredIssues = issues.filter((i) => {
    if (filter === 'all') return true;
    return i.severity === filter;
  });

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle size={14} color="var(--accent-rose)" />;
      case 'warning':
        return <AlertTriangle size={14} color="var(--accent-amber)" />;
      case 'optimization':
        return <Zap size={14} color="var(--accent-primary)" />;
      case 'info':
        return <Info size={14} color="var(--accent-purple)" />;
    }
  };

  const handleApply = (issueId: string, fix: string) => {
    if (onApplyFix) {
      onApplyFix(fix);
      setAppliedFixes((prev) => ({ ...prev, [issueId]: true }));
    }
  };

  const lensKeys: PersonaId[] = ['security-auditor', 'staff-systems', 'clean-architect', 'academic-cs'];

  return (
    <div>
      <div className="lens-selector-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Focus Lens:</span>
          <div className="lens-pills">
            {lensKeys.map((lid) => {
              const p = PERSONAS[lid];
              return (
                <button
                  key={lid}
                  className={`lens-pill ${activeLens === lid ? 'active' : ''}`}
                  onClick={() => onSelectLens(lid)}
                  title={p.tagline}
                >
                  <span>{p.avatar}</span> <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="filter-pills">
          <button
            className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({issues.length})
          </button>
          <button
            className={`filter-pill ${filter === 'critical' ? 'active' : ''}`}
            onClick={() => setFilter('critical')}
          >
            Critical ({issues.filter((i) => i.severity === 'critical').length})
          </button>
          <button
            className={`filter-pill ${filter === 'warning' ? 'active' : ''}`}
            onClick={() => setFilter('warning')}
          >
            Warnings ({issues.filter((i) => i.severity === 'warning').length})
          </button>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 0.95rem',
          fontSize: '0.8rem',
          lineHeight: '1.5',
          marginBottom: '1rem',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            Audit Summary ({PERSONAS[activeLens].name}):
          </span>
          {onViewDiffTab && (
            <button
              onClick={onViewDiffTab}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary)',
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontWeight: 600
              }}
            >
              <span>View Diff & Fix</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
        <div>{summary}</div>
      </div>

      {filteredIssues.length === 0 ? (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem',
            textAlign: 'center',
            color: 'var(--accent-emerald)'
          }}
        >
          <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem' }} />
          <h3 style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '0.2rem' }}>
            No Issues Found in this Category
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            The code passes all checks for the selected filter.
          </p>
        </div>
      ) : (
        <div className="findings-list">
          {filteredIssues.map((issue) => {
            const isExpanded = expandedId === issue.id;
            return (
              <div key={issue.id} className={`finding-card ${issue.severity}`}>
                <div
                  className="finding-header"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                >
                  <div className="finding-title-group">
                    {getSeverityIcon(issue.severity)}
                    <span className={`severity-tag ${issue.severity}`}>{issue.severity}</span>
                    <span className="line-anchor">
                      L{issue.lineStart}
                      {issue.lineEnd !== issue.lineStart ? `–L${issue.lineEnd}` : ''}
                    </span>
                    <span className="finding-title">{issue.title}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </div>
                </div>

                <p className="finding-desc">{issue.description}</p>

                <div className="finding-meta-row">
                  {issue.cwe && <span style={{ color: 'var(--accent-rose)' }}>🛡️ {issue.cwe}</span>}
                  {issue.benchmarkImpact && (
                    <span>⚡ <strong>Impact:</strong> {issue.benchmarkImpact}</span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.35rem',
                    paddingTop: '0.35rem',
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <strong style={{ color: 'var(--text-primary)' }}>Remediation:</strong>{' '}
                  {issue.recommendation}
                </div>

                {issue.codeFix && (
                  <div style={{ marginTop: '0.65rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        marginBottom: '0.25rem'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Suggested Replacement:</span>
                      {onApplyFix && (
                        <button
                          className="btn-primary"
                          style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}
                          onClick={() => handleApply(issue.id, issue.codeFix!)}
                        >
                          {appliedFixes[issue.id] ? (
                            <>
                              <Check size={11} color="#fff" /> Applied!
                            </>
                          ) : (
                            'Apply Fix to Editor'
                          )}
                        </button>
                      )}
                    </div>
                    <pre className="code-fix-block">
                      <code>{issue.codeFix}</code>
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
