-- 0003_prerequisites_resources_quiz.sql
-- Tables: node_prerequisites, resources, quiz_questions, quiz_answers

CREATE TABLE IF NOT EXISTS public.node_prerequisites (
  node_id TEXT NOT NULL REFERENCES public.skill_nodes(node_id) ON DELETE CASCADE,
  prerequisite_node_id TEXT NOT NULL REFERENCES public.skill_nodes(node_id) ON DELETE CASCADE,
  PRIMARY KEY (node_id, prerequisite_node_id),
  CHECK (node_id != prerequisite_node_id)
);

CREATE TABLE IF NOT EXISTS public.resources (
  resource_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id TEXT NOT NULL REFERENCES public.skill_nodes(node_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN (
      'documentation',
      'article',
      'course',
      'video',
      'book',
      'tutorial',
      'practice'
    )
  ),
  tag TEXT NOT NULL CHECK (
    tag IN (
      'start_here',
      'alternative',
      'practice',
      'reference'
    )
  ),
  why TEXT,
  order_index INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS one_start_here_per_node
ON public.resources (node_id)
WHERE tag = 'start_here';

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id TEXT NOT NULL REFERENCES public.skill_nodes(node_id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  CHECK (jsonb_array_length(options) = 4)
);

CREATE TABLE IF NOT EXISTS public.quiz_answers (
  question_id UUID PRIMARY KEY REFERENCES public.quiz_questions(question_id) ON DELETE CASCADE,
  correct_index INTEGER NOT NULL CHECK (correct_index BETWEEN 0 AND 3)
);
