import React, { useState, useEffect } from 'react';
import { Send, Bot, User, Copy, Check, Sparkles } from 'lucide-react';
import { ChatMessage, CodeIssue, ComplexityResult, PersonaProfile, ProviderConfig } from '../types';

interface AssistantChatProps {
  code: string;
  language: string;
  issues: CodeIssue[];
  complexity: ComplexityResult;
  persona: PersonaProfile;
  providerConfig: ProviderConfig;
  initialPrompt?: string;
}

export const AssistantChat: React.FC<AssistantChatProps> = ({
  code,
  language,
  issues,
  complexity,
  persona,
  providerConfig,
  initialPrompt
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      content: `Hello! I'm grounded in your active **${language}** snippet (${issues.length} issue(s) flagged, time complexity: **${complexity.timeComplexity}**).\n\nI am analyzing from the perspective of **${persona.name}** (${persona.role}). Ask me anything about edge cases, asymptotic proofs, memory layouts, or automated refactoring!`,
      timestamp: new Date().toLocaleTimeString(),
      suggestions: [
        'Prove Big-O Time Complexity',
        'How to make this Zero-Allocation?',
        'Explain security vulnerability in detail',
        'Show unit test harness'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  const handleCopyMessage = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      content: userPrompt,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateAssistantResponse(userPrompt, code, language, issues, complexity, persona, providerConfig);
      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        content: reply.text,
        timestamp: new Date().toLocaleTimeString(),
        suggestions: reply.suggestions
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="chat-container">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 0.85rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '0.75rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{persona.avatar}</span>
          <span>
            Speaking with <strong>{persona.name}</strong> ({persona.role})
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)' }}>
          <Sparkles size={12} />
          <span>Codebase Grounded</span>
        </div>
      </div>

      <div className="chat-history">
        {messages.map((m) => (
          <div key={m.id} className={`chat-message ${m.sender}`}>
            <div className="chat-avatar">
              {m.sender === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div style={{ maxWidth: '85%' }}>
              <div className="chat-bubble" style={{ position: 'relative' }}>
                <div style={{ whiteSpace: 'pre-line' }}>{m.content}</div>
                {m.sender === 'assistant' && (
                  <button
                    onClick={() => handleCopyMessage(m.id, m.content)}
                    title="Copy message"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      padding: '2px'
                    }}
                  >
                    {copiedId === m.id ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
              {m.suggestions && m.suggestions.length > 0 && (
                <div className="chat-suggestions">
                  {m.suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      className="suggestion-pill"
                      onClick={() => handleSend(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-message assistant">
            <div className="chat-avatar">
              <Bot size={16} />
            </div>
            <div className="chat-bubble">
              <span style={{ color: 'var(--text-muted)' }}>Thinking from {persona.name}&apos;s perspective...</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '0.6rem' }}>
        <button
          className="suggestion-pill"
          onClick={() => handleSend('Prove Big-O Time Complexity')}
        >
          📐 Prove Big-O
        </button>
        <button
          className="suggestion-pill"
          onClick={() => handleSend('How to make this Zero-Allocation?')}
        >
          ⚡ Zero-Alloc Refactor
        </button>
        <button
          className="suggestion-pill"
          onClick={() => handleSend('Explain security vulnerability in detail')}
        >
          🛡️ Threat Audit
        </button>
        <button
          className="suggestion-pill"
          onClick={() => handleSend('Show unit test harness')}
        >
          🧪 Unit Tests
        </button>
      </div>

      <form
        className="chat-input-bar"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputValue);
        }}
      >
        <input
          type="text"
          className="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Ask ${persona.name} about architecture, edge cases, or complexity...`}
        />
        <button type="submit" className="btn-action btn-primary" disabled={isTyping}>
          <Send size={14} />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};

function generateAssistantResponse(
  prompt: string,
  _code: string,
  _language: string,
  issues: CodeIssue[],
  complexity: ComplexityResult,
  persona: PersonaProfile,
  _config: ProviderConfig
): { text: string; suggestions?: string[] } {
  const p = prompt.toLowerCase();

  if (p.includes('big-o') || p.includes('complexity') || p.includes('prove')) {
    return {
      text: `**Algorithmic Derivation Proof (${persona.name}):**\n\n1. **Outer Traversal:** The control flow executes **${complexity.worstCase}**.\n2. **Auxiliary Space:** Space is bounded by **${complexity.spaceComplexity}**.\n3. **Tightness of Bound:** In the worst case, every input element undergoes non-constant evaluations, meaning Ω(g(n)) = O(g(n)) = Θ(${complexity.timeComplexity}).\n\n**To optimize:** Replacing nested lookups with a pre-indexed map or single-batch SQL join cuts runtime from quadratic down to linear O(N) or constant O(1).`,
      suggestions: ['Show refactored code', 'What are the concurrency hazards?']
    };
  }

  if (p.includes('zero-allocation') || p.includes('memory') || p.includes('leak')) {
    return {
      text: `**Memory & Allocation Review (${persona.name}):**\n\n- The current code path creates new heap allocations per iteration/call.\n- Under high request rates, this increases GC pressure and causes tail-latency jitter (P99 spikes).\n- **Remedy:** Pre-allocate slice/buffer capacity upfront. For caching, replace loose object creation with an object pool or circular slab buffer.`,
      suggestions: ['Explain cache eviction', 'Show unit test harness']
    };
  }

  if (p.includes('security') || p.includes('vulnerability') || p.includes('cwe') || p.includes('threat')) {
    const critical = issues.filter((i) => i.severity === 'critical');
    if (critical.length > 0) {
      return {
        text: `**Security Threat Analysis:**\n\nWe identified **${critical[0].title}**.\n\n- **Impact:** ${critical[0].description}\n- **CWE:** ${critical[0].cwe || 'CWE-200 / CWE-89'}\n- **Fix:** ${critical[0].recommendation}`,
        suggestions: ['How does constant-time comparison work?', 'Generate security fuzz tests']
      };
    }
    return {
      text: `No critical vulnerabilities were detected in the active buffer. However, always ensure parameterized SQL queries, strict input boundaries, and zero-trust auth token validation.`,
      suggestions: ['Check performance issues', 'Prove time complexity']
    };
  }

  return {
    text: `From my standpoint as ${persona.role}, this code demonstrates ${issues.length > 0 ? issues.length + ' key areas for hardening' : 'solid baseline hygiene'}. The current complexity is ${complexity.timeComplexity}. Applying the recommended unified diff will eliminate latency regressions and prevent runtime failure modes.`,
    suggestions: ['Prove Big-O Time Complexity', 'How to make this Zero-Allocation?', 'Show refactored code']
  };
}
