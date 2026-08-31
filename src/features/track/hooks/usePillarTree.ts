import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/hooks/useAuth';
import { NodeStatus, SkillNodeWithMeta, SubtopicWithNodes, TopicWithHierarchy } from '../types/track.types';
import { calculatePillarPercent, computeCurrentFocus, getTreeOrder, isNodeLocked, getUnmetPrerequisites, resolvePrerequisiteNames } from '../utils/progression';

export interface PillarTreeResult {
  pillarId: string;
  pillarName: string;
  pillarDescription: string;
  topics: TopicWithHierarchy[];
  allNodes: SkillNodeWithMeta[];
  currentFocusNodeId: string | null;
  completionPercent: number;
  totalNodeCount: number;
  requiredNodeCount: number;
  completedRequiredCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePillarTree(pillarId: string | undefined): PillarTreeResult {
  const { user } = useAuth();

  const [pillarName, setPillarName] = useState<string>('');
  const [pillarDescription, setPillarDescription] = useState<string>('');
  const [topics, setTopics] = useState<TopicWithHierarchy[]>([]);
  const [allNodes, setAllNodes] = useState<SkillNodeWithMeta[]>([]);
  const [currentFocusNodeId, setCurrentFocusNodeId] = useState<string | null>(null);
  const [completionPercent, setCompletionPercent] = useState<number>(0);
  const [totalNodeCount, setTotalNodeCount] = useState<number>(0);
  const [requiredNodeCount, setRequiredNodeCount] = useState<number>(0);
  const [completedRequiredCount, setCompletedRequiredCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPillarTree = useCallback(async () => {
    if (!user || !pillarId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch pillar info
      const { data: pillarData, error: pillarErr } = await supabase
        .from('pillars')
        .select('pillar_id, track_id, name, description')
        .eq('pillar_id', pillarId)
        .maybeSingle();

      if (pillarErr) throw pillarErr;
      if (!pillarData) {
        throw new Error(`Pillar '${pillarId}' not found.`);
      }

      setPillarName(pillarData.name);
      setPillarDescription(pillarData.description);

      // 2. Fetch topics, subtopics, ALL skill nodes for name resolution, prerequisites, and TRACK-WIDE user progress
      const [topicsRes, subtopicsRes, allNodesRes, prereqsRes, progressRes] = await Promise.all([
        supabase.from('topics').select('topic_id, pillar_id, name, order_index').eq('pillar_id', pillarId).order('order_index', { ascending: true }),
        supabase.from('subtopics').select('subtopic_id, topic_id, name, order_index'),
        supabase.from('skill_nodes').select('node_id, parent_subtopic_id, parent_topic_id, name, classification, recommended_depth, estimated_time_minutes, order_index'),
        supabase.from('node_prerequisites').select('node_id, prerequisite_node_id'),
        // TRACK-WIDE progress: Fetch all user progress rows so cross-pillar dependencies are accurately resolved!
        supabase.from('user_node_progress').select('node_id, status').eq('user_id', user.id),
      ]);

      if (topicsRes.error) throw topicsRes.error;
      if (allNodesRes.error) throw allNodesRes.error;

      // Build name map for all nodes in system for friendly prerequisite hints
      const nodeNameMap = new Map<string, string>();
      (allNodesRes.data || []).forEach((n) => {
        nodeNameMap.set(n.node_id, n.name);
      });

      // Build prerequisite map: node_id -> [prerequisite_node_id]
      const prereqMap = new Map<string, string[]>();
      (prereqsRes.data || []).forEach((row) => {
        const existing = prereqMap.get(row.node_id) || [];
        existing.push(row.prerequisite_node_id);
        prereqMap.set(row.node_id, existing);
      });

      // Build track-wide progress map: node_id -> status
      const progressMap = new Map<string, NodeStatus>();
      (progressRes.data || []).forEach((row) => {
        progressMap.set(row.node_id, row.status as NodeStatus);
      });

      const rawTopics = topicsRes.data || [];
      const rawSubtopics = subtopicsRes.data || [];
      const rawNodes = allNodesRes.data || [];

      // Build meta map for nodes in this pillar
      const pillarNodesMeta = new Map<string, SkillNodeWithMeta>();
      rawNodes.forEach((node) => {
        const prereqs = prereqMap.get(node.node_id) || [];
        const status = progressMap.get(node.node_id) || 'not_started';
        const is_locked = isNodeLocked(prereqs, progressMap);
        const unmet_prerequisites = getUnmetPrerequisites(prereqs, progressMap);
        const unmet_prerequisite_names = resolvePrerequisiteNames(unmet_prerequisites, nodeNameMap);

        pillarNodesMeta.set(node.node_id, {
          ...node,
          prerequisites: prereqs,
          status,
          is_locked,
          unmet_prerequisites,
          unmet_prerequisite_names,
          is_current_focus: false,
        });
      });

      // Structure topics -> subtopics -> nodes
      const structuredTopics: TopicWithHierarchy[] = rawTopics.map((topic) => {
        const topicSubtopics = rawSubtopics
          .filter((s) => s.topic_id === topic.topic_id)
          .sort((a, b) => a.order_index - b.order_index);

        const subtopicsWithNodes: SubtopicWithNodes[] = topicSubtopics.map((st) => {
          const stNodes = rawNodes
            .filter((n) => n.parent_subtopic_id === st.subtopic_id)
            .map((n) => pillarNodesMeta.get(n.node_id)!)
            .filter(Boolean)
            .sort((a, b) => a.order_index - b.order_index);

          return {
            ...st,
            nodes: stNodes,
          };
        });

        const directTopicNodes = rawNodes
          .filter((n) => n.parent_topic_id === topic.topic_id && !n.parent_subtopic_id)
          .map((n) => pillarNodesMeta.get(n.node_id)!)
          .filter(Boolean)
          .sort((a, b) => a.order_index - b.order_index);

        const allTopicNodes = [
          ...directTopicNodes,
          ...subtopicsWithNodes.flatMap((s) => s.nodes),
        ];

        return {
          ...topic,
          subtopics: subtopicsWithNodes,
          direct_nodes: directTopicNodes,
          all_nodes: allTopicNodes,
        };
      });

      // Get ordered nodes for tree traversal and current focus calculation
      const orderedPillarNodes = getTreeOrder(structuredTopics);
      const focusNodeId = computeCurrentFocus(orderedPillarNodes, progressMap);
      setCurrentFocusNodeId(focusNodeId);

      // Flag the current focus node on the meta objects
      if (focusNodeId) {
        orderedPillarNodes.forEach((node) => {
          if (node.node_id === focusNodeId) {
            node.is_current_focus = true;
          }
        });
      }

      const requiredNodes = orderedPillarNodes.filter((n) => n.classification === 'required');
      const completedRequired = requiredNodes.filter((n) => progressMap.get(n.node_id) === 'completed');
      const percent = calculatePillarPercent(orderedPillarNodes, progressMap);

      setTopics(structuredTopics);
      setAllNodes(orderedPillarNodes);
      setCompletionPercent(percent);
      setTotalNodeCount(orderedPillarNodes.length);
      setRequiredNodeCount(requiredNodes.length);
      setCompletedRequiredCount(completedRequired.length);
    } catch (err: any) {
      console.error('Error loading pillar tree data:', err);
      setError(err.message || 'Unable to load pillar tree.');
    } finally {
      setIsLoading(false);
    }
  }, [user, pillarId]);

  useEffect(() => {
    fetchPillarTree();
  }, [fetchPillarTree]);

  return {
    pillarId: pillarId || '',
    pillarName,
    pillarDescription,
    topics,
    allNodes,
    currentFocusNodeId,
    completionPercent,
    totalNodeCount,
    requiredNodeCount,
    completedRequiredCount,
    isLoading,
    error,
    refetch: fetchPillarTree,
  };
}
