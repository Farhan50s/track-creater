export type SkillNodeClassification = 'required' | 'recommended' | 'optional' | 'specialization';
export type SkillNodeDepth = 'overview' | 'practical' | 'implementation' | 'advanced';
export type NodeStatus = 'not_started' | 'in_progress' | 'completed';

export interface RawSkillNode {
  node_id: string;
  parent_subtopic_id: string | null;
  parent_topic_id: string | null;
  name: string;
  classification: SkillNodeClassification;
  recommended_depth: SkillNodeDepth;
  estimated_time_minutes: number;
  order_index: number;
}

export interface SkillNodeWithMeta extends RawSkillNode {
  prerequisites: string[];
  status: NodeStatus;
  is_locked: boolean;
  unmet_prerequisites: string[];
  unmet_prerequisite_names?: string[];
  is_current_focus: boolean;
}

export interface SubtopicWithNodes {
  subtopic_id: string;
  topic_id: string;
  name: string;
  order_index: number;
  nodes: SkillNodeWithMeta[];
}

export interface TopicWithHierarchy {
  topic_id: string;
  pillar_id: string;
  name: string;
  order_index: number;
  subtopics: SubtopicWithNodes[];
  direct_nodes: SkillNodeWithMeta[];
  all_nodes: SkillNodeWithMeta[];
}

export interface PillarSummary {
  pillar_id: string;
  track_id: string;
  name: string;
  description: string;
  order_index: number;
  totalNodeCount: number;
  requiredNodeCount: number;
  completedRequiredCount: number;
  completionPercent: number;
  currentFocusNodeId: string | null;
  currentFocusNodeName: string | null;
  isBlockedByPrereq?: boolean;
}

export interface TrackHierarchy {
  track_id: string;
  name: string;
  description: string;
  pillars: PillarSummary[];
}
