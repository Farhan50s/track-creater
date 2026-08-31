import { NodeStatus, SkillNodeWithMeta, TopicWithHierarchy } from '../types/track.types';

/**
 * Checks if a skill node is locked based on its prerequisites and the user's progress.
 * A node is locked if ANY prerequisite is not marked as 'completed'.
 */
export function isNodeLocked(
  prerequisites: string[] | undefined | null,
  userProgressMap: Map<string, NodeStatus>
): boolean {
  if (!prerequisites || prerequisites.length === 0) return false;
  return prerequisites.some((prereqId) => userProgressMap.get(prereqId) !== 'completed');
}

/**
 * Returns the list of prerequisite node IDs that have not yet been completed by the user.
 */
export function getUnmetPrerequisites(
  prerequisites: string[] | undefined | null,
  userProgressMap: Map<string, NodeStatus>
): string[] {
  if (!prerequisites || prerequisites.length === 0) return [];
  return prerequisites.filter((prereqId) => userProgressMap.get(prereqId) !== 'completed');
}

/**
 * Maps an array of unmet prerequisite node IDs to their human-readable node names.
 */
export function resolvePrerequisiteNames(
  unmetIds: string[],
  nodeNameMap: Map<string, string>
): string[] {
  return unmetIds.map((id) => nodeNameMap.get(id) || id);
}

/**
 * Flattens and returns skill nodes in depth-first traversal order:
 * Topic.order_index ASC -> Subtopic.order_index ASC -> SkillNode.order_index ASC.
 * Also accommodates nodes attached directly to topics (parent_subtopic_id = null).
 */
export function getTreeOrder(topics: TopicWithHierarchy[]): SkillNodeWithMeta[] {
  const sortedTopics = [...topics].sort((a, b) => a.order_index - b.order_index);
  const orderedNodes: SkillNodeWithMeta[] = [];

  for (const topic of sortedTopics) {
    // 1. Direct nodes on the topic (sorted by order_index)
    const directNodes = [...(topic.direct_nodes || [])].sort((a, b) => a.order_index - b.order_index);

    // 2. Subtopics on the topic (sorted by order_index)
    const sortedSubtopics = [...(topic.subtopics || [])].sort((a, b) => a.order_index - b.order_index);

    // If there are both direct nodes and subtopics, preserve stable ordering
    orderedNodes.push(...directNodes);

    for (const subtopic of sortedSubtopics) {
      const sortedSubtopicNodes = [...(subtopic.nodes || [])].sort((a, b) => a.order_index - b.order_index);
      orderedNodes.push(...sortedSubtopicNodes);
    }
  }

  return orderedNodes;
}

/**
 * Computes the Current Focus node for a pillar:
 * The first node in tree_order where:
 * 1. classification === 'required'
 * 2. status !== 'completed'
 * 3. !is_locked (all prerequisites are completed)
 *
 * Returns node_id or null if all required nodes are completed or all incomplete required nodes are locked.
 */
export function computeCurrentFocus(
  pillarNodesInTreeOrder: SkillNodeWithMeta[],
  userProgressMap: Map<string, NodeStatus>
): string | null {
  for (const node of pillarNodesInTreeOrder) {
    if (node.classification !== 'required') continue;
    const status = userProgressMap.get(node.node_id) || 'not_started';
    if (status === 'completed') continue;

    const locked = isNodeLocked(node.prerequisites, userProgressMap);
    if (!locked) {
      return node.node_id;
    }
  }
  return null;
}

/**
 * Calculates completion percentage for a pillar:
 * ONLY required nodes participate in the numerator and denominator.
 * Optional, recommended, and specialization nodes never alter the percentage.
 */
export function calculatePillarPercent(
  pillarNodes: SkillNodeWithMeta[],
  userProgressMap: Map<string, NodeStatus>
): number {
  const requiredNodes = pillarNodes.filter((n) => n.classification === 'required');
  if (requiredNodes.length === 0) return 0;

  const completedCount = requiredNodes.filter(
    (n) => userProgressMap.get(n.node_id) === 'completed'
  ).length;

  return Math.round((completedCount / requiredNodes.length) * 100);
}
