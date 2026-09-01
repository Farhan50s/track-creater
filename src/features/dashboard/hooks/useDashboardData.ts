import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/hooks/useAuth';
import { NodeStatus, SkillNodeWithMeta, TopicWithHierarchy } from '../../track/types/track.types';
import { calculatePillarPercent, computeCurrentFocus, getTreeOrder, isNodeLocked, getUnmetPrerequisites } from '../../track/utils/progression';
import { DashboardData, PillarProgressSummary } from '../types/dashboard.types';
import { computeFocusPillar, computeRecommendedAction } from '../utils/recommendations';

export function useDashboardData(): DashboardData {
  const { user } = useAuth();

  const [trackId, setTrackId] = useState<string | null>(null);
  const [trackName, setTrackName] = useState<string>('');
  const [trackDescription, setTrackDescription] = useState<string>('');
  const [overallCompletionPercent, setOverallCompletionPercent] = useState<number>(0);
  const [totalRequiredSkills, setTotalRequiredSkills] = useState<number>(0);
  const [completedRequiredSkills, setCompletedRequiredSkills] = useState<number>(0);
  const [totalSkills, setTotalSkills] = useState<number>(0);
  const [pillars, setPillars] = useState<PillarProgressSummary[]>([]);
  const [activePillars, setActivePillars] = useState<PillarProgressSummary[]>([]);
  const [focusPillar, setFocusPillar] = useState<PillarProgressSummary | null>(null);
  const [recommendedAction, setRecommendedAction] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchDashboard = useCallback(async () => {
    if (!user) {
      if (isMounted.current) setIsLoading(false);
      return;
    }

    try {
      if (isMounted.current) {
        setIsLoading(true);
        setError(null);
      }

      // 1. Fetch user active track
      const { data: activeTrackData, error: activeErr } = await supabase
        .from('user_active_track')
        .select('track_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (activeErr) throw activeErr;
      if (!activeTrackData) {
        if (isMounted.current) {
          setTrackId(null);
          setIsLoading(false);
        }
        return;
      }

      const activeTrackId = activeTrackData.track_id;
      if (isMounted.current) setTrackId(activeTrackId);

      // 2. Fetch track data, pillars, topics, subtopics, nodes, prereqs, progress
      const [trackRes, pillarsRes, topicsRes, subtopicsRes, nodesRes, prereqsRes, progressRes] =
        await Promise.all([
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

      if (isMounted.current && trackRes.data) {
        setTrackName(trackRes.data.name);
        setTrackDescription(trackRes.data.description);
      }

      // Build prereq and progress maps
      const prereqMap = new Map<string, string[]>();
      (prereqsRes.data || []).forEach((r) => {
        const existing = prereqMap.get(r.node_id) || [];
        existing.push(r.prerequisite_node_id);
        prereqMap.set(r.node_id, existing);
      });

      const progressMap = new Map<string, NodeStatus>();
      (progressRes.data || []).forEach((p) => {
        progressMap.set(p.node_id, p.status as NodeStatus);
      });

      const rawPillars = pillarsRes.data || [];
      const rawTopics = topicsRes.data || [];
      const rawSubtopics = subtopicsRes.data || [];
      const rawNodes = nodesRes.data || [];

      // Build node map
      const allNodesMetaMap = new Map<string, SkillNodeWithMeta>();
      rawNodes.forEach((node) => {
        const prereqs = prereqMap.get(node.node_id) || [];
        const status = progressMap.get(node.node_id) || 'not_started';
        const locked = isNodeLocked(prereqs, progressMap);
        const unmet = getUnmetPrerequisites(prereqs, progressMap);

        allNodesMetaMap.set(node.node_id, {
          node_id: node.node_id,
          parent_subtopic_id: node.parent_subtopic_id,
          parent_topic_id: node.parent_topic_id,
          name: node.name,
          classification: node.classification as any,
          recommended_depth: node.recommended_depth as any,
          estimated_time_minutes: node.estimated_time_minutes,
          order_index: node.order_index,
          prerequisites: prereqs,
          status,
          is_locked: locked,
          unmet_prerequisites: unmet,
          is_current_focus: false,
        });
      });

      // Build hierarchical summaries for each pillar
      const pillarSummaries: PillarProgressSummary[] = [];

      for (const pillar of rawPillars) {
        const pillarTopics = rawTopics
          .filter((t) => t.pillar_id === pillar.pillar_id)
          .sort((a, b) => a.order_index - b.order_index);

        const structuredTopics: TopicWithHierarchy[] = pillarTopics.map((topic) => {
          const directNodes = rawNodes
            .filter((n) => n.parent_topic_id === topic.topic_id && !n.parent_subtopic_id)
            .map((n) => allNodesMetaMap.get(n.node_id)!)
            .filter(Boolean);

          const topicSubtopics = rawSubtopics
            .filter((st) => st.topic_id === topic.topic_id)
            .sort((a, b) => a.order_index - b.order_index)
            .map((st) => {
              const stNodes = rawNodes
                .filter((n) => n.parent_subtopic_id === st.subtopic_id)
                .map((n) => allNodesMetaMap.get(n.node_id)!)
                .filter(Boolean);

              return {
                subtopic_id: st.subtopic_id,
                topic_id: st.topic_id,
                name: st.name,
                order_index: st.order_index,
                nodes: stNodes,
              };
            });

          const allTopicNodes = [...directNodes, ...topicSubtopics.flatMap((st) => st.nodes)];

          return {
            topic_id: topic.topic_id,
            pillar_id: topic.pillar_id,
            name: topic.name,
            order_index: topic.order_index,
            direct_nodes: directNodes,
            subtopics: topicSubtopics,
            all_nodes: allTopicNodes,
          };
        });

        // Compute depth-first tree order for the pillar
        const pillarNodesInTreeOrder = getTreeOrder(structuredTopics);
        const completionPercent = calculatePillarPercent(pillarNodesInTreeOrder, progressMap);
        const focusNodeId = computeCurrentFocus(pillarNodesInTreeOrder, progressMap);
        const focusNode = focusNodeId ? allNodesMetaMap.get(focusNodeId) : null;

        const requiredNodes = pillarNodesInTreeOrder.filter((n) => n.classification === 'required');
        const completedRequired = requiredNodes.filter((n) => progressMap.get(n.node_id) === 'completed');

        pillarSummaries.push({
          pillarId: pillar.pillar_id,
          name: pillar.name,
          description: pillar.description,
          orderIndex: pillar.order_index,
          completionPercent,
          totalSkillCount: pillarNodesInTreeOrder.length,
          requiredCount: requiredNodes.length,
          completedRequiredCount: completedRequired.length,
          currentFocusNodeId: focusNodeId,
          currentFocusNodeName: focusNode ? focusNode.name : null,
          nodes: pillarNodesInTreeOrder,
        });
      }

      // Collect all nodes belonging strictly to the active track's pillars
      const activeTrackNodes = pillarSummaries.flatMap((p) => p.nodes);
      const activeTrackNodesMap = new Map<string, SkillNodeWithMeta>();
      activeTrackNodes.forEach((n) => activeTrackNodesMap.set(n.node_id, n));

      // Compute overall track required metrics strictly from active track
      const allRequiredNodes = activeTrackNodes.filter((n) => n.classification === 'required');
      const allCompletedRequired = allRequiredNodes.filter((n) => progressMap.get(n.node_id) === 'completed');
      const overallPercent =
        allRequiredNodes.length > 0
          ? Math.round((allCompletedRequired.length / allRequiredNodes.length) * 100)
          : 0;

      // Compute Active Pillars (percent > 0 and < 100). Fallback to all incomplete pillars if none in progress
      const active = pillarSummaries.filter((p) => p.completionPercent > 0 && p.completionPercent < 100);

      // Compute Focus Pillar and Recommendation
      const resolvedFocusPillar = pillarSummaries.length > 0 ? computeFocusPillar(pillarSummaries) : null;
      const recAction = resolvedFocusPillar
        ? computeRecommendedAction(resolvedFocusPillar, pillarSummaries, activeTrackNodesMap, progressMap)
        : null;

      if (isMounted.current) {
        setPillars(pillarSummaries);
        setActivePillars(active.length > 0 ? active : pillarSummaries.filter((p) => p.completionPercent < 100));
        setFocusPillar(resolvedFocusPillar);
        setRecommendedAction(recAction);
        setOverallCompletionPercent(overallPercent);
        setTotalRequiredSkills(allRequiredNodes.length);
        setCompletedRequiredSkills(allCompletedRequired.length);
        setTotalSkills(activeTrackNodes.length);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      if (isMounted.current) {
        setError(err.message || 'Unable to load dashboard.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    trackId,
    trackName,
    trackDescription,
    overallCompletionPercent,
    totalRequiredSkills,
    completedRequiredSkills,
    totalSkills,
    pillars,
    activePillars,
    focusPillar,
    recommendedAction,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}
