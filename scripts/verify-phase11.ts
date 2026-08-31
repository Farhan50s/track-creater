import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import {
  isNodeLocked,
  getUnmetPrerequisites,
  computeCurrentFocus,
  calculatePillarPercent,
} from '../src/features/track/utils/progression';
import { NodeStatus, SkillNodeWithMeta } from '../src/features/track/types/track.types';
import { computeFocusPillar, computeRecommendedAction } from '../src/features/dashboard/utils/recommendations';

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

console.log('================================================================================');
console.log('=== Phase 11 Real-Content Cutover & Production Rollout Verification ===');
console.log('================================================================================');
console.log('Target Supabase URL:', supabaseUrl);

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

async function runPhase11Verification() {
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const client: SupabaseClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const productionTrackId = 'ai-engineer';

  const timestamp = Date.now();
  const testEmail = `phase11.learner.${timestamp}@gmail.com`;
  const testPassword = 'Phase11Password123!#';
  let createdUserId: string | null = null;

  try {
    // -------------------------------------------------------------------------
    // 1. Production Track Database Seeding Integrity
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Production Track Database Seeding ---');
    const { data: trackRow } = await adminClient
      .from('tracks')
      .select('*')
      .eq('track_id', productionTrackId)
      .single();

    const { data: pillars } = await adminClient
      .from('pillars')
      .select('*')
      .eq('track_id', productionTrackId);

    const { data: topics } = await adminClient
      .from('topics')
      .select('*, pillars!inner(track_id)')
      .eq('pillars.track_id', productionTrackId);

    const { data: nodes } = await adminClient
      .from('skill_nodes')
      .select('*');

    // Filter nodes belonging to ai-engineer
    const prodNodes = (nodes || []).filter((n) => n.node_id.startsWith(productionTrackId));

    if (trackRow && pillars?.length === 3 && topics?.length === 5 && prodNodes.length === 10) {
      record(
        'Production Track Database Seeding',
        'PASS',
        `Track '${trackRow.name}' seeded with 3 pillars, 5 topics, and 10 skill nodes`
      );
    } else {
      record(
        'Production Track Database Seeding',
        'FAIL',
        `Track: ${Boolean(trackRow)}, Pillars: ${pillars?.length}, Topics: ${topics?.length}, Nodes: ${prodNodes.length}`
      );
    }

    // -------------------------------------------------------------------------
    // 2. DAG Integrity Check (Topological Sort / Acyclicity)
    // -------------------------------------------------------------------------
    console.log('\n--- 2. DAG Integrity Check ---');
    const { data: prereqs } = await adminClient.from('node_prerequisites').select('*');
    const prodPrereqs = (prereqs || []).filter((p) => p.node_id.startsWith(productionTrackId));

    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const n of prodNodes) {
      adj.set(n.node_id, []);
      inDegree.set(n.node_id, 0);
    }

    for (const p of prodPrereqs) {
      if (adj.has(p.prerequisite_node_id) && inDegree.has(p.node_id)) {
        adj.get(p.prerequisite_node_id)!.push(p.node_id);
        inDegree.set(p.node_id, (inDegree.get(p.node_id) || 0) + 1);
      }
    }

    const queue: string[] = [];
    for (const [nId, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(nId);
    }

    let visited = 0;
    while (queue.length > 0) {
      const curr = queue.shift()!;
      visited++;
      for (const next of adj.get(curr) || []) {
        const newDeg = inDegree.get(next)! - 1;
        inDegree.set(next, newDeg);
        if (newDeg === 0) queue.push(next);
      }
    }

    if (visited === prodNodes.length) {
      record(
        'Topological DAG Integrity Check',
        'PASS',
        `Topological sort confirmed acyclic prerequisite dependency graph across all ${visited} production nodes`
      );
    } else {
      record(
        'Topological DAG Integrity Check',
        'FAIL',
        `Visited ${visited} of ${prodNodes.length} nodes (cycle detected)`
      );
    }

    // -------------------------------------------------------------------------
    // 3. Resource & Quiz Invariants Check
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Resource & Quiz Invariants Check ---');
    const { data: allResources } = await adminClient.from('resources').select('*');
    const prodResources = (allResources || []).filter((r) => r.node_id.startsWith(productionTrackId));

    const { data: allQuestions } = await adminClient.from('quiz_questions').select('*');
    const prodQuestions = (allQuestions || []).filter((q) => q.node_id.startsWith(productionTrackId));

    const { data: allAnswers } = await adminClient.from('quiz_answers').select('*');
    const qIdSet = new Set(prodQuestions.map((q) => q.question_id));
    const prodAnswers = (allAnswers || []).filter((a) => qIdSet.has(a.question_id));

    // Check per-node resource and quiz bounds
    let resourceBoundsPass = true;
    let quizBoundsPass = true;

    for (const n of prodNodes) {
      const nRes = prodResources.filter((r) => r.node_id === n.node_id);
      const startHeres = nRes.filter((r) => r.tag === 'start_here');
      if (nRes.length < 2 || startHeres.length !== 1) {
        resourceBoundsPass = false;
      }

      const nQuestions = prodQuestions.filter((q) => q.node_id === n.node_id);
      if (nQuestions.length < 8) {
        quizBoundsPass = false;
      }
    }

    if (resourceBoundsPass && quizBoundsPass && prodAnswers.length === prodQuestions.length) {
      record(
        'Resource & Quiz Pool Standards Compliance',
        'PASS',
        `All 10 nodes have >=2 resources (exactly 1 start_here) and >=8 quiz questions with corresponding answer keys (${prodQuestions.length} questions, ${prodAnswers.length} answers)`
      );
    } else {
      record(
        'Resource & Quiz Pool Standards Compliance',
        'FAIL',
        `ResourceBounds: ${resourceBoundsPass}, QuizBounds: ${quizBoundsPass}, Questions: ${prodQuestions.length}, Answers: ${prodAnswers.length}`
      );
    }

    // -------------------------------------------------------------------------
    // 4. Server Answer Key Protection
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Server Answer Key Protection ---');
    const { data: anonAnswers, error: anonAnsErr } = await client.from('quiz_answers').select('*');
    if (!anonAnswers || anonAnswers.length === 0) {
      record(
        'Production Quiz Answer Key Security',
        'PASS',
        'Unauthenticated/client queries to quiz_answers returned 0 rows (RLS protected)'
      );
    } else {
      record(
        'Production Quiz Answer Key Security',
        'FAIL',
        `Client query leaked ${anonAnswers.length} answer key rows!`
      );
    }

    // -------------------------------------------------------------------------
    // 5. Goal Selection & Onboarding Flow Simulation
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Goal Selection & Onboarding Simulation ---');
    const { data: signUpData, error: signUpErr } = await client.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    if (signUpErr || !signUpData.user) throw new Error(`Sign up failed: ${signUpErr?.message}`);
    createdUserId = signUpData.user.id;

    // Submit self-report for all 3 pillars
    const { error: srErr } = await client.from('user_pillar_self_report').insert([
      { user_id: createdUserId, pillar_id: 'ai-engineer__foundations', level: 'beginner' },
      { user_id: createdUserId, pillar_id: 'ai-engineer__deep-learning', level: 'dont_know' },
      { user_id: createdUserId, pillar_id: 'ai-engineer__production-systems', level: 'beginner' },
    ]);
    if (srErr) throw new Error(`Self-report failed: ${srErr.message}`);

    // Enroll in ai-engineer track
    const { error: enrollErr } = await client.from('user_active_track').insert({
      user_id: createdUserId,
      track_id: productionTrackId,
    });
    if (enrollErr) throw new Error(`Enrollment failed: ${enrollErr.message}`);

    record(
      'Goal Selection & Onboarding Enrollment',
      'PASS',
      `Learner registered, submitted 3 pillar self-reports, and enrolled into active track '${productionTrackId}'`
    );

    // -------------------------------------------------------------------------
    // 6. Production Progression & Recommendation Derivation
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Production Progression & Recommendation Derivation ---');
    const prereqMap = new Map<string, string[]>();
    prodPrereqs.forEach((p) => {
      const existing = prereqMap.get(p.node_id) || [];
      existing.push(p.prerequisite_node_id);
      prereqMap.set(p.node_id, existing);
    });

    const progressMap = new Map<string, NodeStatus>();
    const node1Id = 'ai-engineer__foundations.python-numpy.core.vector-matrix-ops';

    const p1Nodes: SkillNodeWithMeta[] = prodNodes
      .filter((n) => n.node_id.startsWith('ai-engineer__foundations'))
      .map((n) => {
        const pList = prereqMap.get(n.node_id) || [];
        return {
          ...n,
          prerequisites: pList,
          status: 'not_started' as NodeStatus,
          is_locked: isNodeLocked(pList, progressMap),
          unmet_prerequisites: getUnmetPrerequisites(pList, progressMap),
          is_current_focus: false,
        };
      });

    const focusNodeP1 = computeCurrentFocus(p1Nodes, progressMap);
    const p1Percent = calculatePillarPercent(p1Nodes, progressMap);

    const allNodesMap = new Map<string, SkillNodeWithMeta>();
    const allProdNodesMeta: SkillNodeWithMeta[] = prodNodes.map((n) => {
      const pList = prereqMap.get(n.node_id) || [];
      const metaNode: SkillNodeWithMeta = {
        ...n,
        prerequisites: pList,
        status: 'not_started' as NodeStatus,
        is_locked: isNodeLocked(pList, progressMap),
        unmet_prerequisites: getUnmetPrerequisites(pList, progressMap),
        is_current_focus: false,
      };
      allNodesMap.set(n.node_id, metaNode);
      return metaNode;
    });

    const pillarSummaries = [
      {
        pillarId: 'ai-engineer__foundations',
        name: 'Foundations',
        orderIndex: 1,
        completionPercent: 0,
        totalRequiredNodes: 3,
        completedRequiredNodes: 0,
        currentFocusNodeId: focusNodeP1,
        nodes: allProdNodesMeta.filter((n) => n.node_id.startsWith('ai-engineer__foundations')),
      },
      {
        pillarId: 'ai-engineer__deep-learning',
        name: 'Deep Learning',
        orderIndex: 2,
        completionPercent: 0,
        totalRequiredNodes: 2,
        completedRequiredNodes: 0,
        currentFocusNodeId: null,
        nodes: allProdNodesMeta.filter((n) => n.node_id.startsWith('ai-engineer__deep-learning')),
      },
      {
        pillarId: 'ai-engineer__production-systems',
        name: 'Production Systems',
        orderIndex: 3,
        completionPercent: 0,
        totalRequiredNodes: 1,
        completedRequiredNodes: 0,
        currentFocusNodeId: null,
        nodes: allProdNodesMeta.filter((n) => n.node_id.startsWith('ai-engineer__production-systems')),
      },
    ];

    const focusPillar = computeFocusPillar(pillarSummaries);
    const recAction = computeRecommendedAction(focusPillar!, pillarSummaries, allNodesMap, progressMap);

    if (
      focusNodeP1 === node1Id &&
      p1Percent === 0 &&
      focusPillar?.pillarId === 'ai-engineer__foundations' &&
      recAction?.nodeId === node1Id &&
      recAction?.type === 'recommended_next'
    ) {
      record(
        'Production Progression & Recommendation Derivation',
        'PASS',
        `Correctly derived Initial Focus: '${focusNodeP1}', Focus Pillar: '${focusPillar.pillarId}', Recommended Action: '${recAction.nodeName}' (${recAction.type})`
      );
    } else {
      record(
        'Production Progression & Recommendation Derivation',
        'FAIL',
        `FocusNode: ${focusNodeP1}, FocusPillar: ${focusPillar?.pillarId}, RecAction: ${recAction?.nodeId} (${recAction?.type})`
      );
    }

  } finally {
    console.log('\n--- Cleaning Up Temporary Test User ---');
    if (createdUserId) {
      await adminClient.auth.admin.deleteUser(createdUserId);
      console.log(`Test user ${createdUserId} deleted.`);
    }
  }

  // Summary Table
  console.log('\n======================================================');
  console.log('# Phase 11 Real-Content Cutover Verification Summary\n');
  console.log('| Test | Status | Evidence |');
  console.log('|---|---|---|');
  for (const r of results) {
    console.log(`| ${r.test} | **${r.status}** | ${r.evidence.replace(/\|/g, '\\|')} |`);
  }
}

runPhase11Verification().catch((err) => {
  console.error('[FATAL]:', err);
  process.exit(1);
});
