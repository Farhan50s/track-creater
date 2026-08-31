import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/hooks/useAuth';
import { NodeStatus } from '../../track/types/track.types';
import { isNodeLocked, getUnmetPrerequisites } from '../../track/utils/progression';
import { PrerequisiteDetail, ResourceItem, SkillNodeDetail } from '../types/skill.types';

export interface UseSkillDetailResult {
  node: SkillNodeDetail | null;
  prerequisites: PrerequisiteDetail[];
  resources: ResourceItem[];
  status: NodeStatus;
  isLocked: boolean;
  unmetPrerequisites: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSkillDetail(nodeId: string | undefined): UseSkillDetailResult {
  const { user } = useAuth();

  const [node, setNode] = useState<SkillNodeDetail | null>(null);
  const [prerequisites, setPrerequisites] = useState<PrerequisiteDetail[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [status, setStatus] = useState<NodeStatus>('not_started');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [unmetPrerequisites, setUnmetPrerequisites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const hasTriggeredOpen = useRef<string | null>(null);

  const fetchSkillDetail = useCallback(async () => {
    if (!user || !nodeId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch node data with hierarchy context
      const { data: nodeData, error: nodeErr } = await supabase
        .from('skill_nodes')
        .select(`
          node_id,
          parent_subtopic_id,
          parent_topic_id,
          name,
          classification,
          recommended_depth,
          estimated_time_minutes,
          one_sentence_definition,
          why_it_matters,
          quick_overview,
          deep_dive,
          content_version,
          order_index,
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
        .maybeSingle();

      if (nodeErr) throw nodeErr;
      if (!nodeData) {
        throw new Error(`Skill node '${nodeId}' not found.`);
      }

      // Extract pillar and topic details
      let pillarId = '';
      let pillarName = '';
      let topicName = '';

      const nodeAny = nodeData as any;
      if (nodeAny.subtopics?.topics?.pillars) {
        pillarId = nodeAny.subtopics.topics.pillars.pillar_id;
        pillarName = nodeAny.subtopics.topics.pillars.name;
        topicName = nodeAny.subtopics.topics.name;
      } else if (nodeAny.topics?.pillars) {
        pillarId = nodeAny.topics.pillars.pillar_id;
        pillarName = nodeAny.topics.pillars.name;
        topicName = nodeAny.topics.name;
      }

      const formattedNode: SkillNodeDetail = {
        node_id: nodeData.node_id,
        parent_subtopic_id: nodeData.parent_subtopic_id,
        parent_topic_id: nodeData.parent_topic_id,
        name: nodeData.name,
        classification: nodeData.classification as any,
        recommended_depth: nodeData.recommended_depth as any,
        estimated_time_minutes: nodeData.estimated_time_minutes,
        one_sentence_definition: nodeData.one_sentence_definition,
        why_it_matters: nodeData.why_it_matters,
        quick_overview: nodeData.quick_overview,
        deep_dive: nodeData.deep_dive,
        content_version: nodeData.content_version,
        order_index: nodeData.order_index,
        pillar_id: pillarId,
        pillar_name: pillarName,
        topic_name: topicName,
      };

      setNode(formattedNode);

      // 2. Fetch direct prerequisites and all nodes (for name lookup)
      const [prereqsRes, allNodesRes, resourcesRes, progressRes] = await Promise.all([
        supabase.from('node_prerequisites').select('prerequisite_node_id').eq('node_id', nodeId),
        supabase.from('skill_nodes').select('node_id, name'),
        supabase.from('resources').select('*').eq('node_id', nodeId).order('order_index', { ascending: true }),
        // TRACK-WIDE progress for full prerequisite evaluation
        supabase.from('user_node_progress').select('node_id, status').eq('user_id', user.id),
      ]);

      if (prereqsRes.error) throw prereqsRes.error;
      if (resourcesRes.error) throw resourcesRes.error;

      // Build name lookup map
      const nodeNameMap = new Map<string, string>();
      (allNodesRes.data || []).forEach((n) => nodeNameMap.set(n.node_id, n.name));

      // Build progress map
      const progressMap = new Map<string, NodeStatus>();
      (progressRes.data || []).forEach((p) => progressMap.set(p.node_id, p.status as NodeStatus));

      // Compute prerequisites detail list
      const prereqIds = (prereqsRes.data || []).map((r) => r.prerequisite_node_id);
      const prereqDetails: PrerequisiteDetail[] = prereqIds.map((pId) => ({
        node_id: pId,
        name: nodeNameMap.get(pId) || pId,
        is_completed: progressMap.get(pId) === 'completed',
      }));

      setPrerequisites(prereqDetails);
      setResources((resourcesRes.data || []) as ResourceItem[]);

      // Compute lock state & current status
      const currentStatus = progressMap.get(nodeId) || 'not_started';
      const locked = isNodeLocked(prereqIds, progressMap);
      const unmet = getUnmetPrerequisites(prereqIds, progressMap);

      setStatus(currentStatus);
      setIsLocked(locked);
      setUnmetPrerequisites(unmet);

      // 3. Server Progress Trigger: Invoke mark_node_opened on mount if not already opened in this session
      if (hasTriggeredOpen.current !== nodeId && currentStatus !== 'completed') {
        hasTriggeredOpen.current = nodeId;
        try {
          await supabase.rpc('mark_node_opened', { p_node_id: nodeId });
          if (currentStatus === 'not_started') {
            setStatus('in_progress');
          }
        } catch (rpcErr) {
          console.warn('[useSkillDetail] mark_node_opened trigger warning:', rpcErr);
        }
      }
    } catch (err: any) {
      console.error('Error fetching skill detail:', err);
      setError(err.message || 'Unable to load skill details.');
    } finally {
      setIsLoading(false);
    }
  }, [user, nodeId]);

  useEffect(() => {
    fetchSkillDetail();
  }, [fetchSkillDetail]);

  return {
    node,
    prerequisites,
    resources,
    status,
    isLocked,
    unmetPrerequisites,
    isLoading,
    error,
    refetch: fetchSkillDetail,
  };
}
