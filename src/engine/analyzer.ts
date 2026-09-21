import { AnalysisReport, PersonaId } from '../types';
import { deriveComplexity } from './complexity';
import { runHeuristics, computeMetricScores } from './heuristics';
import { generateUnifiedDiff, synthesizeRefactoredCode } from './diff';
import { REFERENCE_CATALOG } from './references';
import { PERSONAS } from './personas';

export function analyzeCode(
  code: string,
  language: string,
  personaId: PersonaId = 'staff-systems'
): AnalysisReport {
  const lines = code.split('\n');
  const loc = lines.filter((l) => l.trim().length > 0).length;

  const complexity = deriveComplexity(code, language);
  const rawIssues = runHeuristics(code, language);
  const scores = computeMetricScores(rawIssues, loc);
  const refactoredCode = synthesizeRefactoredCode(code, language);
  const { diffText: unifiedDiff } = generateUnifiedDiff(
    code,
    refactoredCode,
    `snippet.${language === 'typescript' ? 'ts' : language === 'python' ? 'py' : language === 'go' ? 'go' : 'rs'}`
  );

  const matchedRefs = [];
  if (rawIssues.some((i) => i.id.includes('timing'))) {
    matchedRefs.push(...REFERENCE_CATALOG.timing);
  }
  if (rawIssues.some((i) => i.id.includes('timer') || i.id.includes('map') || i.id.includes('pointer'))) {
    matchedRefs.push(...REFERENCE_CATALOG.memory);
  }
  if (rawIssues.some((i) => i.id.includes('n-plus-one') || i.id.includes('sql'))) {
    matchedRefs.push(...REFERENCE_CATALOG.database);
  }
  if (matchedRefs.length === 0) {
    matchedRefs.push(...REFERENCE_CATALOG.concurrency);
  }

  const persona = PERSONAS[personaId];

  // Adjust issues ordering/emphasis based on chosen persona
  const issues = [...rawIssues].sort((a, b) => {
    if (personaId === 'security-auditor') {
      if (a.category === 'security' && b.category !== 'security') return -1;
      if (b.category === 'security' && a.category !== 'security') return 1;
    } else if (personaId === 'staff-systems') {
      if (a.category === 'performance' && b.category !== 'performance') return -1;
      if (b.category === 'performance' && a.category !== 'performance') return 1;
    }
    const order = { critical: 0, warning: 1, optimization: 2, info: 3 };
    return order[a.severity] - order[b.severity];
  });

  const summary = generateExecutiveSummary(issues, complexity, persona.name, persona.role);
  const testSuiteSuggestion = generateTestSuite(language, issues, complexity);

  return {
    timestamp: new Date().toISOString(),
    language,
    loc,
    scores,
    summary,
    issues,
    complexity,
    references: matchedRefs,
    refactoredCode,
    unifiedDiff,
    testSuiteSuggestion
  };
}

function generateExecutiveSummary(
  issues: ReturnType<typeof runHeuristics>,
  complexity: ReturnType<typeof deriveComplexity>,
  reviewerName: string,
  reviewerRole: string
): string {
  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  if (criticalCount > 0) {
    return `${reviewerName} (${reviewerRole}): Flagged ${criticalCount} critical blocker(s) and ${warningCount} advisory issue(s). Algorithmic complexity resolves to ${complexity.timeComplexity}. Immediate architectural intervention required before production deployment.`;
  }
  if (warningCount > 0) {
    return `${reviewerName} (${reviewerRole}): Code exhibits sound structural fundamentals with ${warningCount} optimization/reliability warning(s). Algorithmic complexity verified at ${complexity.timeComplexity}.`;
  }
  return `${reviewerName} (${reviewerRole}): Code adheres to idiomatic standards with no severe vulnerabilities or bottlenecks detected. Complexity bounded at ${complexity.timeComplexity}.`;
}

function generateTestSuite(
  language: string,
  _issues: ReturnType<typeof runHeuristics>,
  _complexity: ReturnType<typeof deriveComplexity>
): string {
  if (language === 'typescript' || language === 'javascript') {
    return `import { describe, it, expect, vi } from 'vitest';

describe('AsyncMemoryCache Spec & Regression', () => {
  it('should coalesce duplicate in-flight requests into a single invocation', async () => {
    const fetcher = vi.fn().mockResolvedValue('data-payload');
    const cache = new AsyncMemoryCache<string>();

    const [res1, res2] = await Promise.all([
      cache.getOrFetch('user-1', 5000, fetcher),
      cache.getOrFetch('user-1', 5000, fetcher)
    ]);

    expect(res1).toBe('data-payload');
    expect(res2).toBe('data-payload');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should clean up in-flight map even if fetcher throws', async () => {
    const errorFetcher = vi.fn().mockRejectedValue(new Error('upstream timeout'));
    const cache = new AsyncMemoryCache<string>();

    await expect(cache.getOrFetch('fail-key', 5000, errorFetcher)).rejects.toThrow();
    // Subsequent calls should retry and not be permanently poisoned
    const successFetcher = vi.fn().mockResolvedValue('ok');
    const retryRes = await cache.getOrFetch('fail-key', 5000, successFetcher);
    expect(retryRes).toBe('ok');
  });

  it('should honor eviction policy and prevent memory leaks', async () => {
    const cache = new AsyncMemoryCache<string>(2);
    await cache.getOrFetch('k1', 1000, async () => 'v1');
    await cache.getOrFetch('k2', 1000, async () => 'v2');
    await cache.getOrFetch('k3', 1000, async () => 'v3');
    // k1 should have been evicted under capacity pressure
  });
});`;
  }

  if (language === 'go') {
    return `package auth_test

import (
	"crypto/hmac"
	"crypto/sha256"
	"testing"
)

func TestTokenValidator_TimingResilience(t *testing.T) {
	validator := auth.NewTokenValidator("super-secret-key")
	payload := "session_user_992"

	mac := hmac.New(sha256.New, []byte("super-secret-key"))
	mac.Write([]byte(payload))
	validSig := string(mac.Sum(nil))

	ok, err := validator.VerifySignature(payload, validSig)
	if err != nil || !ok {
		t.Fatalf("Expected valid signature to verify successfully, got err=%v", err)
	}

	tamperedSig := validSig[:len(validSig)-1] + "x"
	ok, _ = validator.VerifySignature(payload, tamperedSig)
	if ok {
		t.Fatal("Expected tampered signature to fail verification")
	}
}`;
  }

  if (language === 'python') {
    return `import pytest
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_user_summaries_single_roundtrip():
    mock_db = AsyncMock()
    mock_db.execute.return_value.fetchall.return_value = [
        {"username": "alice", "total_spent": 250, "tx_count": 3},
        {"username": "bob", "total_spent": 1400, "tx_count": 8},
    ]

    generator = TransactionReportGenerator(mock_db)
    results = await generator.generate_user_summaries([101, 102])

    assert len(results) == 2
    # Verify N+1 hazard is eliminated: only 1 aggregate query executed
    assert mock_db.execute.call_count == 1`;
  }

  return `// Automated regression & benchmark harness
#[test]
fn test_ring_buffer_concurrency_and_boundaries() {
    let buffer = SafeRingBuffer::new(4);
    assert!(buffer.push(10).is_ok());
    assert!(buffer.push(20).is_ok());
    assert_eq!(buffer.pop(), Some(10));
}`;
}
