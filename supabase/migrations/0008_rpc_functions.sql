-- 0008_rpc_functions.sql
-- Trusted RPC functions: mark_node_opened, submit_quiz_attempt

-- 1. mark_node_opened(p_node_id TEXT)
CREATE OR REPLACE FUNCTION public.mark_node_opened(p_node_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_active_track_id TEXT;
  v_node_track_id TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT track_id INTO v_active_track_id
  FROM public.user_active_track
  WHERE user_id = v_user_id;

  IF v_active_track_id IS NULL THEN
    RAISE EXCEPTION 'User has no active track';
  END IF;

  SELECT COALESCE(p1.track_id, p2.track_id) INTO v_node_track_id
  FROM public.skill_nodes sn
  LEFT JOIN public.subtopics st ON sn.parent_subtopic_id = st.subtopic_id
  LEFT JOIN public.topics t1 ON st.topic_id = t1.topic_id
  LEFT JOIN public.pillars p1 ON t1.pillar_id = p1.pillar_id
  LEFT JOIN public.topics t2 ON sn.parent_topic_id = t2.topic_id
  LEFT JOIN public.pillars p2 ON t2.pillar_id = p2.pillar_id
  WHERE sn.node_id = p_node_id;

  IF v_node_track_id IS NULL THEN
    RAISE EXCEPTION 'Node does not exist: %', p_node_id;
  END IF;

  IF v_node_track_id != v_active_track_id THEN
    RAISE EXCEPTION 'Node does not belong to active track';
  END IF;

  INSERT INTO public.user_node_progress (
    user_id,
    node_id,
    status,
    first_opened_at,
    updated_at
  )
  VALUES (
    v_user_id,
    p_node_id,
    'in_progress',
    now(),
    now()
  )
  ON CONFLICT (user_id, node_id) DO NOTHING;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_node_opened(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_node_opened(TEXT) TO authenticated;


-- 2. submit_quiz_attempt(p_node_id TEXT, p_question_ids UUID[], p_answers INTEGER[])
CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
  p_node_id TEXT,
  p_question_ids UUID[],
  p_answers INTEGER[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_active_track_id TEXT;
  v_node_track_id TEXT;
  v_distinct_q_count INTEGER;
  v_node_q_count INTEGER;
  v_current_status TEXT;
  v_score INTEGER;
  v_passed BOOLEAN;
  v_attempt_id UUID;
BEGIN
  -- Gate 0 / 1: Identify user and active-track validation
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT track_id INTO v_active_track_id
  FROM public.user_active_track
  WHERE user_id = v_user_id;

  IF v_active_track_id IS NULL THEN
    RAISE EXCEPTION 'User has no active track';
  END IF;

  SELECT COALESCE(p1.track_id, p2.track_id) INTO v_node_track_id
  FROM public.skill_nodes sn
  LEFT JOIN public.subtopics st ON sn.parent_subtopic_id = st.subtopic_id
  LEFT JOIN public.topics t1 ON st.topic_id = t1.topic_id
  LEFT JOIN public.pillars p1 ON t1.pillar_id = p1.pillar_id
  LEFT JOIN public.topics t2 ON sn.parent_topic_id = t2.topic_id
  LEFT JOIN public.pillars p2 ON t2.pillar_id = p2.pillar_id
  WHERE sn.node_id = p_node_id;

  IF v_node_track_id IS NULL THEN
    RAISE EXCEPTION 'Node does not exist: %', p_node_id;
  END IF;

  IF v_node_track_id != v_active_track_id THEN
    RAISE EXCEPTION 'Node does not belong to active track';
  END IF;

  -- Gate 2: Structural validation
  IF p_question_ids IS NULL OR p_answers IS NULL OR
     cardinality(p_question_ids) != 5 OR cardinality(p_answers) != 5 THEN
    RAISE EXCEPTION 'Must provide exactly 5 questions and 5 answers';
  END IF;

  SELECT count(DISTINCT q) INTO v_distinct_q_count
  FROM unnest(p_question_ids) q;

  IF v_distinct_q_count != 5 THEN
    RAISE EXCEPTION 'Duplicate question IDs provided';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(p_answers) a
    WHERE a IS NULL OR a < 0 OR a > 3
  ) THEN
    RAISE EXCEPTION 'Answer indices must be between 0 and 3';
  END IF;

  -- Gate 3: Question ownership
  SELECT count(*) INTO v_node_q_count
  FROM public.quiz_questions
  WHERE node_id = p_node_id
    AND question_id = ANY(p_question_ids);

  IF v_node_q_count != 5 THEN
    RAISE EXCEPTION 'All questions must belong to the specified node';
  END IF;

  -- Gate 4: Quiz eligibility (node opened + prerequisites satisfied)
  SELECT status INTO v_current_status
  FROM public.user_node_progress
  WHERE user_id = v_user_id
    AND node_id = p_node_id;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Node must be opened before attempting quiz';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.node_prerequisites np
    WHERE np.node_id = p_node_id
      AND NOT EXISTS (
        SELECT 1
        FROM public.user_node_progress unp
        WHERE unp.user_id = v_user_id
          AND unp.node_id = np.prerequisite_node_id
          AND unp.status = 'completed'
      )
  ) THEN
    RAISE EXCEPTION 'Prerequisites not satisfied';
  END IF;

  -- Gate 5: Grading (server-side against quiz_answers)
  SELECT count(*)::int INTO v_score
  FROM unnest(p_question_ids, p_answers) WITH ORDINALITY AS u(qid, ans, ord)
  JOIN public.quiz_answers qa ON qa.question_id = u.qid
  WHERE qa.correct_index = u.ans;

  v_passed := (v_score >= 4);

  -- Gate 6: Attempt persistence
  INSERT INTO public.quiz_attempts (
    user_id,
    node_id,
    questions_served,
    answers_selected,
    score,
    passed,
    submitted_at
  )
  VALUES (
    v_user_id,
    p_node_id,
    to_jsonb(p_question_ids),
    to_jsonb(p_answers),
    v_score,
    v_passed,
    now()
  )
  RETURNING attempt_id INTO v_attempt_id;

  -- Gate 7 & 8: Progress transition and latest score update
  IF v_passed AND v_current_status != 'completed' THEN
    UPDATE public.user_node_progress
    SET
      status = 'completed',
      completed_at = now(),
      last_quiz_score = v_score,
      updated_at = now()
    WHERE user_id = v_user_id
      AND node_id = p_node_id;

    v_current_status := 'completed';
  ELSE
    UPDATE public.user_node_progress
    SET
      last_quiz_score = v_score,
      updated_at = now()
    WHERE user_id = v_user_id
      AND node_id = p_node_id;
  END IF;

  RETURN jsonb_build_object(
    'attempt_id', v_attempt_id,
    'score', v_score,
    'passed', v_passed,
    'status', v_current_status
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_quiz_attempt(TEXT, UUID[], INTEGER[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(TEXT, UUID[], INTEGER[]) TO authenticated;
