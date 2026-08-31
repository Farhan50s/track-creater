import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { parse as parseYaml } from 'yaml';
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

const supabaseUrl = (process.env.VITE_SUPABASE_URL || 'https://evdlpjgalvgiplofmywm.supabase.co').replace('/rest/v1/', '').trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';

if (!serviceRoleKey) {
  console.error('[FATAL] SUPABASE_SERVICE_ROLE_KEY not found in .env. Seeding requires the service-role key.');
  process.exit(1);
}

const trackId = process.argv[2] || 'track-creator-test';
const trackDir = path.join(process.cwd(), 'content-drafts', trackId);

console.log('=== Supabase Content Seeder ===');
console.log('Track ID:', trackId);
console.log('Supabase URL:', supabaseUrl);
console.log('Track Directory:', trackDir);

function computeHash(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function seed() {
  const manifestPath = path.join(trackDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`[FATAL] Validation manifest not found at ${manifestPath}. Run validate-track first.`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  // 1. Seed eligibility gate
  if (!manifest.seed_eligible || manifest.error_count > 0) {
    console.error(`[FATAL] Track is not seed-eligible! Manifest seed_eligible=${manifest.seed_eligible}, errors=${manifest.error_count}`);
    process.exit(1);
  }

  // 2. Staleness check (SHA-256 fingerprint verification)
  console.log('\n--- Checking Manifest Freshness (Staleness Gate) ---');
  for (const [relFile, recordedHash] of Object.entries<string>(manifest.file_hashes)) {
    const fullPath = path.join(trackDir, relFile);
    if (!fs.existsSync(fullPath)) {
      console.error(`[FATAL StaleValidationManifestError] File missing since validation: ${relFile}`);
      process.exit(1);
    }
    const currentHash = computeHash(fullPath);
    if (currentHash !== recordedHash) {
      console.error(`[FATAL StaleValidationManifestError] File '${relFile}' was modified after validation! Please rerun validate-track.`);
      process.exit(1);
    }
  }
  console.log('Manifest is fresh. All content file hashes match.');

  // Parse skeleton and drafts
  const skeletonPath = path.join(trackDir, 'skeleton.yaml');
  const skeleton = parseYaml(fs.readFileSync(skeletonPath, 'utf-8'));

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  console.log('\n--- Seeding Track Content in Dependency Order ---');

  // 1. Clean existing test track if present
  console.log(`Cleaning previous instance of track '${trackId}'...`);
  await supabase.from('tracks').delete().eq('track_id', trackId);

  // 2. Insert Track
  console.log(`Inserting track: ${skeleton.track_id} ("${skeleton.name}")`);
  const { error: trackErr } = await supabase.from('tracks').insert({
    track_id: skeleton.track_id,
    name: skeleton.name,
    description: skeleton.description,
  });
  if (trackErr) throw new Error(`Track insert failed: ${trackErr.message}`);

  // 3. Insert Pillars
  for (const p of skeleton.pillars) {
    console.log(`  Inserting pillar: ${p.pillar_id} ("${p.name}")`);
    const { error: pillarErr } = await supabase.from('pillars').insert({
      pillar_id: p.pillar_id,
      track_id: skeleton.track_id,
      name: p.name,
      description: p.description,
      order_index: p.order,
    });
    if (pillarErr) throw new Error(`Pillar insert failed: ${pillarErr.message}`);

    // 4. Insert Topics
    for (const t of p.topics || []) {
      console.log(`    Inserting topic: ${t.topic_id} ("${t.name}")`);
      const { error: topicErr } = await supabase.from('topics').insert({
        topic_id: t.topic_id,
        pillar_id: p.pillar_id,
        name: t.name,
        order_index: t.order,
      });
      if (topicErr) throw new Error(`Topic insert failed: ${topicErr.message}`);

      // 5. Insert Subtopics
      for (const st of t.subtopics || []) {
        console.log(`      Inserting subtopic: ${st.subtopic_id} ("${st.name}")`);
        const { error: subtopicErr } = await supabase.from('subtopics').insert({
          subtopic_id: st.subtopic_id,
          topic_id: t.topic_id,
          name: st.name,
          order_index: st.order,
        });
        if (subtopicErr) throw new Error(`Subtopic insert failed: ${subtopicErr.message}`);

        // 6. Insert Skill Nodes
        for (const sn of st.skill_nodes || []) {
          const draftPath = path.join(trackDir, `${sn.node_id}.yaml`);
          const draft = parseYaml(fs.readFileSync(draftPath, 'utf-8'));

          console.log(`        Inserting skill node: ${sn.node_id} ("${draft.name}")`);
          const { error: nodeErr } = await supabase.from('skill_nodes').insert({
            node_id: sn.node_id,
            parent_subtopic_id: st.subtopic_id,
            name: draft.name,
            classification: draft.classification,
            recommended_depth: draft.recommended_depth,
            estimated_time_minutes: draft.estimated_time_minutes,
            one_sentence_definition: draft.one_sentence_definition,
            why_it_matters: draft.why_it_matters,
            quick_overview: draft.quick_overview,
            deep_dive: draft.deep_dive || null,
            content_version: draft.content_version || 1,
            order_index: sn.order,
          });
          if (nodeErr) throw new Error(`Skill node insert failed: ${nodeErr.message}`);

          // 7. Insert Resources
          for (const res of draft.resources || []) {
            const { error: resErr } = await supabase.from('resources').insert({
              node_id: sn.node_id,
              title: res.title,
              url: res.url,
              type: res.type,
              tag: res.tag,
              why: res.why || null,
              order_index: res.order_index,
            });
            if (resErr) throw new Error(`Resource insert failed: ${resErr.message}`);
          }

          // 8. Insert Quiz Questions and Answers
          for (const q of draft.quiz_pool || []) {
            const { data: qData, error: qErr } = await supabase.from('quiz_questions').insert({
              node_id: sn.node_id,
              question_text: q.question,
              options: q.options,
            }).select('question_id').single();

            if (qErr) throw new Error(`Quiz question insert failed: ${qErr.message}`);

            const { error: ansErr } = await supabase.from('quiz_answers').insert({
              question_id: qData.question_id,
              correct_index: q.correct_index,
            });
            if (ansErr) throw new Error(`Quiz answer insert failed: ${ansErr.message}`);
          }
        }
      }
    }
  }

  // 9. Insert Prerequisites (after all nodes are inserted)
  console.log('\nInserting node prerequisites...');
  for (const p of skeleton.pillars) {
    for (const t of p.topics || []) {
      for (const st of t.subtopics || []) {
        for (const sn of st.skill_nodes || []) {
          for (const prereqId of sn.prerequisites || []) {
            console.log(`  Prerequisite: ${sn.node_id} requires ${prereqId}`);
            const { error: prereqErr } = await supabase.from('node_prerequisites').insert({
              node_id: sn.node_id,
              prerequisite_node_id: prereqId,
            });
            if (prereqErr) throw new Error(`Prerequisite insert failed: ${prereqErr.message}`);
          }
        }
      }
    }
  }

  console.log('\n=== Seeding Complete Successfully! ===');
}

seed().catch(err => {
  console.error('\n[FATAL SEED ERROR]:', err);
  process.exit(1);
});
