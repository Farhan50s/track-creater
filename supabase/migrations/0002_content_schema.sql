-- 0002_content_schema.sql
-- Content tables: tracks, pillars, topics, subtopics, skill_nodes

CREATE TABLE IF NOT EXISTS public.tracks (
  track_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pillars (
  pillar_id TEXT PRIMARY KEY,
  track_id TEXT NOT NULL REFERENCES public.tracks(track_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  UNIQUE (track_id, order_index)
);

CREATE TABLE IF NOT EXISTS public.topics (
  topic_id TEXT PRIMARY KEY,
  pillar_id TEXT NOT NULL REFERENCES public.pillars(pillar_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  UNIQUE (pillar_id, order_index)
);

CREATE TABLE IF NOT EXISTS public.subtopics (
  subtopic_id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL REFERENCES public.topics(topic_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  UNIQUE (topic_id, order_index)
);

CREATE TABLE IF NOT EXISTS public.skill_nodes (
  node_id TEXT PRIMARY KEY,
  parent_subtopic_id TEXT REFERENCES public.subtopics(subtopic_id) ON DELETE CASCADE,
  parent_topic_id TEXT REFERENCES public.topics(topic_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  classification TEXT NOT NULL CHECK (
    classification IN (
      'required',
      'recommended',
      'optional',
      'specialization'
    )
  ),
  recommended_depth TEXT NOT NULL CHECK (
    recommended_depth IN (
      'overview',
      'practical',
      'implementation',
      'advanced'
    )
  ),
  estimated_time_minutes INTEGER NOT NULL CHECK (estimated_time_minutes > 0),
  one_sentence_definition TEXT NOT NULL,
  why_it_matters TEXT NOT NULL,
  quick_overview TEXT NOT NULL,
  deep_dive TEXT,
  content_version INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (parent_subtopic_id IS NOT NULL)::int +
    (parent_topic_id IS NOT NULL)::int = 1
  )
);
