import React, { useState } from 'react';
import { CodeIssue, Severity } from '../types';
import { AlertCircle, AlertTriangle, Info, Zap, ChevronDown, ChevronRight, Check } from 'lucide-react';

interface ReviewPanelProps {
  issues: CodeIssue[];
  summary: string;
  onApplyFix?: (fixSnippet: string) => void;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  issues,
  summary,
  onApplyFix
}) => {
  const [filter, setFilter] = useState<Severity | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
          padding: '0.85rem 1rem',
          fontSize: '0.82rem',
          lineHeight: '1.5',
          marginBottom: '1.25rem',
          color: '#cbd5e1'
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '0.2rem' }}>
          Executive Review Finding:
        </div>
        {summary}
      </div>

      <div className="findings-filter-bar">
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
            Warning ({issues.filter((i) => i.severity === 'warning').length})
          </button>
          <button
            className={`filter-pill ${filter === 'optimization' ? 'active' : ''}`}
            onClick={() => setFilter('optimization')}
          >
            Optimization ({issues.filter((i) => i.severity === 'optimization').length})
          </button>
        </div>
      </div>

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
                    {issue.lineEnd !== issue.lineStart ? `-L${issue.lineEnd}` : ''}
                  </span>
                  <span className="finding-title">{issue.title}</span>
                </div>
                <div>{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</div>
              </div>

              <p className="finding-desc">{issue.description}</p>

              <div className="finding-meta-row">
                {issue.cwe && <span className="cwe-badge">{issue.cwe}</span>}
                {issue.benchmarkImpact && (
                  <span>
                    ⚡ <strong>Impact:</strong> {issue.benchmarkImpact}
                  </span>
                )}
              </div>

              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-main)',
                  marginTop: '0.4rem',
                  paddingTop: '0.4rem',
                  borderTop: '1px solid var(--border-subtle)'
                }}
              >
                <strong style={{ color: 'var(--accent-cyan)' }}>Recommendation:</strong>{' '}
                {issue.recommendation}
              </div>

              {issue.codeFix && (
                <div style={{ marginTop: '0.6rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.2rem'
                    }}
                  >
                    <span>Suggested Replacement:</span>
                    {onApplyFix && (
                      <button
                        className="btn-action btn-ghost"
                        style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}
                        onClick={() => handleApply(issue.id, issue.codeFix!)}
                      >
                        {appliedFixes[issue.id] ? (
                          <>
                            <Check size={11} color="var(--accent-emerald)" /> Applied
                          </>
                        ) : (
                          'Apply Fix'
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
    </div>
  );
};
