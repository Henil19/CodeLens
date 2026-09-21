import { analyzeCode } from './src/engine/analyzer';
import { SCENARIOS } from './src/samples/scenarios';
import { deriveComplexity } from './src/engine/complexity';
import { runHeuristics } from './src/engine/heuristics';
import { generateUnifiedDiff } from './src/engine/diff';
import { PERSONAS } from './src/engine/personas';
import { PersonaId } from './src/types';

console.log('====================================================');
console.log('   CodeLens Studio Comprehensive Verification Suite ');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (!condition) {
    console.error(`  ❌ FAILED: ${testName}`);
    process.exit(1);
  } else {
    console.log(`  ✓ PASSED: ${testName}`);
    passedTests++;
  }
}

// ----------------------------------------------------
// Test Group 1: Scenario Auditing & Heuristics Coverage
// ----------------------------------------------------
console.log('--- Test Group 1: Scenario Auditing & Heuristics ---');

for (const scenario of SCENARIOS) {
  const report = analyzeCode(scenario.code, scenario.language, 'staff-systems');
  assert(report.issues.length > 0, `[${scenario.language.toUpperCase()}] Detects defects in ${scenario.name}`);
  assert(report.scores.overall < 100, `[${scenario.language.toUpperCase()}] Flawed code has non-100 score (${report.scores.overall}/100)`);
  assert(Boolean(report.complexity.timeComplexity), `[${scenario.language.toUpperCase()}] Derives valid Big-O time complexity: ${report.complexity.timeComplexity}`);
  assert(report.references.length > 0, `[${scenario.language.toUpperCase()}] Correlates literature/RFC citations`);
  assert(Boolean(report.refactoredCode && report.refactoredCode.length > 0), `[${scenario.language.toUpperCase()}] Synthesizes hardened solution`);
  assert(report.unifiedDiff.includes('--- a/'), `[${scenario.language.toUpperCase()}] Generates valid git unified diff header`);
}

// ----------------------------------------------------
// Test Group 2: Hardening & Refactor Verification
// ----------------------------------------------------
console.log('\n--- Test Group 2: Hardening & Fix Application ---');

for (const scenario of SCENARIOS) {
  const initial = analyzeCode(scenario.code, scenario.language, 'staff-systems');
  const hardened = analyzeCode(initial.refactoredCode, scenario.language, 'staff-systems');

  assert(
    hardened.scores.overall >= initial.scores.overall,
    `[${scenario.language.toUpperCase()}] Refactored code improves health score (${initial.scores.overall} -> ${hardened.scores.overall})`
  );
  assert(
    hardened.issues.filter(i => i.severity === 'critical').length === 0,
    `[${scenario.language.toUpperCase()}] Refactored code eliminates all critical vulnerabilities`
  );
}

// ----------------------------------------------------
// Test Group 3: Multi-Persona Perspectives
// ----------------------------------------------------
console.log('\n--- Test Group 3: Persona Perspectives & Tone ---');

const sampleCode = SCENARIOS[1].code; // Go timing attack
const personaKeys: PersonaId[] = ['staff-systems', 'security-auditor', 'clean-architect', 'academic-cs'];

for (const pid of personaKeys) {
  const p = PERSONAS[pid];
  const rep = analyzeCode(sampleCode, 'go', pid);
  assert(rep.summary.includes(p.name), `Summary adapts to persona: ${p.name} (${p.role})`);
}

// ----------------------------------------------------
// Test Group 4: Diff Generation & Patch Formatting
// ----------------------------------------------------
console.log('\n--- Test Group 4: Diff Engine & Patch Formatting ---');

const orig = 'const x = 1;\nconst y = 2;';
const target = 'const x = 1;\nconst y = 20;\nconst z = 30;';
const { diffText, lines } = generateUnifiedDiff(orig, target, 'math.ts');

assert(lines.some(l => l.type === 'addition'), 'Diff classifies addition lines (+)');
assert(lines.some(l => l.type === 'deletion'), 'Diff classifies deletion lines (-)');
assert(lines.some(l => l.type === 'normal'), 'Diff preserves context lines');
assert(diffText.includes('@@ -1,2 +1,3 @@'), 'Diff generates standard git hunk header');

// ----------------------------------------------------
// Test Group 5: Complexity Engine Boundaries
// ----------------------------------------------------
console.log('\n--- Test Group 5: Asymptotic Complexity Boundaries ---');

const quadraticCode = `
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    compute(i, j);
  }
}
`;
const quadResult = deriveComplexity(quadraticCode, 'javascript');
assert(quadResult.timeComplexity === 'O(N²)', 'Correctly classifies nested loop as O(N²) quadratic');

const constantCode = `
function getHead(arr) {
  return arr[0];
}
`;
const constResult = deriveComplexity(constantCode, 'javascript');
assert(constResult.timeComplexity === 'O(1)', 'Correctly classifies single instruction as O(1) constant');

console.log('\n====================================================');
console.log(`   ALL ${passedTests}/${totalTests} TESTS PASSED CLEANLY! `);
console.log('====================================================\n');
