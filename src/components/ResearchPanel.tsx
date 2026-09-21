import React, { useState } from 'react';
import { ComplexityResult, LiteratureRef } from '../types';
import { BookOpen, Check, Copy, Gauge, ShieldCheck, Terminal } from 'lucide-react';

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

  const getComplexityRating = (timeStr: string) => {
    if (timeStr.includes('1')) {
      return { label: 'Optimal / Constant Time', color: 'var(--accent-emerald)', desc: 'Immediate execution unaffected by input dataset size.' };
    }
    if (timeStr.includes('log')) {
      return { label: 'Sub-Linear / Logarithmic', color: 'var(--accent-cyan)', desc: 'High scalability, standard for tree lookups or efficient binary operations.' };
    }
    if (timeStr.includes('N²') || timeStr.includes('M')) {
      return { label: 'Quadratic / Bottleneck Risk', color: 'var(--accent-rose)', desc: 'Multiplicative scaling: 10,000 items requires ~100M operations. High risk under production load.' };
    }
    return { label: 'Linear Traversal', color: 'var(--accent-amber)', desc: 'Single-pass throughput scaling proportionally with dataset length.' };
  };

  const rating = getComplexityRating(complexity.timeComplexity);

  return (
    <div className="research-grid">
      <div className="research-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h3>
            <Gauge size={16} color="var(--accent-cyan)" /> Algorithmic Complexity & Asymptotic Bounds
          </h3>
          <div
            style={{
              fontSize: '0.74rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${rating.color}`,
              color: rating.color,
              fontWeight: 600
            }}
          >
            {rating.label}
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.5' }}>
          {rating.desc}
        </p>

        <table className="complexity-table">
          <thead>
            <tr>
              <th>Evaluation Dimension</th>
              <th>Order of Growth</th>
              <th>Behavioral Limit</th>
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
              <td>Auxiliary working memory allocation</td>
            </tr>
            <tr>
              <td>Call Stack / Recursion</td>
              <td style={{ color: 'var(--accent-indigo)' }}>{complexity.recursionDepth}</td>
              <td>Maximum runtime frame overhead</td>
            </tr>
          </tbody>
        </table>

        {complexity.invariants.length > 0 && (
          <div style={{ marginTop: '0.85rem' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Invariant Guarantees & Correctness Proofs:
            </div>
            <ul className="invariants-list">
              {complexity.invariants.map((inv, idx) => (
                <li key={idx}>
                  <ShieldCheck size={14} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{inv}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Interactive Scalability Benchmark Simulator */}
        <div
          style={{
            marginTop: '1.25rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              ⚡ Real-World Scale Latency Projection:
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Empirical V8 Model</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.6rem' }}>
            {[
              { n: 'N = 100', ops: complexity.timeComplexity.includes('1') ? '~0.01 ms' : complexity.timeComplexity.includes('N²') ? '~0.1 ms' : '~0.02 ms', status: 'optimal', color: 'var(--accent-emerald)' },
              { n: 'N = 10,000', ops: complexity.timeComplexity.includes('1') ? '~0.01 ms' : complexity.timeComplexity.includes('N²') ? '~100 ms' : '~1.2 ms', status: complexity.timeComplexity.includes('N²') ? 'warning' : 'optimal', color: complexity.timeComplexity.includes('N²') ? 'var(--accent-amber)' : 'var(--accent-emerald)' },
              { n: 'N = 1,000,000', ops: complexity.timeComplexity.includes('1') ? '~0.02 ms' : complexity.timeComplexity.includes('N²') ? '~12.5 min (Crash)' : '~85 ms', status: complexity.timeComplexity.includes('N²') ? 'danger' : 'optimal', color: complexity.timeComplexity.includes('N²') ? 'var(--accent-rose)' : 'var(--accent-cyan)' },
              { n: 'N = 100M', ops: complexity.timeComplexity.includes('1') ? '~0.05 ms' : complexity.timeComplexity.includes('N²') ? 'Out of Memory' : '~8.2 s', status: complexity.timeComplexity.includes('1') ? 'optimal' : 'danger', color: complexity.timeComplexity.includes('1') ? 'var(--accent-emerald)' : 'var(--accent-rose)' }
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-input)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${s.color}30`,
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.n}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: s.color, marginTop: '2px' }}>{s.ops}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="research-card">
        <h3>
          <BookOpen size={16} color="var(--accent-indigo)" /> Academic Literature & RFC Citations
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Industry standard papers and RFC specifications applicable to the detected code patterns.
        </p>
        <div className="references-list">
          {references.map((ref, idx) => (
            <div key={idx} className="reference-card">
              <div className="reference-title">{ref.title}</div>
              <div className="reference-src">
                {ref.authorsOrSource} {ref.year ? `(${ref.year})` : ''}
              </div>
              <p className="reference-summary">{ref.summary}</p>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.35rem' }}>
                ↳ <strong>Practical Implication:</strong> {ref.relevance}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="research-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h3>
            <Terminal size={16} color="var(--accent-emerald)" /> Synthesized Regression & Test Harness
          </h3>
          <button
            className="btn-action btn-ghost"
            onClick={handleCopyTest}
            title="Copy test suite to clipboard"
            style={{ fontSize: '0.74rem', padding: '0.2rem 0.6rem' }}
          >
            {copiedTest ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
            <span>{copiedTest ? 'Copied!' : 'Copy Test Suite'}</span>
          </button>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
          Targeted edge-case and regression tests generated specifically to guard against the identified vulnerabilities.
        </p>
        <pre className="code-fix-block" style={{ maxHeight: '280px', overflowY: 'auto' }}>
          <code>{testSuite}</code>
        </pre>
      </div>
    </div>
  );
};
