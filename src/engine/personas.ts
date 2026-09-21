import { PersonaId, PersonaProfile } from '../types';

export const PERSONAS: Record<PersonaId, PersonaProfile> = {
  'security-auditor': {
    id: 'security-auditor',
    name: 'Security & Vulnerabilities',
    role: 'OWASP / CWE Threat Lens',
    tagline: 'Adversarial threat modeling, injection, and side-channel flaws.',
    avatar: '🛡️',
    focus: ['CWE & OWASP Mapping', 'Timing Leaks (CWE-208)', 'Injection Vectors (CWE-89)', 'Buffer Bounds (CWE-119)'],
    tone: 'Defensive, rigorous, security-first perspective.'
  },
  'staff-systems': {
    id: 'staff-systems',
    name: 'Performance & Concurrency',
    role: 'Systems & Scale Lens',
    tagline: 'High throughput, zero-leak memory layout, and lock contention.',
    avatar: '⚡',
    focus: ['Race Hazards & Concurrency', 'Memory Leaks & V8 GC', 'I/O & Socket Saturation', 'Tail Latency Bounding'],
    tone: 'Metrics-driven, latency and throughput focus.'
  },
  'clean-architect': {
    id: 'clean-architect',
    name: 'Architecture & Clean Code',
    role: 'Maintainability & DRY Lens',
    tagline: 'SOLID principles, decoupling, ergonomic APIs, and maintainability.',
    avatar: '📐',
    focus: ['Decoupling & Cohesion', 'Idiomatic Conventions', 'Error Propagation', 'Testability'],
    tone: 'Pragmatic, prioritizes maintainability and clean design.'
  },
  'academic-cs': {
    id: 'academic-cs',
    name: 'Algorithmic Theory',
    role: 'Big-O & Proofs Lens',
    tagline: 'Asymptotic complexity, formal invariants, and peer-reviewed literature.',
    avatar: '🔬',
    focus: ['Big-O Bounds', 'State Invariants', 'Optimal Reductions', 'Literature Citations'],
    tone: 'Scholarly, mathematically grounded.'
  }
};
