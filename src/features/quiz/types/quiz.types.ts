import { NodeStatus } from '../../track/types/track.types';

export interface QuizQuestion {
  question_id: string;
  node_id: string;
  question_text: string;
  options: string[];
}

export interface QuestionReviewItem {
  question_id: string;
  question_text: string;
  options: string[];
  selected_index: number;
  correct_index: number;
  is_correct: boolean;
  explanation: string;
}

export interface QuizSubmissionResponse {
  attempt_id: string;
  score: number;
  total_questions: number;
  passed: boolean;
  status?: NodeStatus;
  review?: QuestionReviewItem[];
}

export interface QuizAttemptResult {
  attempt_id: string;
  score: number;
  passed: boolean;
  status: NodeStatus;
  total_questions?: number;
  review?: QuestionReviewItem[];
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
