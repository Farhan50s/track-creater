import { NodeStatus, SkillNodeWithMeta } from '../../track/types/track.types';
import { isNodeLocked, getUnmetPrerequisites } from '../../track/utils/progression';
import { PillarProgressSummary, RecommendationResult } from '../types/dashboard.types';

/**
 * Resolves the primary focus pillar:
 * 1. Active pillars (0 < percent < 100): highest completion % wins, ties broken by orderIndex ASC.
 * 2. If no active pillars: first incomplete pillar (percent < 100) by orderIndex ASC.
 * 3. Fallback: first pillar.
 */
export function computeFocusPillar(pillarsWithProgress: PillarProgressSummary[]): PillarProgressSummary {
  if (pillarsWithProgress.length === 0) {
    throw new Error('Cannot compute focus pillar from empty pillar list.');
  }

  // 1. Filter active pillars (0 < percent < 100)
  const active = pillarsWithProgress.filter((p) => p.completionPercent > 0 && p.completionPercent < 100);
  if (active.length > 0) {
    return [...active].sort(
      (a, b) => b.completionPercent - a.completionPercent || a.orderIndex - b.orderIndex
    )[0];
  }

  // 2. Filter incomplete pillars (percent < 100)
  const incomplete = pillarsWithProgress.filter((p) => p.completionPercent < 100);
  if (incomplete.length > 0) {
    return [...incomplete].sort((a, b) => a.orderIndex - b.orderIndex)[0];
  }

  // 3. Fallback to first pillar by orderIndex
  return [...pillarsWithProgress].sort((a, b) => a.orderIndex - b.orderIndex)[0];
}

/**
 * Resolves the single recommended action card using the 4-step deterministic algorithm:
 * - Step 1: Unlocked incomplete required node in focus pillar -> "Recommended next"
 * - Step 2: Cross-pillar prerequisite blocker -> points to missing prerequisite labeled "Complete this first"
 * - Step 3: Required path complete in focus pillar -> first unlocked recommended/optional node labeled "Optional next"
 * - Step 4: Advance to next incomplete pillar by order_index ASC
 */
export function computeRecommendedAction(
  focusPillar: PillarProgressSummary,
  allPillars: PillarProgressSummary[],
  allNodesWithMeta: Map<string, SkillNodeWithMeta>,
  userProgressMap: Map<string, NodeStatus>
): RecommendationResult | null {
  // Step 1 & Step 2: Check focus pillar for required nodes
  const focusRequiredNodes = focusPillar.nodes.filter((n) => n.classification === 'required');

  for (const node of focusRequiredNodes) {
    const status = userProgressMap.get(node.node_id) || 'not_started';
    if (status === 'completed') continue;

    const locked = isNodeLocked(node.prerequisites, userProgressMap);

    // Step 1: Unlocked incomplete required node
    if (!locked) {
      return {
        nodeId: node.node_id,
        nodeName: node.name,
        pillarId: focusPillar.pillarId,
        pillarName: focusPillar.name,
        type: 'recommended_next',
        label: 'Recommended next',
        reason: `Next core skill in ${focusPillar.name}`,
        estimatedMinutes: node.estimated_time_minutes,
      };
    }

    // Step 2: Locked node -> find first unmet prerequisite (even cross-pillar)
    const unmetPrereqIds = getUnmetPrerequisites(node.prerequisites, userProgressMap);
    if (unmetPrereqIds && unmetPrereqIds.length > 0) {
      const blockingNode = allNodesWithMeta.get(unmetPrereqIds[0]);
      if (blockingNode) {
        // Find which pillar contains this blocking node
        const parentPillar = allPillars.find((p) =>
          p.nodes.some((pn) => pn.node_id === blockingNode.node_id)
        );

        return {
          nodeId: blockingNode.node_id,
          nodeName: blockingNode.name,
          pillarId: parentPillar?.pillarId || focusPillar.pillarId,
          pillarName: parentPillar?.name || 'Prerequisite Skill',
          type: 'complete_this_first',
          label: 'Complete this first',
          reason: `Required to unlock ${node.name}`,
          estimatedMinutes: blockingNode.estimated_time_minutes,
        };
      }
    }
  }

  // Step 3: All required in focus pillar completed -> check unlocked recommended / optional nodes
  const nonRequiredNodes = focusPillar.nodes.filter(
    (n) => n.classification === 'recommended' || n.classification === 'optional'
  );

  for (const node of nonRequiredNodes) {
    const status = userProgressMap.get(node.node_id) || 'not_started';
    const locked = isNodeLocked(node.prerequisites, userProgressMap);
    if (status === 'completed' || locked) continue;

    return {
      nodeId: node.node_id,
      nodeName: node.name,
      pillarId: focusPillar.pillarId,
      pillarName: focusPillar.name,
      type: 'optional_next',
      label: 'Optional next',
      reason: `Expand your depth in ${focusPillar.name}`,
      estimatedMinutes: node.estimated_time_minutes,
    };
  }

  // Step 4: Advance to next incomplete pillar by orderIndex ASC
  const otherPillars = allPillars
    .filter((p) => p.pillarId !== focusPillar.pillarId && p.completionPercent < 100)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  if (otherPillars.length > 0) {
    return computeRecommendedAction(otherPillars[0], allPillars, allNodesWithMeta, userProgressMap);
  }

  // Track 100% complete
  return null;
}
