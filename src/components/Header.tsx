import React from 'react';
import { Sparkles, Terminal, Download, Copy, Settings, HelpCircle, Layers } from 'lucide-react';
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
  onToggleGuide: () => void;
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
  onToggleGuide,
  isAnalyzing
}) => {
  const currentScenario = scenarios.find((s) => s.id === selectedScenarioId);

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
          <p>Algorithmic complexity, security heuristics & unified diff studio</p>
        </div>
      </div>

      <div className="header-controls">
        <div className="scenario-select-wrapper" title="Select a preloaded real-world code challenge or paste your own">
          <Layers size={14} color="var(--accent-cyan)" />
          <select
            id="scenario-select"
            value={selectedScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
          >
            <option value="custom">✍️ Custom Code / Paste</option>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.language.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {currentScenario && (
          <span
            style={{
              fontSize: '0.72rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '999px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              color: 'var(--accent-indigo)',
              fontWeight: 500
            }}
          >
            {currentScenario.tag}
          </span>
        )}

        <div className="persona-btn-group" title="Switch reviewer perspective to see tailored audits">
          {(Object.keys(PERSONAS) as PersonaId[]).map((pid) => {
            const p = PERSONAS[pid];
            return (
              <button
                key={pid}
                className={`persona-btn ${activePersona === pid ? 'active' : ''}`}
                onClick={() => onSelectPersona(pid)}
                title={`${p.name} (${p.role}) - ${p.tagline}`}
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
          title="Re-run deep multi-vector heuristic and complexity audit"
        >
          <Sparkles size={14} />
          <span>{isAnalyzing ? 'Auditing...' : 'Run Audit'}</span>
        </button>

        <button className="btn-action btn-ghost" onClick={onExportReport} title="Download Comprehensive Markdown Report">
          <Download size={14} />
          <span>Report</span>
        </button>

        <button className="btn-action btn-ghost" onClick={onCopyPatch} title="Copy Unified Git Diff Patch">
          <Copy size={14} />
          <span>Patch</span>
        </button>

        <button className="btn-action btn-ghost" onClick={onToggleGuide} title="Show/Hide Quick Start Guide">
          <HelpCircle size={14} />
          <span>Guide</span>
        </button>

        <button className="btn-action btn-ghost" onClick={onOpenSettings} title="Configure AI Inference Engine & API Keys">
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
};
