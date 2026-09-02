import * as fs from 'fs';
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

console.log('=== Full-Stack TypeScript Track Seeding & Lifecycle Verification ===');

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

async function runVerification() {
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const anonClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

  // 1. Check Track & Hierarchy in Database
  const { data: trackData, error: trackErr } = await adminClient
    .from('tracks')
    .select('track_id, name, description')
    .eq('track_id', 'fullstack-ts')
    .maybeSingle();

  if (trackErr) throw trackErr;

  const { data: pillars } = await adminClient.from('pillars').select('*').eq('track_id', 'fullstack-ts').order('order_index');
  const { data: topics } = await adminClient.from('topics').select('*').in('pillar_id', (pillars || []).map((p) => p.pillar_id));
  const { data: subtopics } = await adminClient.from('subtopics').select('*').in('topic_id', (topics || []).map((t) => t.topic_id));
  const { data: nodes } = await adminClient.from('skill_nodes').select('*').in('parent_subtopic_id', (subtopics || []).map((st) => st.subtopic_id));
  const { data: prereqs } = await adminClient.from('node_prerequisites').select('*').in('node_id', (nodes || []).map((n) => n.node_id));
  const { data: resources } = await adminClient.from('resources').select('*').in('node_id', (nodes || []).map((n) => n.node_id));
  const { data: questions } = await adminClient.from('quiz_questions').select('*').in('node_id', (nodes || []).map((n) => n.node_id));
  const { data: answers } = await adminClient.from('quiz_answers').select('*').in('question_id', (questions || []).map((q) => q.question_id));

  if (
    trackData &&
    (pillars || []).length === 3 &&
    (topics || []).length === 9 &&
    (subtopics || []).length === 10 &&
    (nodes || []).length === 23 &&
    (prereqs || []).length === 24 &&
    (resources || []).length === 46 &&
    (questions || []).length === 184 &&
    (answers || []).length === 184
  ) {
    record(
      'Full-Stack TypeScript Database Seeding Integrity',
      'PASS',
      `Track '${trackData.name}' seeded: 3 pillars, 9 topics, 10 subtopics, 23 skill nodes, 24 prerequisites, 46 resources, 184 quiz questions & answers`
    );
  } else {
    record(
      'Full-Stack TypeScript Database Seeding Integrity',
      'FAIL',
      `Pillars: ${pillars?.length}, Topics: ${topics?.length}, Subtopics: ${subtopics?.length}, Nodes: ${nodes?.length}, Prereqs: ${prereqs?.length}, Res: ${resources?.length}, Questions: ${questions?.length}, Answers: ${answers?.length}`
    );
  }

  // 2. DAG Acyclicity Check
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  (nodes || []).forEach((n) => {
    inDegree.set(n.node_id, 0);
    adj.set(n.node_id, []);
  });

  (prereqs || []).forEach((p) => {
    inDegree.set(p.node_id, (inDegree.get(p.node_id) || 0) + 1);
    const existing = adj.get(p.prerequisite_node_id) || [];
    existing.push(p.node_id);
    adj.set(p.prerequisite_node_id, existing);
  });

  const queue: string[] = [];
  for (const [nodeId, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(nodeId);
  }

  let visited = 0;
  while (queue.length > 0) {
    const curr = queue.shift()!;
    visited++;
    for (const neighbor of adj.get(curr) || []) {
      const nextDeg = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, nextDeg);
      if (nextDeg === 0) queue.push(neighbor);
    }
  }

  if (visited === (nodes || []).length) {
    record(
      'Kahn\'s DAG Acyclic Topological Sort',
      'PASS',
      `Verified 23 nodes with 24 prerequisite dependencies form a strictly acyclic directed graph`
    );
  } else {
    record(
      'Kahn\'s DAG Acyclic Topological Sort',
      'FAIL',
      `Cycle detected! Visited ${visited} of ${nodes?.length} nodes`
    );
  }

  // 3. Goal Selection Scope Badges
  const rawPillars = await adminClient.from('pillars').select('pillar_id, track_id');
  const pillarCount = (rawPillars.data || []).filter((p) => p.track_id === 'fullstack-ts').length;
  const nodeCount = (nodes || []).length;

  if (pillarCount === 3 && nodeCount === 23) {
    record(
      'Goal Selection Scope Badges',
      'PASS',
      `Dynamic counters evaluate to '3 Pillars · 23 Skills'`
    );
  } else {
    record(
      'Goal Selection Scope Badges',
      'FAIL',
      `Pillars: ${pillarCount}, Nodes: ${nodeCount}`
    );
  }

  // 4. Test User Registration, Onboarding Enrollment & Progress Trigger
  const timestamp = Date.now();
  const testEmail = `fullstack.tester.${timestamp}@example.com`;
  const testPassword = 'FullStackPass123!#';
  let userId: string | null = null;

  try {
    const { data: authData } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });
    userId = authData.user?.id || null;
    if (!userId) throw new Error('Failed to create test user');

    const authClient = createClient(supabaseUrl, anonKey);
    await authClient.auth.signInWithPassword({ email: testEmail, password: testPassword });

    // Submit self-report knowledge
    const knowledgeRatings = (pillars || []).map((p) => ({
      user_id: userId,
      pillar_id: p.pillar_id,
      self_reported_level: 'none',
    }));
    await authClient.from('user_pillar_knowledge').insert(knowledgeRatings);

    // Enroll in fullstack-ts
    await authClient.from('user_active_track').insert({
      user_id: userId,
      track_id: 'fullstack-ts',
    });

    // Mark first node opened
    const firstNodeId = 'fullstack-ts__frontend.web-standards.semantic-html';
    const { error: openErr } = await authClient.rpc('mark_node_opened', { p_node_id: firstNodeId });
    if (openErr) throw openErr;

    const { data: openProgress } = await authClient
      .from('user_node_progress')
      .select('status, first_opened_at')
      .eq('node_id', firstNodeId)
      .maybeSingle();

    if (openProgress && openProgress.status === 'in_progress') {
      record(
        'Onboarding Enrollment & mark_node_opened Progression',
        'PASS',
        `Learner registered, enrolled into 'fullstack-ts', and opened root node '${firstNodeId}' (status='in_progress')`
      );
    } else {
      record(
        'Onboarding Enrollment & mark_node_opened Progression',
        'FAIL',
        `Open progress: ${JSON.stringify(openProgress)}`
      );
    }

    // Submit passing quiz
    const { data: nodeQuestions } = await authClient
      .from('quiz_questions')
      .select('question_id')
      .eq('node_id', firstNodeId)
      .limit(5);

    const qIds = (nodeQuestions || []).map((q) => q.question_id);
    const { data: correctAnswers } = await adminClient
      .from('quiz_answers')
      .select('question_id, correct_index')
      .in('question_id', qIds);

    const answerMap = new Map<string, number>();
    (correctAnswers || []).forEach((a) => answerMap.set(a.question_id, a.correct_index));
    const selectedIndices = qIds.map((qid) => answerMap.get(qid) ?? 0);

    const { data: quizResult, error: quizErr } = await authClient.rpc('submit_quiz_attempt', {
      p_node_id: firstNodeId,
      p_question_ids: qIds,
      p_answers: selectedIndices,
    });
    if (quizErr) throw quizErr;

    if (quizResult.score === 5 && quizResult.passed === true && quizResult.status === 'completed') {
      record(
        'Server-Side Quiz Verification on Production Node',
        'PASS',
        `Successfully scored 5/5 on '${firstNodeId}', transitioning node status to 'completed'`
      );
    } else {
      record(
        'Server-Side Quiz Verification on Production Node',
        'FAIL',
        `Quiz result: ${JSON.stringify(quizResult)}`
      );
    }

  } finally {
    if (userId) {
      await adminClient.auth.admin.deleteUser(userId);
    }
  }

  // Summary
  console.log('\n======================================================');
  console.log('# Full-Stack TypeScript Track Verification Summary\n');
  console.log('| Check | Status | Evidence |');
  console.log('|---|---|---|');
  for (const r of results) {
    console.log(`| ${r.test} | **${r.status}** | ${r.evidence.replace(/\|/g, '\\|')} |`);
  }
}

runVerification().catch((err) => {
  console.error('[FATAL]:', err);
  process.exit(1);
});
