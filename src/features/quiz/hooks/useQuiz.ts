import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/hooks/useAuth';
import { NodeStatus } from '../../track/types/track.types';
import { isNodeLocked } from '../../track/utils/progression';
import { QuizAttemptResult, QuizLifecycleState, QuizQuestion, QuizSkillContext } from '../types/quiz.types';
import { sampleQuestions } from '../utils/sampling';

export interface UseQuizResult {
  state: QuizLifecycleState;
  skillContext: QuizSkillContext | null;
  questionPool: QuizQuestion[];
  servedQuestions: QuizQuestion[];
  currentIndex: number;
  selectedAnswers: (number | null)[];
  result: QuizAttemptResult | null;
  error: string | null;
  isSubmitting: boolean;
  startQuiz: () => void;
  selectOption: (index: number) => void;
  nextQuestion: () => void;
  submitQuiz: () => Promise<void>;
  retryQuiz: () => void;
}

export function useQuiz(nodeId: string | undefined): UseQuizResult {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState<QuizLifecycleState>('loading');
  const [skillContext, setSkillContext] = useState<QuizSkillContext | null>(null);
  const [questionPool, setQuestionPool] = useState<QuizQuestion[]>([]);
  const [servedQuestions, setServedQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([null, null, null, null, null]);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadQuizData = useCallback(async () => {
    if (!user || !nodeId) {
      if (isMounted.current) setState('loading');
      return;
    }

    try {
      if (isMounted.current) {
        setState('loading');
        setError(null);
      }

      // 1. Fetch node context and prerequisites
      const [nodeRes, prereqsRes, allProgressRes] = await Promise.all([
        supabase
          .from('skill_nodes')
          .select(`
            node_id,
            name,
            subtopics:parent_subtopic_id (
              name,
              topics:topic_id (
                name,
                pillars:pillar_id (
                  pillar_id,
                  name
                )
              )
            ),
            topics:parent_topic_id (
              name,
              pillars:pillar_id (
                pillar_id,
                name
              )
            )
          `)
          .eq('node_id', nodeId)
          .maybeSingle(),
        supabase.from('node_prerequisites').select('prerequisite_node_id').eq('node_id', nodeId),
        supabase.from('user_node_progress').select('node_id, status').eq('user_id', user.id),
      ]);

      if (nodeRes.error) throw nodeRes.error;
      if (!nodeRes.data) {
        throw new Error(`Skill node '${nodeId}' not found.`);
      }

      const progressMap = new Map<string, NodeStatus>();
      (allProgressRes.data || []).forEach((p) => progressMap.set(p.node_id, p.status as NodeStatus));

      const currentStatus = progressMap.get(nodeId);
      const prereqIds = (prereqsRes.data || []).map((r) => r.prerequisite_node_id);
      const isLocked = isNodeLocked(prereqIds, progressMap);

      // Access Gate: Node must be opened (status exists) and not locked
      if (!currentStatus || isLocked) {
        console.warn(`[useQuiz] Access gate blocked for node ${nodeId}. Status: ${currentStatus}, Locked: ${isLocked}`);
        if (isMounted.current) {
          setState('unauthorized');
        }
        navigate(`/app/node/${encodeURIComponent(nodeId)}`, { replace: true });
        return;
      }

      // Extract hierarchy
      const nodeAny = nodeRes.data as any;
      let pillarId = '';
      let pillarName = '';
      if (nodeAny.subtopics?.topics?.pillars) {
        pillarId = nodeAny.subtopics.topics.pillars.pillar_id;
        pillarName = nodeAny.subtopics.topics.pillars.name;
      } else if (nodeAny.topics?.pillars) {
        pillarId = nodeAny.topics.pillars.pillar_id;
        pillarName = nodeAny.topics.pillars.name;
      }

      // 2. Fetch question pool (ZERO correct_index leak: selecting only public question text and options)
      const { data: questionsData, error: qErr } = await supabase
        .from('quiz_questions')
        .select('question_id, node_id, question_text, options')
        .eq('node_id', nodeId);

      if (qErr) throw qErr;
      if (!questionsData || questionsData.length === 0) {
        throw new Error('No quiz questions found for this skill.');
      }

      // 3. Resolve next node in pillar for completion CTA
      let nextNodeId: string | null = null;
      let nextNodeName: string | null = null;

      if (pillarId) {
        // Query sibling nodes to find next node
        const { data: siblingNodes } = await supabase
          .from('skill_nodes')
          .select(`
            node_id,
            name,
            order_index,
            subtopics:parent_subtopic_id (
              order_index,
              topics:topic_id (
                pillar_id,
                order_index
              )
            ),
            topics:parent_topic_id (
              pillar_id,
              order_index
            )
          `);

        const pillarNodes = (siblingNodes || []).filter((sn: any) => {
          const pId = sn.subtopics?.topics?.pillar_id || sn.topics?.pillar_id;
          return pId === pillarId;
        });

        // Find next node in list
        const currentIndexInPillar = pillarNodes.findIndex((n) => n.node_id === nodeId);
        if (currentIndexInPillar >= 0 && currentIndexInPillar < pillarNodes.length - 1) {
          const nextNode = pillarNodes[currentIndexInPillar + 1];
          nextNodeId = nextNode.node_id;
          nextNodeName = nextNode.name;
        }
      }

      const formattedQuestions: QuizQuestion[] = questionsData.map((q: any) => ({
        question_id: q.question_id,
        node_id: q.node_id,
        question_text: q.question_text,
        options: Array.isArray(q.options) ? q.options : [],
      }));

      if (isMounted.current) {
        setSkillContext({
          nodeId,
          name: nodeRes.data.name,
          pillarId,
          pillarName,
          nextNodeId,
          nextNodeName,
        });
        setQuestionPool(formattedQuestions);
        setState('idle');
      }
    } catch (err: any) {
      console.error('Error loading quiz data:', err);
      if (isMounted.current) {
        setError(err.message || 'Unable to load quiz checkpoint.');
        setState('error');
      }
    }
  }, [user, nodeId, navigate]);

  useEffect(() => {
    loadQuizData();
  }, [loadQuizData]);

  // Actions
  const startQuiz = useCallback(() => {
    if (questionPool.length === 0) return;
    const sampled = sampleQuestions(questionPool, 5);
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

  const nextQuestion = useCallback(() => {
    if (currentIndex < servedQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, servedQuestions.length]);

  const submitQuiz = useCallback(async () => {
    if (!nodeId || servedQuestions.length !== 5) return;

    // Validate that all 5 answers are selected
    if (selectedAnswers.some((a) => a === null)) {
      setError('Please answer all 5 questions before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      setState('submitting');
      setError(null);

      const questionIds = servedQuestions.map((q) => q.question_id);
      const answerIndices = selectedAnswers as number[];

      const { data, error: rpcErr } = await supabase.rpc('submit_quiz_attempt', {
        p_node_id: nodeId,
        p_question_ids: questionIds,
        p_answers: answerIndices,
      });

      if (rpcErr) throw rpcErr;

      if (isMounted.current) {
        setResult(data as QuizAttemptResult);
        setState('result');
      }
    } catch (err: any) {
      console.error('Error submitting quiz attempt:', err);
      if (isMounted.current) {
        setError(err.message || 'Failed to submit quiz attempt. Please try again.');
        setState('in_progress');
      }
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  }, [nodeId, servedQuestions, selectedAnswers]);

  const retryQuiz = useCallback(() => {
    startQuiz();
  }, [startQuiz]);

  return {
    state,
    skillContext,
    questionPool,
    servedQuestions,
    currentIndex,
    selectedAnswers,
    result,
    error,
    isSubmitting,
    startQuiz,
    selectOption,
    nextQuestion,
    submitQuiz,
    retryQuiz,
  };
}
