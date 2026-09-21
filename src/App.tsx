import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { CodeEditor } from './components/CodeEditor';
import { ReviewPanel } from './components/ReviewPanel';
import { DiffViewer } from './components/DiffViewer';
import { ResearchPanel } from './components/ResearchPanel';
import { AssistantChat } from './components/AssistantChat';
import { SettingsModal } from './components/SettingsModal';
import { QuickGuide } from './components/QuickGuide';
import { Toast, ToastMessage } from './components/Toast';

import { SCENARIOS } from './samples/scenarios';
import { PERSONAS } from './engine/personas';
import { analyzeCode } from './engine/analyzer';
import { PersonaId, ProviderConfig, AnalysisReport } from './types';
import { ShieldAlert, GitCompare, BookOpen, MessageSquareCode } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('ts-cache-leak');
  const [activePersonaId, setActivePersonaId] = useState<PersonaId>('staff-systems');
  const [code, setCode] = useState<string>(SCENARIOS[0].code);
  const [language, setLanguage] = useState<string>(SCENARIOS[0].language);

  const [activeTab, setActiveTab] = useState<'review' | 'diff' | 'research' | 'chat'>('review');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [providerConfig, setProviderConfig] = useState<ProviderConfig>({
    provider: 'local-engine',
    temperature: 0.2
  });

  const [report, setReport] = useState<AnalysisReport>(() =>
    analyzeCode(SCENARIOS[0].code, SCENARIOS[0].language, 'staff-systems')
  );

  const activePersona = PERSONAS[activePersonaId];

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = String(Date.now() + Math.random());
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
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
    }, 120);
  };

  const handleSelectScenario = (id: string) => {
    setSelectedScenarioId(id);
    if (id === 'custom') {
      setCode('');
      addToast('info', 'Switched to Custom Code editor. Paste or type your code!');
      return;
    }
    const found = SCENARIOS.find((s) => s.id === id);
    if (found) {
      setCode(found.code);
      setLanguage(found.language);
      handleRunAnalysis(found.code, found.language, activePersonaId);
      addToast('info', `Loaded preset: ${found.name}`);
    }
  };

  const handleSelectPersona = (pid: PersonaId) => {
    setActivePersonaId(pid);
    handleRunAnalysis(code, language, pid);
    const p = PERSONAS[pid];
    addToast('info', `Reviewer switched to ${p.name} (${p.role})`);
  };

  const handleApplyFix = (_fixSnippet: string) => {
    // Cleanly replace with the refactored code to eliminate all flaws
    const updated = report.refactoredCode;
    setCode(updated);
    handleRunAnalysis(updated, language, activePersonaId);
    addToast('success', 'Fix applied! Health score updated in editor.');
  };

  const handleApplyRefactor = (refactored: string) => {
    setCode(refactored);
    handleRunAnalysis(refactored, language, activePersonaId);
    setActiveTab('review');
    addToast('success', 'Complete refactor applied! Code is now fully hardened.');
  };

  const handleExportReport = () => {
    const md = `# CodeLens Audit Report: ${selectedScenarioId}
**Date:** ${new Date().toISOString()}  
**Reviewer:** ${activePersona.name} (${activePersona.role})  
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

## Algorithmic Invariants & Proofs
${report.complexity.explanation}

## Synthesized Regression Test Suite
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

  // Re-run analysis on code change with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      handleRunAnalysis(code, language, activePersonaId);
    }, 350);
    return () => clearTimeout(handler);
  }, [code, language]);

  return (
    <div className="app-container">
      <Header
        scenarios={SCENARIOS}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={handleSelectScenario}
        activePersona={activePersonaId}
        onSelectPersona={handleSelectPersona}
        onRunAnalysis={() => {
          handleRunAnalysis();
          addToast('info', 'Audit refreshed!');
        }}
        onExportReport={handleExportReport}
        onCopyPatch={handleCopyPatch}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleGuide={() => setIsGuideOpen(!isGuideOpen)}
        isAnalyzing={isAnalyzing}
      />

      <QuickGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <MetricsBar
        scores={report.scores}
        complexity={report.complexity}
        persona={activePersona}
        loc={report.loc}
        issueCount={report.issues.length}
      />

      <main className="workspace-grid">
        <CodeEditor
          code={code}
          onChange={setCode}
          language={language}
          onLanguageChange={(l) => {
            setLanguage(l);
            addToast('info', `Language set to ${l.toUpperCase()}`);
          }}
          onReset={() => {
            setCode('');
            addToast('info', 'Editor cleared');
          }}
        />

        <div className="intel-pane">
          <div className="tab-nav">
            <button
              className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`}
              onClick={() => setActiveTab('review')}
            >
              <ShieldAlert size={14} />
              <span>Review Findings</span>
              <span className="tab-badge">{report.issues.length}</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'diff' ? 'active' : ''}`}
              onClick={() => setActiveTab('diff')}
            >
              <GitCompare size={14} />
              <span>Unified Diff & Patch</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'research' ? 'active' : ''}`}
              onClick={() => setActiveTab('research')}
            >
              <BookOpen size={14} />
              <span>Research & Complexity</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquareCode size={14} />
              <span>Interactive Assistant</span>
            </button>
          </div>

          <div className="tab-content-area">
            {activeTab === 'review' && (
              <ReviewPanel
                issues={report.issues}
                summary={report.summary}
                onApplyFix={handleApplyFix}
                onViewDiffTab={() => setActiveTab('diff')}
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
              />
            )}
          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={providerConfig}
        onSave={(cfg) => {
          setProviderConfig(cfg);
          addToast('success', 'Engine settings saved!');
        }}
      />

      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};
export default App;
