-- 0009_quiz_explanations.sql
-- Migration 0009: Add explanation column to quiz_answers and enrich submit_quiz_attempt RPC with post-grading review payload

-- 1. Ensure explanation column exists on quiz_answers
ALTER TABLE public.quiz_answers
ADD COLUMN IF NOT EXISTS explanation TEXT;

-- 2. Ensure users can update their active track for seamless track switching
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_active_track'
      AND policyname = 'Allow users to update own active track'
  ) THEN
    CREATE POLICY "Allow users to update own active track"
    ON public.user_active_track FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 2. Upgrade submit_quiz_attempt RPC function
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
  v_score INTEGER := 0;
  v_passed BOOLEAN;
  v_attempt_id UUID;
  v_review JSONB := '[]'::jsonb;
  v_q_rec RECORD;
  v_ans_rec RECORD;
  i INTEGER;
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
    RAISE EXCEPTION 'Submission must contain exactly 5 answers';
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

  -- Gate 5: Grade against protected quiz_answers and construct review array
  FOR i IN 1..5 LOOP
    SELECT question_id, question_text, options INTO v_q_rec
    FROM public.quiz_questions
    WHERE question_id = p_question_ids[i];

    SELECT correct_index, explanation INTO v_ans_rec
    FROM public.quiz_answers
    WHERE question_id = p_question_ids[i];

    IF v_ans_rec.correct_index = p_answers[i] THEN
      v_score := v_score + 1;
    END IF;

    -- Append question review item
    v_review := v_review || jsonb_build_array(
      jsonb_build_object(
        'question_id', v_q_rec.question_id,
        'question_text', v_q_rec.question_text,
        'options', v_q_rec.options,
        'selected_index', p_answers[i],
        'correct_index', v_ans_rec.correct_index,
        'is_correct', (v_ans_rec.correct_index = p_answers[i]),
        'explanation', COALESCE(v_ans_rec.explanation, '')
      )
    );
  END LOOP;

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

  -- Gate 7 & 8: Unidirectional progress transition and latest score update
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

  -- Return graded result with review sheet
  RETURN jsonb_build_object(
    'attempt_id', v_attempt_id,
    'score', v_score,
    'total_questions', 5,
    'passed', v_passed,
    'status', v_current_status,
    'review', v_review
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_quiz_attempt(TEXT, UUID[], INTEGER[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(TEXT, UUID[], INTEGER[]) TO authenticated;
