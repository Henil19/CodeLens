export type Severity = 'critical' | 'warning' | 'info' | 'optimization';

export type Category = 'security' | 'performance' | 'reliability' | 'maintainability' | 'architecture';

export type PersonaId = 'staff-systems' | 'security-auditor' | 'clean-architect' | 'academic-cs';

export interface CodeIssue {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  lineStart: number;
  lineEnd: number;
  snippet?: string;
  recommendation: string;
  codeFix?: string;
  cwe?: string;
  benchmarkImpact?: string;
}

export interface MetricScore {
  overall: number;
  security: number;
  performance: number;
  reliability: number;
  maintainability: number;
  architecture: number;
}

export interface ComplexityResult {
  timeComplexity: string;
  spaceComplexity: string;
  bestCase: string;
  worstCase: string;
  recursionDepth: string;
  explanation: string;
  invariants: string[];
}

export interface LiteratureRef {
  title: string;
  authorsOrSource: string;
  year?: string;
  url?: string;
  summary: string;
  relevance: string;
}

export interface AnalysisReport {
  timestamp: string;
  language: string;
  loc: number;
  scores: MetricScore;
  summary: string;
  issues: CodeIssue[];
  complexity: ComplexityResult;
  references: LiteratureRef[];
  refactoredCode: string;
  unifiedDiff: string;
  testSuiteSuggestion: string;
}

export interface PersonaProfile {
  id: PersonaId;
  name: string;
  role: string;
  tagline: string;
  avatar: string;
  focus: string[];
  tone: string;
}

export interface Scenario {
  id: string;
  name: string;
  language: string;
  difficulty: 'Junior' | 'Senior' | 'Staff';
  tag: string;
  description: string;
  code: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

export interface ProviderConfig {
  provider: 'local-engine' | 'gemini' | 'openai' | 'anthropic' | 'ollama';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  temperature: number;
}
