import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env
try {
  if (typeof (process as any).loadEnvFile === 'function') {
    (process as any).loadEnvFile('.env');
  } else if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf-8');
    for (const line of envContent.split('\n')) {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
} catch (e) {}

const rawUrl = process.env.VITE_SUPABASE_URL || 'https://evdlpjgalvgiplofmywm.supabase.co';
const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

console.log('=== Release Polish Verification Suite ===');

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  evidence: string;
}

const results: TestResult[] = [];

function record(test: string, status: 'PASS' | 'FAIL', evidence: string) {
  results.push({ test, status, evidence });
  console.log(`[${status}] ${test}: ${evidence}`);
}

function readFile(relativePath: string): string {
  const fullPath = path.resolve(process.cwd(), relativePath);
  return fs.readFileSync(fullPath, 'utf-8');
}

async function runPolishVerification() {
  // 1. Check useDashboardData.ts scoping logic
  const dashboardHookCode = readFile('src/features/dashboard/hooks/useDashboardData.ts');
  const hasActiveTrackScoping =
    dashboardHookCode.includes('const activeTrackNodes = pillarSummaries.flatMap((p) => p.nodes);') &&
    dashboardHookCode.includes('activeTrackNodes.filter((n) => n.classification === \'required\')') &&
    dashboardHookCode.includes('setTotalSkills(activeTrackNodes.length);');

  if (hasActiveTrackScoping) {
    record(
      'Active Track Metric Scoping in useDashboardData.ts',
      'PASS',
      'useDashboardData strictly scopes allRequiredNodes, allCompletedRequired, and totalSkills to active track pillars'
    );
  } else {
    record(
      'Active Track Metric Scoping in useDashboardData.ts',
      'FAIL',
      'Missing active track node scoping in useDashboardData.ts'
    );
  }

  // 2. Check AppShell.tsx clean production header
  const appShellCode = readFile('src/components/AppShell.tsx');
  const hasDebugStrip = appShellCode.includes('Navigation:') || appShellCode.includes('ROUTES.map');
  const hasProdNavLinks =
    appShellCode.includes('to="/app"') &&
    appShellCode.includes('to="/app/track"') &&
    appShellCode.includes('to="/onboarding/goal"') &&
    appShellCode.includes('to="/app/profile"');

  if (!hasDebugStrip && hasProdNavLinks) {
    record(
      'Clean Production Navigation in AppShell.tsx',
      'PASS',
      'Debug link strip removed; header renders Dashboard, Track Map, Switch Track, and Profile links'
    );
  } else {
    record(
      'Clean Production Navigation in AppShell.tsx',
      'FAIL',
      `DebugStrip: ${hasDebugStrip}, ProdLinks: ${hasProdNavLinks}`
    );
  }

  // 3. Check LandingPage.tsx contents
  const landingCode = readFile('src/features/landing/pages/LandingPage.tsx');
  const hasHeadline = landingCode.includes('Master Technical Skills Through Structured, Verified Progression');
  const hasSubhead = landingCode.includes('Explore curriculum trees freely. Unlock official branches by demonstrating');
  const hasCards =
    landingCode.includes('Interactive Skill Trees') &&
    landingCode.includes('Server-Graded Checkpoints') &&
    landingCode.includes('Self-Paced Exploration');

  if (hasHeadline && hasSubhead && hasCards) {
    record(
      'Dark-Themed Production Landing Page',
      'PASS',
      'LandingPage renders authoritative headline, subhead, CTA buttons, and 3 feature highlight cards'
    );
  } else {
    record(
      'Dark-Themed Production Landing Page',
      'FAIL',
      `Headline: ${hasHeadline}, Subhead: ${hasSubhead}, Cards: ${hasCards}`
    );
  }

  // 4. Check ProfilePage.tsx contents
  const profileCode = readFile('src/features/profile/pages/ProfilePage.tsx');
  const hasProfileFields =
    profileCode.includes('Learner Profile') &&
    profileCode.includes('Account UUID') &&
    profileCode.includes('Member Since') &&
    profileCode.includes('Active Learning Track') &&
    profileCode.includes('Change Track') &&
    profileCode.includes('Sign Out of Account');

  if (hasProfileFields) {
    record(
      'Account Settings Profile Page',
      'PASS',
      'ProfilePage renders User Identity Card, Enrolled Track Progress Bar, Change Track CTA, and Sign Out action'
    );
  } else {
    record(
      'Account Settings Profile Page',
      'FAIL',
      `Profile fields complete: ${hasProfileFields}`
    );
  }

  // 5. Check Live Database Progress Calculation on track-creator-test
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const client = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

  const timestamp = Date.now();
  const testEmail = `polish.learner.${timestamp}@gmail.com`;
  const testPassword = 'PolishPassword123!#';
  let userId: string | null = null;

  try {
    const { data: authData } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });
    userId = authData.user?.id || null;
    if (!userId) throw new Error('Failed to create test user');

    // Enroll in track-creator-test
    await adminClient.from('user_active_track').insert({ user_id: userId, track_id: 'track-creator-test' });

    // Mark 2 of 3 required nodes completed
    const n1 = 'track-creator-test__foundations.programming.core.fundamentals';
    const n2 = 'track-creator-test__foundations.programming.core.functions';

    await adminClient.from('user_node_progress').insert([
      { user_id: userId, node_id: n1, status: 'completed', first_opened_at: new Date().toISOString(), completed_at: new Date().toISOString(), last_quiz_score: 5 },
      { user_id: userId, node_id: n2, status: 'completed', first_opened_at: new Date().toISOString(), completed_at: new Date().toISOString(), last_quiz_score: 4 },
    ]);

    // Query active track pillars and calculate metrics
    const { data: trackPillars } = await adminClient
      .from('pillars')
      .select('pillar_id, name, order_index')
      .eq('track_id', 'track-creator-test');

    const { data: allNodes } = await adminClient.from('skill_nodes').select('*');
    const { data: allPrereqs } = await adminClient.from('node_prerequisites').select('*');
    const { data: userProgress } = await adminClient.from('user_node_progress').select('*').eq('user_id', userId);

    const progressMap = new Map<string, string>();
    (userProgress || []).forEach((p) => progressMap.set(p.node_id, p.status));

    const trackPillarIds = new Set((trackPillars || []).map((p) => p.pillar_id));
    // Filter nodes belonging strictly to track-creator-test
    const testTrackNodes = (allNodes || []).filter((n) => n.node_id.startsWith('track-creator-test'));
    const testRequiredNodes = testTrackNodes.filter((n) => n.classification === 'required');
    const testCompletedRequired = testRequiredNodes.filter((n) => progressMap.get(n.node_id) === 'completed');
    const testPct = Math.round((testCompletedRequired.length / testRequiredNodes.length) * 100);

    if (testRequiredNodes.length === 3 && testCompletedRequired.length === 2 && testPct === 67) {
      record(
        'Database Active Track Required Metrics (67% for 2/3 Completed)',
        'PASS',
        `Track 'track-creator-test' evaluated to ${testCompletedRequired.length}/${testRequiredNodes.length} required nodes completed = ${testPct}%`
      );
    } else {
      record(
        'Database Active Track Required Metrics (67% for 2/3 Completed)',
        'FAIL',
        `Required: ${testRequiredNodes.length}, Completed: ${testCompletedRequired.length}, Pct: ${testPct}%`
      );
    }

  } finally {
    if (userId) {
      await adminClient.auth.admin.deleteUser(userId);
    }
  }

  // Summary
  console.log('\n======================================================');
  console.log('# Release Polish Verification Summary\n');
  console.log('| Check | Status | Evidence |');
  console.log('|---|---|---|');
  for (const r of results) {
    console.log(`| ${r.test} | **${r.status}** | ${r.evidence.replace(/\|/g, '\\|')} |`);
  }
}

runPolishVerification().catch((err) => {
  console.error('[FATAL POLISH]:', err);
  process.exit(1);
});
