import React, { useState, useEffect } from 'react';
import { Header, AppTheme } from './components/Header';
import { CodeEditor } from './components/CodeEditor';
import { ReviewPanel } from './components/ReviewPanel';
import { DiffViewer } from './components/DiffViewer';
import { ResearchPanel } from './components/ResearchPanel';
import { AssistantChat } from './components/AssistantChat';
import { SettingsModal } from './components/SettingsModal';
import { Toast, ToastMessage } from './components/Toast';

import { SCENARIOS } from './samples/scenarios';
import { PERSONAS } from './engine/personas';
import { analyzeCode } from './engine/analyzer';
import { PersonaId, ProviderConfig, AnalysisReport } from './types';
import {
  ShieldAlert,
  GitCompare,
  BookOpen,
  MessageSquareCode,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Columns,
  Maximize2,
  Minimize2
} from 'lucide-react';

export const App: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('ts-cache-leak');
  const [activePersonaId, setActivePersonaId] = useState<PersonaId>('security-auditor');
  const [code, setCode] = useState<string>(SCENARIOS[0].code);
  const [language, setLanguage] = useState<string>(SCENARIOS[0].language);

  // User flow state & Theme / View customization
  const [currentTheme, setCurrentTheme] = useState<AppTheme>('cosmic');
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'review'>('split');
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);
  const [chatPrompt, setChatPrompt] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'review' | 'diff' | 'research' | 'chat'>('review');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [providerConfig, setProviderConfig] = useState<ProviderConfig>({
    provider: 'local-engine',
    temperature: 0.2
  });

  const [report, setReport] = useState<AnalysisReport>(() =>
    analyzeCode(SCENARIOS[0].code, SCENARIOS[0].language, 'security-auditor')
  );

  const activePersona = PERSONAS[activePersonaId];
  const criticalCount = report.issues.filter((i) => i.severity === 'critical').length;
  const isHealthy = report.scores.overall >= 80;
  const isWarning = report.scores.overall >= 60 && report.scores.overall < 80;

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = String(Date.now() + Math.random());
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleRunAnalysis = (overrideCode?: string, overrideLang?: string, overridePersona?: PersonaId) => {
    setIsAnalyzing(true);
    const targetCode = overrideCode ?? code;
    const targetLang = overrideLang ?? language;
    const targetPersona = overridePersona ?? activePersonaId;

    setTimeout(() => {
      const nextReport = analyzeCode(targetCode, targetLang, targetPersona);
      setReport(nextReport);
      setIsAnalyzing(false);
      setHasAnalyzed(true);
      addToast('success', 'Analysis completed!');
    }, 150);
  };

  const handleSelectScenario = (id: string) => {
    setSelectedScenarioId(id);
    if (id === 'custom') {
      setCode('');
      setHasAnalyzed(false);
      addToast('info', 'Blank editor ready. Paste or type your code!');
      return;
    }
    const found = SCENARIOS.find((s) => s.id === id);
    if (found) {
      setCode(found.code);
      setLanguage(found.language);
      setHasAnalyzed(false);
      addToast('info', `Loaded sample: ${found.name}`);
    }
  };

  const handleSelectPersona = (pid: PersonaId) => {
    setActivePersonaId(pid);
    const nextReport = analyzeCode(code, language, pid);
    setReport(nextReport);
    const p = PERSONAS[pid];
    addToast('info', `Switched focus to ${p.name}`);
  };

  const handleApplyFix = (_fixSnippet: string) => {
    const updated = report.refactoredCode;
    setCode(updated);
    const nextReport = analyzeCode(updated, language, activePersonaId);
    setReport(nextReport);
    addToast('success', 'Hardened fix applied to editor!');
  };

  const handleApplyRefactor = (refactored: string) => {
    setCode(refactored);
    const nextReport = analyzeCode(refactored, language, activePersonaId);
    setReport(nextReport);
    setActiveTab('review');
    addToast('success', 'Complete refactor applied to editor!');
  };

  const handleAutoFixAll = () => {
    setCode(report.refactoredCode);
    const nextReport = analyzeCode(report.refactoredCode, language, activePersonaId);
    setReport(nextReport);
    addToast('success', 'All recommended fixes applied and verified!');
  };

  const handleTriggerToolAction = (action: string) => {
    if (action === 'generate-tests') {
      setActiveTab('research');
      addToast('info', 'Generated regression & edge-case test harness');
    } else if (action === 'security-fuzz') {
      setActivePersonaId('security-auditor');
      const nextReport = analyzeCode(code, language, 'security-auditor');
      setReport(nextReport);
      setActiveTab('review');
      addToast('info', 'Security Fuzzing Lens Active');
    } else if (action === 'zero-alloc') {
      setActivePersonaId('staff-systems');
      const nextReport = analyzeCode(code, language, 'staff-systems');
      setReport(nextReport);
      setActiveTab('diff');
      addToast('info', 'Zero-Allocation Systems Lens Active');
    }
  };

  const handleExportReport = () => {
    const md = `# CodeLens Audit Report
**Date:** ${new Date().toISOString()}  
**Focus Lens:** ${activePersona.name}  
**Overall Health Score:** ${report.scores.overall}/100  
**Time Complexity:** ${report.complexity.timeComplexity} | **Space:** ${report.complexity.spaceComplexity}

## Executive Summary
${report.summary}

## Metric Scores
- Security: ${report.scores.security}%
- Performance: ${report.scores.performance}%
- Reliability: ${report.scores.reliability}%
- Maintainability: ${report.scores.maintainability}%
- Architecture: ${report.scores.architecture}%

## Identified Issues (${report.issues.length})
${report.issues
  .map(
    (issue, i) => `### ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.title} (L${issue.lineStart}-L${issue.lineEnd})
**Description:** ${issue.description}  
${issue.cwe ? `**CWE:** ${issue.cwe}  \n` : ''}**Recommendation:** ${issue.recommendation}
${issue.codeFix ? `\`\`\`${language}\n${issue.codeFix}\n\`\`\`` : ''}
`
  )
  .join('\n')}

## Algorithmic Complexity & Bounds
${report.complexity.explanation}

## Automated Test Harness
\`\`\`${language}
${report.testSuiteSuggestion}
\`\`\`
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codelens-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Audit report downloaded as Markdown (.md)');
  };

  const handleCopyPatch = async () => {
    await navigator.clipboard.writeText(report.unifiedDiff);
    addToast('success', 'Unified .patch copied to clipboard!');
  };

  // If already analyzed and user modifies code, debounce re-analysis
  useEffect(() => {
    if (!hasAnalyzed) return;
    const handler = setTimeout(() => {
      const nextReport = analyzeCode(code, language, activePersonaId);
      setReport(nextReport);
    }, 400);
    return () => clearTimeout(handler);
  }, [code, language, hasAnalyzed, activePersonaId]);

  return (
    <div className="app-container" data-theme={currentTheme}>
      {/* 1. Header with Themes and Developer Tools */}
      <Header
        scenarios={SCENARIOS}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={handleSelectScenario}
        onRunAnalysis={() => handleRunAnalysis()}
        onExportReport={handleExportReport}
        onCopyPatch={handleCopyPatch}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onTriggerToolAction={handleTriggerToolAction}
        isAnalyzing={isAnalyzing}
        hasAnalyzed={hasAnalyzed}
        onBackToEditor={() => setHasAnalyzed(false)}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
      />

      {/* 2. State-Based Workspace Flow */}
      {!hasAnalyzed ? (
        // Initial clean landing screen: focused, spacious code input
        <main className="landing-workspace">
          <div className="landing-card">
            <div className="landing-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="dropdown-select"
                >
                  <option value="typescript">TypeScript (.ts)</option>
                  <option value="javascript">JavaScript (.js)</option>
                  <option value="python">Python (.py)</option>
                  <option value="go">Go (.go)</option>
                  <option value="rust">Rust (.rs)</option>
                  <option value="java">Java (.java)</option>
                  <option value="cpp">C++ (.cpp)</option>
                  <option value="sql">SQL (.sql)</option>
                </select>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {code.split('\n').length} lines · {(code.length / 1024).toFixed(1)} KB
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setCode('');
                    addToast('info', 'Editor cleared');
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="landing-card-body">
              <div className="line-numbers">
                {Array.from({ length: Math.max(code.split('\n').length, 16) }, (_, i) => (
                  <div key={i + 1}>{i + 1}</div>
                ))}
              </div>
              <textarea
                className="code-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste or write code here to audit vulnerabilities, complexity, and architectural anti-patterns..."
                spellCheck={false}
              />
            </div>

            <div className="landing-card-footer">
              <div className="sample-pills-row">
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Quick Samples:</span>
                {SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    className="sample-pill-btn"
                    onClick={() => {
                      setCode(s.code);
                      setLanguage(s.language);
                      setSelectedScenarioId(s.id);
                      addToast('info', `Loaded: ${s.name}`);
                    }}
                  >
                    {s.name.split(' (')[0]}
                  </button>
                ))}
              </div>

              <button
                className="btn-primary"
                onClick={() => handleRunAnalysis()}
                disabled={isAnalyzing || !code.trim()}
                style={{ padding: '0.55rem 1.35rem', fontSize: '0.86rem' }}
              >
                <Sparkles size={16} />
                <span>{isAnalyzing ? 'Auditing...' : 'Analyze Code'}</span>
              </button>
            </div>
          </div>
        </main>
      ) : (
        // Results View: Spacious split workspace with rich tabs
        <>
          <div className="results-subnav">
            <div className="results-subnav-left">
              <button
                className="btn-secondary"
                onClick={() => setHasAnalyzed(false)}
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
              >
                <ArrowLeft size={13} />
                <span>Full Editor</span>
              </button>

              <div
                className={`status-badge ${
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
                  Health: {report.scores.overall}/100 ·{' '}
                  {criticalCount > 0
                    ? `${criticalCount} Critical Blockers`
                    : report.issues.length > 0
                    ? `${report.issues.length} Issues Flagged`
                    : 'Hardened & Clean'}
                </span>
              </div>

              {report.issues.length > 0 && (
                <button
                  className="btn-glow"
                  onClick={handleAutoFixAll}
                  style={{ padding: '0.24rem 0.75rem', fontSize: '0.74rem' }}
                  title="Apply all recommended fixes to code"
                >
                  <Sparkles size={12} />
                  <span>Auto-Fix All ({report.issues.length})</span>
                </button>
              )}
            </div>

            <div className="results-subnav-right">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.5rem' }}>
                <span className="stat-pill" style={{ color: 'var(--accent-cyan)' }}>
                  Time: <strong>{report.complexity.timeComplexity}</strong>
                </span>
                <span className="stat-pill" style={{ color: 'var(--accent-purple)' }}>
                  Space: <strong>{report.complexity.spaceComplexity}</strong>
                </span>
                <span className="stat-pill" style={{ color: 'var(--text-muted)' }}>
                  {report.loc} lines
                </span>
              </div>

              {/* View Mode Toggle: Split / Code Focus / Review Focus */}
              <div className="filter-pills">
                <button
                  className={`filter-pill ${viewMode === 'split' ? 'active' : ''}`}
                  onClick={() => setViewMode('split')}
                  title="50/50 Split View"
                >
                  <Columns size={12} />
                </button>
                <button
                  className={`filter-pill ${viewMode === 'editor' ? 'active' : ''}`}
                  onClick={() => setViewMode('editor')}
                  title="Editor Focus"
                >
                  <Maximize2 size={12} />
                </button>
                <button
                  className={`filter-pill ${viewMode === 'review' ? 'active' : ''}`}
                  onClick={() => setViewMode('review')}
                  title="Review Focus"
                >
                  <Minimize2 size={12} />
                </button>
              </div>
            </div>
          </div>

          <div className={`results-workspace-grid mode-${viewMode}`}>
            <CodeEditor
              code={code}
              onChange={setCode}
              language={language}
              onLanguageChange={setLanguage}
              onReset={() => {
                setCode('');
                setHasAnalyzed(false);
                addToast('info', 'Editor cleared');
              }}
              onToast={addToast}
            />

            <div className="intel-pane">
              <div className="tab-nav">
                <button
                  className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`}
                  onClick={() => setActiveTab('review')}
                >
                  <ShieldAlert size={14} />
                  <span>Findings</span>
                  <span className="tab-badge">{report.issues.length}</span>
                </button>

                <button
                  className={`tab-btn ${activeTab === 'diff' ? 'active' : ''}`}
                  onClick={() => setActiveTab('diff')}
                >
                  <GitCompare size={14} />
                  <span>Diff & Fix</span>
                </button>

                <button
                  className={`tab-btn ${activeTab === 'research' ? 'active' : ''}`}
                  onClick={() => setActiveTab('research')}
                >
                  <BookOpen size={14} />
                  <span>Complexity & Big-O</span>
                </button>

                <button
                  className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  <MessageSquareCode size={14} />
                  <span>AI Assistant</span>
                </button>
              </div>

              <div className="tab-content-area">
                {activeTab === 'review' && (
                  <ReviewPanel
                    issues={report.issues}
                    summary={report.summary}
                    activeLens={activePersonaId}
                    onSelectLens={handleSelectPersona}
                    onApplyFix={handleApplyFix}
                    onApplyAllFixes={handleAutoFixAll}
                    onViewDiffTab={() => setActiveTab('diff')}
                    onAskAI={(prompt) => {
                      setChatPrompt(prompt);
                      setActiveTab('chat');
                    }}
                  />
                )}

                {activeTab === 'diff' && (
                  <DiffViewer
                    originalCode={code}
                    refactoredCode={report.refactoredCode}
                    onApplyRefactor={handleApplyRefactor}
                    language={language}
                  />
                )}

                {activeTab === 'research' && (
                  <ResearchPanel
                    complexity={report.complexity}
                    references={report.references}
                    testSuite={report.testSuiteSuggestion}
                  />
                )}

                {activeTab === 'chat' && (
                  <AssistantChat
                    code={code}
                    language={language}
                    issues={report.issues}
                    complexity={report.complexity}
                    persona={activePersona}
                    providerConfig={providerConfig}
                    initialPrompt={chatPrompt}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={providerConfig}
        onSave={(cfg) => {
          setProviderConfig(cfg);
          addToast('success', 'Settings saved');
        }}
      />

      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};
export default App;
