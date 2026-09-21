import React, { useState } from 'react';
import { Sparkles, Terminal, Download, Copy, Settings, Wrench, FileCode, ShieldAlert, Palette, ArrowLeft } from 'lucide-react';
import { Scenario } from '../types';

export type AppTheme = 'cosmic' | 'cyberpunk' | 'sunset' | 'emerald' | 'light';

interface HeaderProps {
  scenarios: Scenario[];
  selectedScenarioId: string;
  onSelectScenario: (id: string) => void;
  onRunAnalysis: () => void;
  onExportReport: () => void;
  onCopyPatch: () => void;
  onOpenSettings: () => void;
  onTriggerToolAction?: (action: string) => void;
  isAnalyzing: boolean;
  hasAnalyzed: boolean;
  onBackToEditor?: () => void;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

export const Header: React.FC<HeaderProps> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onRunAnalysis,
  onExportReport,
  onCopyPatch,
  onOpenSettings,
  onTriggerToolAction,
  isAnalyzing,
  hasAnalyzed,
  onBackToEditor,
  currentTheme,
  onSelectTheme
}) => {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const themes: { id: AppTheme; name: string; dotColor: string }[] = [
    { id: 'cosmic', name: 'Cosmic Indigo', dotColor: '#6366f1' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', dotColor: '#ec4899' },
    { id: 'sunset', name: 'Sunset Solar', dotColor: '#f97316' },
    { id: 'emerald', name: 'Emerald Matrix', dotColor: '#10b981' },
    { id: 'light', name: 'Luminous Light', dotColor: '#3b82f6' }
  ];

  return (
    <header className="top-header">
      <div className="brand-section">
        <div className="brand-logo">
          <Terminal size={17} />
        </div>
        <div className="brand-title">
          <span>CodeLens</span>
          <span className="brand-badge">Studio</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Scenario Switcher */}
        <select
          className="dropdown-select"
          value={selectedScenarioId}
          onChange={(e) => onSelectScenario(e.target.value)}
          title="Switch preset challenge or write custom code"
        >
          <option value="custom">✍️ Blank Editor / Custom Code</option>
          <optgroup label="Real-World Code Challenges">
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.language.toUpperCase()})
              </option>
            ))}
          </optgroup>
        </select>

        {/* Developer Tools Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-secondary"
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            title="More Analysis Tools & Generators"
          >
            <Wrench size={13} />
            <span>Developer Tools ▾</span>
          </button>

          {isToolsOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
                width: '240px',
                zIndex: 100,
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
              onMouseLeave={() => setIsToolsOpen(false)}
            >
              <button
                className="lens-pill"
                style={{ textAlign: 'left', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => {
                  setIsToolsOpen(false);
                  onTriggerToolAction?.('generate-tests');
                }}
              >
                <FileCode size={14} color="var(--accent-emerald)" />
                <span>Generate Test Suite</span>
              </button>

              <button
                className="lens-pill"
                style={{ textAlign: 'left', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => {
                  setIsToolsOpen(false);
                  onTriggerToolAction?.('security-fuzz');
                }}
              >
                <ShieldAlert size={14} color="var(--accent-rose)" />
                <span>Security Fuzz Simulator</span>
              </button>

              <button
                className="lens-pill"
                style={{ textAlign: 'left', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => {
                  setIsToolsOpen(false);
                  onTriggerToolAction?.('zero-alloc');
                }}
              >
                <Sparkles size={14} color="var(--accent-cyan)" />
                <span>Zero-Alloc Refactor</span>
              </button>

              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

              <button
                className="lens-pill"
                style={{ textAlign: 'left', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => {
                  setIsToolsOpen(false);
                  onExportReport();
                }}
              >
                <Download size={14} color="var(--accent-indigo)" />
                <span>Export Markdown Report</span>
              </button>

              <button
                className="lens-pill"
                style={{ textAlign: 'left', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => {
                  setIsToolsOpen(false);
                  onCopyPatch();
                }}
              >
                <Copy size={14} color="var(--accent-amber)" />
                <span>Copy Unified .patch</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Picker Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-secondary"
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            title="Change Visual Theme & Color Palette"
            style={{ padding: '0.48rem 0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Palette size={14} style={{ color: themes.find(t => t.id === currentTheme)?.dotColor }} />
            <span style={{ fontSize: '0.78rem' }}>Theme</span>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: themes.find(t => t.id === currentTheme)?.dotColor,
                boxShadow: `0 0 8px ${themes.find(t => t.id === currentTheme)?.dotColor}`
              }}
            />
          </button>

          {isThemeOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
                width: '190px',
                zIndex: 100,
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
              onMouseLeave={() => setIsThemeOpen(false)}
            >
              {themes.map((t) => (
                <button
                  key={t.id}
                  className={`lens-pill ${currentTheme === t.id ? 'active' : ''}`}
                  style={{
                    textAlign: 'left',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onClick={() => {
                    onSelectTheme(t.id);
                    setIsThemeOpen(false);
                  }}
                >
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: t.dotColor,
                      boxShadow: `0 0 8px ${t.dotColor}`
                    }}
                  />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Settings button */}
        <button
          className="btn-secondary"
          onClick={onOpenSettings}
          title="Configure AI Models & Engine"
          style={{ padding: '0.48rem 0.6rem' }}
        >
          <Settings size={14} />
        </button>

        {/* Action Button: Back to Editor if analyzed */}
        {hasAnalyzed && onBackToEditor ? (
          <button
            className="btn-secondary"
            onClick={onBackToEditor}
            title="Return to full-screen editor"
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <ArrowLeft size={13} />
            <span>Full Editor</span>
          </button>
        ) : null}

        <button
          className="btn-primary"
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          title="Run complete multi-vector heuristic & complexity audit"
        >
          <Sparkles size={15} />
          <span>{isAnalyzing ? 'Auditing...' : 'Analyze Code'}</span>
        </button>
      </div>
    </header>
  );
};
