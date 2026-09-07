import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/hooks/useAuth';
import { NodeStatus } from '../../track/types/track.types';
import {
  QuizQuestion,
  DiagnosticSubmissionResult,
  QuestionReviewItem,
} from '../types/quiz.types';
import { sampleTopicDiagnosticQuestions } from '../utils/diagnosticSampling';
import { explanationsCatalog } from '../utils/explanationsCatalog';

export type DiagnosticLifecycleState =
  | 'loading'
  | 'unauthorized'
  | 'ready'
  | 'in_progress'
  | 'submitting'
  | 'result'
  | 'error';

export interface TopicChildNode {
  node_id: string;
  name: string;
  status: NodeStatus | 'not_started';
}

export interface TopicDiagnosticContext {
  topicId: string;
  topicName: string;
  pillarId: string;
  pillarName: string;
  childNodes: TopicChildNode[];
  allCompleted: boolean;
}

export interface UseTopicDiagnosticResult {
  state: DiagnosticLifecycleState;
  context: TopicDiagnosticContext | null;
  questionPool: QuizQuestion[];
  servedQuestions: QuizQuestion[];
  currentIndex: number;
  selectedAnswers: (number | null)[];
  result: DiagnosticSubmissionResult | null;
  error: string | null;
  isSubmitting: boolean;
  answeredCount: number;
  startDiagnostic: () => void;
  selectOption: (index: number) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitDiagnostic: () => Promise<void>;
  retryDiagnostic: () => void;
}

export function useTopicDiagnostic(topicId: string | undefined): UseTopicDiagnosticResult {
  const { user } = useAuth();

  const [state, setState] = useState<DiagnosticLifecycleState>('loading');
  const [context, setContext] = useState<TopicDiagnosticContext | null>(null);
  const [questionPool, setQuestionPool] = useState<QuizQuestion[]>([]);
  const [servedQuestions, setServedQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<DiagnosticSubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadTopicData = useCallback(async () => {
    if (!user || !topicId) {
      if (isMounted.current) setState('loading');
      return;
    }

    try {
      if (isMounted.current) {
        setState('loading');
        setError(null);
      }

      // 1. Fetch topic & pillar details
      const { data: topicData, error: topicErr } = await supabase
        .from('topics')
        .select(`
          topic_id,
          name,
          pillar_id,
          pillars:pillar_id (
            pillar_id,
            name
          )
        `)
        .eq('topic_id', topicId)
        .maybeSingle();

      if (topicErr) throw topicErr;
      if (!topicData) {
        throw new Error(`Topic '${topicId}' not found.`);
      }

      // 2. Fetch subtopics under this topic
      const { data: subtopicsData, error: subErr } = await supabase
        .from('subtopics')
        .select('subtopic_id, name')
        .eq('topic_id', topicId);

      if (subErr) throw subErr;
      const subtopicIds = (subtopicsData || []).map((s) => s.subtopic_id);

      // 3. Fetch all child nodes (direct nodes + subtopic nodes)
      const nodePromises = [
        supabase
          .from('skill_nodes')
          .select('node_id, name, parent_topic_id, parent_subtopic_id')
          .eq('parent_topic_id', topicId),
      ];

      if (subtopicIds.length > 0) {
        nodePromises.push(
          supabase
            .from('skill_nodes')
            .select('node_id, name, parent_topic_id, parent_subtopic_id')
            .in('parent_subtopic_id', subtopicIds)
        );
      }

      const nodeResults = await Promise.all(nodePromises);
      const rawNodes: Array<{ node_id: string; name: string }> = [];
      nodeResults.forEach((res) => {
        if (res.data) {
          rawNodes.push(...res.data);
        }
      });

      // Deduplicate nodes
      const uniqueNodeMap = new Map<string, string>();
      rawNodes.forEach((n) => uniqueNodeMap.set(n.node_id, n.name));
      const childNodeIds = Array.from(uniqueNodeMap.keys());

      if (childNodeIds.length === 0) {
        throw new Error(`Topic '${topicData.name}' has no registered skill nodes.`);
      }

      // 4. Fetch user's existing progress on these nodes
      const { data: progressData } = await supabase
        .from('user_node_progress')
        .select('node_id, status')
        .eq('user_id', user.id)
        .in('node_id', childNodeIds);

      const progressMap = new Map<string, NodeStatus>();
      (progressData || []).forEach((p) => {
        progressMap.set(p.node_id, p.status as NodeStatus);
      });

      const childNodes: TopicChildNode[] = childNodeIds.map((id) => ({
        node_id: id,
        name: uniqueNodeMap.get(id) || id,
        status: progressMap.get(id) || 'not_started',
      }));

      const allCompleted =
        childNodes.length > 0 &&
        childNodes.every((n) => n.status === 'completed');

      // 5. Fetch all quiz questions for all child nodes
      const { data: questionsData, error: qErr } = await supabase
        .from('quiz_questions')
        .select('question_id, node_id, question_text, options')
        .in('node_id', childNodeIds);

      if (qErr) throw qErr;

      const formattedQuestions: QuizQuestion[] = (questionsData || []).map((q: any) => ({
        question_id: q.question_id,
        node_id: q.node_id,
        question_text: q.question_text,
        options: Array.isArray(q.options)
          ? q.options
          : typeof q.options === 'string'
          ? JSON.parse(q.options)
          : [],
      }));

      if (formattedQuestions.length === 0) {
        throw new Error(`No quiz questions available for topic '${topicData.name}'.`);
      }

      const pillarObj = Array.isArray(topicData.pillars)
        ? topicData.pillars[0]
        : topicData.pillars;

      if (isMounted.current) {
        setContext({
          topicId: topicData.topic_id,
          topicName: topicData.name,
          pillarId: pillarObj?.pillar_id || topicData.pillar_id,
          pillarName: pillarObj?.name || 'Pillar',
          childNodes,
          allCompleted,
        });
        setQuestionPool(formattedQuestions);
        setState('ready');
      }
    } catch (err: any) {
      console.error('[useTopicDiagnostic] Error loading topic data:', err);
      if (isMounted.current) {
        setError(err.message || 'Unable to load topic diagnostic.');
        setState('error');
      }
    }
  }, [user, topicId]);

  useEffect(() => {
    loadTopicData();
  }, [loadTopicData]);

  // Actions
  const startDiagnostic = useCallback(() => {
    if (questionPool.length === 0) return;
    const sampled = sampleTopicDiagnosticQuestions(questionPool, 10);
    setServedQuestions(sampled);
    setCurrentIndex(0);
    setSelectedAnswers(new Array(sampled.length).fill(null));
    setResult(null);
    setState('in_progress');
  }, [questionPool]);

  const selectOption = useCallback((index: number) => {
    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = index;
      return next;
    });
  }, [currentIndex]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < servedQuestions.length) {
      setCurrentIndex(index);
    }
  }, [servedQuestions.length]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < servedQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, servedQuestions.length]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const submitDiagnostic = useCallback(async () => {
    if (!topicId || !user || servedQuestions.length === 0) return;

    if (selectedAnswers.some((a) => a === null)) {
      setError('Please answer all 10 questions before submitting the diagnostic exam.');
      return;
    }

    try {
      setIsSubmitting(true);
      setState('submitting');
      setError(null);

      const questionIds = servedQuestions.map((q) => q.question_id);
      const answerIndices = selectedAnswers as number[];

      // Try calling PostgreSQL RPC first
      const { data: rpcData, error: rpcErr } = await supabase.rpc(
        'submit_topic_diagnostic',
        {
          p_topic_id: topicId,
          p_question_ids: questionIds,
          p_answers: answerIndices,
        }
      );

      let finalResult: DiagnosticSubmissionResult;

      if (!rpcErr && rpcData && typeof rpcData.score === 'number') {
        finalResult = {
          topic_id: rpcData.topic_id || topicId,
          score: rpcData.score,
          total_questions: rpcData.total_questions || 10,
          passed: rpcData.passed,
          threshold: rpcData.threshold || 8,
          unlocked_node_count: rpcData.unlocked_node_count || 0,
          unlocked_nodes: rpcData.unlocked_nodes || [],
          review: rpcData.review || [],
        };
      } else {
        // Graceful client fallback using explanationsCatalog
        console.warn(
          '[useTopicDiagnostic] submit_topic_diagnostic RPC unavailable, executing fallback evaluation:',
          rpcErr?.message
        );

        let score = 0;
        const reviewList: QuestionReviewItem[] = servedQuestions.map((q, idx) => {
          const selectedIdx = answerIndices[idx] ?? 0;
          const catEntry = explanationsCatalog[q.question_text.trim()];
          const correctIdx = catEntry ? catEntry.correct_index : 0;
          const isCorrect = selectedIdx === correctIdx;
          if (isCorrect) score += 1;
          return {
            question_id: q.question_id,
            question_text: q.question_text,
            options: q.options,
            selected_index: selectedIdx,
            correct_index: correctIdx,
            is_correct: isCorrect,
            explanation: catEntry ? catEntry.explanation : '',
          };
        });

        const passed = score >= 8;
        const unlockedNodes: string[] = [];

        if (passed && context) {
          // Bulk upsert child nodes into user_node_progress
          const now = new Date().toISOString();
          for (const node of context.childNodes) {
            await supabase.from('user_node_progress').upsert(
              {
                user_id: user.id,
                node_id: node.node_id,
                status: 'completed',
                first_opened_at: now,
                completed_at: now,
                last_quiz_score: 5,
                updated_at: now,
              },
              { onConflict: 'user_id,node_id' }
            );
            unlockedNodes.push(node.node_id);
          }
        }

        finalResult = {
          topic_id: topicId,
          score,
          total_questions: servedQuestions.length,
          passed,
          threshold: 8,
          unlocked_node_count: unlockedNodes.length,
          unlocked_nodes: unlockedNodes,
          review: reviewList,
        };
      }

      if (isMounted.current) {
        setResult(finalResult);
        setState('result');
      }
    } catch (err: any) {
      console.error('[useTopicDiagnostic] Error submitting diagnostic:', err);
      if (isMounted.current) {
        setError(err.message || 'Failed to submit diagnostic exam.');
        setState('in_progress');
      }
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  }, [topicId, user, servedQuestions, selectedAnswers, context]);

  const retryDiagnostic = useCallback(() => {
    startDiagnostic();
  }, [startDiagnostic]);

  const answeredCount = selectedAnswers.filter((a) => a !== null).length;

  return {
    state,
    context,
    questionPool,
    servedQuestions,
    currentIndex,
    selectedAnswers,
    result,
    error,
    isSubmitting,
    answeredCount,
    startDiagnostic,
    selectOption,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitDiagnostic,
    retryDiagnostic,
  };
}
