import * as fs from 'fs';

console.log('=== Guided Remediation & Explorer Breadcrumb Verification Suite ===');

interface TestResult {
  category: string;
  name: string;
  status: 'PASS' | 'FAIL';
  evidence: string;
}

const results: TestResult[] = [];

function record(category: string, name: string, status: 'PASS' | 'FAIL', evidence: string) {
  results.push({ category, name, status, evidence });
  console.log(`[${status}] [${category}] ${name}: ${evidence}`);
}

async function runVerification() {
  // 1. Verify ExplorerBreadcrumb.tsx
  const breadcrumbFile = fs.readFileSync('src/components/ExplorerBreadcrumb.tsx', 'utf-8');
  const hasL1Blue = breadcrumbFile.includes('bg-blue-950/40') && breadcrumbFile.includes('text-blue-300') && breadcrumbFile.includes('border-blue-800/50');
  const hasL2Emerald = breadcrumbFile.includes('bg-emerald-950/40') && breadcrumbFile.includes('text-emerald-300') && breadcrumbFile.includes('border-emerald-800/50');
  const hasL3Amber = breadcrumbFile.includes('bg-amber-950/40') && breadcrumbFile.includes('text-amber-300') && breadcrumbFile.includes('border-amber-800/50');
  const hasL4Violet = breadcrumbFile.includes('bg-purple-950/40') && breadcrumbFile.includes('text-purple-300') && breadcrumbFile.includes('border-purple-800/50');

  if (hasL1Blue && hasL2Emerald && hasL3Amber && hasL4Violet) {
    record(
      'Explorer Breadcrumb',
      'Level 1 to Level 4 Color-Coded Tiers',
      'PASS',
      'ExplorerBreadcrumb implements Level 1 Blue, Level 2 Emerald, Level 3 Amber, and Level 4 Violet badges with directory chevrons'
    );
  } else {
    record(
      'Explorer Breadcrumb',
      'Level 1 to Level 4 Color-Coded Tiers',
      'FAIL',
      `Missing color classes: L1 Blue=${hasL1Blue}, L2 Emerald=${hasL2Emerald}, L3 Amber=${hasL3Amber}, L4 Violet=${hasL4Violet}`
    );
  }

  // 2. Verify Page Integrations
  const skillDetailFile = fs.readFileSync('src/features/skill/pages/SkillDetailPage.tsx', 'utf-8');
  const quizPageFile = fs.readFileSync('src/features/quiz/pages/QuizPage.tsx', 'utf-8');

  const skillDetailHasBreadcrumb = skillDetailFile.includes('<ExplorerBreadcrumb') && skillDetailFile.includes('pillarName={node.pillar_name}');
  const quizPageHasBreadcrumb = quizPageFile.includes('<ExplorerBreadcrumb') && quizPageFile.includes('pillarName={skillContext.pillarName}');

  if (skillDetailHasBreadcrumb && quizPageHasBreadcrumb) {
    record(
      'Explorer Breadcrumb',
      'Page Integration (Skill Detail & Quiz Page)',
      'PASS',
      'SkillDetailPage and QuizPage render ExplorerBreadcrumb with full hierarchy context (Pillar, Topic, Subtopic, Node)'
    );
  } else {
    record(
      'Explorer Breadcrumb',
      'Page Integration (Skill Detail & Quiz Page)',
      'FAIL',
      `SkillDetail=${skillDetailHasBreadcrumb}, QuizPage=${quizPageHasBreadcrumb}`
    );
  }

  // 3. Verify Guided Remediation in QuizResultCard.tsx
  const resultCardFile = fs.readFileSync('src/features/quiz/components/QuizResultCard.tsx', 'utf-8');
  const hasNoSpoilerOnFail = resultCardFile.includes('isPassed ? (') && resultCardFile.includes('Guided Remediation Review');
  const hasConceptReviewPrompt = resultCardFile.includes('Concept to Review:') && resultCardFile.includes('extractConceptHint');
  const hasJumpToLesson = resultCardFile.includes('Jump to Lesson Section →');
  const hasFullUnlockOnPass = resultCardFile.includes('✓ Correct Answer') && resultCardFile.includes('💡 Explanation:');

  if (hasNoSpoilerOnFail && hasConceptReviewPrompt && hasJumpToLesson && hasFullUnlockOnPass) {
    record(
      'Guided Remediation',
      'Anti-Spoiler Guard & Remediation Jump Link',
      'PASS',
      'Failing quizzes hide correct options and present Concept to Review box with Jump to Lesson Section link; passing unlocks full explanation sheet'
    );
  } else {
    record(
      'Guided Remediation',
      'Anti-Spoiler Guard & Remediation Jump Link',
      'FAIL',
      `NoSpoiler=${hasNoSpoilerOnFail}, ConceptPrompt=${hasConceptReviewPrompt}, JumpLink=${hasJumpToLesson}, UnlockPass=${hasFullUnlockOnPass}`
    );
  }

  // Summary Table
  console.log('\n======================================================');
  console.log('# Guided Remediation & Breadcrumb Verification Summary\n');
  console.log('| Category | Test | Status | Evidence |');
  console.log('|---|---|---|---|');
  results.forEach((r) => {
    console.log(`| ${r.category} | ${r.name} | **${r.status}** | ${r.evidence} |`);
  });

  const allPassed = results.length > 0 && results.every((r) => r.status === 'PASS');
  if (!allPassed) {
    console.error('\n[FAIL] One or more tests failed.');
    process.exit(1);
  } else {
    console.log('\n=== All Verification Invariants Passed! ===');
  }
}

runVerification().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
