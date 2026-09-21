import React from 'react';
import { Sparkles, Terminal, Download, Copy, Settings } from 'lucide-react';
import { Scenario } from '../types';

interface HeaderProps {
  scenarios: Scenario[];
  selectedScenarioId: string;
  onSelectScenario: (id: string) => void;
  onRunAnalysis: () => void;
  onExportReport: () => void;
  onCopyPatch: () => void;
  onOpenSettings: () => void;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onRunAnalysis,
  onExportReport,
  onCopyPatch,
  onOpenSettings,
  isAnalyzing
}) => {
  return (
    <header className="top-header">
      <div className="brand-section">
        <div className="brand-logo">
          <Terminal size={16} />
        </div>
        <div className="brand-title">
          <span>CodeLens</span>
          <span className="brand-badge">AI Reviewer</span>
        </div>
      </div>

      <div className="header-actions">
        <select
          className="dropdown-select"
          value={selectedScenarioId}
          onChange={(e) => onSelectScenario(e.target.value)}
          title="Load preloaded sample code challenge or start with blank editor"
        >
          <option value="custom">✍️ Blank Editor / Paste Code</option>
          <optgroup label="Sample Code Vulnerabilities">
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.language.toUpperCase()})
              </option>
            ))}
          </optgroup>
        </select>

        <button
          className="btn-secondary"
          onClick={onExportReport}
          title="Download Comprehensive Markdown Audit Report"
        >
          <Download size={13} />
          <span>Export Report</span>
        </button>

        <button
          className="btn-secondary"
          onClick={onCopyPatch}
          title="Copy Unified Git Diff Patch to clipboard"
        >
          <Copy size={13} />
          <span>Copy Patch</span>
        </button>

        <button
          className="btn-secondary"
          onClick={onOpenSettings}
          title="Configure AI Models & Engine"
          style={{ padding: '0.42rem 0.5rem' }}
        >
          <Settings size={14} />
        </button>

        <button
          className="btn-primary"
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          title="Run complete multi-vector heuristic & complexity audit"
        >
          <Sparkles size={14} />
          <span>{isAnalyzing ? 'Auditing...' : 'Analyze Code'}</span>
        </button>
      </div>
    </header>
  );
};
