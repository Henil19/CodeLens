import React, { useState } from 'react';
import { CodeIssue, Severity, PersonaId } from '../types';
import { PERSONAS } from '../engine/personas';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Zap,
  ChevronDown,
  ChevronRight,
  Check,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Copy,
  MessageSquareCode
} from 'lucide-react';

interface ReviewPanelProps {
  issues: CodeIssue[];
  summary: string;
  activeLens: PersonaId;
  onSelectLens: (lensId: PersonaId) => void;
  onApplyFix?: (fixSnippet: string) => void;
  onApplyAllFixes?: () => void;
  onViewDiffTab?: () => void;
  onAskAI?: (prompt: string) => void;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  issues,
  summary,
  activeLens,
  onSelectLens,
  onApplyFix,
  onApplyAllFixes,
  onViewDiffTab,
  onAskAI
}) => {
  const [filter, setFilter] = useState<Severity | 'all' | 'resolved'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(issues.length > 0 ? issues[0].id : null);
  const [resolvedIds, setResolvedIds] = useState<Record<string, boolean>>({});
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  const handleToggleResolve = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setResolvedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApply = (issueId: string, fix: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onApplyFix) {
      onApplyFix(fix);
      setResolvedIds((prev) => ({ ...prev, [issueId]: true }));
    }
  };

  const handleCopySnippet = async (id: string, snippet: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(snippet);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleResolveAll = () => {
    const allResolved: Record<string, boolean> = {};
    for (const issue of issues) {
      allResolved[issue.id] = true;
    }
    setResolvedIds(allResolved);
  };

  const filteredIssues = issues.filter((i) => {
    const isResolved = Boolean(resolvedIds[i.id]);
    if (filter === 'resolved') return isResolved;
    if (filter === 'all') return !isResolved;
    return i.severity === filter && !isResolved;
  });

  const resolvedCount = Object.values(resolvedIds).filter(Boolean).length;
  const activeIssuesCount = issues.length - resolvedCount;

  const getSeverityIcon = (severity: Severity, isResolved: boolean) => {
    if (isResolved) return <CheckCircle2 size={15} color="var(--accent-emerald)" />;
    switch (severity) {
      case 'critical':
        return <AlertCircle size={15} color="var(--accent-rose)" />;
      case 'warning':
        return <AlertTriangle size={15} color="var(--accent-amber)" />;
      case 'optimization':
        return <Zap size={15} color="var(--accent-cyan)" />;
      case 'info':
        return <Info size={15} color="var(--accent-purple)" />;
    }
  };

  const lensKeys: PersonaId[] = ['security-auditor', 'staff-systems', 'clean-architect', 'academic-cs'];

  return (
    <div>
      {/* Streamlined Unified Toolbar: Lens + Filter + Quick Actions */}
      <div
        className="findings-topbar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)' }}>Focus Lens:</span>
            <select
              value={activeLens}
              onChange={(e) => onSelectLens(e.target.value as PersonaId)}
              className="dropdown-select"
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.76rem' }}
            >
              {lensKeys.map((lid) => {
                const p = PERSONAS[lid];
                return (
                  <option key={lid} value={lid}>
                    {p.avatar} {p.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {onApplyAllFixes && activeIssuesCount > 0 && (
              <button
                className="btn-glow"
                onClick={onApplyAllFixes}
                title="Automatically apply all recommended fixes to code"
                style={{ fontSize: '0.74rem', padding: '0.28rem 0.75rem' }}
              >
                <Sparkles size={12} />
                <span>Auto-Fix All ({activeIssuesCount})</span>
              </button>
            )}

            {activeIssuesCount > 0 && (
              <button
                className="btn-secondary"
                onClick={handleResolveAll}
                title="Mark all as resolved"
                style={{ fontSize: '0.72rem', padding: '0.26rem 0.55rem' }}
              >
                Resolve All
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills with vibrant glowing tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Open ({activeIssuesCount})
          </button>
          <button
            className={`filter-pill ${filter === 'critical' ? 'active' : ''}`}
            onClick={() => setFilter('critical')}
            style={{ color: 'var(--accent-rose)' }}
          >
            Critical ({issues.filter((i) => i.severity === 'critical' && !resolvedIds[i.id]).length})
          </button>
          <button
            className={`filter-pill ${filter === 'warning' ? 'active' : ''}`}
            onClick={() => setFilter('warning')}
            style={{ color: 'var(--accent-amber)' }}
          >
            Warnings ({issues.filter((i) => i.severity === 'warning' && !resolvedIds[i.id]).length})
          </button>
          {resolvedCount > 0 && (
            <button
              className={`filter-pill ${filter === 'resolved' ? 'active' : ''}`}
              onClick={() => setFilter('resolved')}
              style={{ color: 'var(--accent-emerald)' }}
            >
              ✓ Resolved ({resolvedCount})
            </button>
          )}
        </div>
      </div>

      {/* Summary Box */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.15rem',
          fontSize: '0.82rem',
          lineHeight: '1.55',
          marginBottom: '1.15rem',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
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
                fontSize: '0.76rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600
              }}
            >
              <span>View Diff & Fix</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
        <div>{summary}</div>
      </div>

      {/* Findings List */}
      {filteredIssues.length === 0 ? (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.04)',
            border: '1px solid rgba(16, 185, 129, 0.18)',
            borderRadius: 'var(--radius-md)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            color: 'var(--accent-emerald)'
          }}
        >
          <ShieldCheck size={36} style={{ margin: '0 auto 0.6rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.3rem' }}>
            {filter === 'resolved'
              ? 'No resolved issues yet'
              : 'All Identified Issues Resolved!'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
            {filter === 'resolved'
              ? 'Click "Resolve" or "Apply Fix" on any issue to mark it as resolved.'
              : 'Your code adheres to standard best practices with no active defects in this filter.'}
          </p>
        </div>
      ) : (
        <div className="findings-list">
          {filteredIssues.map((issue) => {
            const isExpanded = expandedId === issue.id;
            const isResolved = Boolean(resolvedIds[issue.id]);

            return (
              <div
                key={issue.id}
                className={`finding-card ${isResolved ? 'resolved' : issue.severity}`}
              >
                <div
                  className="finding-header"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                >
                  <div className="finding-title-group">
                    {getSeverityIcon(issue.severity, isResolved)}
                    <span className={`severity-tag ${isResolved ? 'resolved' : issue.severity}`}>
                      {isResolved ? 'Resolved' : issue.severity}
                    </span>
                    <span className="line-anchor">
                      Line {issue.lineStart}
                      {issue.lineEnd !== issue.lineStart ? `–${issue.lineEnd}` : ''}
                    </span>
                    <span
                      className="finding-title"
                      style={{ textDecoration: isResolved ? 'line-through' : 'none' }}
                    >
                      {issue.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      className="btn-secondary"
                      onClick={(e) => handleToggleResolve(issue.id, e)}
                      title={isResolved ? 'Re-open issue' : 'Mark as resolved'}
                      style={{
                        padding: '0.15rem 0.45rem',
                        fontSize: '0.7rem',
                        color: isResolved ? 'var(--accent-emerald)' : 'var(--text-muted)'
                      }}
                    >
                      {isResolved ? <Check size={12} /> : null}
                      <span>{isResolved ? 'Resolved' : 'Dismiss'}</span>
                    </button>

                    <div style={{ color: 'var(--text-muted)' }}>
                      {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </div>
                  </div>
                </div>

                <p className="finding-desc">{issue.description}</p>

                <div className="finding-meta-row">
                  {issue.cwe && <span style={{ color: 'var(--accent-rose)' }}>🛡️ {issue.cwe}</span>}
                  {issue.benchmarkImpact && (
                    <span>
                      ⚡ <strong>Impact:</strong> {issue.benchmarkImpact}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.45rem',
                    paddingTop: '0.45rem',
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <strong style={{ color: 'var(--text-primary)' }}>Remediation Advice:</strong>{' '}
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
                        marginBottom: '0.35rem'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Suggested Replacement Code:</span>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {onAskAI && (
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAskAI(`Can you explain line by line why this is an issue: "${issue.title}" and how the remediation fixes it?`);
                            }}
                            title="Ask AI Assistant to explain this issue"
                          >
                            <MessageSquareCode size={11} color="var(--accent-cyan)" />
                            <span>Explain</span>
                          </button>
                        )}
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}
                          onClick={(e) => handleCopySnippet(issue.id, issue.codeFix!, e)}
                        >
                          {copiedSnippetId === issue.id ? <Check size={11} color="var(--accent-emerald)" /> : <Copy size={11} />}
                          <span>{copiedSnippetId === issue.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        {onApplyFix && (
                          <button
                            className="btn-primary"
                            style={{ padding: '0.15rem 0.6rem', fontSize: '0.7rem' }}
                            onClick={(e) => handleApply(issue.id, issue.codeFix!, e)}
                          >
                            <Sparkles size={11} />
                            <span>{isResolved ? 'Re-Apply Fix' : 'Apply Fix to Code'}</span>
                          </button>
                        )}
                      </div>
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
