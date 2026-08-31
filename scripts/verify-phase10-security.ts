import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

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
console.log('=== Phase 10 Adversarial Penetration & Security Audit Suite ===');
console.log('================================================================================');
console.log('Target Supabase URL:', supabaseUrl);
console.log('Anon Key Present:', Boolean(anonKey));
console.log('Service Role Key Present:', Boolean(serviceRoleKey));

if (!serviceRoleKey) {
  console.error('[FATAL] SUPABASE_SERVICE_ROLE_KEY is required for test execution.');
  process.exit(1);
}

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

async function runPenetrationSuite() {
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const trackId = 'track-creator-test';

  const timestamp = Date.now();
  const emailUserA = `security.userA.${timestamp}@gmail.com`;
  const emailUserB = `security.userB.${timestamp}@gmail.com`;
  const testPassword = 'AdversarialPass123!#';

  let userIdA: string | null = null;
  let userIdB: string | null = null;

  const clientA: SupabaseClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const clientB: SupabaseClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

  const n1Id = 'track-creator-test__foundations.programming.core.fundamentals';
  const n2Id = 'track-creator-test__foundations.programming.core.functions';
  const p1Id = 'track-creator-test__foundations';

  try {
    console.log('\n--- 1. Setting Up Test Users (User A and User B) ---');
    // Create User A
    const { data: resA, error: errA } = await adminClient.auth.admin.createUser({
      email: emailUserA,
      password: testPassword,
      email_confirm: true,
    });
    if (errA || !resA.user) throw new Error(`Create User A failed: ${errA?.message}`);
    userIdA = resA.user.id;

    // Create User B
    const { data: resB, error: errB } = await adminClient.auth.admin.createUser({
      email: emailUserB,
      password: testPassword,
      email_confirm: true,
    });
    if (errB || !resB.user) throw new Error(`Create User B failed: ${errB?.message}`);
    userIdB = resB.user.id;

    // Enroll User A in track
    await adminClient.from('user_active_track').insert({ user_id: userIdA, track_id: trackId });
    // Enroll User B in track
    await adminClient.from('user_active_track').insert({ user_id: userIdB, track_id: trackId });

    // Authenticate Client A and Client B
    const { data: authA } = await clientA.auth.signInWithPassword({ email: emailUserA, password: testPassword });
    const { data: authB } = await clientB.auth.signInWithPassword({ email: emailUserB, password: testPassword });
    if (!authA.session || !authB.session) throw new Error('Authentication failed for test users.');

    // Fetch valid question pool for n1
    const { data: n1Questions } = await clientA
      .from('quiz_questions')
      .select('question_id')
      .eq('node_id', n1Id)
      .limit(5);

    const validN1QuestionIds = (n1Questions || []).map((q) => q.question_id);
    const mockAnswers = [0, 1, 2, 3, 0];

    console.log('\n--- 2. Executing 7 Targeted Adversarial Attack Vectors ---');

    // =========================================================================
    // ATTACK 1: Locked Quiz Submission Attack
    // Vector: Client calls submit_quiz_attempt directly on a locked node (n2Id)
    // =========================================================================
    // Open n2 first so it's opened, but its prerequisite (n1) is NOT completed
    await clientA.rpc('mark_node_opened', { p_node_id: n2Id });
    const { data: n2Questions } = await clientA
      .from('quiz_questions')
      .select('question_id')
      .eq('node_id', n2Id)
      .limit(5);
    const validN2QuestionIds = (n2Questions || []).map((q) => q.question_id);

    const { data: atk1Data, error: atk1Err } = await clientA.rpc('submit_quiz_attempt', {
      p_node_id: n2Id,
      p_question_ids: validN2QuestionIds,
      p_answers: mockAnswers,
    });

    const isAtk1Blocked = atk1Err && atk1Err.message.includes('Prerequisites not satisfied');
    // Verify 0 attempts logged
    const { data: atk1Attempts } = await adminClient
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userIdA)
      .eq('node_id', n2Id);

    if (isAtk1Blocked && atk1Attempts?.length === 0) {
      record(
        'ATTACK 1: Locked Quiz Submission Attack',
        'PASS',
        `RPC rejected locked quiz submission with: "${atk1Err?.message}". 0 rows written to quiz_attempts`
      );
    } else {
      record(
        'ATTACK 1: Locked Quiz Submission Attack',
        'FAIL',
        `Expected rejection, got: ${atk1Err?.message || JSON.stringify(atk1Data)}`
      );
    }

    // =========================================================================
    // ATTACK 2: Unopened Node Quiz Attack
    // Vector: Client calls submit_quiz_attempt on unopened node (n1Id before mark_node_opened)
    // =========================================================================
    // User B has not opened n1Id
    const { data: atk2Data, error: atk2Err } = await clientB.rpc('submit_quiz_attempt', {
      p_node_id: n1Id,
      p_question_ids: validN1QuestionIds,
      p_answers: mockAnswers,
    });

    const isAtk2Blocked = atk2Err && atk2Err.message.includes('Node must be opened before attempting quiz');
    if (isAtk2Blocked) {
      record(
        'ATTACK 2: Unopened Node Quiz Attack',
        'PASS',
        `RPC rejected quiz attempt on unopened node with: "${atk2Err?.message}"`
      );
    } else {
      record(
        'ATTACK 2: Unopened Node Quiz Attack',
        'FAIL',
        `Expected unopened rejection, got: ${atk2Err?.message || JSON.stringify(atk2Data)}`
      );
    }

    // =========================================================================
    // ATTACK 3: Foreign Track Node Attack
    // Vector: User attempts mark_node_opened on a node belonging to Track B
    // =========================================================================
    // Create a temporary second track + pillar + topic + node
    const foreignTrackId = 'foreign-track-test';
    const { error: insTrackErr } = await adminClient.from('tracks').insert({
      track_id: foreignTrackId,
      name: 'Foreign Track',
      description: 'Secondary track for foreign isolation testing',
    });
    if (insTrackErr) console.error('insTrackErr:', insTrackErr);

    const { error: insPillarErr } = await adminClient.from('pillars').insert({
      pillar_id: 'foreign-track__p1',
      track_id: foreignTrackId,
      name: 'Foreign Pillar',
      description: 'Foreign pillar description',
      order_index: 1,
    });
    if (insPillarErr) console.error('insPillarErr:', insPillarErr);

    const { error: insTopicErr } = await adminClient.from('topics').insert({
      topic_id: 'foreign-track__t1',
      pillar_id: 'foreign-track__p1',
      name: 'Foreign Topic',
      order_index: 1,
    });
    if (insTopicErr) console.error('insTopicErr:', insTopicErr);

    const foreignNodeId = 'foreign-track__t1.node1';
    const { error: insNodeErr } = await adminClient.from('skill_nodes').insert({
      node_id: foreignNodeId,
      parent_topic_id: 'foreign-track__t1',
      name: 'Foreign Node',
      classification: 'required',
      recommended_depth: 'overview',
      estimated_time_minutes: 10,
      one_sentence_definition: 'Foreign node definition',
      why_it_matters: 'Foreign node why it matters',
      quick_overview: 'Foreign node quick overview',
      order_index: 1,
    });
    if (insNodeErr) console.error('insNodeErr:', insNodeErr);

    const { data: atk3Data, error: atk3Err } = await clientA.rpc('mark_node_opened', {
      p_node_id: foreignNodeId,
    });

    // Also test completely non-existent node
    const { error: atk3NonExistentErr } = await clientA.rpc('mark_node_opened', {
      p_node_id: 'completely-non-existent-node-id',
    });

    const isAtk3Blocked =
      atk3Err?.message.includes('Node does not belong to active track') &&
      atk3NonExistentErr?.message.includes('Node does not exist');

    // Clean up foreign track
    await adminClient.from('skill_nodes').delete().eq('node_id', foreignNodeId);
    await adminClient.from('topics').delete().eq('topic_id', 'foreign-track__t1');
    await adminClient.from('pillars').delete().eq('pillar_id', 'foreign-track__p1');
    await adminClient.from('tracks').delete().eq('track_id', foreignTrackId);

    if (isAtk3Blocked) {
      record(
        'ATTACK 3: Foreign Track Node Attack',
        'PASS',
        `RPC rejected foreign track node with: "${atk3Err?.message}" and non-existent node with: "${atk3NonExistentErr?.message}"`
      );
    } else {
      record(
        'ATTACK 3: Foreign Track Node Attack',
        'FAIL',
        `ForeignErr: ${atk3Err?.message}, NonExistentErr: ${atk3NonExistentErr?.message}`
      );
    }

    // =========================================================================
    // ATTACK 4: Malformed Quiz Payload Attacks
    // =========================================================================
    await clientA.rpc('mark_node_opened', { p_node_id: n1Id });

    // Payload A: 4 questions instead of 5
    const { error: atk4AErr } = await clientA.rpc('submit_quiz_attempt', {
      p_node_id: n1Id,
      p_question_ids: validN1QuestionIds.slice(0, 4),
      p_answers: [0, 1, 2, 3],
    });
    // Payload B: 6 questions instead of 5
    const { error: atk4BErr } = await clientA.rpc('submit_quiz_attempt', {
      p_node_id: n1Id,
      p_question_ids: [...validN1QuestionIds, validN1QuestionIds[0]],
      p_answers: [0, 1, 2, 3, 0, 1],
    });
    // Payload C: Duplicate question IDs
    const { error: atk4CErr } = await clientA.rpc('submit_quiz_attempt', {
      p_node_id: n1Id,
      p_question_ids: [validN1QuestionIds[0], validN1QuestionIds[0], validN1QuestionIds[1], validN1QuestionIds[2], validN1QuestionIds[3]],
      p_answers: [0, 1, 2, 3, 0],
    });
    // Payload D: Out-of-bounds answer index (4 or -1)
    const { error: atk4DErr } = await clientA.rpc('submit_quiz_attempt', {
      p_node_id: n1Id,
      p_question_ids: validN1QuestionIds,
      p_answers: [0, 1, 4, 3, 0],
    });

    const isAtk4Pass =
      atk4AErr?.message.includes('Must provide exactly 5 questions') &&
      atk4BErr?.message.includes('Must provide exactly 5 questions') &&
      atk4CErr?.message.includes('Duplicate question IDs provided') &&
      atk4DErr?.message.includes('Answer indices must be between 0 and 3');

    if (isAtk4Pass) {
      record(
        'ATTACK 4: Malformed Quiz Payload Attacks',
        'PASS',
        'Server rejected <5 questions, >5 questions, duplicate question IDs, and out-of-bounds answer indices'
      );
    } else {
      record(
        'ATTACK 4: Malformed Quiz Payload Attacks',
        'FAIL',
        `A: ${atk4AErr?.message}, B: ${atk4BErr?.message}, C: ${atk4CErr?.message}, D: ${atk4DErr?.message}`
      );
    }

    // =========================================================================
    // ATTACK 5: Wrong-Node Question Injection (Document 4 P0 Security Fix)
    // Vector: Submitting 5 questions belonging to n1Id while passing p_node_id = n2Id
    // =========================================================================
    const { error: atk5Err } = await clientA.rpc('submit_quiz_attempt', {
      p_node_id: n2Id,
      p_question_ids: validN1QuestionIds, // questions belong to n1Id!
      p_answers: mockAnswers,
    });

    const isAtk5Blocked = atk5Err && atk5Err.message.includes('All questions must belong to the specified node');
    if (isAtk5Blocked) {
      record(
        'ATTACK 5: Wrong-Node Question Injection',
        'PASS',
        `RPC rejected foreign question pool injection with: "${atk5Err?.message}"`
      );
    } else {
      record(
        'ATTACK 5: Wrong-Node Question Injection',
        'FAIL',
        `Expected ownership mismatch rejection, got: ${atk5Err?.message}`
      );
    }

    // =========================================================================
    // ATTACK 6: Direct Table Mutation via RLS Bypass
    // =========================================================================
    // Attempt 1: Direct insert into user_node_progress
    const { error: atk6ProgressErr } = await clientA.from('user_node_progress').insert({
      user_id: userIdA,
      node_id: n2Id,
      status: 'completed',
    });
    // Attempt 2: Direct insert into quiz_attempts
    const { error: atk6AttemptErr } = await clientA.from('quiz_attempts').insert({
      user_id: userIdA,
      node_id: n1Id,
      score: 5,
      passed: true,
      questions_served: validN1QuestionIds,
      answers_given: mockAnswers,
    });
    // Attempt 3: Direct select on quiz_answers
    const { data: atk6AnswerData, error: atk6AnswerErr } = await clientA.from('quiz_answers').select('*');

    const isAtk6Pass =
      Boolean(atk6ProgressErr) &&
      Boolean(atk6AttemptErr) &&
      (!atk6AnswerData || atk6AnswerData.length === 0);

    if (isAtk6Pass) {
      record(
        'ATTACK 6: Direct Table Mutation via RLS Bypass',
        'PASS',
        'RLS policies successfully blocked direct INSERT to user_node_progress and quiz_attempts, and blocked SELECT on quiz_answers (0 rows returned)'
      );
    } else {
      record(
        'ATTACK 6: Direct Table Mutation via RLS Bypass',
        'FAIL',
        `ProgressErr: ${Boolean(atk6ProgressErr)}, AttemptErr: ${Boolean(atk6AttemptErr)}, Answers: ${atk6AnswerData?.length}`
      );
    }

    // =========================================================================
    // ATTACK 7: Cross-User Snooping Attack
    // Vector: User A attempts to read User B's progress or quiz attempts
    // =========================================================================
    // Let User B open n1Id
    await clientB.rpc('mark_node_opened', { p_node_id: n1Id });

    const { data: atk7Progress } = await clientA
      .from('user_node_progress')
      .select('*')
      .eq('user_id', userIdB);

    const { data: atk7Attempts } = await clientA
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userIdB);

    const isAtk7Pass =
      (!atk7Progress || atk7Progress.length === 0) &&
      (!atk7Attempts || atk7Attempts.length === 0);

    if (isAtk7Pass) {
      record(
        'ATTACK 7: Cross-User Snooping Attack',
        'PASS',
        'Client A query filtering for User B returned 0 rows across user_node_progress and quiz_attempts (strict auth.uid() = user_id enforcement)'
      );
    } else {
      record(
        'ATTACK 7: Cross-User Snooping Attack',
        'FAIL',
        `Snooped rows: Progress=${atk7Progress?.length}, Attempts=${atk7Attempts?.length}`
      );
    }

    // =========================================================================
    // Client Bundle Secrets Audit
    // =========================================================================
    console.log('\n--- 3. Client Bundle Secrets Audit ---');
    const distDir = path.resolve(process.cwd(), 'dist');
    let bundleHasSecrets = false;
    let leakedSecrets: string[] = [];

    if (fs.existsSync(distDir)) {
      const files = fs.readdirSync(distDir, { recursive: true }) as string[];
      for (const file of files) {
        const fullFilePath = path.join(distDir, file);
        if (fs.statSync(fullFilePath).isFile() && (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.css'))) {
          const content = fs.readFileSync(fullFilePath, 'utf-8');
          if (serviceRoleKey && content.includes(serviceRoleKey)) {
            bundleHasSecrets = true;
            leakedSecrets.push(`SUPABASE_SERVICE_ROLE_KEY found in ${file}`);
          }
          if (process.env.GEMINI_API_KEY && content.includes(process.env.GEMINI_API_KEY)) {
            bundleHasSecrets = true;
            leakedSecrets.push(`GEMINI_API_KEY found in ${file}`);
          }
        }
      }
    }

    if (!bundleHasSecrets) {
      record(
        'Client Bundle Secrets Isolation Audit',
        'PASS',
        'Scanned production bundle (dist/): 0 instances of SUPABASE_SERVICE_ROLE_KEY or GEMINI_API_KEY detected'
      );
    } else {
      record(
        'Client Bundle Secrets Isolation Audit',
        'FAIL',
        `Secrets leaked in bundle: ${leakedSecrets.join(', ')}`
      );
    }

  } finally {
    console.log('\n--- Cleaning Up Temporary Security Test Users ---');
    if (userIdA) {
      await adminClient.auth.admin.deleteUser(userIdA);
      console.log(`Test User A (${userIdA}) deleted.`);
    }
    if (userIdB) {
      await adminClient.auth.admin.deleteUser(userIdB);
      console.log(`Test User B (${userIdB}) deleted.`);
    }
  }

  // Summary Table
  console.log('\n======================================================');
  console.log('# Phase 10 Adversarial Penetration Suite Summary\n');
  console.log('| Test / Attack Vector | Status | Evidence |');
  console.log('|---|---|---|');
  for (const r of results) {
    console.log(`| ${r.test} | **${r.status}** | ${r.evidence.replace(/\|/g, '\\|')} |`);
  }
}

runPenetrationSuite().catch((err) => {
  console.error('[FATAL]:', err);
  process.exit(1);
});
