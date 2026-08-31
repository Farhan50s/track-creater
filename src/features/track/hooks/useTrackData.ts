import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/hooks/useAuth';
import { NodeStatus, PillarSummary, SkillNodeWithMeta, TopicWithHierarchy } from '../types/track.types';
import { calculatePillarPercent, computeCurrentFocus, getTreeOrder, isNodeLocked, getUnmetPrerequisites } from '../utils/progression';

export interface TrackDataResult {
  trackId: string | null;
  trackName: string;
  trackDescription: string;
  pillars: PillarSummary[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTrackData(): TrackDataResult {
  const { user } = useAuth();

  const [trackId, setTrackId] = useState<string | null>(null);
  const [trackName, setTrackName] = useState<string>('');
  const [trackDescription, setTrackDescription] = useState<string>('');
  const [pillars, setPillars] = useState<PillarSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Get user's active track
      const { data: activeTrackData, error: activeErr } = await supabase
        .from('user_active_track')
        .select('track_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (activeErr) throw activeErr;
      if (!activeTrackData) {
        setTrackId(null);
        setPillars([]);
        setIsLoading(false);
        return;
      }

      const activeTrackId = activeTrackData.track_id;
      setTrackId(activeTrackId);

      // 2. Fetch track, pillars, topics, subtopics, skill_nodes, prerequisites, and user_node_progress in parallel
      const [trackRes, pillarsRes, topicsRes, subtopicsRes, nodesRes, prereqsRes, progressRes] = await Promise.all([
        supabase.from('tracks').select('track_id, name, description').eq('track_id', activeTrackId).maybeSingle(),
        supabase.from('pillars').select('pillar_id, track_id, name, description, order_index').eq('track_id', activeTrackId).order('order_index', { ascending: true }),
        supabase.from('topics').select('topic_id, pillar_id, name, order_index'),
        supabase.from('subtopics').select('subtopic_id, topic_id, name, order_index'),
        supabase.from('skill_nodes').select('node_id, parent_subtopic_id, parent_topic_id, name, classification, recommended_depth, estimated_time_minutes, order_index'),
        supabase.from('node_prerequisites').select('node_id, prerequisite_node_id'),
        supabase.from('user_node_progress').select('node_id, status').eq('user_id', user.id),
      ]);

      if (trackRes.error) throw trackRes.error;
      if (pillarsRes.error) throw pillarsRes.error;

      if (trackRes.data) {
        setTrackName(trackRes.data.name);
        setTrackDescription(trackRes.data.description);
      }

      // Build prerequisite map: node_id -> [prerequisite_node_id]
      const prereqMap = new Map<string, string[]>();
      (prereqsRes.data || []).forEach((row) => {
        const existing = prereqMap.get(row.node_id) || [];
        existing.push(row.prerequisite_node_id);
        prereqMap.set(row.node_id, existing);
      });

      // Build user progress map: node_id -> status
      const progressMap = new Map<string, NodeStatus>();
      (progressRes.data || []).forEach((row) => {
        progressMap.set(row.node_id, row.status as NodeStatus);
      });

      const rawPillars = pillarsRes.data || [];
      const rawTopics = topicsRes.data || [];
      const rawSubtopics = subtopicsRes.data || [];
      const rawNodes = nodesRes.data || [];

      // Build node map
      const nodeMetaMap = new Map<string, SkillNodeWithMeta>();
      rawNodes.forEach((node) => {
        const prereqs = prereqMap.get(node.node_id) || [];
        const status = progressMap.get(node.node_id) || 'not_started';
        const is_locked = isNodeLocked(prereqs, progressMap);
        const unmet_prerequisites = getUnmetPrerequisites(prereqs, progressMap);

        nodeMetaMap.set(node.node_id, {
          ...node,
          prerequisites: prereqs,
          status,
          is_locked,
          unmet_prerequisites,
          is_current_focus: false,
        });
      });

      // Map topics & subtopics to pillars
      const pillarSummaries: PillarSummary[] = rawPillars.map((pillar) => {
        const pillarTopics = rawTopics
          .filter((t) => t.pillar_id === pillar.pillar_id)
          .sort((a, b) => a.order_index - b.order_index);

        const topicHierarchies: TopicWithHierarchy[] = pillarTopics.map((topic) => {
          const topicSubtopics = rawSubtopics
            .filter((s) => s.topic_id === topic.topic_id)
            .sort((a, b) => a.order_index - b.order_index);

          const subtopicsWithNodes = topicSubtopics.map((st) => {
            const stNodes = rawNodes
              .filter((n) => n.parent_subtopic_id === st.subtopic_id)
              .map((n) => nodeMetaMap.get(n.node_id)!)
              .filter(Boolean)
              .sort((a, b) => a.order_index - b.order_index);

            return {
              ...st,
              nodes: stNodes,
            };
          });

          const directTopicNodes = rawNodes
            .filter((n) => n.parent_topic_id === topic.topic_id && !n.parent_subtopic_id)
            .map((n) => nodeMetaMap.get(n.node_id)!)
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

        const orderedPillarNodes = getTreeOrder(topicHierarchies);
        const requiredNodes = orderedPillarNodes.filter((n) => n.classification === 'required');
        const completedRequired = requiredNodes.filter((n) => progressMap.get(n.node_id) === 'completed');
        const percent = calculatePillarPercent(orderedPillarNodes, progressMap);

        const focusNodeId = computeCurrentFocus(orderedPillarNodes, progressMap);
        const focusNodeName = focusNodeId ? nodeMetaMap.get(focusNodeId)?.name || null : null;

        // If focus is null and there are still incomplete required nodes, it means incomplete required nodes are blocked by prerequisites
        const hasIncompleteRequired = requiredNodes.some((n) => progressMap.get(n.node_id) !== 'completed');
        const isBlocked = hasIncompleteRequired && focusNodeId === null;

        return {
          pillar_id: pillar.pillar_id,
          track_id: pillar.track_id,
          name: pillar.name,
          description: pillar.description,
          order_index: pillar.order_index,
          totalNodeCount: orderedPillarNodes.length,
          requiredNodeCount: requiredNodes.length,
          completedRequiredCount: completedRequired.length,
          completionPercent: percent,
          currentFocusNodeId: focusNodeId,
          currentFocusNodeName: focusNodeName,
          isBlockedByPrereq: isBlocked,
        };
      });

      setPillars(pillarSummaries);
    } catch (err: any) {
      console.error('Error fetching track overview data:', err);
      setError('Unable to load track overview.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTrackData();
  }, [fetchTrackData]);

  return {
    trackId,
    trackName,
    trackDescription,
    pillars,
    isLoading,
    error,
    refetch: fetchTrackData,
  };
}
