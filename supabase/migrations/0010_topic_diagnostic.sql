-- Migration 0010: Topic Diagnostic Test-Out RPC
-- Enables testing out of all skills under a Level 2 Topic via a 10-question comprehensive diagnostic

CREATE OR REPLACE FUNCTION public.submit_topic_diagnostic(
    p_topic_id TEXT,
    p_question_ids UUID[],
    p_answers INT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_score INT := 0;
    v_passed BOOLEAN;
    v_total INT;
    v_q_count INT;
    v_valid_topic INT;
    v_review JSONB := '[]'::jsonb;
    v_q_rec RECORD;
    v_ans_rec RECORD;
    v_unlocked_nodes TEXT[] := ARRAY[]::TEXT[];
    v_node RECORD;
    i INT;
BEGIN
    -- 1. Authentication check
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Verify topic exists
    SELECT count(*) INTO v_valid_topic
    FROM public.topics
    WHERE topic_id = p_topic_id;

    IF v_valid_topic = 0 THEN
        RAISE EXCEPTION 'Topic does not exist: %', p_topic_id;
    END IF;

    v_total := array_length(p_question_ids, 1);
    IF v_total IS NULL OR v_total != array_length(p_answers, 1) OR v_total != 10 THEN
        RAISE EXCEPTION 'Diagnostic submission must contain exactly 10 questions and answers (received %)', COALESCE(v_total, 0);
    END IF;

    -- 3. Verify that all 10 questions actually belong to skill_nodes under this topic
    SELECT count(DISTINCT q.question_id) INTO v_q_count
    FROM public.quiz_questions q
    JOIN public.skill_nodes sn ON q.node_id = sn.node_id
    LEFT JOIN public.subtopics st ON sn.parent_subtopic_id = st.subtopic_id
    WHERE q.question_id = ANY(p_question_ids)
      AND (st.topic_id = p_topic_id OR sn.parent_topic_id = p_topic_id);

    IF v_q_count != 10 THEN
        RAISE EXCEPTION 'Invalid question selection: all questions must belong to nodes within topic %', p_topic_id;
    END IF;

    -- 4. Grade against protected quiz_answers
    FOR i IN 1..10 LOOP
        SELECT question_id, question_text, options INTO v_q_rec
        FROM public.quiz_questions
        WHERE question_id = p_question_ids[i];

        SELECT correct_index, explanation INTO v_ans_rec
        FROM public.quiz_answers
        WHERE question_id = p_question_ids[i];

        IF v_ans_rec.correct_index = p_answers[i] THEN
            v_score := v_score + 1;
        END IF;

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

    -- Pass condition: 80% threshold (8 or more correct out of 10)
    v_passed := (v_score >= 8);

    -- 5. Bulk unlock child nodes if passed (unidirectional - never reverts completed nodes)
    IF v_passed THEN
        FOR v_node IN
            SELECT sn.node_id
            FROM public.skill_nodes sn
            LEFT JOIN public.subtopics st ON sn.parent_subtopic_id = st.subtopic_id
            WHERE st.topic_id = p_topic_id OR sn.parent_topic_id = p_topic_id
        LOOP
            INSERT INTO public.user_node_progress (user_id, node_id, status, first_opened_at, completed_at, last_quiz_score, updated_at)
            VALUES (v_user_id, v_node.node_id, 'completed', now(), now(), 5, now())
            ON CONFLICT (user_id, node_id) DO UPDATE
            SET status = 'completed',
                completed_at = COALESCE(public.user_node_progress.completed_at, now()),
                last_quiz_score = GREATEST(COALESCE(public.user_node_progress.last_quiz_score, 0), 5),
                updated_at = now();

            v_unlocked_nodes := array_append(v_unlocked_nodes, v_node.node_id);
        END LOOP;
    END IF;

    -- 6. Return response
    RETURN jsonb_build_object(
        'topic_id', p_topic_id,
        'score', v_score,
        'total_questions', 10,
        'passed', v_passed,
        'threshold', 8,
        'unlocked_node_count', COALESCE(array_length(v_unlocked_nodes, 1), 0),
        'unlocked_nodes', to_jsonb(v_unlocked_nodes),
        'review', v_review
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_topic_diagnostic(TEXT, UUID[], INT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_topic_diagnostic(TEXT, UUID[], INT[]) TO authenticated;
