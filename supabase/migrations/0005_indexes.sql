-- 0005_indexes.sql
-- Indexes for performance and relationships

CREATE INDEX IF NOT EXISTS idx_pillars_track
ON public.pillars(track_id);

CREATE INDEX IF NOT EXISTS idx_topics_pillar
ON public.topics(pillar_id);

CREATE INDEX IF NOT EXISTS idx_subtopics_topic
ON public.subtopics(topic_id);

CREATE INDEX IF NOT EXISTS idx_skill_nodes_subtopic
ON public.skill_nodes(parent_subtopic_id);

CREATE INDEX IF NOT EXISTS idx_skill_nodes_topic
ON public.skill_nodes(parent_topic_id);

CREATE INDEX IF NOT EXISTS idx_node_prerequisites_prerequisite
ON public.node_prerequisites(prerequisite_node_id);

CREATE INDEX IF NOT EXISTS idx_resources_node
ON public.resources(node_id);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_node
ON public.quiz_questions(node_id);

CREATE INDEX IF NOT EXISTS idx_progress_user
ON public.user_node_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_attempts_user_node
ON public.quiz_attempts(user_id, node_id);

CREATE INDEX IF NOT EXISTS idx_attempts_node_submitted
ON public.quiz_attempts(node_id, submitted_at);
