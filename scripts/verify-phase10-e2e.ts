import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import {
  isNodeLocked,
  getUnmetPrerequisites,
  computeCurrentFocus,
  calculatePillarPercent,
} from '../src/features/track/utils/progression';
import { NodeStatus, SkillNodeWithMeta } from '../src/features/track/types/track.types';
import { sampleQuestions } from '../src/features/quiz/utils/sampling';

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
console.log('=== Phase 10 Complete 9-Step End-to-End User Lifecycle Harness ===');
console.log('================================================================================');
console.log('Target Supabase URL:', supabaseUrl);

interface StepResult {
  step: number;
  description: string;
  status: 'PASS' | 'FAIL';
  evidence: string;
}

const lifecycleResults: StepResult[] = [];

function recordStep(step: number, description: string, status: 'PASS' | 'FAIL', evidence: string) {
  lifecycleResults.push({ step, description, status, evidence });
  console.log(`[${status}] Step ${step}: ${description}`);
  console.log(`  Evidence: ${evidence}`);
}

async function runLifecycleHarness() {
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const trackId = 'track-creator-test';

  const timestamp = Date.now();
  const testEmail = `lifecycle.learner.${timestamp}@gmail.com`;
  const testPassword = 'LifecyclePassword123!#';
  let createdUserId: string | null = null;

  const publicClient: SupabaseClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

  const n1Id = 'track-creator-test__foundations.programming.core.fundamentals';
  const n2Id = 'track-creator-test__foundations.programming.core.functions';
  const p1Id = 'track-creator-test__foundations';
  const p2Id = 'track-creator-test__advanced';

  try {
    // -------------------------------------------------------------------------
    // Step 1: Register new test learner via signUp()
    // -------------------------------------------------------------------------
    const { data: signUpData, error: signUpErr } = await publicClient.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    if (signUpErr || !signUpData.user) throw new Error(`Sign up failed: ${signUpErr?.message}`);
    createdUserId = signUpData.user.id;

    recordStep(
      1,
      'Register new test learner via signUp()',
      'PASS',
      `Registered test user with ID ${createdUserId} (${testEmail})`
    );

    // -------------------------------------------------------------------------
    // Step 2: Confirm profiles row created automatically by trigger
    // -------------------------------------------------------------------------
    // Small wait for postgres trigger
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { data: profileData, error: profileErr } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', createdUserId)
      .single();

    if (!profileErr && profileData && profileData.user_id === createdUserId) {
      recordStep(
        2,
        'Confirm profiles row created automatically by handle_new_user trigger',
        'PASS',
        `profiles row found for user_id: ${profileData.user_id}, created_at: ${profileData.created_at}`
      );
    } else {
      recordStep(
        2,
        'Confirm profiles row created automatically by handle_new_user trigger',
        'FAIL',
        `Profile error: ${profileErr?.message || 'Profile row not found'}`
      );
    }

    // -------------------------------------------------------------------------
    // Step 3: Submit starting self-report levels and enroll in track-creator-test
    // -------------------------------------------------------------------------
    // Insert self-report first (safe write sequence)
    const { error: srErr } = await publicClient.from('user_pillar_self_report').insert([
      { user_id: createdUserId, pillar_id: p1Id, level: 'beginner' },
      { user_id: createdUserId, pillar_id: p2Id, level: 'intermediate' },
    ]);
    if (srErr) throw new Error(`Self-report insertion failed: ${srErr.message}`);

    // Insert active track
    const { error: trackErr } = await publicClient.from('user_active_track').insert({
      user_id: createdUserId,
      track_id: trackId,
    });
    if (trackErr) throw new Error(`Active track enrollment failed: ${trackErr.message}`);

    recordStep(
      3,
      'Submit starting self-report levels and enroll in track-creator-test',
      'PASS',
      `Inserted 2 pillar self-reports and enrolled into active track '${trackId}'`
    );

    // -------------------------------------------------------------------------
    // Step 4: Assert initial tree state: Node 1 unlocked, Node 2 locked, progress = 0%
    // -------------------------------------------------------------------------
    const { data: allNodesRaw } = await publicClient.from('skill_nodes').select('*');
    const { data: allPrereqsRaw } = await publicClient.from('node_prerequisites').select('*');

    const prereqMap = new Map<string, string[]>();
    (allPrereqsRaw || []).forEach((row) => {
      const existing = prereqMap.get(row.node_id) || [];
      existing.push(row.prerequisite_node_id);
      prereqMap.set(row.node_id, existing);
    });

    const initialProgressMap = new Map<string, NodeStatus>();
    const n1Prereqs = prereqMap.get(n1Id) || [];
    const n2Prereqs = prereqMap.get(n2Id) || [];

    const n1Locked0 = isNodeLocked(n1Prereqs, initialProgressMap);
    const n2Locked0 = isNodeLocked(n2Prereqs, initialProgressMap);

    const p1NodesInOrder = [
      (allNodesRaw || []).find((n) => n.node_id === n1Id)!,
      (allNodesRaw || []).find((n) => n.node_id === n2Id)!,
      (allNodesRaw || []).find((n) => n.node_id === 'track-creator-test__foundations.concepts.general.data-structures')!,
      (allNodesRaw || []).find((n) => n.node_id === 'track-creator-test__foundations.concepts.general.optional-patterns')!,
    ].map((n) => ({
      ...n,
      prerequisites: prereqMap.get(n.node_id) || [],
      status: 'not_started' as NodeStatus,
      is_locked: isNodeLocked(prereqMap.get(n.node_id) || [], initialProgressMap),
      unmet_prerequisites: getUnmetPrerequisites(prereqMap.get(n.node_id) || [], initialProgressMap),
      is_current_focus: false,
    }));

    const initialPct = calculatePillarPercent(p1NodesInOrder, initialProgressMap);
    const initialFocus = computeCurrentFocus(p1NodesInOrder, initialProgressMap);

    if (!n1Locked0 && n2Locked0 && initialPct === 0 && initialFocus === n1Id) {
      recordStep(
        4,
        'Assert initial tree state: Node 1 unlocked, Node 2 locked, required progress = 0%',
        'PASS',
        `Node 1 unlocked=true, Node 2 locked=true, Current Focus=${initialFocus}, Pillar 1 progress=${initialPct}%`
      );
    } else {
      recordStep(
        4,
        'Assert initial tree state: Node 1 unlocked, Node 2 locked, required progress = 0%',
        'FAIL',
        `n1Locked=${n1Locked0}, n2Locked=${n2Locked0}, pct=${initialPct}%, focus=${initialFocus}`
      );
    }

    // -------------------------------------------------------------------------
    // Step 5: Call mark_node_opened on Node 1 -> Status transitions to in_progress
    // -------------------------------------------------------------------------
    await publicClient.rpc('mark_node_opened', { p_node_id: n1Id });

    const { data: step5Progress } = await publicClient
      .from('user_node_progress')
      .select('*')
      .eq('user_id', createdUserId)
      .eq('node_id', n1Id)
      .single();

    if (step5Progress?.status === 'in_progress') {
      recordStep(
        5,
        'Call mark_node_opened on Node 1 -> Status transitions to in_progress',
        'PASS',
        `user_node_progress row created with status: 'in_progress', first_opened_at: ${step5Progress.first_opened_at}`
      );
    } else {
      recordStep(
        5,
        'Call mark_node_opened on Node 1 -> Status transitions to in_progress',
        'FAIL',
        `Progress status: ${step5Progress?.status}`
      );
    }

    // -------------------------------------------------------------------------
    // Step 6: Submit failing quiz (score 3/5) -> Attempt recorded, status remains in_progress
    // -------------------------------------------------------------------------
    const { data: n1QuestionsRaw } = await publicClient
      .from('quiz_questions')
      .select('question_id')
      .eq('node_id', n1Id);

    const sampled5Questions = sampleQuestions(n1QuestionsRaw || [], 5);
    const qIds = sampled5Questions.map((q) => q.question_id);

    // Fetch answer key via admin client for precise test harness answers
    const { data: answerKeyData } = await adminClient
      .from('quiz_answers')
      .select('question_id, correct_index');

    const ansMap = new Map<string, number>();
    (answerKeyData || []).forEach((a) => ansMap.set(a.question_id, a.correct_index));

    // Craft score of 3: first 3 correct, last 2 incorrect
    const answersScore3 = qIds.map((qid, idx) => {
      const correct = ansMap.get(qid) ?? 0;
      return idx < 3 ? correct : (correct + 1) % 4;
    });

    const { data: failQuizRes } = await publicClient.rpc('submit_quiz_attempt', {
      p_node_id: n1Id,
      p_question_ids: qIds,
      p_answers: answersScore3,
    });

    const { data: progressAfterFail } = await publicClient
      .from('user_node_progress')
      .select('*')
      .eq('user_id', createdUserId)
      .eq('node_id', n1Id)
      .single();

    if (
      failQuizRes?.score === 3 &&
      failQuizRes?.passed === false &&
      progressAfterFail?.status === 'in_progress' &&
      progressAfterFail?.last_quiz_score === 3
    ) {
      recordStep(
        6,
        'Submit failing quiz (score 3/5) -> Attempt recorded; status strictly remains in_progress',
        'PASS',
        `RPC returned score=3, passed=false. user_node_progress status remained 'in_progress' with last_quiz_score=3`
      );
    } else {
      recordStep(
        6,
        'Submit failing quiz (score 3/5) -> Attempt recorded; status strictly remains in_progress',
        'FAIL',
        `Quiz res: ${JSON.stringify(failQuizRes)}, Progress: ${JSON.stringify(progressAfterFail)}`
      );
    }

    // -------------------------------------------------------------------------
    // Step 7: Submit passing quiz (score 4/5) -> Attempt recorded, status transitions to completed
    // -------------------------------------------------------------------------
    // Craft score of 4: first 4 correct, last 1 incorrect
    const answersScore4 = qIds.map((qid, idx) => {
      const correct = ansMap.get(qid) ?? 0;
      return idx < 4 ? correct : (correct + 1) % 4;
    });

    const { data: passQuizRes } = await publicClient.rpc('submit_quiz_attempt', {
      p_node_id: n1Id,
      p_question_ids: qIds,
      p_answers: answersScore4,
    });

    const { data: progressAfterPass } = await publicClient
      .from('user_node_progress')
      .select('*')
      .eq('user_id', createdUserId)
      .eq('node_id', n1Id)
      .single();

    if (
      passQuizRes?.score === 4 &&
      passQuizRes?.passed === true &&
      progressAfterPass?.status === 'completed' &&
      progressAfterPass?.last_quiz_score === 4 &&
      progressAfterPass?.completed_at !== null
    ) {
      recordStep(
        7,
        'Submit passing quiz (score 4/5) -> Attempt recorded; status transitions to completed',
        'PASS',
        `RPC returned score=4, passed=true. user_node_progress transitioned to 'completed' with completed_at=${progressAfterPass.completed_at}`
      );
    } else {
      recordStep(
        7,
        'Submit passing quiz (score 4/5) -> Attempt recorded; status transitions to completed',
        'FAIL',
        `Quiz res: ${JSON.stringify(passQuizRes)}, Progress: ${JSON.stringify(progressAfterPass)}`
      );
    }

    // -------------------------------------------------------------------------
    // Step 8: Assert unlock cascade: Node 2 unlocks, becomes Current Focus, progress = 33%
    // -------------------------------------------------------------------------
    const updatedProgressMap = new Map<string, NodeStatus>([[n1Id, 'completed']]);

    const p1NodesUpdated = p1NodesInOrder.map((n) => {
      const status: NodeStatus = n.node_id === n1Id ? 'completed' : 'not_started';
      const prereqs = prereqMap.get(n.node_id) || [];
      return {
        ...n,
        prerequisites: prereqs,
        status,
        is_locked: isNodeLocked(prereqs, updatedProgressMap),
        unmet_prerequisites: getUnmetPrerequisites(prereqs, updatedProgressMap),
        is_current_focus: false,
      };
    });

    const updatedPct = calculatePillarPercent(p1NodesUpdated, updatedProgressMap);
    const updatedFocus = computeCurrentFocus(p1NodesUpdated, updatedProgressMap);
    const n2UnlockedState = !p1NodesUpdated.find((n) => n.node_id === n2Id)!.is_locked;

    if (updatedPct === 33 && updatedFocus === n2Id && n2UnlockedState) {
      recordStep(
        8,
        'Assert unlock cascade: Node 2 unlocks, becomes Current Focus, Pillar 1 progress reaches 33%',
        'PASS',
        `Dependent Node 2 unlocked=true, Current Focus dynamically promoted to '${updatedFocus}', Pillar 1 progress updated to ${updatedPct}%`
      );
    } else {
      recordStep(
        8,
        'Assert unlock cascade: Node 2 unlocks, becomes Current Focus, Pillar 1 progress reaches 33%',
        'FAIL',
        `Pct=${updatedPct}%, Focus=${updatedFocus}, n2Unlocked=${n2UnlockedState}`
      );
    }

    // -------------------------------------------------------------------------
    // Step 9: Submit failing retake on Node 1 (score 2/5) -> status strictly remains completed
    // -------------------------------------------------------------------------
    const answersScore2 = qIds.map((qid, idx) => {
      const correct = ansMap.get(qid) ?? 0;
      return idx < 2 ? correct : (correct + 1) % 4;
    });

    const { data: retakeRes } = await publicClient.rpc('submit_quiz_attempt', {
      p_node_id: n1Id,
      p_question_ids: qIds,
      p_answers: answersScore2,
    });

    const { data: progressAfterRetake } = await publicClient
      .from('user_node_progress')
      .select('*')
      .eq('user_id', createdUserId)
      .eq('node_id', n1Id)
      .single();

    if (
      retakeRes?.score === 2 &&
      retakeRes?.passed === false &&
      progressAfterRetake?.status === 'completed' &&
      progressAfterRetake?.last_quiz_score === 2
    ) {
      recordStep(
        9,
        'Submit failing retake on Node 1 (score 2/5) -> Score updates, but status strictly remains completed',
        'PASS',
        `Non-degrading retake: attempt recorded with score=2, last_quiz_score updated to 2, status strictly preserved as 'completed'`
      );
    } else {
      recordStep(
        9,
        'Submit failing retake on Node 1 (score 2/5) -> Score updates, but status strictly remains completed',
        'FAIL',
        `Retake res: ${JSON.stringify(retakeRes)}, Progress: ${JSON.stringify(progressAfterRetake)}`
      );
    }

  } finally {
    console.log('\n--- Cleaning Up Lifecycle Test User ---');
    if (createdUserId) {
      await adminClient.auth.admin.deleteUser(createdUserId);
      console.log(`Lifecycle test user ${createdUserId} deleted.`);
    }
  }

  // Summary Table
  console.log('\n======================================================');
  console.log('# Phase 10 End-to-End User Lifecycle Summary\n');
  console.log('| Step | Description | Status | Evidence |');
  console.log('|---|---|---|---|');
  for (const s of lifecycleResults) {
    console.log(`| Step ${s.step} | ${s.description} | **${s.status}** | ${s.evidence.replace(/\|/g, '\\|')} |`);
  }
}

runLifecycleHarness().catch((err) => {
  console.error('[FATAL LIFECYCLE]:', err);
  process.exit(1);
});
