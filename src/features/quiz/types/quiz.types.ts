import { NodeStatus } from '../../track/types/track.types';

export interface QuizQuestion {
  question_id: string;
  node_id: string;
  question_text: string;
  options: string[];
}

export interface QuizAttemptResult {
  attempt_id: string;
  score: number;
  passed: boolean;
  status: NodeStatus;
}

export type QuizLifecycleState =
  | 'loading'
  | 'unauthorized'
  | 'idle'
  | 'in_progress'
  | 'submitting'
  | 'result'
  | 'error';

export interface QuizSkillContext {
  nodeId: string;
  name: string;
  pillarId: string;
  pillarName: string;
  nextNodeId: string | null;
  nextNodeName: string | null;
}
