import { SkillNodeWithMeta } from '../../track/types/track.types';

export type RecommendationType = 'recommended_next' | 'complete_this_first' | 'optional_next';

export interface RecommendationResult {
  nodeId: string;
  nodeName: string;
  pillarId: string;
  pillarName: string;
  type: RecommendationType;
  label: 'Recommended next' | 'Complete this first' | 'Optional next';
  reason: string;
  estimatedMinutes: number;
}

export interface PillarProgressSummary {
  pillarId: string;
  name: string;
  description: string;
  orderIndex: number;
  completionPercent: number; // strictly on required nodes
  totalSkillCount: number;
  requiredCount: number;
  completedRequiredCount: number;
  currentFocusNodeId: string | null;
  currentFocusNodeName: string | null;
  nodes: SkillNodeWithMeta[];
}

export interface DashboardData {
  trackId: string | null;
  trackName: string;
  trackDescription: string;
  overallCompletionPercent: number; // strictly on required nodes across track
  totalRequiredSkills: number;
  completedRequiredSkills: number;
  totalSkills: number;
  pillars: PillarProgressSummary[];
  activePillars: PillarProgressSummary[];
  focusPillar: PillarProgressSummary | null;
  recommendedAction: RecommendationResult | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
