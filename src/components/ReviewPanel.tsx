import React, { useState } from 'react';
import { CodeIssue, Severity } from '../types';
import { AlertCircle, AlertTriangle, Info, Zap, ChevronDown, ChevronRight, Check, CheckCircle2, ArrowRight } from 'lucide-react';

interface ReviewPanelProps {
  issues: CodeIssue[];
  summary: string;
  onApplyFix?: (fixSnippet: string) => void;
  onViewDiffTab?: () => void;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  issues,
  summary,
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
        return <AlertCircle size={15} color="var(--accent-rose)" />;
      case 'warning':
        return <AlertTriangle size={15} color="var(--accent-amber)" />;
      case 'optimization':
        return <Zap size={15} color="var(--accent-cyan)" />;
      case 'info':
        return <Info size={15} color="var(--accent-indigo)" />;
    }
  };

  const handleApply = (issueId: string, fix: string) => {
    if (onApplyFix) {
      onApplyFix(fix);
      setAppliedFixes((prev) => ({ ...prev, [issueId]: true }));
    }
  };

  return (
    <div>
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.05)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.95rem 1.15rem',
          fontSize: '0.84rem',
          lineHeight: '1.55',
          marginBottom: '1.25rem',
          color: '#cbd5e1'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>Reviewer Finding Summary:</span>
          {onViewDiffTab && (
            <button
              onClick={onViewDiffTab}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-cyan)',
                fontSize: '0.76rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600
              }}
            >
              <span>View Full Unified Diff</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
        <div>{summary}</div>
      </div>

      <div className="findings-filter-bar">
        <div className="filter-pills">
          <button
            className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Findings ({issues.length})
          </button>
          <button
            className={`filter-pill ${filter === 'critical' ? 'active' : ''}`}
            onClick={() => setFilter('critical')}
          >
            🚨 Critical ({issues.filter((i) => i.severity === 'critical').length})
          </button>
          <button
            className={`filter-pill ${filter === 'warning' ? 'active' : ''}`}
            onClick={() => setFilter('warning')}
          >
            ⚠️ Warnings ({issues.filter((i) => i.severity === 'warning').length})
          </button>
          <button
            className={`filter-pill ${filter === 'optimization' ? 'active' : ''}`}
            onClick={() => setFilter('optimization')}
          >
            ⚡ Optimizations ({issues.filter((i) => i.severity === 'optimization').length})
          </button>
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            textAlign: 'center',
            color: '#6ee7b7'
          }}
        >
          <CheckCircle2 size={36} color="var(--accent-emerald)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.35rem' }}>No Issues in this Category</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            The active code passes all heuristic checks for the selected filter.
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
                      Line {issue.lineStart}
                      {issue.lineEnd !== issue.lineStart ? `–${issue.lineEnd}` : ''}
                    </span>
                    <span className="finding-title">{issue.title}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </div>

                <p className="finding-desc">{issue.description}</p>

                <div className="finding-meta-row">
                  {issue.cwe && <span className="cwe-badge">🛡️ {issue.cwe}</span>}
                  {issue.benchmarkImpact && (
                    <span>
                      ⚡ <strong>Impact:</strong> {issue.benchmarkImpact}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    marginTop: '0.4rem',
                    paddingTop: '0.45rem',
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <strong style={{ color: 'var(--accent-cyan)' }}>Recommended Remediation:</strong>{' '}
                  {issue.recommendation}
                </div>

                {issue.codeFix && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.74rem',
                        color: 'var(--text-muted)',
                        marginBottom: '0.3rem'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Suggested Replacement Code:</span>
                      {onApplyFix && (
                        <button
                          className="btn-action btn-primary"
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
                          onClick={() => handleApply(issue.id, issue.codeFix!)}
                        >
                          {appliedFixes[issue.id] ? (
                            <>
                              <Check size={12} color="#fff" /> Applied!
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
