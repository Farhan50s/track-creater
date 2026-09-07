import * as fs from 'fs';
import { DEPTH_THEMES, getDepthTheme } from '../src/utils/depthTheme';

console.log('=== Visual Branching Tree, Connector Guides & 4-Tier Depth Theming Verification ===');

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
  // 1. Verify Depth Palette Tokens
  try {
    const l1 = getDepthTheme(1);
    const l2 = getDepthTheme(2);
    const l3 = getDepthTheme(3);
    const l4 = getDepthTheme(4);

    if (
      l1.label === 'Pillar' && l1.badgeBg.includes('blue') &&
      l2.label === 'Topic' && l2.badgeBg.includes('emerald') &&
      l3.label === 'Subtopic' && l3.badgeBg.includes('amber') &&
      l4.label === 'Skill Node' && l4.badgeBg.includes('purple')
    ) {
      record(
        'Depth Palette',
        'Centralized 4-Tier Depth Tokens',
        'PASS',
        'DEPTH_THEMES correctly defines Level 1 Blue, Level 2 Emerald, Level 3 Amber, and Level 4 Purple tokens'
      );
    } else {
      record('Depth Palette', 'Centralized 4-Tier Depth Tokens', 'FAIL', 'Token levels or color classes mismatch');
    }
  } catch (err: any) {
    record('Depth Palette', 'Centralized 4-Tier Depth Tokens', 'FAIL', err.message);
  }

  // 2. Verify TopicSection.tsx
  const topicFile = fs.readFileSync('src/features/track/components/TopicSection.tsx', 'utf-8');
  const topicHasEmerald = topicFile.includes('L2 Topic') && (topicFile.includes('emerald') || topicFile.includes('DEPTH_THEMES[2]'));
  const topicHasRail = topicFile.includes('border-l-2 border-slate-800/80') && topicFile.includes('tree-topic-rail');
  const topicHasFolder = topicFile.includes('📂') && topicFile.includes('📁');

  if (topicHasEmerald && topicHasRail && topicHasFolder) {
    record(
      'Topic Level (L2)',
      'Emerald Badge & Continuous Left-Hand Rail',
      'PASS',
      'TopicSection renders L2 Topic badge, folder toggle icons, and continuous vertical connector rail'
    );
  } else {
    record(
      'Topic Level (L2)',
      'Emerald Badge & Continuous Left-Hand Rail',
      'FAIL',
      `Emerald=${topicHasEmerald}, Rail=${topicHasRail}, FolderIcon=${topicHasFolder}`
    );
  }

  // 3. Verify SubtopicSection.tsx
  const subtopicFile = fs.readFileSync('src/features/track/components/SubtopicSection.tsx', 'utf-8');
  const subtopicHasAmber = subtopicFile.includes('L3 Subtopic') && (subtopicFile.includes('amber') || subtopicFile.includes('DEPTH_THEMES[3]'));
  const subtopicHasElbow = subtopicFile.includes('before:top-4 before:w-5 before:h-px before:bg-amber-500/40');
  const subtopicHasNodesRail = subtopicFile.includes('border-l-2 border-slate-800/60 ml-3 pl-5 space-y-3 mt-3');
  const subtopicHasNodeElbow = subtopicFile.includes('before:-left-5 before:top-1/2 before:w-4 before:h-px before:bg-purple-500/40');

  if (subtopicHasAmber && subtopicHasElbow && subtopicHasNodesRail && subtopicHasNodeElbow) {
    record(
      'Subtopic Level (L3)',
      'Amber Badge, Connector Elbow & Children Branch Rail',
      'PASS',
      'SubtopicSection renders L3 Subtopic badge, horizontal elbow connector, and vertical branch rail for child nodes'
    );
  } else {
    record(
      'Subtopic Level (L3)',
      'Amber Badge, Connector Elbow & Children Branch Rail',
      'FAIL',
      `Amber=${subtopicHasAmber}, Elbow=${subtopicHasElbow}, NodesRail=${subtopicHasNodesRail}, NodeElbow=${subtopicHasNodeElbow}`
    );
  }

  // 4. Verify NodeCard.tsx
  const nodeCardFile = fs.readFileSync('src/features/track/components/NodeCard.tsx', 'utf-8');
  const nodeHasL4Pill = nodeCardFile.includes('L4 Skill') && nodeCardFile.includes('font-mono');
  const nodeHasBorder = nodeCardFile.includes('border-purple-900/40') && nodeCardFile.includes('bg-slate-950/70');
  const nodeHasHover = nodeCardFile.includes('hover:border-purple-500/80') && nodeCardFile.includes('hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]');

  if (nodeHasL4Pill && nodeHasBorder && nodeHasHover) {
    record(
      'Skill Node (L4)',
      'L4 Skill Pill, Violet Borders & Glowing Hover Effect',
      'PASS',
      'NodeCard renders L4 Skill pill, base subtle purple border, and glowing purple hover transition'
    );
  } else {
    record(
      'Skill Node (L4)',
      'L4 Skill Pill, Violet Borders & Glowing Hover Effect',
      'FAIL',
      `L4Pill=${nodeHasL4Pill}, Border=${nodeHasBorder}, Hover=${nodeHasHover}`
    );
  }

  // 5. Verify 1-Click Dev Quick Login in LoginForm.tsx
  const loginFile = fs.readFileSync('src/features/auth/components/LoginForm.tsx', 'utf-8');
  const loginHasDevGuard = loginFile.includes('import.meta.env.DEV');
  const loginHasDevButton = loginFile.includes('⚡ Dev Quick Login (1-Click)');
  const loginHasAmberStyle = loginFile.includes('bg-amber-500/10') && loginFile.includes('border-amber-500/30') && loginFile.includes('text-amber-300');

  if (loginHasDevGuard && loginHasDevButton && loginHasAmberStyle) {
    record(
      'Dev Ergonomics',
      '1-Click Dev Quick Login Bypass',
      'PASS',
      'LoginForm renders development-only 1-Click Dev Quick Login button with amber styling and instant bypass'
    );
  } else {
    record(
      'Dev Ergonomics',
      '1-Click Dev Quick Login Bypass',
      'FAIL',
      `DevGuard=${loginHasDevGuard}, DevButton=${loginHasDevButton}, AmberStyle=${loginHasAmberStyle}`
    );
  }

  // Summary Table
  console.log('\n======================================================');
  console.log('# Visual Tree Theming Verification Summary\n');
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
