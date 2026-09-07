import { QuizQuestion } from '../types/quiz.types';

/**
 * Fisher-Yates (Knuth) in-place shuffle helper
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

/**
 * Stratified random sampling for diagnostic exams across topic child nodes.
 * Guarantees fair, balanced question distribution across all nodes in a topic,
 * falling back to an overflow pool if specific nodes have fewer questions.
 */
export function sampleTopicDiagnosticQuestions(
  pool: QuizQuestion[],
  targetCount: number = 10
): QuizQuestion[] {
  if (pool.length <= targetCount) {
    return shuffleArray(pool);
  }

  // Group questions by node_id
  const nodeMap = new Map<string, QuizQuestion[]>();
  for (const q of pool) {
    const existing = nodeMap.get(q.node_id) || [];
    existing.push(q);
    nodeMap.set(q.node_id, existing);
  }

  // Shuffle node IDs to prevent deterministic remainder slot advantages
  const nodeIds = shuffleArray(Array.from(nodeMap.keys()));
  const totalNodes = nodeIds.length;

  if (totalNodes === 0) return [];

  // Calculate base quota per node and remainder
  const baseQuota = Math.floor(targetCount / totalNodes);
  const remainder = targetCount % totalNodes;

  const selectedQuestions: QuizQuestion[] = [];
  const overflowPool: QuizQuestion[] = [];

  nodeIds.forEach((nodeId, index) => {
    const nodeQuestions = shuffleArray(nodeMap.get(nodeId) || []);
    // Nodes up to remainder get baseQuota + 1 (if baseQuota === 0, at most remainder nodes get 1)
    const targetForNode = baseQuota + (index < remainder ? 1 : 0);

    const taken = nodeQuestions.slice(0, targetForNode);
    const unused = nodeQuestions.slice(targetForNode);

    selectedQuestions.push(...taken);
    overflowPool.push(...unused);
  });

  // If any node had fewer questions than targetForNode, fill the deficit from the overflow pool
  if (selectedQuestions.length < targetCount) {
    const deficit = targetCount - selectedQuestions.length;
    const shuffledOverflow = shuffleArray(overflowPool);
    selectedQuestions.push(...shuffledOverflow.slice(0, deficit));
  }

  // Interleave and randomize question order so questions from the same node aren't clumped together
  return shuffleArray(selectedQuestions.slice(0, targetCount));
}
