import React, { useState } from 'react';
import { ComplexityResult, LiteratureRef } from '../types';
import { BookOpen, Check, Copy } from 'lucide-react';

interface ResearchPanelProps {
  complexity: ComplexityResult;
  references: LiteratureRef[];
  testSuite: string;
}

export const ResearchPanel: React.FC<ResearchPanelProps> = ({
  complexity,
  references,
  testSuite
}) => {
  const [copiedTest, setCopiedTest] = useState(false);

  const handleCopyTest = async () => {
    await navigator.clipboard.writeText(testSuite);
    setCopiedTest(true);
    setTimeout(() => setCopiedTest(false), 2000);
  };

  return (
    <div className="research-grid">
      <div className="research-card">
        <h3>
          <span>📐</span> Algorithmic Complexity Derivation
        </h3>
        <table className="complexity-table">
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Order of Growth</th>
              <th>Behavioral Boundary</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Time Complexity (Worst)</td>
              <td style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>{complexity.worstCase}</td>
              <td>Upper asymptotic bound O(g(n))</td>
            </tr>
            <tr>
              <td>Time Complexity (Best)</td>
              <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{complexity.bestCase}</td>
              <td>Lower asymptotic bound Ω(g(n))</td>
            </tr>
            <tr>
              <td>Space Complexity</td>
              <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{complexity.spaceComplexity}</td>
              <td>Auxiliary working heap / stack space</td>
            </tr>
            <tr>
              <td>Recursion / Call Stack</td>
              <td style={{ color: 'var(--accent-indigo)' }}>{complexity.recursionDepth}</td>
              <td>Maximum runtime frame depth</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          {complexity.explanation}
        </p>

        {complexity.invariants.length > 0 && (
          <div style={{ marginTop: '0.85rem' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Loop & Invariant Guarantees:
            </div>
            <ul className="invariants-list">
              {complexity.invariants.map((inv, idx) => (
                <li key={idx}>
                  <span style={{ color: 'var(--accent-cyan)' }}>•</span>
                  <span>{inv}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="research-card">
        <h3>
          <BookOpen size={16} /> Academic Literature & RFC Citations
        </h3>
        <div className="references-list">
          {references.map((ref, idx) => (
            <div key={idx} className="reference-card">
              <div className="reference-title">{ref.title}</div>
              <div className="reference-src">
                {ref.authorsOrSource} {ref.year ? `(${ref.year})` : ''}
              </div>
              <p className="reference-summary">{ref.summary}</p>
              <div style={{ fontSize: '0.74rem', color: 'var(--accent-indigo)', marginTop: '0.35rem' }}>
                ↳ <strong>Application:</strong> {ref.relevance}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="research-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h3>
            <span>🧪</span> Synthesized Regression & Test Suite
          </h3>
          <button
            className="btn-action btn-ghost"
            onClick={handleCopyTest}
            style={{ fontSize: '0.74rem', padding: '0.2rem 0.6rem' }}
          >
            {copiedTest ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
            <span>{copiedTest ? 'Copied' : 'Copy Test Suite'}</span>
          </button>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
          Automated edge-case and regression harness targeting the identified failure modes.
        </p>
        <pre className="code-fix-block" style={{ maxHeight: '280px', overflowY: 'auto' }}>
          <code>{testSuite}</code>
        </pre>
      </div>
    </div>
  );
};
