-- 0004_user_schema.sql
-- User tables: profiles, user_active_track, user_pillar_self_report, user_node_progress, quiz_attempts

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_active_track (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL REFERENCES public.tracks(track_id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_pillar_self_report (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar_id TEXT NOT NULL REFERENCES public.pillars(pillar_id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (
    level IN (
      'dont_know',
      'beginner',
      'intermediate',
      'advanced'
    )
  ),
  PRIMARY KEY (user_id, pillar_id)
);

CREATE TABLE IF NOT EXISTS public.user_node_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL REFERENCES public.skill_nodes(node_id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (
    status IN (
      'in_progress',
      'completed'
    )
  ),
  first_opened_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  last_quiz_score INTEGER CHECK (last_quiz_score BETWEEN 0 AND 5),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, node_id)
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  attempt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL REFERENCES public.skill_nodes(node_id) ON DELETE CASCADE,
  questions_served JSONB NOT NULL,
  answers_selected JSONB NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 5),
  passed BOOLEAN NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
