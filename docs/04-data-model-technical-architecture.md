# Track Creator — Data Model & Technical Architecture

**Document 4 of 6 (consolidated set)**  
**Status:** V1 Locked / Implementation-Ready  
**Depends on:** Documents 1–3  
**Feeds into:** Document 5 — AI Content Pipeline; Document 6 — Implementation Plan

---

## Purpose

This document converts the product decisions from Documents 1–3 into a concrete, secure, buildable technical architecture.

It defines:

- technology choices
- runtime architecture
- database schema
- progress and quiz enforcement boundaries
- Supabase RPC functions
- Row-Level Security
- API/client surface
- secrets and environment configuration
- content seeding and deployment
- explicit V1 exclusions

This document **does not reopen product decisions**. If implementation reveals a genuine contradiction with Documents 1–3, stop and resolve that contradiction explicitly rather than inventing behavior.

---

# Part A — Technology Stack & Rationale

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React + Vite + TypeScript | Matches the existing development workflow and keeps the frontend strongly typed and straightforward for Antigravity implementation. |
| UI | Existing approved UI/design system from Document 2 | Prevents technical architecture from introducing an independent visual system. |
| Backend / Database | Supabase — PostgreSQL + Auth + RLS + RPC | V1 has no live AI or heavy server-side application workload. Supabase provides authentication, relational storage, authorization, and trusted database functions without requiring a separate application server. |
| Hosting | Lovable initially | Consistent with the existing workflow. The frontend remains portable to Vercel/Netlify because the application communicates with Supabase through its client API. |
| Authentication | Supabase Auth, standalone project | Track Creator is intentionally independent from StudyHub. No shared authentication database in V1. |
| Offline content generation | Gemini API through a local authoring script | AI is used to accelerate one-time content creation, not during learner runtime. |
| Content storage | Supabase PostgreSQL | Structured relational data is appropriate for the hierarchical skill tree, prerequisites, resources, quiz pools, and progress. |

### Explicitly excluded from V1

- FastAPI server
- Node/Express backend
- custom REST API
- custom GraphQL API
- live Gemini calls from the deployed application
- AI-generated quiz grading
- AI-generated recommendations

The product's trusted server-side operations are implemented through PostgreSQL RPC functions.

---

# Part B — System Architecture

## B.1 Runtime architecture

```text
                         ┌──────────────────────┐
                         │      React App       │
                         │ Vite + TypeScript    │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
                    ▼               ▼                ▼
             Supabase Auth    Content Reads     User Data Reads
                    │               │                │
                    └───────────────┼────────────────┘
                                    ▼
                         ┌──────────────────────┐
                         │  Supabase PostgreSQL  │
                         │       + RLS           │
                         └──────────┬───────────┘
                                    │
                         Trusted RPC Operations
                                    │
                    ┌───────────────┴────────────────┐
                    ▼                                ▼
            mark_node_opened()              submit_quiz_attempt()
```

The deployed frontend has **no direct runtime connection to Gemini or any other AI provider**.

## B.2 Runtime responsibilities

### Frontend

Responsible for:

- rendering the skill tree
- rendering node content
- displaying derived progress state
- displaying prerequisite locks
- displaying Current Focus
- displaying quiz questions
- collecting quiz answers
- displaying quiz results
- displaying recommendations
- managing local UI state

The frontend is **never trusted** for:

- quiz grading
- answer-key access
- progress-state mutation
- prerequisite enforcement
- completion enforcement
- cross-user data access

### Supabase

Responsible for:

- authentication
- persistent content
- user-specific progress
- quiz attempts
- RLS authorization
- trusted progress mutations
- prerequisite re-validation
- quiz grading

## B.3 Offline content pipeline

```text
Local Authoring Script
        │
        ▼
     Gemini API
        │
        ▼
Draft Markdown / YAML / JSON
        │
        ▼
Human Review + Editing
        │
        ▼
Validation Pipeline
        │
        ├── schema validation
        ├── content validation
        ├── prerequisite/DAG validation
        ├── resource validation
        └── quiz-pool validation
        │
        ▼
Supabase Seed Script
        │
        ▼
PostgreSQL Content Tables
```

The content-generation pipeline is **not part of the deployed learner application**.

---

# Part C — Database Schema

## C.0 General conventions

### IDs

Content-tree entities use human-readable `TEXT` slugs:

```text
track_id
pillar_id
topic_id
subtopic_id
node_id
```

User-generated/runtime records use UUIDs where appropriate.

### Enumerations

V1 uses:

```sql
TEXT + CHECK
```

rather than PostgreSQL native `ENUM`.

### Timestamps

Use:

```sql
TIMESTAMPTZ
```

for persisted timestamps.

### Content writes

Content tables are writable only through the controlled seed process using the Supabase service-role key.

Learner clients have read access but cannot modify content.

---

## C.1 Content tables

### `tracks`

```sql
tracks
  track_id        TEXT PRIMARY KEY
  name            TEXT NOT NULL
  description     TEXT NOT NULL
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
```

### `pillars`

```sql
pillars
  pillar_id       TEXT PRIMARY KEY
  track_id        TEXT NOT NULL REFERENCES tracks(track_id)
  name            TEXT NOT NULL
  description     TEXT NOT NULL
  order_index     INTEGER NOT NULL
  UNIQUE (track_id, order_index)
```

### `topics`

```sql
topics
  topic_id        TEXT PRIMARY KEY
  pillar_id       TEXT NOT NULL REFERENCES pillars(pillar_id)
  name            TEXT NOT NULL
  order_index     INTEGER NOT NULL
  UNIQUE (pillar_id, order_index)
```

### `subtopics`

```sql
subtopics
  subtopic_id     TEXT PRIMARY KEY
  topic_id        TEXT NOT NULL REFERENCES topics(topic_id)
  name            TEXT NOT NULL
  order_index     INTEGER NOT NULL
  UNIQUE (topic_id, order_index)
```

### `skill_nodes`

```sql
skill_nodes
  node_id                 TEXT PRIMARY KEY
  parent_subtopic_id      TEXT REFERENCES subtopics(subtopic_id)
  parent_topic_id         TEXT REFERENCES topics(topic_id)

  name                    TEXT NOT NULL

  classification          TEXT NOT NULL CHECK (
    classification IN (
      'required',
      'recommended',
      'optional',
      'specialization'
    )
  )

  recommended_depth       TEXT NOT NULL CHECK (
    recommended_depth IN (
      'overview',
      'practical',
      'implementation',
      'advanced'
    )
  )

  estimated_time_minutes  INTEGER NOT NULL
                          CHECK (estimated_time_minutes > 0)

  one_sentence_definition TEXT NOT NULL
  why_it_matters          TEXT NOT NULL
  quick_overview          TEXT NOT NULL
  deep_dive               TEXT

  content_version         INTEGER NOT NULL DEFAULT 1
  order_index             INTEGER NOT NULL

  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()

  CHECK (
    (parent_subtopic_id IS NOT NULL)::int +
    (parent_topic_id IS NOT NULL)::int = 1
  )
```

Every skill node has exactly one immediate parent.

---

## C.2 Prerequisites

### `node_prerequisites`

```sql
node_prerequisites
  node_id               TEXT NOT NULL
                        REFERENCES skill_nodes(node_id)

  prerequisite_node_id  TEXT NOT NULL
                        REFERENCES skill_nodes(node_id)

  PRIMARY KEY (node_id, prerequisite_node_id)

  CHECK (node_id != prerequisite_node_id)
```

Prerequisites may cross pillars within the same track.

The prerequisite graph must be acyclic.

V1 validates DAG acyclicity in the authoring/seed pipeline rather than attempting to enforce global graph acyclicity through a database CHECK constraint.

The seed must fail if a cycle exists.

---

## C.3 Resources

### `resources`

```sql
resources
  resource_id     UUID PRIMARY KEY DEFAULT gen_random_uuid()
  node_id         TEXT NOT NULL REFERENCES skill_nodes(node_id)

  title           TEXT NOT NULL
  url             TEXT NOT NULL

  type            TEXT NOT NULL CHECK (
    type IN (
      'documentation',
      'article',
      'course',
      'video',
      'book',
      'tutorial',
      'practice'
    )
  )

  tag             TEXT NOT NULL CHECK (
    tag IN (
      'start_here',
      'alternative',
      'practice',
      'reference'
    )
  )

  why             TEXT
  order_index     INTEGER NOT NULL
```

Exactly one `start_here` resource is required per node.

```sql
CREATE UNIQUE INDEX one_start_here_per_node
ON resources (node_id)
WHERE tag = 'start_here';
```

This requirement is also validated before seeding.

---

## C.4 Quiz questions

### `quiz_questions`

```sql
quiz_questions
  question_id     UUID PRIMARY KEY DEFAULT gen_random_uuid()
  node_id         TEXT NOT NULL REFERENCES skill_nodes(node_id)

  question_text   TEXT NOT NULL
  options         JSONB NOT NULL

  CHECK (jsonb_array_length(options) = 4)
```

The answer key is intentionally absent from this table.

---

## C.5 Quiz answers

### `quiz_answers`

```sql
quiz_answers
  question_id     UUID PRIMARY KEY
                  REFERENCES quiz_questions(question_id)

  correct_index   INTEGER NOT NULL
                  CHECK (correct_index BETWEEN 0 AND 3)
```

There is no client SELECT policy for this table.

Only trusted server-side grading logic can access it.

---

## C.6 User profile

### `profiles`

```sql
profiles
  user_id         UUID PRIMARY KEY
                  REFERENCES auth.users(id)

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
```

Email is intentionally not duplicated. Supabase Auth remains the source of truth.

---

## C.7 Active track

### `user_active_track`

```sql
user_active_track
  user_id         UUID PRIMARY KEY
                  REFERENCES auth.users(id)

  track_id        TEXT NOT NULL
                  REFERENCES tracks(track_id)

  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT now()
```

V1 allows one active track per user.

The client may insert this row during onboarding but may not update it directly.

Track switching is outside V1.

---

## C.8 Self-reported starting level

### `user_pillar_self_report`

```sql
user_pillar_self_report
  user_id         UUID NOT NULL
                  REFERENCES auth.users(id)

  pillar_id       TEXT NOT NULL
                  REFERENCES pillars(pillar_id)

  level           TEXT NOT NULL CHECK (
    level IN (
      'dont_know',
      'beginner',
      'intermediate',
      'advanced'
    )
  )

  PRIMARY KEY (user_id, pillar_id)
```

Self-report is used only for onboarding/start-point suggestions.

It never determines:

- completion
- prerequisite satisfaction
- Current Focus
- quiz eligibility
- mastery

---

## C.9 Node progress

### `user_node_progress`

The database does not need a row for `not_started`.

```sql
user_node_progress
  user_id           UUID NOT NULL
                    REFERENCES auth.users(id)

  node_id           TEXT NOT NULL
                    REFERENCES skill_nodes(node_id)

  status            TEXT NOT NULL
                    CHECK (
                      status IN (
                        'in_progress',
                        'completed'
                      )
                    )

  first_opened_at   TIMESTAMPTZ NOT NULL
  completed_at      TIMESTAMPTZ

  last_quiz_score   INTEGER
                    CHECK (last_quiz_score BETWEEN 0 AND 5)

  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()

  PRIMARY KEY (user_id, node_id)
```

Application-level states remain exactly:

```text
not_started
in_progress
completed
```

A missing row is interpreted as:

```text
not_started
```

The first node open creates an `in_progress` row.

This avoids pre-seeding roughly 100–150 progress rows per user.

---

## C.10 Quiz attempts

### `quiz_attempts`

```sql
quiz_attempts
  attempt_id        UUID PRIMARY KEY
                    DEFAULT gen_random_uuid()

  user_id           UUID NOT NULL
                    REFERENCES auth.users(id)

  node_id           TEXT NOT NULL
                    REFERENCES skill_nodes(node_id)

  questions_served  JSONB NOT NULL
  answers_selected  JSONB NOT NULL

  score             INTEGER NOT NULL
                    CHECK (score BETWEEN 0 AND 5)

  passed            BOOLEAN NOT NULL

  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT now()
```

Quiz attempts are append-only.

Failed attempts, successful attempts, and post-completion retakes are retained.

---

## C.11 Required indexes

```sql
CREATE INDEX idx_pillars_track
ON pillars(track_id);

CREATE INDEX idx_topics_pillar
ON topics(pillar_id);

CREATE INDEX idx_subtopics_topic
ON subtopics(topic_id);

CREATE INDEX idx_skill_nodes_subtopic
ON skill_nodes(parent_subtopic_id);

CREATE INDEX idx_skill_nodes_topic
ON skill_nodes(parent_topic_id);

CREATE INDEX idx_node_prerequisites_prerequisite
ON node_prerequisites(prerequisite_node_id);

CREATE INDEX idx_resources_node
ON resources(node_id);

CREATE INDEX idx_quiz_questions_node
ON quiz_questions(node_id);

CREATE INDEX idx_progress_user
ON user_node_progress(user_id);

CREATE INDEX idx_attempts_user_node
ON quiz_attempts(user_id, node_id);

CREATE INDEX idx_attempts_node_submitted
ON quiz_attempts(node_id, submitted_at);
```

---

# Part D — Derived Logic: Client vs. Database

The architecture deliberately separates display computation from security enforcement.

## D.1 Client-side derived logic

The following may be calculated in TypeScript:

- `is_locked`
- `unmet_prerequisites`
- `current_focus`
- `pillar_percent`
- `track_percent`
- `focus_pillar`
- `recommended_next`
- active pillar lists
- branch progress indicators

These are derived from the content tree, prerequisites, and the user's own progress.

They do not independently grant permission or mutate protected state.

## D.2 Server-side authoritative checks

The database must independently enforce:

- active-track membership
- node eligibility
- prerequisite completion
- quiz accessibility
- question/node relationship
- exact question count
- duplicate-question rejection
- valid answer indices
- answer-key lookup
- score calculation
- completion transition

The frontend's implementation of these rules is therefore UX logic, not a security boundary.

---

# Part E — Trusted RPC Functions

The frontend must not directly mutate:

```text
user_node_progress
quiz_attempts
```

The trusted mutation boundary is the PostgreSQL RPC layer.

## E.0 Security hardening

Every `SECURITY DEFINER` function must:

1. Pin its search path:

```sql
SET search_path = public, pg_temp
```

2. Explicitly control execution:

```sql
REVOKE EXECUTE ON FUNCTION mark_node_opened FROM PUBLIC;
GRANT EXECUTE ON FUNCTION mark_node_opened TO authenticated;

REVOKE EXECUTE ON FUNCTION submit_quiz_attempt FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_quiz_attempt TO authenticated;
```

3. Never accept `user_id` from the client.

The caller is always:

```sql
auth.uid()
```

4. Validate active-track ownership and other security-sensitive conditions inside the function.

---

## E.1 `mark_node_opened(p_node_id TEXT)`

Purpose:

```text
not_started → in_progress
```

Pseudocode:

```sql
BEGIN

  IF NOT node_belongs_to_users_active_track(
    auth.uid(),
    p_node_id
  ) THEN
    RAISE EXCEPTION
      'Node does not belong to your active track';
  END IF;

  INSERT INTO user_node_progress (
    user_id,
    node_id,
    status,
    first_opened_at
  )
  VALUES (
    auth.uid(),
    p_node_id,
    'in_progress',
    now()
  )
  ON CONFLICT (user_id, node_id)
  DO NOTHING;

END;
```

The function is idempotent.

Repeated calls cannot reset progress or overwrite `first_opened_at`.

---

## E.2 `submit_quiz_attempt(...)`

Signature:

```sql
submit_quiz_attempt(
  p_node_id TEXT,
  p_question_ids UUID[],
  p_answers INTEGER[]
)
```

Required sequence:

### 0 — Verify active-track ownership

Reject if the node does not belong to the user's active track.

### 1 — Validate structure

Require exactly:

```text
5 question IDs
5 answers
```

Reject:

- fewer than 5
- more than 5
- duplicate question IDs
- answer index < 0
- answer index > 3

### 2 — Validate question ownership

Every question must belong to:

```text
p_node_id
```

### 3 — Validate quiz eligibility

Require:

```text
node has been opened
AND
all prerequisites are completed
AND
node belongs to user's active track
```

### 4 — Grade

Read `quiz_answers` server-side.

```text
score = number of correct answers
passed = score >= 4
```

### 5 — Store attempt

Insert the immutable attempt record.

### 6 — Apply completion

If passed and not already completed:

```text
status = completed
completed_at = now()
```

### 7 — Update latest score

Always update:

```text
last_quiz_score
```

to the latest submitted score.

A failed retake can never revert a completed node.

---

## E.3 Quiz question selection

V1 contains 8–10 authored questions per node and serves 5 questions per attempt.

The client may retrieve:

```sql
SELECT
  question_id,
  node_id,
  question_text,
  options
FROM quiz_questions
WHERE node_id = $node_id
ORDER BY random()
LIMIT 5;
```

This is safe because the answer key is not stored in `quiz_questions`.

The server still validates all submitted question IDs before grading.

V1 deliberately does not introduce server-issued quiz sessions or temporary quiz state. This keeps the runtime state machine small.

If strict server-issued random selection or anti-repeat behavior becomes necessary, it can be introduced in V2.

---

# Part F — Row-Level Security

RLS is enabled on all exposed tables.

## F.1 Content

| Table | SELECT | INSERT / UPDATE / DELETE |
|---|---|---|
| `tracks`, `pillars`, `topics`, `subtopics`, `skill_nodes`, `resources`, `quiz_questions` | Authenticated users | Service role only |
| `quiz_answers` | No client access | Service role only |

## F.2 User data

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | Own row | Signup trigger | Own row if needed | Denied |
| `user_active_track` | Own row | Own row | Denied | Denied |
| `user_pillar_self_report` | Own rows | Own rows | Own rows | Denied |
| `user_node_progress` | Own rows | Denied | Denied | Denied |
| `quiz_attempts` | Own rows | Denied | Denied | Denied |

`user_node_progress` and `quiz_attempts` are mutated only by trusted RPCs.

## F.3 Signup trigger

A PostgreSQL trigger on `auth.users` creates the matching `profiles` row.

---

# Part G — API / Client Surface

No custom REST or GraphQL layer exists in V1.

## G.1 Authentication

```text
supabase.auth.signUp()
supabase.auth.signInWithPassword()
supabase.auth.signOut()
supabase.auth.resetPasswordForEmail()
```

## G.2 Content

Fetch the selected track and its hierarchical content.

Conceptually:

```text
tracks
  └── pillars
       └── topics
            └── subtopics
                 └── skill_nodes
                      └── resources
```

The expected V1 dataset is small enough to keep in client state.

## G.3 Progress

Read the current user's:

```text
user_node_progress
```

Missing rows mean `not_started`.

## G.4 Quiz

Read only:

```text
question_id
node_id
question_text
options
```

Never expose `correct_index`.

## G.5 Mutations

```text
supabase.rpc(
  'mark_node_opened',
  { p_node_id }
)

supabase.rpc(
  'submit_quiz_attempt',
  {
    p_node_id,
    p_question_ids,
    p_answers
  }
)
```

## G.6 Onboarding

Direct low-risk writes:

```text
user_active_track
user_pillar_self_report
```

These do not independently grant completion or quiz access.

---

# Part H — Environment & Secrets

| Variable | Used by | Exposure |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | Public |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Public; protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Local seed scripts | Secret; never deployed |
| `GEMINI_API_KEY` | Local content-generation scripts | Secret; never deployed |

Never place the service-role or Gemini key inside the browser bundle, committed `.env` files, GitHub, or client-side API calls.

---

# Part I — Content Seeding & Deployment Pipeline

```text
Generate
   ↓
Human Review
   ↓
Validate
   ↓
Seed
   ↓
Verify
   ↓
Deploy
```

## I.1 Generate

Document 5 produces draft content in the agreed reviewable format.

## I.2 Human review

AI-generated content is reviewed and edited before production.

## I.3 Validate

Before database insertion, validate:

### Structure

- valid hierarchy
- unique IDs
- valid ordering
- maximum four levels
- valid parent relationships

### Content

- required fields
- content-depth requirements
- word-count bounds
- no malformed records

### Resources

- valid URLs
- valid resource types
- valid tags
- exactly one `start_here` resource per node

### Quiz

- 8–10 questions per node
- exactly 4 options per question
- valid answer index
- one correct answer per question
- no duplicate question IDs

### Prerequisites

- referenced nodes exist
- no self-prerequisites
- no cycles
- valid cross-pillar references

The validation process must fail before seeding when invalid content is found.

## I.4 Seed

Dependency order:

```text
tracks
→ pillars
→ topics
→ subtopics
→ skill_nodes
→ node_prerequisites
→ resources
→ quiz_questions
→ quiz_answers
```

The seed script uses the service-role key in a trusted environment.

## I.5 Verify

Post-seed verification confirms:

- expected hierarchy exists
- no orphaned records
- every node has required content
- every node has exactly one `start_here`
- every node has 8–10 questions
- every question has an answer key
- prerequisite graph is acyclic

---

# Part J — Data Integrity & Failure Rules

## J.1 Never trust client progress

Only trusted quiz submission can produce:

```text
in_progress → completed
```

## J.2 Never trust client prerequisite state

The server independently checks prerequisites.

## J.3 Never expose answer keys

`quiz_answers` is never client-readable.

## J.4 Never allow cross-user mutation

All protected mutations derive the user from:

```sql
auth.uid()
```

## J.5 Never allow completion regression

V1 has no:

```text
completed → in_progress
completed → not_started
```

## J.6 Reject invalid quiz submissions

Reject:

- wrong node
- wrong question count
- duplicate questions
- wrong-node questions
- invalid answer indices
- locked nodes
- unopened nodes
- nodes outside the active track

## J.7 Reject invalid content

Invalid content must fail validation before production seeding.

---

# Part K — Observability & Error Handling

V1 does not require a full analytics platform.

The frontend should expose friendly errors such as:

```text
Unable to load your track.
Unable to open this skill.
This quiz is currently unavailable.
Quiz submission failed. Please try again.
```

Raw PostgreSQL errors must not be displayed to learners.

Developer logging may capture:

- RPC failures
- seed failures
- validation failures
- quiz submission failures
- authentication failures

Never log:

- passwords
- service-role keys
- Gemini API keys
- answer keys
- unnecessary personal data

---

# Part L — Testing Requirements

## L.1 Progress

- first open creates `in_progress`
- repeated open is idempotent
- failed quiz leaves node incomplete
- 4/5 completes node
- 5/5 completes node
- failed retake cannot uncomplete a node
- successful retake cannot alter completion state
- completion timestamp is set only on first completion

## L.2 Prerequisites

- unlocked node can be quizzed
- locked node cannot be quizzed
- incomplete prerequisite blocks quiz
- completing prerequisite unlocks dependent node
- cross-pillar prerequisites work
- invalid prerequisite data fails safely

## L.3 Security

- user A cannot read user B's progress
- user A cannot insert progress directly
- user A cannot update progress directly
- user A cannot insert attempts directly
- user A cannot read `quiz_answers`
- user A cannot submit another node's questions
- user A cannot mutate another user's progress
- service-role credentials never appear client-side

## L.4 Quiz

- exactly five questions required
- duplicate questions rejected
- invalid answer indices rejected
- fewer than five rejected
- more than five rejected
- 3/5 fails
- 4/5 passes
- 5/5 passes
- every submitted question belongs to the node

## L.5 Content

- no orphan nodes
- no duplicate IDs
- no invalid classifications
- no invalid hierarchy
- exactly one `start_here`
- 8–10 questions per node
- every question has an answer
- prerequisite graph has no cycle

---

# Part M — V1 Architectural Invariants

Antigravity must not violate these rules during implementation:

1. Supabase is the V1 backend.
2. No separate application server.
3. No live AI calls from the learner application.
4. The client never receives quiz answer keys.
5. Progress writes go through trusted RPCs.
6. Quiz grading is server-side.
7. Prerequisites are server-side enforced.
8. A node cannot become completed without passing its quiz.
9. Completion is one-way in V1.
10. Missing progress rows mean `not_started`.
11. One active track per user.
12. Self-report never substitutes for demonstrated progress.
13. Content enters production through the controlled seed pipeline.
14. Invalid content fails validation before seeding.
15. Service-role credentials never reach the browser.
16. Gemini credentials never reach the browser.
17. No V1 admin/content-generation UI.
18. No V1 custom REST/GraphQL backend.
19. Derived UI logic may run client-side, but security-sensitive rules are independently enforced server-side.
20. When implementation encounters ambiguity, refer back to Documents 1–3 rather than inventing a new product rule.

---

# Part N — Deliberate V1 Exclusions

Explicitly outside V1:

- separate hosted backend
- FastAPI/Node application server
- native PostgreSQL enums
- database-level DAG-cycle constraint
- multiple active tracks per user
- track-switching workflow
- admin dashboard
- in-app content authoring
- in-app AI generation
- live AI recommendations
- AI quiz grading
- adaptive quizzes
- short-answer AI grading
- quiz failure diagnostics
- practice gates
- visual graph architecture
- server-issued quiz sessions
- anti-repeat quiz optimization
- advanced analytics
- mastery scoring beyond the three progress states
- cross-role shared skill-node architecture

These can be reconsidered only after V1 validates the need.

---

# Part O — Definition of Technical Readiness

Document 4 is implementation-ready when:

- [ ] Documents 1–3 remain consistent with this architecture
- [ ] database migrations are defined
- [ ] RLS policies are implemented
- [ ] RPC functions are implemented
- [ ] RPC security hardening is applied
- [ ] prerequisite validation exists
- [ ] seed validation exists
- [ ] content seed pipeline works
- [ ] quiz grading tests pass
- [ ] progress transition tests pass
- [ ] cross-user security tests pass
- [ ] no secret is exposed to the frontend
- [ ] frontend Supabase calls match the documented API surface
- [ ] the complete content dataset passes validation
- [ ] Document 5's output format matches this schema
- [ ] Document 6's implementation sequence follows these boundaries

---

# Final Architectural Principle

Track Creator is intentionally simple at runtime.

```text
Learner Runtime

React
  ↓
Supabase Auth
  ↓
Supabase PostgreSQL + RLS
  ↓
Trusted RPC Functions
```

AI exists outside the learner runtime as an authoring accelerator:

```text
Gemini
  ↓
Draft Content
  ↓
Human Review
  ↓
Validation
  ↓
Seed
  ↓
Supabase
```

The most important architectural boundary is:

> **The client controls presentation; the database controls truth.**
