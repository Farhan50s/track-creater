import { NodeStatus, SkillNodeClassification, SkillNodeDepth } from '../../track/types/track.types';

export type ResourceType = 'documentation' | 'article' | 'course' | 'video' | 'book' | 'tutorial' | 'practice';
export type ResourceTag = 'start_here' | 'alternative' | 'practice' | 'reference';

export interface ResourceItem {
  resource_id: string;
  node_id: string;
  title: string;
  url: string;
  type: ResourceType;
  tag: ResourceTag;
  why: string | null;
  order_index: number;
}

export interface PrerequisiteDetail {
  node_id: string;
  name: string;
  is_completed: boolean;
}

export interface SkillNodeDetail {
  node_id: string;
  parent_subtopic_id: string | null;
  parent_topic_id: string | null;
  name: string;
  classification: SkillNodeClassification;
  recommended_depth: SkillNodeDepth;
  estimated_time_minutes: number;
  one_sentence_definition: string;
  why_it_matters: string;
  quick_overview: string;
  deep_dive: string | null;
  content_version: number;
  order_index: number;
  pillar_id: string;
  pillar_name: string;
  topic_name: string;
}

export interface SkillDetailState {
  node: SkillNodeDetail | null;
  prerequisites: PrerequisiteDetail[];
  resources: ResourceItem[];
  status: NodeStatus;
  is_locked: boolean;
  unmet_prerequisites: string[];
  isLoading: boolean;
  error: string | null;
}
