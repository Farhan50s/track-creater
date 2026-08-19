-- 0006_rls.sql
-- Enable Row Level Security on all 14 tables and define policies

-- 1. Enable RLS on all tables
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_active_track ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pillar_self_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_node_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- 2. Content tables policies: SELECT for authenticated, no client writes
CREATE POLICY "Allow authenticated read on tracks"
ON public.tracks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on pillars"
ON public.pillars FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on topics"
ON public.topics FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on subtopics"
ON public.subtopics FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on skill_nodes"
ON public.skill_nodes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on node_prerequisites"
ON public.node_prerequisites FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on resources"
ON public.resources FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on quiz_questions"
ON public.quiz_questions FOR SELECT TO authenticated USING (true);

-- 3. quiz_answers: NO SELECT or client policy (explicit default deny with RLS enabled)

-- 4. User data tables policies
-- profiles: SELECT own row only, no client INSERT/UPDATE/DELETE
CREATE POLICY "Allow users to read own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- user_active_track: SELECT own row, INSERT own row, no UPDATE/DELETE
CREATE POLICY "Allow users to read own active track"
ON public.user_active_track FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own active track"
ON public.user_active_track FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- user_pillar_self_report: SELECT, INSERT, UPDATE own row, no DELETE
CREATE POLICY "Allow users to read own self report"
ON public.user_pillar_self_report FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own self report"
ON public.user_pillar_self_report FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own self report"
ON public.user_pillar_self_report FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- user_node_progress: SELECT own row only, RPC-only mutation
CREATE POLICY "Allow users to read own node progress"
ON public.user_node_progress FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- quiz_attempts: SELECT own row only, RPC-only mutation
CREATE POLICY "Allow users to read own quiz attempts"
ON public.quiz_attempts FOR SELECT TO authenticated
USING (auth.uid() = user_id);
