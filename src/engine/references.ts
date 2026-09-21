import { LiteratureRef } from '../types';

export const REFERENCE_CATALOG: Record<string, LiteratureRef[]> = {
  timing: [
    {
      title: 'Remote Timing Attacks are Practical',
      authorsOrSource: 'Brumley & Boneh (Stanford Univ / USENIX Security)',
      year: '2003',
      summary: 'Demonstrated that variable-time comparison in cryptographic verification leaks sensitive keys over remote networks via statistical variance analysis.',
      relevance: 'Mandates constant-time byte comparisons (e.g. subtle.ConstantTimeCompare or crypto.timingSafeEqual).'
    },
    {
      title: 'CWE-208: Observable Timing Discrepancy',
      authorsOrSource: 'MITRE Corporation',
      year: '2023',
      summary: 'Describes the vulnerability where an adversary infers secret tokens through measurable latency differences during string evaluations.',
      relevance: 'Direct classification for signature or password verification loops.'
    }
  ],
  concurrency: [
    {
      title: 'The Art of Multiprocessor Programming',
      authorsOrSource: 'Maurice Herlihy & Nir Shavit',
      year: '2012',
      summary: 'Comprehensive formal analysis of memory synchronization, lock-free data structures, ABA problems, and cache-line invalidation.',
      relevance: 'Applies to concurrent map mutations, lock contention, and in-flight promise memoization.'
    },
    {
      title: 'Go Memory Model Specification',
      authorsOrSource: 'The Go Authors',
      year: '2022',
      summary: 'Defines the conditions under which reads of a variable in one goroutine can be guaranteed to observe values produced by writes in another.',
      relevance: 'Essential for channel synchronization, sync.RWMutex, and atomic load/store correctness.'
    }
  ],
  database: [
    {
      title: 'Database Systems: The Complete Book (2nd Edition)',
      authorsOrSource: 'Garcia-Molina, Ullman, & Widom',
      year: '2008',
      summary: 'Theoretical query cost models showing that nested subquery loops incur O(N * M) network round-trips versus O(1) relational joins.',
      relevance: 'Critical foundation for eliminating N+1 query patterns using batch projection or DataLoader joins.'
    },
    {
      title: 'RFC 3986 & SQL Injection Defenses',
      authorsOrSource: 'OWASP Foundation Top 10 A03:2021',
      year: '2021',
      summary: 'Details parameterization and prepared statements as non-negotiable boundaries against injection in dynamic string interpolations.',
      relevance: 'Replaces raw f-string / template literals in SQL executions with parameterized bind parameters.'
    }
  ],
  memory: [
    {
      title: 'Memory Management in V8 and Modern Runtimes',
      authorsOrSource: 'Google Chrome V8 Engineering Group',
      year: '2021',
      summary: 'Explores generational garbage collection, GC pause overhead, and how lingering references in global Maps or interval timers cause heap bloat.',
      relevance: 'Explains why unbounded collections and dangling setInterval instances prevent object reclamation.'
    },
    {
      title: 'Rust Nomicon: The Dark Arts of Advanced and Unsafe Rust',
      authorsOrSource: 'Rust Core Team',
      year: '2024',
      summary: 'Documents undefined behavior boundaries around pointer arithmetic, aliasing invariants, and unaligned deallocations.',
      relevance: 'Guidelines for wrapping raw pointers in NonNull, checking capacity limits, and implementing Drop.'
    }
  ]
};
