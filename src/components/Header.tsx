import React from 'react';
import { Sparkles, Terminal, Download, Copy, Settings } from 'lucide-react';
import { PersonaId, Scenario } from '../types';
import { PERSONAS } from '../engine/personas';

interface HeaderProps {
  scenarios: Scenario[];
  selectedScenarioId: string;
  onSelectScenario: (id: string) => void;
  activePersona: PersonaId;
  onSelectPersona: (id: PersonaId) => void;
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
  activePersona,
  onSelectPersona,
  onRunAnalysis,
  onExportReport,
  onCopyPatch,
  onOpenSettings,
  isAnalyzing
}) => {
  return (
    <header className="top-header">
      <div className="brand-section">
        <div className="brand-badge">
          <Terminal size={20} />
        </div>
        <div className="brand-meta">
          <h1>
            CodeLens <span className="brand-tag">Research & Review</span>
          </h1>
          <p>Multi-dimensional algorithmic, security, and architectural analyzer</p>
        </div>
      </div>

      <div className="header-controls">
        <div className="scenario-select-wrapper">
          <label htmlFor="scenario-select">Preset:</label>
          <select
            id="scenario-select"
            value={selectedScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
          >
            <option value="custom">Custom Code / Paste</option>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.language})
              </option>
            ))}
          </select>
        </div>

        <div className="persona-btn-group">
          {(Object.keys(PERSONAS) as PersonaId[]).map((pid) => {
            const p = PERSONAS[pid];
            return (
              <button
                key={pid}
                className={`persona-btn ${activePersona === pid ? 'active' : ''}`}
                onClick={() => onSelectPersona(pid)}
                title={`${p.name} - ${p.tagline}`}
              >
                <span>{p.avatar}</span>
                <span>{p.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        <button
          className="btn-action btn-primary"
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
        >
          <Sparkles size={14} />
          <span>{isAnalyzing ? 'Auditing...' : 'Analyze'}</span>
        </button>

        <button className="btn-action btn-ghost" onClick={onExportReport} title="Export Markdown Report">
          <Download size={14} />
          <span>Report</span>
        </button>

        <button className="btn-action btn-ghost" onClick={onCopyPatch} title="Copy .patch diff">
          <Copy size={14} />
          <span>Patch</span>
        </button>

        <button className="btn-action btn-ghost" onClick={onOpenSettings} title="Model & Engine Settings">
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
};
