import { ComplexityResult } from '../types';

export function deriveComplexity(code: string, _language: string): ComplexityResult {
  const loopPatterns = [
    /\bfor\b/g,
    /\bwhile\b/g,
    /\b\.forEach\b/g,
    /\b\.map\b/g,
    /\b\.filter\b/g,
    /\b\.reduce\b/g
  ];

  let loopCount = 0;
  for (const pattern of loopPatterns) {
    const matches = code.match(pattern);
    if (matches) loopCount += matches.length;
  }

  const lines = code.split('\n');
  let maxNesting = 0;
  let currentDepth = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) continue;

    const opens = (line.match(/{|:/g) || []).length;
    const closes = (line.match(/}/g) || []).length;

    if (/\b(for|while|if|def|async\s+def|function|class)\b/.test(line)) {
      currentDepth++;
      if (currentDepth > maxNesting) maxNesting = currentDepth;
    }
    currentDepth = Math.max(0, currentDepth + opens - closes);
  }

  const hasNestedQueries = /select\s+.*\s+where/i.test(code) && loopCount > 1;
  const hasRecursion = /(?:function|def|fn)\s+([a-zA-Z_]\w*)[\s\S]*?\{[\s\S]*?\b\1\s*\(/.test(code);
  const hasMapLookup = /map|dict|\.get\(|store\[/i.test(code);
  const hasSorting = /\.sort\(|sorted\(|quicksort|mergesort/i.test(code);

  let timeComplexity = 'O(1)';
  let spaceComplexity = 'O(1)';
  let bestCase = 'O(1)';
  let worstCase = 'O(1)';
  let recursionDepth = 'O(1) - Iterative';
  let explanation = '';
  const invariants: string[] = [];

  if (hasNestedQueries) {
    timeComplexity = 'O(N × M)';
    worstCase = 'O(N × M) network roundtrips with I/O blocking';
    bestCase = 'O(1) if dataset is empty';
    spaceComplexity = 'O(N + M)';
    explanation = 'Nested iterative query execution incurs multiplicative network roundtrips. Latency scales quadratically with dataset cardinality.';
    invariants.push(
      'Invariant: Number of database roundtrips = 1 + N + Σ(M_i).',
      'Transaction isolation: Sequential execution risks phantom reads across loop iterations.',
      'Connection starvation: Persistent open sessions block async worker pools.'
    );
  } else if (hasRecursion) {
    timeComplexity = 'O(2^N) or O(N log N)';
    worstCase = 'O(N!) if branch factor is unconstrained without memoization';
    bestCase = 'O(N)';
    spaceComplexity = 'O(N) call-stack depth';
    recursionDepth = 'O(N) stack frames';
    explanation = 'Recursive branching without memoization risks call-stack exhaustion and exponential state expansion.';
    invariants.push(
      'Termination condition: Base case must strictly diminish problem scale.',
      'Stack frame limit: Exceeds default engine call stack limit at depth ~10,000.'
    );
  } else if (loopCount >= 2 && maxNesting >= 2) {
    timeComplexity = 'O(N²)';
    worstCase = 'O(N²) quadratic comparison loop';
    bestCase = 'O(N)';
    spaceComplexity = hasMapLookup ? 'O(N)' : 'O(1)';
    explanation = 'Nested iteration produces quadratic comparison steps. Refactoring via hash projection reduces time complexity to linear O(N).';
    invariants.push(
      'Loop invariant: Elements before cursor index remain invariant and sorted.',
      'Time penalty: 1,000 items requires ~1,000,000 operations.'
    );
  } else if (loopCount === 1) {
    timeComplexity = 'O(N)';
    worstCase = 'O(N) single pass';
    bestCase = 'O(1) with early termination';
    spaceComplexity = hasMapLookup ? 'O(N)' : 'O(1)';
    explanation = 'Linear single-pass traversal through the primary collection.';
    invariants.push('Traversal guarantee: Exactly one evaluation per collection item.');
  } else if (hasSorting) {
    timeComplexity = 'O(N log N)';
    worstCase = 'O(N log N) comparison sort';
    bestCase = 'O(N) on pre-sorted arrays with adaptive sorting';
    spaceComplexity = 'O(log N) auxiliary partition stack';
    explanation = 'Standard comparison-based sorting complexity bounded by Information Theoretic lower bound Ω(N log N).';
    invariants.push('Total order invariant: Transitive and antisymmetric order across keys.');
  } else {
    timeComplexity = 'O(1)';
    worstCase = 'O(1) bounded instruction sequence';
    bestCase = 'O(1)';
    spaceComplexity = 'O(1)';
    explanation = 'Constant-time instruction sequence without unbounded loops or recursive invocations.';
    invariants.push('Determinism: Execution time depends solely on local CPU pipeline latency.');
  }

  return {
    timeComplexity,
    spaceComplexity,
    bestCase,
    worstCase,
    recursionDepth,
    explanation,
    invariants
  };
}
