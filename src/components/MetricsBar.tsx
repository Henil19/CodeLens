import React from 'react';
import { MetricScore, ComplexityResult } from '../types';
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';

interface MetricsBarProps {
  scores: MetricScore;
  complexity: ComplexityResult;
  loc: number;
  issueCount: number;
  criticalCount: number;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  scores,
  complexity,
  loc,
  issueCount,
  criticalCount
}) => {
  const isHealthy = scores.overall >= 80;
  const isWarning = scores.overall >= 60 && scores.overall < 80;

  return (
    <div className="status-strip">
      <div className="status-left">
        <div
          className={`health-pill ${
            criticalCount > 0 ? 'critical' : isHealthy ? 'healthy' : isWarning ? 'warning' : 'critical'
          }`}
        >
          {criticalCount > 0 ? (
            <AlertCircle size={13} />
          ) : isHealthy ? (
            <ShieldCheck size={13} />
          ) : (
            <AlertTriangle size={13} />
          )}
          <span>
            Score: {scores.overall}/100 ·{' '}
            {criticalCount > 0
              ? `${criticalCount} Critical Blockers`
              : issueCount > 0
              ? `${issueCount} Issues Found`
              : 'Clean & Hardened'}
          </span>
        </div>

        <span className="status-meta">
          Security: {scores.security}% · Performance: {scores.performance}% · Reliability: {scores.reliability}%
        </span>
      </div>

      <div className="status-right">
        <div className="status-tag">
          <span>Time:</span>
          <strong>{complexity.timeComplexity}</strong>
        </div>
        <div className="status-tag">
          <span>Space:</span>
          <strong>{complexity.spaceComplexity}</strong>
        </div>
        <div className="status-tag">
          <span>{loc} lines</span>
        </div>
      </div>
    </div>
  );
};
