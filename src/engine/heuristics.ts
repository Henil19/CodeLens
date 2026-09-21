import { CodeIssue } from '../types';

export function runHeuristics(code: string, language: string): CodeIssue[] {
  const issues: CodeIssue[] = [];
  const lines = code.split('\n');

  // Rule 1: Non-constant time string equality in crypto/auth
  if (
    /strings\.Compare|==\s*signature|==\s*token|expected\s*==|===?\s*hash/i.test(code) &&
    /hmac|sha256|token|signature|secret|digest/i.test(code)
  ) {
    const targetLine = lines.findIndex((l) =>
      /strings\.Compare|==\s*signature|==\s*token|expected\s*==/.test(l)
    );
    issues.push({
      id: 'sec-timing-attack',
      category: 'security',
      severity: 'critical',
      title: 'Variable-Time String Comparison in Cryptographic Verification',
      description:
        'Standard string equality operators terminate immediately on the first byte mismatch. Attackers measure latency variations over network channels to brute-force signature bytes sequentially.',
      lineStart: targetLine >= 0 ? targetLine + 1 : 25,
      lineEnd: targetLine >= 0 ? targetLine + 1 : 27,
      recommendation:
        'Use constant-time comparison primitives: subtle.ConstantTimeCompare in Go, crypto.timingSafeEqual in Node.js, or hmac.compare_digest in Python.',
      codeFix:
        language === 'go'
          ? 'if hmac.Equal([]byte(expected), []byte(signature)) == false { return false, errors.New("signature mismatch") }'
          : 'crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))',
      cwe: 'CWE-208: Observable Timing Discrepancy',
      benchmarkImpact: 'Prevents statistical latency side-channel extraction.'
    });
  }

  // Rule 2: Interval timer without clear / memory leak
  if (/setInterval\s*\(/i.test(code) && !/clearInterval/i.test(code)) {
    const targetLine = lines.findIndex((l) => /setInterval/.test(l));
    issues.push({
      id: 'perf-timer-leak',
      category: 'performance',
      severity: 'warning',
      title: 'Unbound Interval Timer Causing Event Loop Retention',
      description:
        'Invoking setInterval inside request/fetch handlers creates permanent event loop references. Even if keys are deleted, timer closures retain root references, leading to gradual memory growth.',
      lineStart: targetLine >= 0 ? targetLine + 1 : 20,
      lineEnd: targetLine >= 0 ? targetLine + 3 : 23,
      recommendation:
        'Replace repeating setInterval with a single setTimeout or maintain active timer handles in an eviction schedule map.',
      codeFix: 'const timer = setTimeout(() => this.store.delete(key), ttlMs);\nthis.timers.set(key, timer);',
      benchmarkImpact: 'Reduces V8 retained heap size and unblocks graceful process shutdown.'
    });
  }

  // Rule 3: Missing eviction in Map / Cache unbounded size
  if (
    /class\s+\w*Cache|new\s+Map\s*\(/.test(code) &&
    !/maxSize|capacity|evict|lru/i.test(code) &&
    /set\s*\(/.test(code)
  ) {
    issues.push({
      id: 'rel-unbounded-map',
      category: 'reliability',
      severity: 'warning',
      title: 'Unbounded Collection Growth (Memory Exhaustion Hazard)',
      description:
        'The cache map lacks capacity constraints or an LRU eviction policy. Under high traffic or unique key distribution, process heap memory will expand indefinitely until an Out-Of-Memory (OOM) crash.',
      lineStart: 1,
      lineEnd: 5,
      recommendation:
        'Enforce a strict maximum capacity with LRU or FIFO eviction when capacity is reached.',
      codeFix: 'if (this.store.size >= this.maxCapacity) {\n  const oldest = this.store.keys().next().value;\n  this.store.delete(oldest);\n}',
      benchmarkImpact: 'Caps resident memory usage to deterministic limits.'
    });
  }

  // Rule 4: Dynamic string interpolation in SQL / Injection
  if (/f["'].*SELECT.*FROM.*{/i.test(code) || /SELECT.*FROM.*\$\{/i.test(code) || /execute\(f["']/i.test(code)) {
    const targetLine = lines.findIndex((l) => /SELECT.*FROM/i.test(l));
    issues.push({
      id: 'sec-sql-injection',
      category: 'security',
      severity: 'critical',
      title: 'SQL Query Constructed via String Interpolation (Injection Vulnerability)',
      description:
        'Raw user parameters are formatted directly into SQL query strings without sanitization or parameterized bindings, allowing malicious input to alter query syntax.',
      lineStart: targetLine >= 0 ? targetLine + 1 : 12,
      lineEnd: targetLine >= 0 ? targetLine + 1 : 12,
      recommendation:
        'Utilize prepared statements or query parameter placeholders (e.g., :param or $1) supported by your database driver.',
      codeFix: 'await self.db.execute("SELECT * FROM users WHERE id = :uid", {"uid": uid})',
      cwe: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
      benchmarkImpact: 'Enables query plan caching and eliminates injection attack vector.'
    });
  }

  // Rule 5: N+1 nested iterative database query execution
  if (
    /for\s+.*\s+in\s+.*:/i.test(code) &&
    (code.match(/await.*\.execute|db\.query/gi) || []).length >= 2
  ) {
    const targetLine = lines.findIndex((l) => /for\s+.*\s+in/.test(l));
    issues.push({
      id: 'perf-n-plus-one',
      category: 'performance',
      severity: 'critical',
      title: 'Quadratic N+1 Network Query Cascading in Iteration',
      description:
        'Executing independent queries inside nested loops creates sequential round-trips over the database socket. Latency scales multiplicatively with dataset size.',
      lineStart: targetLine >= 0 ? targetLine + 1 : 10,
      lineEnd: lines.length - 2,
      recommendation:
        'Consolidate related records using SQL JOINs or IN (:ids) batch projection into an in-memory hash index.',
      codeFix:
        'SELECT u.username, t.amount, m.name as merchant_name\nFROM users u\nJOIN transactions t ON t.user_id = u.id\nJOIN merchants m ON m.id = t.merchant_id\nWHERE u.id = ANY(:user_ids)',
      benchmarkImpact: 'Reduces query round-trips from O(N × M) to O(1), cutting latency by up to 95%.'
    });
  }

  // Rule 6: Raw Unsafe pointer arithmetic without bounds check
  if (/unsafe\s*{/i.test(code) && /\*\w*\.add\(|\.offset\(/i.test(code)) {
    const targetLine = lines.findIndex((l) => /unsafe/.test(l));
    issues.push({
      id: 'sec-unsafe-pointer',
      category: 'reliability',
      severity: 'critical',
      title: 'Unchecked Pointer Arithmetic in Unsafe Block',
      description:
        'Direct pointer offsets bypass compiler borrow checks and memory safety invariants. An off-by-one error or concurrent access triggers buffer overflows and memory corruption.',
      lineStart: targetLine >= 0 ? targetLine + 1 : 15,
      lineEnd: targetLine >= 0 ? targetLine + 6 : 22,
      recommendation:
        'Assert capacity boundaries before offset operations or utilize standard safe abstractions like VecDeque or AtomicUsize.',
      codeFix: 'assert!(self.head - self.tail < self.capacity, "Buffer full");\nself.buffer[self.head % self.capacity] = byte;',
      cwe: 'CWE-119: Improper Restriction of Operations within the Bounds of a Memory Buffer',
      benchmarkImpact: 'Guarantees memory isolation and prevents SIGSEGV faults.'
    });
  }

  // Rule 7: Missing error handling in async promises / returns
  if (
    /\.then\s*\(/.test(code) &&
    !/\.catch\s*\(/.test(code) &&
    !/try\s*{/.test(code)
  ) {
    issues.push({
      id: 'rel-unhandled-promise',
      category: 'reliability',
      severity: 'warning',
      title: 'Missing Rejection Handler in Asynchronous Promise Pipeline',
      description:
        'If the asynchronous fetcher or downstream transform rejects, the in-flight map entry may remain stuck or trigger an UnhandledPromiseRejection warning.',
      lineStart: 15,
      lineEnd: 25,
      recommendation:
        'Add a .catch() handler or wrap in a try/finally block to guarantee in-flight cleanup regardless of success or failure.',
      codeFix: 'const promise = fetcher()\n  .finally(() => this.inflight.delete(key))\n  .then(data => { ... });'
    });
  }

  // Fallback heuristic if clean code
  if (issues.length === 0) {
    issues.push({
      id: 'info-clean-baseline',
      category: 'maintainability',
      severity: 'info',
      title: 'No Severe Structural Violations Detected',
      description: 'The inspected source code adheres to standard language syntax and primary baseline heuristics.',
      lineStart: 1,
      lineEnd: Math.min(lines.length, 10),
      recommendation: 'Ensure high test coverage and enforce static typing where feasible.'
    });
  }

  return issues;
}

export function computeMetricScores(issues: CodeIssue[], _loc: number): {
  overall: number;
  security: number;
  performance: number;
  reliability: number;
  maintainability: number;
  architecture: number;
} {
  let secDeduct = 0;
  let perfDeduct = 0;
  let relDeduct = 0;
  let maintDeduct = 0;
  let archDeduct = 0;

  for (const issue of issues) {
    const penalty = issue.severity === 'critical' ? 35 : issue.severity === 'warning' ? 18 : 8;
    switch (issue.category) {
      case 'security':
        secDeduct += penalty;
        break;
      case 'performance':
        perfDeduct += penalty;
        break;
      case 'reliability':
        relDeduct += penalty;
        break;
      case 'maintainability':
        maintDeduct += penalty;
        break;
      case 'architecture':
        archDeduct += penalty;
        break;
    }
  }

  const security = Math.max(15, 100 - secDeduct);
  const performance = Math.max(20, 100 - perfDeduct);
  const reliability = Math.max(20, 100 - relDeduct);
  const maintainability = Math.max(30, 100 - maintDeduct);
  const architecture = Math.max(25, 100 - archDeduct);

  const overall = Math.round((security * 0.3 + performance * 0.25 + reliability * 0.2 + maintainability * 0.15 + architecture * 0.1));

  return {
    overall,
    security,
    performance,
    reliability,
    maintainability,
    architecture
  };
}
