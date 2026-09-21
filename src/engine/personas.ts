import { PersonaId, PersonaProfile } from '../types';

export const PERSONAS: Record<PersonaId, PersonaProfile> = {
  'staff-systems': {
    id: 'staff-systems',
    name: 'Alex Mercer',
    role: 'Staff Systems Architect',
    tagline: 'High throughput, zero-leak memory layout, and lock contention.',
    avatar: '⚙️',
    focus: ['Concurrency & Race Hazards', 'Memory Leaks & V8 GC Overhead', 'Cache Locality & I/O Saturation', 'P99 Latency Tail Bounding'],
    tone: 'Direct, metrics-driven, focused on production reliability under load.'
  },
  'security-auditor': {
    id: 'security-auditor',
    name: 'Elena Rostova',
    role: 'Principal Security Auditor',
    tagline: 'Adversarial threat modeling, cryptographic flaws, and injection.',
    avatar: '🛡️',
    focus: ['CWE & OWASP Top 10 Mapping', 'Side-Channel & Timing Discrepancies', 'SQL / Command / Prototype Injections', 'Privilege & Boundary Validation'],
    tone: 'Rigorous, defensive, leaves zero unchecked trust boundaries.'
  },
  'clean-architect': {
    id: 'clean-architect',
    name: 'Marcus Vance',
    role: 'Staff Software Craftsman',
    tagline: 'SOLID principles, decoupling, ergonomic APIs, and maintainability.',
    avatar: '📐',
    focus: ['Decoupling & Cohesion', 'Idiomatic Language Patterns', 'Predictable Error Handling', 'Testability & Mock Inversion'],
    tone: 'Constructive, pragmatic, prioritizes developer ergonomics and long-term evolvability.'
  },
  'academic-cs': {
    id: 'academic-cs',
    name: 'Dr. Evelyn Wei',
    role: 'CS Theory Researcher',
    tagline: 'Asymptotic complexity, formal invariants, and peer-reviewed literature.',
    avatar: '🔬',
    focus: ['Big-O Asymptotic Derivation', 'State Invariants & Termination Proofs', 'Theoretical Optimality Bounds', 'Academic Paper Cross-Referencing'],
    tone: 'Scholarly, precise, mathematically grounded.'
  }
};
