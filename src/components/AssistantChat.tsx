import React, { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { ChatMessage, CodeIssue, ComplexityResult, PersonaProfile, ProviderConfig } from '../types';

interface AssistantChatProps {
  code: string;
  language: string;
  issues: CodeIssue[];
  complexity: ComplexityResult;
  persona: PersonaProfile;
  providerConfig: ProviderConfig;
}

export const AssistantChat: React.FC<AssistantChatProps> = ({
  code,
  language,
  issues,
  complexity,
  persona,
  providerConfig
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      content: `Hello! I'm grounded in your ${language} snippet with ${issues.length} flagged issue(s) and an estimated time complexity of ${complexity.timeComplexity}. I am analyzing from the perspective of **${persona.name}** (${persona.role}). What aspect of the architecture, algorithmic proof, or security boundary would you like to explore?`,
      timestamp: new Date().toLocaleTimeString(),
      suggestions: [
        'Prove Big-O Time Complexity',
        'How to make this Zero-Allocation?',
        'Explain security vulnerability in detail',
        'Convert to Rust/Go'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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

    // Simulate smart contextual assistant response grounded in code & analysis
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
    }, 600);
  };

  return (
    <div className="chat-container">
      <div className="chat-history">
        {messages.map((m) => (
          <div key={m.id} className={`chat-message ${m.sender}`}>
            <div className="chat-avatar">
              {m.sender === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div>
              <div className="chat-bubble">
                <div style={{ whiteSpace: 'pre-line' }}>{m.content}</div>
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
          placeholder={`Ask ${persona.name} anything about this code...`}
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
      text: `**Algorithmic Derivation Proof (${persona.name}):**\n\n1. **Outer Traversal:** The control flow executes ${complexity.worstCase}.\n2. **Auxiliary Space:** Space is bounded by ${complexity.spaceComplexity}.\n3. **Tightness of Bound:** In the worst case, every input item encounters non-constant overhead, establishing that Ω(g(n)) = O(g(n)) = Θ(${complexity.timeComplexity}).\n\nTo optimize from ${complexity.timeComplexity} down to O(1) amortized or O(N), we can project the lookups into a pre-computed hash index or single-batch SQL join.`,
      suggestions: ['Show refactored code', 'What are the concurrency hazards?']
    };
  }

  if (p.includes('zero-allocation') || p.includes('memory') || p.includes('leak')) {
    return {
      text: `**Memory & Allocation Review (${persona.name}):**\n\n- The current implementation generates allocations in the inner loop path.\n- In high-throughput runtimes, this drives up minor GC frequency and causes tail-latency spikes (P99).\n- **Remedy:** Pre-allocate slice/buffer capacity upfront. For caching, replace loose object creation with an object pool or circular slab buffer.`,
      suggestions: ['Explain cache eviction', 'Show unit test suite']
    };
  }

  if (p.includes('security') || p.includes('vulnerability') || p.includes('cwe')) {
    const critical = issues.filter((i) => i.severity === 'critical');
    if (critical.length > 0) {
      return {
        text: `**Security Threat Analysis:**\n\nWe identified **${critical[0].title}**.\n\n- **Impact:** ${critical[0].description}\n- **CWE:** ${critical[0].cwe || 'CWE-200 / CWE-89'}\n- **Fix:** ${critical[0].recommendation}`,
        suggestions: ['How does constant-time comparison work?', 'Generate security fuzz tests']
      };
    }
    return {
      text: `No active critical vulnerabilities were triggered by the baseline heuristic filters. However, always ensure parameterized SQL queries, strict input boundaries, and zero-trust auth token validation.`,
      suggestions: ['Check performance issues', 'Prove time complexity']
    };
  }

  return {
    text: `From my standpoint as ${persona.role}, this code demonstrates ${issues.length > 0 ? issues.length + ' key areas for hardening' : 'solid baseline hygiene'}. The current complexity is ${complexity.timeComplexity}. Applying the recommended unified diff will eliminate latency regressions and prevent runtime failure modes.`,
    suggestions: ['Prove Big-O Time Complexity', 'How to make this Zero-Allocation?', 'Show refactored code']
  };
}
