# Track Creator — Progress, Prerequisite & Quiz Specification

**Document 3 of 6 (consolidated set)**
**Depends on:** `V1 Locked Decisions`, `UI/UX & Information Architecture`, `Skill & Content Model`
**Feeds into:** Data Model & Technical Architecture, Implementation Plan

Purpose: this is the product's defining mechanic, so it gets the most exacting treatment. Every rule below is written as something Antigravity can implement directly — deterministic logic, not description. If a behavior isn't nailed down here, don't let it get inferred from the UI mockup; bring it back to this document first.

---

## Part A — Progress State Model

### A.1 States (per user, per Skill Node)

Exactly three, per the locked decision:

| State | Meaning |
|---|---|
| `not_started` | Default state. Learner has never opened the node's detail page. |
| `in_progress` | Learner has opened the node's detail page at least once, but hasn't passed its quiz. |
| `completed` | Learner has passed the node's quiz at least once (≥ passing score — see Part F). |

### A.2 Transition triggers (exact)

| From | To | Trigger |
|---|---|---|
| `not_started` | `in_progress` | The node's detail page (`/app/node/:nodeId`) is opened for the first time. Persisted immediately server-side on first view — not a client-only flag. |
| `in_progress` | `completed` | A quiz attempt is **submitted** and scores at or above the passing threshold (Part F). |
| `completed` | `completed` | A later quiz retake — pass or fail — **never changes the state**. There is no `completed → in_progress` or `completed → not_started` transition in V1. |
| `not_started` | `completed` | Not possible directly — the quiz is only reachable after the node has been opened (per UI spec), so `in_progress` is always visited first, even if only for a moment before immediate quiz completion. |

### A.3 Per-node stored fields (per user, per Skill Node)

```
user_id
node_id
status: not_started | in_progress | completed
first_opened_at: timestamp | null
completed_at: timestamp | null   -- set once, on first pass, never overwritten
last_quiz_score: float | null    -- DENORMALIZED for display only, updated on every
                                  -- attempt. The attempt table (Part F.3) is the
                                  -- single source of truth for quiz history; this
                                  -- field exists purely so the node card/detail page
                                  -- don't need to query the attempt table just to
                                  -- show "last score: X" — never read this field to
                                  -- make a gating or status decision.
```

---

## Part B — Prerequisite Locking Algorithm

### B.1 Definition

A node is **progression-locked** for a user if and only if at least one of its `prerequisites` (per the Skill & Content Model, Part C) does not have status `completed` for that user.

```
is_locked(user, node) =
  EXISTS prereq_id IN node.prerequisites
    WHERE status(user, prereq_id) != completed
```

- If `node.prerequisites` is empty, `is_locked` is always `false`.
- Locking applies **uniformly regardless of the node's own `classification`** — a `recommended` or `optional` node with prerequisites is locked exactly the same way a `required` node is.
- Locking is a **derived value** — never stored. It's recomputed from current progress every time it's needed (page load, tree render, recommendation calculation).

### B.2 What locking affects vs. doesn't

| Locked node CAN | Locked node CANNOT |
|---|---|
| Be opened and read (detail page fully renders) | Have its quiz started (Start Quiz button disabled) |
| Show its content, resources | Transition to `completed` |
| Appear in the tree, fully visible | Become a pillar's Current Focus (Part C) |

This is the Exploration vs. Progression split from the UI/UX spec, restated here as the authoritative rule the backend enforces — the frontend disabling the quiz button is a UX courtesy, but the API must independently reject a quiz submission for a locked node regardless of what the client sends.

### B.3 Lock reason display

When locked, the UI needs the specific unmet prerequisites, not just a boolean:

```
unmet_prerequisites(user, node) =
  [ prereq_id for prereq_id in node.prerequisites
    WHERE status(user, prereq_id) != completed ]
```

Returned as node names (resolved from `unmet_prerequisites`) for the lock banner: "Complete these first: ✅ Regression, ✅ Classification, ❌ Supervised Learning."

---

## Part C — Current Focus Algorithm

### C.1 Definition

Current Focus is **per pillar, per user**, always derived, never manually set. At most one per pillar.

```
current_focus(user, pillar) =
  first node in tree_order(pillar)
    WHERE node.classification == required
    AND status(user, node) != completed
    AND is_locked(user, node) == false
```

If no node satisfies this (see C.3 for the empty cases), `current_focus` is `null` for that pillar.

### C.2 Tree order (tie-breaking / traversal rule)

`tree_order(pillar)` is a depth-first, left-to-right traversal using each level's authored `order` field:

```
Topic.order  →  Subtopic.order  →  SkillNode.order
```

i.e. walk topics in order, within each topic walk subtopics in order, within each subtopic walk skill nodes in order. This is the single tie-breaking rule used everywhere "first eligible node" is needed in this document — defined once here, referenced everywhere else.

### C.3 Empty / edge cases for Current Focus

| Situation | Result |
|---|---|
| All `required` nodes in the pillar are `completed` | `current_focus = null`. Pillar is fully complete (see Part D). UI shows a "Pillar complete" state instead of a focus marker. |
| All incomplete `required` nodes are locked (blocked by cross-pillar prerequisites not yet done) | `current_focus = null`. UI shows "Blocked" state, naming the outstanding cross-pillar prerequisite via `unmet_prerequisites` on the first such node in tree order. |
| Pillar has zero `required` nodes (shouldn't happen given authoring bounds, but must not crash) | `current_focus = null`; pillar contributes 0 to track-wide required-node counts (Part D.3). |

### C.4 Specialization branches (recap from Skill & Content Model, restated as algorithm)

Specialization nodes are **excluded from `current_focus` computation entirely** — the query above filters on `classification == required` only. A specialization branch gets its own, separate, branch-local "in progress" indicator:

```
branch_started(user, specialization_branch) =
  EXISTS node in specialization_branch WHERE status(user, node) != not_started
```

**Explicit UX intent:** opening any specialization node's detail page (the same `not_started → in_progress` trigger from A.2) is sufficient to mark that branch as started — there is no separate "enter this specialization" confirmation step or button. Browsing into a Computer Vision node is, by itself, "starting" the Computer Vision branch. This is a deliberate choice, not an oversight: it keeps specialization branches consistent with the same low-friction exploration model used everywhere else in the tree.

Once `branch_started` is true, the branch's own first incomplete-and-unlocked node (same tree-order rule) can be shown as a **branch-local** focus marker in the UI — visually distinct from a pillar's `required`-node Current Focus, never counted in pillar completion %.

---

## Part D — Progress Percentage Calculations

### D.1 Pillar completion %

```
pillar_percent(user, pillar) =
  round(
    count(required nodes in pillar WHERE status == completed)
    / count(required nodes in pillar)
    * 100
  )
```

Only `required` nodes are in the denominator and numerator — `recommended`/`optional`/`specialization` progress is tracked (has its own status) but never affects this number, per the locked classification rule.

**Edge case:** if `count(required nodes in pillar) == 0`, `pillar_percent = 0`. This is **not a supported production state** — the seed/import process (see Skill & Content Model, Part G) must reject any pillar authored with zero `required` nodes before it ever reaches the database. Runtime code may keep the `0` fallback defensively, but it should never be reachable in practice.

### D.2 "Is this pillar active?" (used for the Home screen Active Learning panel and Part E recommendation)

```
pillar_is_active(user, pillar) =
  pillar_percent(user, pillar) > 0 AND pillar_percent(user, pillar) < 100
```

**Deliberate product intent, stated explicitly:** once a learner has started a pillar (any progress > 0%), the recommendation engine (Part E) prioritizes continuing that pillar over introducing an untouched (0%) one — even if the untouched pillar might otherwise seem like a reasonable place to start. This is not an incidental side effect of the formula; it's the direct implementation of the anti-hopping principle this product is built around. A learner who wants to deliberately start a new pillar can always do so via Explore — this rule only governs what the system *recommends*.

### D.3 Overall track completion %

```
track_percent(user, track) =
  round(
    sum over all pillars of count(required nodes WHERE status == completed)
    / sum over all pillars of count(required nodes)
    * 100
  )
```

**Not** an average of per-pillar percentages — a straight average would weight a 3-node pillar equally with a 15-node pillar, which misrepresents actual progress. This is total-required-nodes-completed over total-required-nodes-in-track.

---

## Part E — Recommendation Engine

Rule-based only, per the locked decision. Two distinct surfaces:

### E.1 "Focus Pillar" (used to pick the single Home-screen recommendation)

```
focus_pillar(user, track) =
  pillar in track.pillars
    WHERE pillar_is_active(user, pillar) == true
    ORDERED BY pillar_percent(user, pillar) DESC, pillar.order ASC
    → first result
```

**Rationale:** always point the learner back at whichever pillar they're already furthest into, rather than the one authored first — this directly targets the "moving to the next thing before finishing the current one" problem this product exists to solve. Ties (equal %) break on authored pillar order.

**If no pillar is active** (every pillar is at 0% or 100%):
```
IF all pillars at 100%:
  → track_complete state (E.4)
ELSE (all remaining pillars at 0%, none started yet):
  → focus_pillar = first pillar by pillar.order
```

### E.2 Home screen "Recommended Next" (single action)

```
recommended_next(user, track):
  pillar = focus_pillar(user, track)
  node = current_focus(user, pillar)          -- Part C

  IF node is not null:
    RETURN node, labeled "Recommended next"

  -- current_focus is null for one of two reasons: either every required node
  -- is complete, or every incomplete required node is locked. These need
  -- different fallbacks — check blocked-required BEFORE falling through to
  -- recommended/optional content, so the anti-hopping principle holds even
  -- when the block is a cross-pillar dependency.

  blocked = [ n for n in tree_order(pillar)
              WHERE n.classification == required
              AND status(user, n) != completed
              AND is_locked(user, n) == true ]

  IF blocked is not empty:
    target = first(blocked)
    missing = unmet_prerequisites(user, target)   -- Part B.3
    RETURN missing[0], labeled "Complete this first"   -- point at the blocking
                                                         -- prerequisite itself,
                                                         -- not the blocked node
    -- this may resolve to a node in a different pillar than `focus_pillar` —
    -- that's correct and intended: it's the actual next actionable step

  -- all required nodes in this pillar are genuinely complete; only now
  -- fall through to non-required content in the same pillar
  node = first node in tree_order(pillar)
           WHERE classification IN (recommended, optional)
           AND status != completed
           AND is_locked == false
  IF node is not null:
    RETURN node, labeled "Optional next"
  ELSE:
    RETURN null
```

**Fallback priority, restated plainly:** (1) an unlocked required node in the focus pillar → (2) if the required path is blocked, the actual missing prerequisite that's blocking it, even if that lives in another pillar → (3) a recommended/optional node in the focus pillar, only once every required node there is truly complete → (4) nothing eligible, fall back to the next pillar by `pillar.order`. This ordering means the system will never suggest "Optional next: X" while a required skill is sitting blocked on an unfinished prerequisite elsewhere — it points at the real blocker instead.

### E.3 Active Learning panel (Home screen, multiple rows)

Shows every active pillar, not just the focus pillar:

```
active_pillars(user, track) =
  [ pillar for pillar in track.pillars WHERE pillar_is_active(user, pillar) ]
  ORDERED BY pillar_percent(user, pillar) DESC, pillar.order ASC
```

Each row shows that pillar's own `current_focus` node (Part C) and its own quiz-pass requirement — this is where "Mathematics 🎯 Probability" and "Python 🎯 NumPy" can both be shown simultaneously, satisfying the multiple-pillars-in-parallel requirement.

### E.4 Track-complete state

When `track_percent == 100`: Home screen replaces the recommendation card with a completion message. If any `recommended`/`optional`/`specialization` nodes remain incomplete anywhere in the track, list up to 3 of them (tree order) as optional follow-ups — not framed as required next steps.

---

## Part F — Quiz Specification

### F.1 Passing threshold — exact arithmetic

Locked decision: 5 questions served, pass required. **5 questions doesn't divide evenly into a "70%" threshold** (70% of 5 = 3.5, not a whole number of correct answers) — so V1 does not use a percentage threshold at all:

> **The pass rule is: at least 4 out of 5 questions correct.** 3 out of 5 does not pass. Product-facing copy should say **"4/5 required to pass"**, not "70%" — the percentage framing is dropped entirely, not just reworded, to avoid the UI, docs, and database ever implying a threshold that doesn't correspond to a real integer score.

### F.2 Attempt lifecycle

1. **Start:** learner taps "Start Quiz" on an unlocked, `in_progress`-or-later node. No database row is created yet.
2. **Selection:** server randomly selects 5 questions, without replacement, from that node's `quiz_pool` (8–10 questions). Simple uniform random sample each attempt — V1 does not track "recently seen" questions to bias against repeats.
3. **Answering:** one question at a time, no "Previous" (per UI spec). Answers held client-side until submission.
4. **Submit:** all 5 answered → single submission event. Server scores against the stored `correct_index` for each served question — **grading is a server-side DB comparison, never client-side, and the correct answers are never sent to the client before submission** (Part G, security note).
5. **Attempt record created:** only on submission — an abandoned quiz (browser closed, navigated away before submitting) leaves **no row at all**, per the UI spec's abandonment rule. Starting again is always a fresh random 5.
6. **Result:** score, pass/fail, and — on pass — the node's status transitions per Part A.2.

### F.3 Attempt record schema

```
attempt_id
user_id
node_id
questions_served: [question_id, question_id, question_id, question_id, question_id]
answers_selected: [option_index, option_index, option_index, option_index, option_index]
score: integer (0-5 correct)
passed: boolean   -- true iff score >= 4
submitted_at: timestamp
```

Every submitted attempt is stored, including failed ones and retakes after an already-`completed` node — this is what the "most recent score" display (Part A.3) and any future analytics (Document 6) read from. No attempt row is ever deleted or overwritten.

### F.4 Retake rule (restated as implementation logic)

```
on_quiz_submit(user, node, score):
  create attempt record
  IF score >= 4 AND status(user, node) != completed:
    status(user, node) = completed
    completed_at = now()
  IF score >= 4 AND status(user, node) == completed:
    -- already completed; just update last_quiz_score, no other change
  IF score < 4:
    -- status is unaffected regardless of current status (in_progress stays in_progress;
    -- completed stays completed — a failed retake can never uncomplete a node)
    last_quiz_score = score
```

### F.5 Concurrency

If a learner has the quiz open in two tabs and submits both: both attempt records are created and stored independently (append-only log, no conflict). Node status logic (F.4) is idempotent — whichever submission arrives first that scores ≥4 flips status to `completed`; the second submission, whatever its score, cannot change that outcome. No locking/transaction complexity needed beyond a standard atomic status update.

### F.6 Quiz-access gate (restated as implementation logic, ties Part B + Part A together)

```
can_start_quiz(user, node) =
  status(user, node) != not_started    -- must have opened the node at least once
  AND is_locked(user, node) == false   -- prerequisites must be satisfied
```

Enforced server-side on the submit endpoint too, not just to show/hide the Start button — a locked or unopened node's quiz submission must be rejected by the API regardless of what the client attempts to send.

---

## Part G — State Transition Reference (canonical examples)

```
Example 1 — normal path
  not_started
    → [user opens node] → in_progress
    → [quiz attempt, score 4/5] → completed

Example 2 — failed first attempt
  not_started
    → [user opens node] → in_progress
    → [quiz attempt, score 2/5] → in_progress (unchanged)
    → [retry, score 4/5] → completed

Example 3 — locked node explored
  not_started, is_locked = true
    → [user opens node anyway] → in_progress, is_locked still true
    → [Start Quiz attempt] → REJECTED (server-side, per F.6) — no attempt record created
    → [prerequisite elsewhere completed] → is_locked recomputes to false
    → [Start Quiz] → allowed

Example 4 — retake after completion
  completed
    → [user retakes for practice, score 3/5] → completed (unchanged, per F.4)
    → [user retakes again, score 5/5] → completed (unchanged; last_quiz_score updates to 5)
```

---

## Part H — Edge Case Reference (explicit answers)

| Edge case | Answer |
|---|---|
| Several `required` nodes qualify equally for Current Focus | Resolved by `tree_order` (Part C.2) — deterministic, no ties possible since `order` fields are unique per level |
| Current pillar's required nodes are all finished | `current_focus = null` (C.3); recommendation engine falls through to `recommended`/`optional` nodes in the same pillar (E.2), labeled "Optional next" |
| Only optional/recommended nodes remain in the whole track | Track-complete state (E.4) still triggers once `required` nodes hit 100%; optional nodes are listed as follow-ups, not blocking anything |
| Several pillars are active simultaneously | All shown in the Active Learning panel (E.3); the single Home "Recommended Next" picks one via `focus_pillar` (E.1) |
| Everything is complete | Track-complete state (E.4) |
| What "current pillar" means, precisely | `focus_pillar(user, track)` (E.1) — the active pillar with the highest completion %, tie-broken by authored pillar order. This is the one and only definition of "current pillar" used anywhere in this document set. |

---

## Part I — What this document deliberately excludes

- Alternative/OR prerequisite evaluation (V2, per Skill & Content Model)
- Per-topic quiz failure diagnostics (excluded per locked decisions)
- Adaptive/AI-assisted recommendation (V2 — this document is rule-based only)
- Time-based or scheduling logic (estimated_time_minutes is display-only, per Skill & Content Model)
- Retroactive re-grading when quiz_pool content changes (Skill & Content Model, Part I)
