import React from 'react';
import { MetricScore, ComplexityResult, PersonaProfile } from '../types';

interface MetricsBarProps {
  scores: MetricScore;
  complexity: ComplexityResult;
  persona: PersonaProfile;
  loc: number;
  issueCount: number;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  scores,
  complexity,
  persona,
  loc,
  issueCount
}) => {
  const getScoreColor = (val: number) => {
    if (val >= 80) return 'var(--accent-emerald)';
    if (val >= 60) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  return (
    <div className="metrics-strip">
      <div className="health-gauge">
        <div
          className="score-circle"
          style={{ color: getScoreColor(scores.overall), borderColor: getScoreColor(scores.overall) }}
        >
          <span>{scores.overall}</span>
          <small>SCORE</small>
        </div>
        <div className="score-text">
          <h3>Health Index: {scores.overall >= 80 ? 'Robust' : scores.overall >= 60 ? 'Degraded' : 'Critical'}</h3>
          <p>
            {persona.avatar} {persona.name} ({persona.role})
          </p>
        </div>
      </div>

      <div className="metric-bars">
        <div className="metric-item">
          <div className="metric-meta">
            <span>Security</span>
            <span>{scores.security}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${scores.security}%`, background: getScoreColor(scores.security) }}
            />
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-meta">
            <span>Performance</span>
            <span>{scores.performance}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${scores.performance}%`, background: getScoreColor(scores.performance) }}
            />
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-meta">
            <span>Reliability</span>
            <span>{scores.reliability}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${scores.reliability}%`, background: getScoreColor(scores.reliability) }}
            />
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-meta">
            <span>Architecture</span>
            <span>{scores.architecture}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${scores.architecture}%`, background: getScoreColor(scores.architecture) }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        <div className="complexity-pill" title={complexity.explanation}>
          <span className="complexity-label">Time:</span>
          <span className="complexity-val">{complexity.timeComplexity}</span>
        </div>
        <div className="complexity-pill" title={`Space complexity: ${complexity.spaceComplexity}`}>
          <span className="complexity-label">Space:</span>
          <span className="complexity-val">{complexity.spaceComplexity}</span>
        </div>
        <div className="complexity-pill">
          <span className="complexity-label">LOC:</span>
          <span style={{ color: 'var(--text-main)' }}>{loc}</span>
        </div>
        <div className="complexity-pill">
          <span className="complexity-label">Issues:</span>
          <span style={{ color: issueCount > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
            {issueCount}
          </span>
        </div>
      </div>
    </div>
  );
};
