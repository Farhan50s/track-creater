import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env if present
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
} catch (e) {
  // Ignore if .env not found
}

// Configuration from environment or defaults
const supabaseUrl = (process.env.VITE_SUPABASE_URL || 'https://evdlpjgalvgiplofmywm.supabase.co').replace('/rest/v1/', '').trim();
const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_PngBC1EwUVF5WiKbgNyrFA_JxAWXO03').trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';

console.log('--- Phase 1 Verification Suite ---');
console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key Present:', Boolean(anonKey));
console.log('Service Role Key Present:', Boolean(serviceRoleKey));

interface TestResult {
  category: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'BLOCKED';
  evidence: string;
}

const results: TestResult[] = [];

function record(category: string, name: string, status: 'PASS' | 'FAIL' | 'BLOCKED', evidence: string) {
  results.push({ category, name, status, evidence });
  console.log(`[${status}] [${category}] ${name}: ${evidence}`);
}

async function main() {
  if (!serviceRoleKey) {
    console.log('\n[NOTE] SUPABASE_SERVICE_ROLE_KEY not found in environment.');
    console.log('For administrative fixture setup (creating test tracks/nodes/quiz pools), please provide SUPABASE_SERVICE_ROLE_KEY or run migrations via Supabase CLI.');
  }

  const adminClient = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } }) : null;
  const anonClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

  // Test credentials
  const userAEmail = `test_user_a_${Date.now()}@example.com`;
  const userBEmail = `test_user_b_${Date.now()}@example.com`;
  const userPassword = 'TestPassword123!#';

  let userAId: string | null = null;
  let userBId: string | null = null;
  let userAClient: SupabaseClient | null = null;
  let userBClient: SupabaseClient | null = null;

  try {
    // 1. Setup Test Users
    console.log('\n--- 1. Setting Up Test Users ---');
    if (adminClient) {
      const { data: uA, error: errA } = await adminClient.auth.admin.createUser({
        email: userAEmail,
        password: userPassword,
        email_confirm: true,
      });
      if (errA) throw new Error(`Failed to create User A: ${errA.message}`);
      userAId = uA.user.id;

      const { data: uB, error: errB } = await adminClient.auth.admin.createUser({
        email: userBEmail,
        password: userPassword,
        email_confirm: true,
      });
      if (errB) throw new Error(`Failed to create User B: ${errB.message}`);
      userBId = uB.user.id;
    } else {
      const { data: sA, error: errSA } = await anonClient.auth.signUp({
        email: userAEmail,
        password: userPassword,
      });
      if (errSA) throw new Error(`Failed to sign up User A: ${errSA.message}`);
      userAId = sA.user?.id || null;

      const { data: sB, error: errSB } = await anonClient.auth.signUp({
        email: userBEmail,
        password: userPassword,
      });
      if (errSB) throw new Error(`Failed to sign up User B: ${errSB.message}`);
      userBId = sB.user?.id || null;
    }

    console.log(`User A created: ${userAId} (${userAEmail})`);
    console.log(`User B created: ${userBId} (${userBEmail})`);

    // Authenticate user clients
    userAClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const { error: signInErrA } = await userAClient.auth.signInWithPassword({
      email: userAEmail,
      password: userPassword,
    });
    if (signInErrA) throw new Error(`User A sign-in failed: ${signInErrA.message}`);

    userBClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const { error: signInErrB } = await userBClient.auth.signInWithPassword({
      email: userBEmail,
      password: userPassword,
    });
    if (signInErrB) throw new Error(`User B sign-in failed: ${signInErrB.message}`);

    // Verify Signup Trigger created profiles
    const { data: profileA } = await userAClient.from('profiles').select('*').single();
    if (profileA && profileA.user_id === userAId) {
      record('Signup Trigger', 'Profile created automatically', 'PASS', `Profile exists for User A: user_id=${profileA.user_id}`);
    } else {
      record('Signup Trigger', 'Profile created automatically', 'FAIL', `No profile row found for User A`);
    }

    // 2. Setup Test Fixtures via adminClient
    console.log('\n--- 2. Setting Up Test Fixtures ---');
    const trackA = `track_test_a_${Date.now()}`;
    const trackB = `track_test_b_${Date.now()}`;
    const pillarA = `pillar_test_a_${Date.now()}`;
    const topicA = `topic_test_a_${Date.now()}`;
    const subtopicA = `subtopic_test_a_${Date.now()}`;
    const node1 = `node_test_1_${Date.now()}`;
    const node2 = `node_test_2_${Date.now()}`; // requires node1
    const foreignNode = `node_test_foreign_${Date.now()}`;

    const questionIdsNode1: string[] = [];
    const questionIdsNode2: string[] = [];

    if (adminClient) {
      // Tracks
      await adminClient.from('tracks').insert([
        { track_id: trackA, name: 'Track A', description: 'Test Track A' },
        { track_id: trackB, name: 'Track B', description: 'Test Track B' },
      ]);

      // Pillars
      await adminClient.from('pillars').insert([
        { pillar_id: pillarA, track_id: trackA, name: 'Pillar A', description: 'Pillar A Desc', order_index: 1 },
      ]);

      // Topics
      await adminClient.from('topics').insert([
        { topic_id: topicA, pillar_id: pillarA, name: 'Topic A', order_index: 1 },
      ]);

      // Subtopics
      await adminClient.from('subtopics').insert([
        { subtopic_id: subtopicA, topic_id: topicA, name: 'Subtopic A', order_index: 1 },
      ]);

      // Skill Nodes
      await adminClient.from('skill_nodes').insert([
        {
          node_id: node1,
          parent_subtopic_id: subtopicA,
          name: 'Skill Node 1 (Prerequisite)',
          classification: 'required',
          recommended_depth: 'practical',
          estimated_time_minutes: 30,
          one_sentence_definition: 'First node definition',
          why_it_matters: 'Foundation skill',
          quick_overview: 'Overview 1',
          deep_dive: 'Deep dive 1',
          content_version: 1,
          order_index: 1,
        },
        {
          node_id: node2,
          parent_subtopic_id: subtopicA,
          name: 'Skill Node 2 (Dependent)',
          classification: 'required',
          recommended_depth: 'practical',
          estimated_time_minutes: 45,
          one_sentence_definition: 'Second node definition',
          why_it_matters: 'Advanced skill',
          quick_overview: 'Overview 2',
          deep_dive: 'Deep dive 2',
          content_version: 1,
          order_index: 2,
        },
        {
          node_id: foreignNode,
          parent_topic_id: topicA,
          name: 'Foreign Track Node',
          classification: 'optional',
          recommended_depth: 'overview',
          estimated_time_minutes: 20,
          one_sentence_definition: 'Foreign node definition',
          why_it_matters: 'Foreign track testing',
          quick_overview: 'Overview foreign',
          content_version: 1,
          order_index: 3,
        }
      ]);

      // Prerequisites (node2 requires node1)
      await adminClient.from('node_prerequisites').insert([
        { node_id: node2, prerequisite_node_id: node1 },
      ]);

      // Resources
      await adminClient.from('resources').insert([
        {
          node_id: node1,
          title: 'Start Here Guide',
          url: 'https://example.com/guide',
          type: 'documentation',
          tag: 'start_here',
          why: 'Starting point',
          order_index: 1,
        },
        {
          node_id: node1,
          title: 'Reference Doc',
          url: 'https://example.com/ref',
          type: 'article',
          tag: 'reference',
          why: 'Reference',
          order_index: 2,
        }
      ]);

      // Quiz Questions and Answers for node1
      for (let i = 0; i < 5; i++) {
        const { data: q } = await adminClient.from('quiz_questions').insert({
          node_id: node1,
          question_text: `Node 1 Question ${i + 1}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
        }).select('question_id').single();

        if (q) {
          questionIdsNode1.push(q.question_id);
          await adminClient.from('quiz_answers').insert({
            question_id: q.question_id,
            correct_index: i % 4,
          });
        }
      }

      // Quiz Questions and Answers for node2
      for (let i = 0; i < 5; i++) {
        const { data: q } = await adminClient.from('quiz_questions').insert({
          node_id: node2,
          question_text: `Node 2 Question ${i + 1}`,
          options: ['Opt 1', 'Opt 2', 'Opt 3', 'Opt 4'],
        }).select('question_id').single();

        if (q) {
          questionIdsNode2.push(q.question_id);
          await adminClient.from('quiz_answers').insert({
            question_id: q.question_id,
            correct_index: 0,
          });
        }
      }

      console.log('Test fixtures created successfully.');
    }

    // Enroll User A in Track A
    await userAClient.from('user_active_track').insert({
      user_id: userAId,
      track_id: trackA,
    });

    // Enroll User B in Track B
    await userBClient.from('user_active_track').insert({
      user_id: userBId,
      track_id: trackB,
    });

    // 3. RLS Verification Tests
    console.log('\n--- 3. Running RLS Verification Tests ---');

    // Test: Content read access
    const { data: tracksRead, error: tracksErr } = await userAClient.from('tracks').select('*');
    if (!tracksErr && tracksRead && tracksRead.length > 0) {
      record('RLS Verification', 'Content read access', 'PASS', `User A read ${tracksRead.length} tracks successfully`);
    } else {
      record('RLS Verification', 'Content read access', 'FAIL', `Error reading tracks: ${tracksErr?.message}`);
    }

    // Test: quiz_answers blocked
    const { data: ansData, error: ansErr } = await userAClient.from('quiz_answers').select('*');
    if (ansErr || !ansData || ansData.length === 0) {
      record('RLS Verification', 'quiz_answers blocked', 'PASS', `Access to quiz_answers denied as expected (${ansErr ? ansErr.message : '0 rows returned'})`);
    } else {
      record('RLS Verification', 'quiz_answers blocked', 'FAIL', `User A was able to read quiz_answers! (${ansData.length} rows)`);
    }

    // Test: Direct progress mutation blocked
    const { error: directProgInsertErr } = await userAClient.from('user_node_progress').insert({
      user_id: userAId,
      node_id: node1,
      status: 'completed',
      first_opened_at: new Date().toISOString(),
    });
    if (directProgInsertErr) {
      record('RLS Verification', 'Direct mutation blocked (progress)', 'PASS', `Direct progress insert denied: ${directProgInsertErr.message}`);
    } else {
      record('RLS Verification', 'Direct mutation blocked (progress)', 'FAIL', `Direct progress insert succeeded unexpectedly`);
    }

    // Test: Direct attempt mutation blocked
    const { error: directAttemptInsertErr } = await userAClient.from('quiz_attempts').insert({
      user_id: userAId,
      node_id: node1,
      questions_served: questionIdsNode1,
      answers_selected: [0, 1, 2, 3, 0],
      score: 5,
      passed: true,
    });
    if (directAttemptInsertErr) {
      record('RLS Verification', 'Direct mutation blocked (attempts)', 'PASS', `Direct attempt insert denied: ${directAttemptInsertErr.message}`);
    } else {
      record('RLS Verification', 'Direct mutation blocked (attempts)', 'FAIL', `Direct attempt insert succeeded unexpectedly`);
    }

    // 4. RPC Verification — mark_node_opened
    console.log('\n--- 4. Running mark_node_opened Tests ---');

    // Test: First open
    const { error: open1Err } = await userAClient.rpc('mark_node_opened', { p_node_id: node1 });
    if (!open1Err) {
      const { data: prog1 } = await userAClient.from('user_node_progress').select('*').eq('node_id', node1).single();
      if (prog1 && prog1.status === 'in_progress' && prog1.first_opened_at) {
        record('RPC Verification — mark_node_opened', 'First open', 'PASS', `Row created: status=${prog1.status}, first_opened_at=${prog1.first_opened_at}`);
      } else {
        record('RPC Verification — mark_node_opened', 'First open', 'FAIL', `Progress row not found or status invalid`);
      }
    } else {
      record('RPC Verification — mark_node_opened', 'First open', 'FAIL', `RPC error: ${open1Err.message}`);
    }

    // Test: Repeated open (idempotent)
    const { data: initialProg } = await userAClient.from('user_node_progress').select('*').eq('node_id', node1).single();
    await userAClient.rpc('mark_node_opened', { p_node_id: node1 });
    const { data: secondProg } = await userAClient.from('user_node_progress').select('*').eq('node_id', node1).single();
    if (initialProg && secondProg && initialProg.first_opened_at === secondProg.first_opened_at && secondProg.status === 'in_progress') {
      record('RPC Verification — mark_node_opened', 'Repeated open (idempotent)', 'PASS', `first_opened_at preserved (${initialProg.first_opened_at})`);
    } else {
      record('RPC Verification — mark_node_opened', 'Repeated open (idempotent)', 'FAIL', `State modified unexpectedly on repeated open`);
    }

    // Test: Foreign-track node rejected
    // User B is on Track B, trying to open node1 which belongs to Track A
    const { error: foreignOpenErr } = await userBClient.rpc('mark_node_opened', { p_node_id: node1 });
    if (foreignOpenErr) {
      record('RPC Verification — mark_node_opened', 'Foreign-track node rejected', 'PASS', `Rejected foreign node open: ${foreignOpenErr.message}`);
    } else {
      record('RPC Verification — mark_node_opened', 'Foreign-track node rejected', 'FAIL', `Foreign node open succeeded unexpectedly`);
    }

    // Test: Nonexistent node rejected
    const { error: nonExistentErr } = await userAClient.rpc('mark_node_opened', { p_node_id: 'non_existent_node_xyz' });
    if (nonExistentErr) {
      record('RPC Verification — mark_node_opened', 'Nonexistent node rejected', 'PASS', `Safely rejected: ${nonExistentErr.message}`);
    } else {
      record('RPC Verification — mark_node_opened', 'Nonexistent node rejected', 'FAIL', `Nonexistent node open succeeded unexpectedly`);
    }

    // Test: User isolation
    const { data: uBReadingAProg } = await userBClient.from('user_node_progress').select('*').eq('user_id', userAId);
    if (!uBReadingAProg || uBReadingAProg.length === 0) {
      record('RLS Verification', 'User isolation (progress)', 'PASS', `User B cannot read User A progress (0 rows returned)`);
    } else {
      record('RLS Verification', 'User isolation (progress)', 'FAIL', `User B read User A progress!`);
    }

    // 5. RPC Verification — submit_quiz_attempt
    console.log('\n--- 5. Running submit_quiz_attempt Tests ---');

    // Test: Unopened node rejected (node2 is unopened)
    const { error: unopenedErr } = await userAClient.rpc('submit_quiz_attempt', {
      p_node_id: node2,
      p_question_ids: questionIdsNode2,
      p_answers: [0, 0, 0, 0, 0],
    });
    if (unopenedErr && unopenedErr.message.includes('opened')) {
      record('RPC Verification — submit_quiz_attempt', 'Unopened node rejected', 'PASS', `Rejected unopened node: ${unopenedErr.message}`);
    } else {
      record('RPC Verification — submit_quiz_attempt', 'Unopened node rejected', 'FAIL', `Expected unopened error, got: ${unopenedErr?.message}`);
    }

    // Test: Locked node rejected (open node2, but prerequisite node1 not complete)
    // Note: To open node2, user calls mark_node_opened(node2)
    await userAClient.rpc('mark_node_opened', { p_node_id: node2 });
    const { error: lockedErr } = await userAClient.rpc('submit_quiz_attempt', {
      p_node_id: node2,
      p_question_ids: questionIdsNode2,
      p_answers: [0, 0, 0, 0, 0],
    });
    if (lockedErr && lockedErr.message.includes('Prerequisites')) {
      record('RPC Verification — submit_quiz_attempt', 'Locked node rejected', 'PASS', `Rejected locked node: ${lockedErr.message}`);
    } else {
      record('RPC Verification — submit_quiz_attempt', 'Locked node rejected', 'FAIL', `Expected prerequisite error, got: ${lockedErr?.message}`);
    }

    // Test: Invalid question count (fewer / more than 5)
    const { error: countErr1 } = await userAClient.rpc('submit_quiz_attempt', {
      p_node_id: node1,
      p_question_ids: questionIdsNode1.slice(0, 4),
      p_answers: [0, 1, 2, 3],
    });
    const { error: countErr2 } = await userAClient.rpc('submit_quiz_attempt', {
      p_node_id: node1,
      p_question_ids: [...questionIdsNode1, questionIdsNode1[0]],
      p_answers: [0, 1, 2, 3, 0, 0],
    });
    if (countErr1 && countErr2) {
      record('RPC Verification — submit_quiz_attempt', 'Invalid question count rejected', 'PASS', `4 and 6 questions rejected`);
    } else {
      record('RPC Verification — submit_quiz_attempt', 'Invalid question count rejected', 'FAIL', `Failed to reject invalid counts`);
    }

    // Test: Duplicate questions rejected
    const { error: dupErr } = await userAClient.rpc('submit_quiz_attempt', {
      p_node_id: node1,
      p_question_ids: [questionIdsNode1[0], questionIdsNode1[0], questionIdsNode1[2], questionIdsNode1[3], questionIdsNode1[4]],
      p_answers: [0, 1, 2, 3, 0],
    });
    if (dupErr && dupErr.message.includes('Duplicate')) {
      record('RPC Verification — submit_quiz_attempt', 'Duplicate questions rejected', 'PASS', `Duplicate questions rejected: ${dupErr.message}`);
    } else {
      record('RPC Verification — submit_quiz_attempt', 'Duplicate questions rejected', 'FAIL', `Duplicates not rejected`);
    }

    // Test: Wrong-node questions rejected
    const { error: wrongNodeErr } = await userAClient.rpc('submit_quiz_attempt', {
      p_node_id: node1,
      p_question_ids: questionIdsNode2, // node2's questions submitted for node1
      p_answers: [0, 0, 0, 0, 0],
    });
    if (wrongNodeErr) {
      record('RPC Verification — submit_quiz_attempt', 'Wrong-node questions rejected', 'PASS', `Wrong node questions rejected: ${wrongNodeErr.message}`);
    } else {
      record('RPC Verification — submit_quiz_attempt', 'Wrong-node questions rejected', 'FAIL', `Wrong node questions accepted unexpectedly`);
    }

    // Test: Invalid answer indices rejected (-1, 4, 999)
    const { error: idxErr } = await userAClient.rpc('submit_quiz_attempt', {
      p_node_id: node1,
      p_question_ids: questionIdsNode1,
      p_answers: [0, 1, 2, 4, 999],
    });
    if (idxErr && idxErr.message.includes('indices')) {
      record('RPC Verification — submit_quiz_attempt', 'Invalid answer indices rejected', 'PASS', `Invalid indices rejected: ${idxErr.message}`);
    } else {
      record('RPC Verification — submit_quiz_attempt', 'Invalid answer indices rejected', 'FAIL', `Invalid indices accepted unexpectedly`);
    }

    // Test: Score matrix (0/5, 1/5, 2/5, 3/5 fail; 4/5, 5/5 pass)
    // Correct answers for node1: [0, 1, 2, 3, 0]
    const testCases = [
      { scoreTarget: 0, answers: [1, 2, 3, 0, 1] },
      { scoreTarget: 1, answers: [0, 2, 3, 0, 1] },
      { scoreTarget: 2, answers: [0, 1, 3, 0, 1] },
      { scoreTarget: 3, answers: [0, 1, 2, 0, 1] },
      { scoreTarget: 4, answers: [0, 1, 2, 3, 1] },
      { scoreTarget: 5, answers: [0, 1, 2, 3, 0] },
    ];

    for (const tc of testCases) {
      const { data: scoreRes, error: scoreErr } = await userAClient.rpc('submit_quiz_attempt', {
        p_node_id: node1,
        p_question_ids: questionIdsNode1,
        p_answers: tc.answers,
      });
      const expectedPass = tc.scoreTarget >= 4;
      if (!scoreErr && scoreRes && scoreRes.score === tc.scoreTarget && scoreRes.passed === expectedPass) {
        record('RPC Verification — submit_quiz_attempt', `Score matrix (${tc.scoreTarget}/5)`, 'PASS', `Result: score=${scoreRes.score}, passed=${scoreRes.passed}, status=${scoreRes.status}, attempt_id=${scoreRes.attempt_id}`);
      } else {
        record('RPC Verification — submit_quiz_attempt', `Score matrix (${tc.scoreTarget}/5)`, 'FAIL', `Expected score=${tc.scoreTarget}, passed=${expectedPass}. Got: ${JSON.stringify(scoreRes)}, Err: ${scoreErr?.message}`);
      }
    }

    const { data: progAfter4 } = await userAClient.from('user_node_progress').select('*').eq('node_id', node1).single();
    if (progAfter4 && progAfter4.status === 'completed' && progAfter4.completed_at) {
      record('RPC Verification — submit_quiz_attempt', 'Valid submission scores correctly', 'PASS', `4/5 and 5/5 completed node: status=completed, completed_at=${progAfter4.completed_at}`);
    } else {
      record('RPC Verification — submit_quiz_attempt', 'Valid submission scores correctly', 'FAIL', `Node completion status failed: ${JSON.stringify(progAfter4)}`);
    }

    // Test: Completion never reverts on failed retake (submit 2/5 on already completed node)
    const { data: resRetakeFail } = await userAClient.rpc('submit_quiz_attempt', {
      p_node_id: node1,
      p_question_ids: questionIdsNode1,
      p_answers: [0, 1, 0, 0, 1], // 2 correct
    });
    const { data: progAfterRetakeFail } = await userAClient.from('user_node_progress').select('*').eq('node_id', node1).single();

    if (resRetakeFail && resRetakeFail.score === 2 && resRetakeFail.passed === false && progAfterRetakeFail.status === 'completed') {
      record('RPC Verification — submit_quiz_attempt', 'Completion never reverts on failed retake', 'PASS', `Retake score=2, passed=false, node status remained 'completed'`);
    } else {
      record('RPC Verification — submit_quiz_attempt', 'Completion never reverts on failed retake', 'FAIL', `Status reverted or invalid: ${JSON.stringify(progAfterRetakeFail)}`);
    }

    // Test: last_quiz_score updates on retake (submit 5/5)
    const { data: resRetake5 } = await userAClient.rpc('submit_quiz_attempt', {
      p_node_id: node1,
      p_question_ids: questionIdsNode1,
      p_answers: [0, 1, 2, 3, 0], // 5 correct
    });
    const { data: progAfterRetake5 } = await userAClient.from('user_node_progress').select('*').eq('node_id', node1).single();

    if (resRetake5 && resRetake5.score === 5 && progAfterRetake5.last_quiz_score === 5 && progAfterRetake5.status === 'completed') {
      record('RPC Verification — submit_quiz_attempt', 'last_quiz_score updates on retake', 'PASS', `last_quiz_score updated to 5, status remained completed`);
    } else {
      record('RPC Verification — submit_quiz_attempt', 'last_quiz_score updates on retake', 'FAIL', `Score update failed: ${JSON.stringify(progAfterRetake5)}`);
    }

    // Test: User B cannot read User A quiz attempts
    const { data: uBAttempts } = await userBClient.from('quiz_attempts').select('*').eq('user_id', userAId);
    if (!uBAttempts || uBAttempts.length === 0) {
      record('RLS Verification', 'User isolation (attempts)', 'PASS', `User B cannot read User A quiz attempts (0 rows returned)`);
    } else {
      record('RLS Verification', 'User isolation (attempts)', 'FAIL', `User B read User A quiz attempts!`);
    }

    // Test: Track isolation
    // User B tries to submit quiz for node1 (belongs to Track A, User B is on Track B)
    const { error: trackIsoErr } = await userBClient.rpc('submit_quiz_attempt', {
      p_node_id: node1,
      p_question_ids: questionIdsNode1,
      p_answers: [0, 1, 2, 3, 0],
    });
    if (trackIsoErr) {
      record('RLS Verification', 'Track isolation', 'PASS', `Foreign track quiz attempt rejected: ${trackIsoErr.message}`);
    } else {
      record('RLS Verification', 'Track isolation', 'FAIL', `Foreign track quiz attempt succeeded unexpectedly`);
    }

    // Cleanup test fixtures
    if (adminClient) {
      console.log('\n--- Cleaning up test fixtures ---');
      await adminClient.auth.admin.deleteUser(userAId);
      await adminClient.auth.admin.deleteUser(userBId);
      await adminClient.from('tracks').delete().in('track_id', [trackA, trackB]);
      console.log('Cleanup completed.');
    }

  } catch (err: any) {
    console.error('\n[ERROR during verification execution]:', err.message);
  }

  // Print Final Markdown Summary
  console.log('\n======================================================');
  console.log('# Phase 1 Verification Report Summary\n');
  console.log('| Category | Test | Status | Evidence |');
  console.log('|---|---|---|---|');
  for (const r of results) {
    console.log(`| ${r.category} | ${r.name} | ${r.status} | ${r.evidence.replace(/\|/g, '\\|')} |`);
  }
}

main();
