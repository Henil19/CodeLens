import { analyzeCode } from './src/engine/analyzer';
import { SCENARIOS } from './src/samples/scenarios';
import { deriveComplexity } from './src/engine/complexity';
import { runHeuristics } from './src/engine/heuristics';
import { generateUnifiedDiff } from './src/engine/diff';
import { PERSONAS } from './src/engine/personas';

console.log('=== Running CodeLens Engine Verification Suite ===\n');

// Test 1: All scenarios run cleanly through analyzer
for (const scenario of SCENARIOS) {
  console.log(`Testing Scenario: [${scenario.language.toUpperCase()}] ${scenario.name}`);
  const report = analyzeCode(scenario.code, scenario.language, 'staff-systems');

  if (!report.summary || report.summary.length === 0) {
    throw new Error(`Summary missing for ${scenario.name}`);
  }
  if (!report.complexity.timeComplexity) {
    throw new Error(`Time complexity missing for ${scenario.name}`);
  }
  if (report.issues.length === 0) {
    throw new Error(`Expected heuristic issues detected for ${scenario.name}`);
  }
  if (!report.unifiedDiff || report.unifiedDiff.length === 0) {
    throw new Error(`Unified diff missing for ${scenario.name}`);
  }

  console.log(`  ✓ Health Score: ${report.scores.overall}/100`);
  console.log(`  ✓ Time Complexity: ${report.complexity.timeComplexity} | Space: ${report.complexity.spaceComplexity}`);
  console.log(`  ✓ Issues Found: ${report.issues.length} (Critical: ${report.issues.filter(i => i.severity === 'critical').length})`);
  console.log(`  ✓ Citations Attached: ${report.references.length}`);
  console.log('');
}

// Test 2: Verify Persona Switching Behavior
console.log('Testing Persona Switching...');
const testCode = SCENARIOS[1].code; // Go timing attack
const secReport = analyzeCode(testCode, 'go', 'security-auditor');
const sysReport = analyzeCode(testCode, 'go', 'staff-systems');

if (!secReport.summary.includes('Elena Rostova')) {
  throw new Error('Security persona name not reflected in summary');
}
if (!sysReport.summary.includes('Alex Mercer')) {
  throw new Error('Staff systems persona name not reflected in summary');
}
console.log('  ✓ Persona switching accurately adjusts executive reviewer perspective\n');

// Test 3: Verify Unified Diff Generation
console.log('Testing Diff Synthesis...');
const oldC = 'function add(a, b) { return a + b; }';
const newC = 'function add(a: number, b: number): number { return a + b; }';
const { diffText, lines } = generateUnifiedDiff(oldC, newC, 'add.ts');

if (!diffText.includes('+++ b/add.ts')) {
  throw new Error('Diff header missing');
}
const hasAdd = lines.some(l => l.type === 'addition');
const hasDel = lines.some(l => l.type === 'deletion');
if (!hasAdd || !hasDel) {
  throw new Error('Diff line classification failure');
}
console.log('  ✓ Unified diff line classification verified\n');

console.log('=== All Engine Verification Checks Passed Successfully! ===');
