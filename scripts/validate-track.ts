import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { parse as parseYaml } from 'yaml';

const trackId = process.argv[2] || 'track-creator-test';
const trackDir = path.join(process.cwd(), 'content-drafts', trackId);

console.log(`=== Track Validator ===`);
console.log(`Track ID: ${trackId}`);
console.log(`Track Directory: ${trackDir}\n`);

interface ValidationMessage {
  type: 'ERROR' | 'WARNING' | 'INFO';
  category: 'Structural' | 'Content' | 'Resource' | 'Quiz' | 'DAG';
  message: string;
  nodeId?: string;
}

const messages: ValidationMessage[] = [];

function error(category: ValidationMessage['category'], message: string, nodeId?: string) {
  messages.push({ type: 'ERROR', category, message, nodeId });
}

function warn(category: ValidationMessage['category'], message: string, nodeId?: string) {
  messages.push({ type: 'WARNING', category, message, nodeId });
}

function info(category: ValidationMessage['category'], message: string, nodeId?: string) {
  messages.push({ type: 'INFO', category, message, nodeId });
}

function computeHash(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function validate() {
  if (!fs.existsSync(trackDir)) {
    error('Structural', `Track directory does not exist: ${trackDir}`);
    printSummary();
    process.exit(1);
  }

  const skeletonPath = path.join(trackDir, 'skeleton.yaml');
  if (!fs.existsSync(skeletonPath)) {
    error('Structural', `skeleton.yaml not found at ${skeletonPath}`);
    printSummary();
    process.exit(1);
  }

  const fileHashes: Record<string, string> = {};
  fileHashes['skeleton.yaml'] = computeHash(skeletonPath);

  let skeleton: any;
  try {
    const raw = fs.readFileSync(skeletonPath, 'utf-8');
    skeleton = parseYaml(raw);
  } catch (err: any) {
    error('Structural', `Failed to parse skeleton.yaml: ${err.message}`);
    printSummary();
    process.exit(1);
  }

  if (skeleton.track_id !== trackId) {
    error('Structural', `skeleton.yaml track_id '${skeleton.track_id}' does not match expected '${trackId}'`);
  }
  if (!skeleton.name || typeof skeleton.name !== 'string') {
    error('Structural', `Track missing non-empty name`);
  }
  if (!skeleton.description || typeof skeleton.description !== 'string') {
    error('Structural', `Track missing non-empty description`);
  }

  const validClassifications = ['required', 'recommended', 'optional', 'specialization'];
  const validDepths = ['overview', 'practical', 'implementation', 'advanced'];
  const validResourceTypes = ['documentation', 'article', 'course', 'video', 'book', 'tutorial', 'practice'];
  const validResourceTags = ['start_here', 'alternative', 'practice', 'reference'];

  // Map to collect all skeleton nodes
  interface SkeletonNode {
    node_id: string;
    name: string;
    classification: string;
    recommended_depth: string;
    estimated_time_minutes: number;
    order: number;
    prerequisites: string[];
    pillar_id: string;
    topic_id: string;
    subtopic_id?: string;
  }

  const skeletonNodes = new Map<string, SkeletonNode>();
  const pillarIds = new Set<string>();
  const topicIds = new Set<string>();
  const subtopicIds = new Set<string>();

  if (!Array.isArray(skeleton.pillars) || skeleton.pillars.length === 0) {
    error('Structural', `Track must have at least one pillar`);
  } else {
    const pillarOrders = new Set<number>();
    for (const pillar of skeleton.pillars) {
      if (!pillar.pillar_id || pillarIds.has(pillar.pillar_id)) {
        error('Structural', `Duplicate or missing pillar_id: ${pillar.pillar_id}`);
      }
      pillarIds.add(pillar.pillar_id);

      if (pillarOrders.has(pillar.order)) {
        error('Structural', `Duplicate pillar order: ${pillar.order} in track`);
      }
      pillarOrders.add(pillar.order);

      if (!Array.isArray(pillar.topics) || pillar.topics.length === 0) {
        error('Structural', `Pillar ${pillar.pillar_id} must have at least one topic`);
      } else {
        const topicOrders = new Set<number>();
        for (const topic of pillar.topics) {
          if (!topic.topic_id || topicIds.has(topic.topic_id)) {
            error('Structural', `Duplicate or missing topic_id: ${topic.topic_id}`);
          }
          topicIds.add(topic.topic_id);

          if (topicOrders.has(topic.order)) {
            error('Structural', `Duplicate topic order: ${topic.order} in pillar ${pillar.pillar_id}`);
          }
          topicOrders.add(topic.order);

          // Subtopics or direct nodes
          if (Array.isArray(topic.subtopics)) {
            const subtopicOrders = new Set<number>();
            for (const subtopic of topic.subtopics) {
              if (!subtopic.subtopic_id || subtopicIds.has(subtopic.subtopic_id)) {
                error('Structural', `Duplicate or missing subtopic_id: ${subtopic.subtopic_id}`);
              }
              subtopicIds.add(subtopic.subtopic_id);

              if (subtopicOrders.has(subtopic.order)) {
                error('Structural', `Duplicate subtopic order: ${subtopic.order} in topic ${topic.topic_id}`);
              }
              subtopicOrders.add(subtopic.order);

              if (Array.isArray(subtopic.skill_nodes)) {
                const nodeOrders = new Set<number>();
                for (const node of subtopic.skill_nodes) {
                  if (skeletonNodes.has(node.node_id)) {
                    error('Structural', `Duplicate node_id: ${node.node_id}`);
                  }
                  if (nodeOrders.has(node.order)) {
                    error('Structural', `Duplicate node order: ${node.order} in subtopic ${subtopic.subtopic_id}`);
                  }
                  nodeOrders.add(node.order);

                  skeletonNodes.set(node.node_id, {
                    ...node,
                    prerequisites: node.prerequisites || [],
                    pillar_id: pillar.pillar_id,
                    topic_id: topic.topic_id,
                    subtopic_id: subtopic.subtopic_id,
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  // Validate prerequisite references & self-prereqs
  for (const [nodeId, node] of skeletonNodes.entries()) {
    if (!validClassifications.includes(node.classification)) {
      error('Structural', `Invalid classification '${node.classification}' on node ${nodeId}`, nodeId);
    }
    if (!validDepths.includes(node.recommended_depth)) {
      error('Structural', `Invalid recommended_depth '${node.recommended_depth}' on node ${nodeId}`, nodeId);
    }
    if (typeof node.estimated_time_minutes !== 'number' || node.estimated_time_minutes <= 0) {
      error('Structural', `estimated_time_minutes must be positive integer on node ${nodeId}`, nodeId);
    }

    for (const prereqId of node.prerequisites) {
      if (prereqId === nodeId) {
        error('Structural', `Node ${nodeId} cannot have itself as a prerequisite`, nodeId);
      }
      if (!skeletonNodes.has(prereqId)) {
        error('Structural', `Prerequisite node '${prereqId}' referenced by '${nodeId}' does not exist`, nodeId);
      }
    }
  }

  // DAG Cycle Check (Kahn's algorithm / DFS)
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const nodeId of skeletonNodes.keys()) {
    adj.set(nodeId, []);
    inDegree.set(nodeId, 0);
  }

  for (const [nodeId, node] of skeletonNodes.entries()) {
    for (const prereqId of node.prerequisites) {
      if (skeletonNodes.has(prereqId)) {
        adj.get(prereqId)!.push(nodeId);
        inDegree.set(nodeId, (inDegree.get(nodeId) || 0) + 1);
      }
    }
  }

  const queue: string[] = [];
  for (const [nodeId, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(nodeId);
  }

  let visitedCount = 0;
  while (queue.length > 0) {
    const u = queue.shift()!;
    visitedCount++;
    for (const v of adj.get(u) || []) {
      const newDeg = inDegree.get(v)! - 1;
      inDegree.set(v, newDeg);
      if (newDeg === 0) queue.push(v);
    }
  }

  if (visitedCount !== skeletonNodes.size) {
    error('DAG', `Prerequisite graph contains a cycle! Visited ${visitedCount} of ${skeletonNodes.size} nodes.`);
  } else {
    info('DAG', `Prerequisite graph is acyclic (${visitedCount} nodes validated).`);
  }

  // Check Node Content Files
  const filesInDir = fs.readdirSync(trackDir).filter(f => f.endsWith('.yaml') && f !== 'skeleton.yaml');
  const expectedFiles = new Set(Array.from(skeletonNodes.keys()).map(id => `${id}.yaml`));

  for (const file of filesInDir) {
    if (!expectedFiles.has(file)) {
      error('Content', `Unexpected draft file in track directory: ${file}`);
    }
  }

  let reviewedNodeCount = 0;

  for (const [nodeId, sNode] of skeletonNodes.entries()) {
    const draftFileName = `${nodeId}.yaml`;
    const draftFilePath = path.join(trackDir, draftFileName);

    if (!fs.existsSync(draftFilePath)) {
      error('Content', `Missing draft YAML file for skeleton node: ${draftFileName}`, nodeId);
      continue;
    }

    fileHashes[draftFileName] = computeHash(draftFilePath);

    let draft: any;
    try {
      draft = parseYaml(fs.readFileSync(draftFilePath, 'utf-8'));
    } catch (err: any) {
      error('Content', `Failed to parse ${draftFileName}: ${err.message}`, nodeId);
      continue;
    }

    // Metadata consistency check
    if (draft.node_id !== sNode.node_id) {
      error('Content', `node_id in draft '${draft.node_id}' does not match skeleton '${sNode.node_id}'`, nodeId);
    }
    if (draft.name !== sNode.name) {
      error('Content', `name in draft '${draft.name}' does not match skeleton '${sNode.name}'`, nodeId);
    }
    if (draft.classification !== sNode.classification) {
      error('Content', `classification '${draft.classification}' does not match skeleton '${sNode.classification}'`, nodeId);
    }
    if (draft.recommended_depth !== sNode.recommended_depth) {
      error('Content', `recommended_depth '${draft.recommended_depth}' does not match skeleton '${sNode.recommended_depth}'`, nodeId);
    }
    if (draft.estimated_time_minutes !== sNode.estimated_time_minutes) {
      error('Content', `estimated_time_minutes ${draft.estimated_time_minutes} does not match skeleton ${sNode.estimated_time_minutes}`, nodeId);
    }

    // Check reviewed status
    if (draft.reviewed === true) {
      reviewedNodeCount++;
    } else {
      error('Content', `Node is marked 'reviewed: false'. Must be reviewed and set to 'reviewed: true' for seed eligibility.`, nodeId);
    }

    // Content fields validation
    if (!draft.one_sentence_definition || typeof draft.one_sentence_definition !== 'string' || draft.one_sentence_definition.trim() === '') {
      error('Content', `Missing or empty one_sentence_definition`, nodeId);
    } else {
      const defWords = draft.one_sentence_definition.trim().split(/\s+/).length;
      if (defWords > 30) {
        warn('Content', `one_sentence_definition is ${defWords} words (guideline: <=25 words)`, nodeId);
      }
    }

    if (!draft.why_it_matters || typeof draft.why_it_matters !== 'string' || draft.why_it_matters.trim() === '') {
      error('Content', `Missing or empty why_it_matters`, nodeId);
    }

    if (!draft.quick_overview || typeof draft.quick_overview !== 'string' || draft.quick_overview.trim() === '') {
      error('Content', `Missing or empty quick_overview`, nodeId);
    }

    if (sNode.recommended_depth !== 'overview') {
      if (!draft.deep_dive || typeof draft.deep_dive !== 'string' || draft.deep_dive.trim() === '') {
        error('Content', `deep_dive is required for non-overview depth '${sNode.recommended_depth}'`, nodeId);
      }
    }

    // Resource validation
    if (!Array.isArray(draft.resources)) {
      error('Resource', `resources must be an array on node ${nodeId}`, nodeId);
    } else {
      if (draft.resources.length < 2 || draft.resources.length > 4) {
        warn('Resource', `Node has ${draft.resources.length} resources (expected 2-4)`, nodeId);
      }

      let startHereCount = 0;
      for (const res of draft.resources) {
        if (!res.title || typeof res.title !== 'string') {
          error('Resource', `Resource missing title on node ${nodeId}`, nodeId);
        }
        if (!res.url || typeof res.url !== 'string' || !res.url.startsWith('http')) {
          error('Resource', `Invalid or missing resource URL on node ${nodeId}: ${res.url}`, nodeId);
        }
        if (!validResourceTypes.includes(res.type)) {
          error('Resource', `Invalid resource type '${res.type}' on node ${nodeId}`, nodeId);
        }
        if (!validResourceTags.includes(res.tag)) {
          error('Resource', `Invalid resource tag '${res.tag}' on node ${nodeId}`, nodeId);
        }
        if (res.tag === 'start_here') {
          startHereCount++;
        }
      }

      if (startHereCount !== 1) {
        error('Resource', `Node must have exactly one 'start_here' resource (found ${startHereCount})`, nodeId);
      }
    }

    // Quiz validation
    if (!Array.isArray(draft.quiz_pool)) {
      error('Quiz', `quiz_pool must be an array on node ${nodeId}`, nodeId);
    } else {
      if (draft.quiz_pool.length < 8 || draft.quiz_pool.length > 10) {
        error('Quiz', `quiz_pool must contain 8-10 questions (found ${draft.quiz_pool.length})`, nodeId);
      }

      const qTexts = new Set<string>();
      for (let qIdx = 0; qIdx < draft.quiz_pool.length; qIdx++) {
        const q = draft.quiz_pool[qIdx];
        if (!q.question || typeof q.question !== 'string') {
          error('Quiz', `Question ${qIdx + 1} missing question text`, nodeId);
        } else if (qTexts.has(q.question.trim().toLowerCase())) {
          error('Quiz', `Duplicate question text in quiz pool: "${q.question}"`, nodeId);
        } else {
          qTexts.add(q.question.trim().toLowerCase());
        }

        if (!Array.isArray(q.options) || q.options.length !== 4) {
          error('Quiz', `Question ${qIdx + 1} must have exactly 4 options`, nodeId);
        } else {
          for (let optIdx = 0; optIdx < 4; optIdx++) {
            if (!q.options[optIdx] || typeof q.options[optIdx] !== 'string') {
              error('Quiz', `Question ${qIdx + 1} option ${optIdx} is empty`, nodeId);
            }
          }
        }

        if (typeof q.correct_index !== 'number' || q.correct_index < 0 || q.correct_index > 3) {
          error('Quiz', `Question ${qIdx + 1} has invalid correct_index: ${q.correct_index} (must be 0-3)`, nodeId);
        }
      }
    }
  }

  // Print Summary and write Manifest
  const errorCount = messages.filter(m => m.type === 'ERROR').length;
  const warningCount = messages.filter(m => m.type === 'WARNING').length;
  const seedEligible = errorCount === 0 && reviewedNodeCount === skeletonNodes.size;

  const manifest = {
    track_id: trackId,
    validated_at: new Date().toISOString(),
    validator_version: '1.0.0',
    seed_eligible: seedEligible,
    node_count: skeletonNodes.size,
    reviewed_node_count: reviewedNodeCount,
    error_count: errorCount,
    warning_count: warningCount,
    file_hashes: fileHashes,
  };

  const manifestPath = path.join(trackDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  printSummary();
  console.log(`\nManifest written to ${manifestPath}`);
  console.log(`Seed Eligible: ${seedEligible ? 'YES (PASS)' : 'NO (FAIL)'}\n`);

  if (!seedEligible) {
    process.exit(1);
  }
}

function printSummary() {
  console.log('\n--- Validation Output ---');
  for (const m of messages) {
    const loc = m.nodeId ? ` [${m.nodeId}]` : '';
    console.log(`[${m.type}] [${m.category}]${loc} ${m.message}`);
  }
}

validate();
