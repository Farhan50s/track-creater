# Track Creator — Antigravity Phase 0–4 Implementation Guide

**Supporting implementation document — first four build phases**

**Use with:** Documents 1–6 of the Track Creator specification set

**Purpose:** Give Antigravity a focused, implementation-ready execution guide for the first four phases without replacing or redefining the six authoritative documents.

---

# 0. How Antigravity Must Use This Document

This document is a **phase execution guide**, not a new product specification.

## Authority order

When implementing these phases, treat the documents as follows:

1. **V1 Locked Decisions** — product decisions and scope
2. **UI/UX & Information Architecture** — screens, routes, interaction rules
3. **Progress, Prerequisite & Quiz Specification** — progression/quiz behavior
4. **Data Model & Technical Architecture** — database, RLS, RPC, security, API
5. **AI Content Pipeline** — content-generation/seeding rules
6. **Implementation Plan** — phase sequencing and acceptance criteria
7. **This document** — practical execution instructions for Phases 0–4

If this document conflicts with an authoritative specification, **do not invent a solution**. Follow the authoritative specification and flag the conflict.

## Global implementation rules

- Do not implement V2 features.
- Do not redesign locked product behavior.
- Do not invent missing business rules.
- Keep changes limited to the active phase.
- Do not modify future-phase behavior just because it is convenient.
- Preserve the documented route structure.
- Preserve the documented database schema.
- Preserve the documented security boundaries.
- Use real working code; do not create fake success states or placeholder integrations that could be mistaken for finished behavior.
- After each phase, run that phase's acceptance criteria before moving forward.
- Commit a clean checkpoint after each completed phase.

---

# Part A — Overall Phase Sequence

```text
PHASE 0
Environment & Scaffold
        ↓
PHASE 1
Database + RLS + RPC
        ↓
PHASE 2
Test Track
        ↓
PHASE 3
Authentication
        ↓
PHASE 4
Onboarding
        ↓
Phase 5+
Track UI → Skill Detail → Quiz → Dashboard → Polish → Security → Real Content
```

Real-content authoring may run separately once the schema/skeleton foundation exists, but it does **not** change the implementation order above.

---

# Part B — Phase 0: Environment & Scaffold

## B.1 Objective

Create the clean application foundation required for later phases.

Phase 0 is **scaffolding only**.

Do not implement:

- authentication behavior
- onboarding behavior
- track rendering
- quiz logic
- progress logic
- recommendation logic
- real content

The purpose is to create a stable project that boots correctly and is ready for Phase 1.

---

## B.2 Technology baseline

Use the stack locked in the technical architecture:

- React
- Vite
- TypeScript
- Supabase client
- existing approved UI/design system approach
- Tailwind/shadcn only if already part of the chosen project baseline

Do not introduce a separate backend.

Do not add FastAPI, Express, Node API routes, GraphQL, or another application server.

---

## B.3 Repository setup

Create a clean Git repository with a structure suitable for the later application.

Recommended initial structure:

```text
track-creator/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── lib/
│   ├── routes/
│   ├── styles/
│   └── types/
├── public/
├── supabase/
│   └── migrations/
├── scripts/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

The exact folder naming may follow the generated project conventions, but the architecture should remain feature-oriented and easy to navigate.

---

## B.4 Environment variables

Create development configuration using the architecture document's public frontend variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Create:

```text
.env.example
```

containing placeholders only.

Example:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Do **not** put these in source code.

Do **not** add:

```text
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
```

to frontend runtime configuration.

Those are for later trusted local scripts only.

---

## B.5 `.gitignore`

Ensure the repository ignores:

```text
.env
.env.*
!.env.example
node_modules/
dist/
```

Do not accidentally ignore future source files or migration files.

---

## B.6 Supabase client

Create one centralized Supabase client module.

The frontend should import that client rather than initializing Supabase separately in every component.

Example conceptual location:

```text
src/lib/supabase.ts
```

Responsibilities:

- create client
- read Vite public variables
- expose the configured client

Do not add business logic here.

---

## B.7 Routing shell

Create the route tree defined by the UI/UX specification:

```text
/
 /signup
 /login
 /forgot-password

 /onboarding/goal
 /onboarding/knowledge

 /app
 /app/track
 /app/track/:pillarId
 /app/node/:nodeId
 /app/node/:nodeId/quiz
 /app/profile
```

At Phase 0 these can render simple **non-functional route placeholders**.

The placeholders must clearly identify the route so navigation can be tested.

Do not implement their actual product behavior yet.

---

## B.8 Base application shell

Create:

- root app shell
- global CSS
- typography baseline
- spacing baseline
- responsive base
- basic loading/error boundary structure
- navigation shell where appropriate

Do not attempt to finish the visual design in Phase 0.

The goal is consistency, not polish.

---

## B.9 Phase 0 acceptance criteria

Phase 0 is complete only when:

- [ ] `npm install` succeeds on a clean checkout.
- [ ] development server starts successfully.
- [ ] production build succeeds.
- [ ] TypeScript compilation succeeds.
- [ ] all documented routes resolve without runtime errors.
- [ ] Supabase client initializes from environment variables.
- [ ] `.env`/secrets are not committed.
- [ ] no service-role/Gemini credential exists in frontend code.
- [ ] no feature logic has been implemented prematurely.
- [ ] repository is committed as a clean Phase 0 checkpoint.

### Verification

Run:

```bash
npm install
npm run dev
npm run build
```

Also inspect the browser console for runtime errors.

---

# Part C — Phase 1: Database, RLS & RPC Functions

## C.1 Objective

Build the entire trusted backend foundation **before connecting real frontend features**.

This phase must be testable without the frontend.

Use the **Data Model & Technical Architecture** as the authoritative source.

---

## C.2 Supabase project

Create the standalone Track Creator Supabase project.

It must be separate from StudyHub.

Configure:

- Postgres
- Auth
- RLS
- migrations
- functions/RPC

Do not configure StudyHub SSO or cross-app integration.

That belongs to future integration work.

---

## C.3 Version-controlled migrations

All database changes must exist as version-controlled migrations.

The schema must be reproducible from a clean Supabase project.

Do not make undocumented manual dashboard-only schema changes.

Recommended structure:

```text
supabase/
└── migrations/
    ├── 0001_extensions.sql
    ├── 0002_content_schema.sql
    ├── 0003_user_schema.sql
    ├── 0004_rls.sql
    ├── 0005_rpc.sql
    └── 0006_triggers.sql
```

Exact migration count is not locked; reproducibility is.

---

## C.4 Extensions

Enable only required PostgreSQL extensions.

The schema currently expects UUID generation such as:

```sql
gen_random_uuid()
```

Ensure the required extension/environment support exists.

Do not add unrelated extensions.

---

# Part D — Content Schema Implementation

Implement the content entities specified in the Data Model document.

## D.1 `tracks`

Required:

```text
track_id
name
description
created_at
```

Constraints:

- `track_id` primary key
- non-null name
- non-null description

---

## D.2 `pillars`

Required:

```text
pillar_id
track_id
name
description
order_index
```

Constraints:

```text
(track_id, order_index) UNIQUE
```

Foreign key:

```text
track_id → tracks.track_id
```

---

## D.3 `topics`

Required:

```text
topic_id
pillar_id
name
order_index
```

Constraints:

```text
(pillar_id, order_index) UNIQUE
```

Foreign key:

```text
pillar_id → pillars.pillar_id
```

---

## D.4 `subtopics`

Required:

```text
subtopic_id
topic_id
name
order_index
```

Constraints:

```text
(topic_id, order_index) UNIQUE
```

Foreign key:

```text
topic_id → topics.topic_id
```

---

## D.5 `skill_nodes`

Implement exactly the documented fields:

```text
node_id
parent_subtopic_id
parent_topic_id
name
classification
recommended_depth
estimated_time_minutes
one_sentence_definition
why_it_matters
quick_overview
deep_dive
content_version
order_index
updated_at
```

Critical constraint:

```text
exactly one of parent_subtopic_id / parent_topic_id must be non-null
```

Allowed classifications:

```text
required
recommended
optional
specialization
```

Allowed depths:

```text
overview
practical
implementation
advanced
```

---

# Part E — Prerequisites

## E.1 `node_prerequisites`

Implement:

```text
node_id
prerequisite_node_id
```

Primary key:

```text
(node_id, prerequisite_node_id)
```

Constraint:

```text
node_id != prerequisite_node_id
```

Do not attempt to solve full DAG enforcement with a basic table constraint.

DAG validation belongs to the content validation pipeline.

---

# Part F — Resources & Quiz Schema

## F.1 `resources`

Implement:

```text
resource_id
node_id
title
url
type
tag
why
order_index
```

Allowed types:

```text
documentation
article
course
video
book
tutorial
practice
```

Allowed tags:

```text
start_here
alternative
practice
reference
```

Add the partial unique index allowing **only one** `start_here` resource per node.

---

## F.2 `quiz_questions`

Implement:

```text
question_id
node_id
question_text
options
```

Enforce exactly four options structurally.

---

## F.3 `quiz_answers`

Implement:

```text
question_id
correct_index
```

Enforce:

```text
correct_index BETWEEN 0 AND 3
```

This table must remain inaccessible to the learner client.

---

# Part G — User Data Schema

## G.1 `profiles`

Implement:

```text
user_id
created_at
```

Do not duplicate the authentication email.

Client RLS: **SELECT own row only.** No client-facing INSERT policy — the row is created exclusively by the Part J signup trigger. This isn't a security-critical boundary (a client inserting its own profile row early would carry no privilege implication), but leaving it undefined invites Antigravity to add a redundant client-side insert path that could race with the trigger; stating it explicitly removes that ambiguity.

---

## G.2 `user_active_track`

Implement:

```text
user_id
track_id
enrolled_at
```

One row per user.

V1 client permissions:

```text
SELECT own row
INSERT own row
NO UPDATE
NO DELETE
```

There is no V1 track-switching workflow.

---

## G.3 `user_pillar_self_report`

Implement:

```text
user_id
pillar_id
level
```

Allowed levels:

```text
dont_know
beginner
intermediate
advanced
```

This table must never become a completion/grading authority.

---

## G.4 `user_node_progress`

Use the documented sparse-row strategy.

Database rows represent:

```text
in_progress
completed
```

A missing row means:

```text
not_started
```

Do not pre-seed progress rows for every node.

Fields:

```text
user_id
node_id
status
first_opened_at
completed_at
last_quiz_score
updated_at
```

---

## G.5 `quiz_attempts`

Implement:

```text
attempt_id
user_id
node_id
questions_served
answers_selected
score
passed
submitted_at
```

Append-only from the client perspective.

---

# Part H — Indexes

Create the indexes defined in the Data Model document for:

- pillar → track
- topic → pillar
- subtopic → topic
- skill node → parent
- prerequisite reverse lookup
- resources → node
- questions → node
- progress → user
- attempts → user/node
- attempts → node/time

Do not add speculative indexes without evidence.

---

# Part I — RLS

Enable Row-Level Security on every exposed table.

## I.1 Public/readable content

Authenticated users can read:

```text
tracks
pillars
topics
subtopics
skill_nodes
resources
quiz_questions
```

Clients cannot write content.

---

## I.2 Quiz answers

Learner clients have:

```text
NO SELECT
```

on:

```text
quiz_answers
```

Only trusted server-side grading logic can access it.

---

## I.3 User data

Users can only read their own:

```text
profiles
user_active_track
user_pillar_self_report
user_node_progress
quiz_attempts
```

Use:

```sql
auth.uid()
```

for ownership checks.

---

## I.4 Protected mutation tables

No client direct INSERT/UPDATE/DELETE for:

```text
user_node_progress
quiz_attempts
```

These are RPC-only mutation paths.

---

# Part J — Signup Trigger

Create the documented `auth.users` signup trigger.

Behavior:

```text
new auth.users row
       ↓
create one profiles row
```

Requirements:

- idempotent enough to avoid duplicate profile creation
- no client race requirement
- correct foreign-key ownership
- no secret exposure

---

# Part K — RPC Function 1: `mark_node_opened()`

Signature:

```text
mark_node_opened(p_node_id TEXT)
```

Implement:

1. identify user with `auth.uid()`
2. verify node belongs to the user's active track
3. insert `in_progress` row if absent
4. do nothing if the row already exists

Must **not**:

- set completed
- change completed status
- reset first-opened timestamp
- trust client `user_id`

### Security hardening

Use:

```sql
SECURITY DEFINER
SET search_path = public, pg_temp
```

and explicit grants:

```sql
REVOKE EXECUTE FROM PUBLIC;
GRANT EXECUTE TO authenticated;
```

Follow the exact function hardening requirements from Data Model Part E.0.

---

# Part L — RPC Function 2: `submit_quiz_attempt()`

Signature:

```text
submit_quiz_attempt(
  p_node_id TEXT,
  p_question_ids UUID[],
  p_answers INTEGER[]
)
```

Implement in this order — chosen for clearer error messages when multiple things are wrong at once, not a security requirement (every gate below must pass regardless of order before grading can occur):

## L.1 Active-track validation

The node must belong to the user's active track.

## L.2 Structural validation

Require:

- exactly 5 question IDs
- exactly 5 answers
- no duplicate question IDs
- every answer index is 0–3

## L.3 Question ownership

All five questions must belong to:

```text
p_node_id
```

## L.4 Quiz eligibility

Require:

- node has been opened
- prerequisites are satisfied
- node belongs to active track

## L.5 Grading

Read the protected answer key from `quiz_answers`.

Calculate:

```text
score = correct answers
passed = score >= 4
```

Do not calculate pass status from a percentage.

## L.6 Attempt persistence

Insert one append-only `quiz_attempts` record.

## L.7 Progress transition

If passed and not already completed:

```text
in_progress → completed
```

If already completed:

```text
completed → completed
```

Failure can never revert completion.

## L.8 Latest score

Update:

```text
last_quiz_score
```

with the latest attempt result.

### Security hardening

This function is the most security-critical operation in the system — it's the only code path with grading access and the only path that can produce `completed` status. It requires the **same explicit hardening as `mark_node_opened`**, not just the general reference to Data Model Part E.0 — state it here directly so it isn't the one function this gets forgotten on:

Use:

```sql
SECURITY DEFINER
SET search_path = public, pg_temp
```

and explicit grants:

```sql
REVOKE EXECUTE FROM PUBLIC;
GRANT EXECUTE TO authenticated;
```

Derive the user exclusively from `auth.uid()` inside the function body — never accept a `user_id` parameter from the client. Follow the exact function hardening requirements from Data Model Part E.0.

---

# Part M — RPC Security Tests Before Leaving Phase 1

Test directly through SQL/RPC tooling before the frontend exists.

## M.1 Progress

- [ ] First node open creates `in_progress`.
- [ ] Second node open changes nothing.
- [ ] A completed node cannot regress.
- [ ] First completion sets `completed_at`.

## M.2 Prerequisites

- [ ] Locked node cannot submit quiz.
- [ ] Completing prerequisite unlocks dependent node.
- [ ] Cross-pillar prerequisite works.
- [ ] Missing/invalid prerequisite data fails safely.

## M.3 Quiz security

- [ ] Wrong node rejected.
- [ ] Fewer than five questions rejected.
- [ ] More than five questions rejected.
- [ ] Duplicate questions rejected.
- [ ] Invalid answer index rejected.
- [ ] Questions from another node rejected.
- [ ] Answer key cannot be selected/read by anon/authenticated client roles.

## M.4 User isolation

Create at least two test users.

Verify:

- [ ] User A cannot read User B progress.
- [ ] User A cannot mutate User B progress.
- [ ] User A cannot insert an attempt for User B.
- [ ] User A cannot access answer keys.

## M.5 Track isolation

- [ ] A user cannot create progress for a node outside the active track.
- [ ] Quiz submission for an outside-track node is rejected.

---

# Part N — Phase 1 Exit Gate

Do not begin Phase 2 until:

- [ ] all migrations succeed on a clean Supabase project
- [ ] all schema constraints work
- [ ] all indexes exist
- [ ] RLS policies work
- [ ] signup trigger works
- [ ] RPC security hardening matches the architecture document
- [ ] progress tests pass
- [ ] prerequisite tests pass
- [ ] quiz security tests pass
- [ ] user-isolation tests pass
- [ ] track-isolation tests pass
- [ ] repository contains reproducible migrations
- [ ] Phase 1 is committed

---

# Part O — Phase 2: Test Track

## O.1 Objective

Create a **small, disposable, structurally real** track so every frontend phase can be built and tested without waiting for the 2–3 real role tracks.

The content may be synthetic and minimal.

The structure, relationships, validation, progression, and security behavior must be real.

---

## O.2 Test track requirements

The test track should contain enough structure to exercise:

- track
- pillar
- multiple topics
- subtopic
- multiple Skill Nodes
- required node
- recommended/optional node where useful
- specialization node
- prerequisite relationship
- locked node
- unlocked node
- overview-depth node with `deep_dive = null`
- quiz pool
- resources

If practical, include a cross-pillar prerequisite as well.

---

## O.3 Recommended shape

Example:

```text
Test Track
│
└── Foundations
    │
    ├── Programming
    │   ├── Basics
    │   │   ├── Variables
    │   │   └── Functions
    │
    └── Concepts
        ├── Core
        │   ├── Data Structures
        │   └── Algorithms
        │
        └── Specialization
            └── Advanced Topic
```

The exact topic names are not important.

The relationships are.

---

## O.4 Required scenarios

The test track must support at least:

### Scenario 1 — normal progression

```text
Node A
  ↓
pass quiz
  ↓
Node B becomes eligible
```

### Scenario 2 — locked exploration

```text
Node B locked
  ↓
user can open/read
  ↓
quiz unavailable
```

### Scenario 3 — failed quiz

```text
2/5
 ↓
retry
 ↓
4/5
 ↓
completed
```

### Scenario 4 — completed retake

```text
completed
 ↓
3/5 retake
 ↓
still completed
```

### Scenario 5 — multiple active pillars

Two pillars must be independently progressable.

### Scenario 6 — specialization

A specialization branch must be visible and explorable.

### Scenario 7 — overview depth

A node with:

```text
recommended_depth = overview
deep_dive = null
```

must render correctly.

### Scenario 8 — cross-pillar prerequisite

If practical in the tiny tree:

```text
Node in Pillar B
   ↓ requires
Node in Pillar A
```

---

# Part P — Test Content

Test content does not need to be educationally polished.

However it must satisfy the same technical schema:

- valid definitions
- valid quiz shape
- valid resources
- valid classifications
- valid depths
- valid prerequisite graph
- valid content files
- valid IDs

The test track must pass the same validation pipeline used for real tracks.

There is **no test-track exemption from structural validation**.

---

# Part Q — Seed the Test Track

Seed it using the same trusted path intended for real content.

Do not create a completely separate database pathway just for testing.

The test track should exercise:

```text
content validation
→ seed eligibility
→ seed script
→ database
→ frontend reads
```

This verifies that the entire content pipeline and database model work together before real content is introduced.

---

# Part R — Phase 2 Acceptance Criteria

- [ ] Test track exists in the database.
- [ ] Track passes the same validation rules as real content.
- [ ] No orphaned records exist.
- [ ] Prerequisite graph is valid.
- [ ] Every test node renders from actual database data.
- [ ] At least one node is progression-locked.
- [ ] At least one required node is immediately eligible.
- [ ] At least one specialization node exists.
- [ ] At least one overview-depth node has no deep dive.
- [ ] Quiz pools are valid.
- [ ] Resources are valid.
- [ ] Test track can exercise cross-pillar behavior if included.
- [ ] Phase 2 seed is reproducible from the repository.
- [ ] Phase 2 is committed as a clean checkpoint.

Do not start Phase 3 until these criteria pass.

---

# Part S — Phase 3: Authentication

## S.1 Objective

Implement standalone Supabase authentication and protected routing.

This phase implements only authentication, not onboarding.

---

## S.2 Routes

Implement:

```text
/signup
/login
/forgot-password
```

Protect:

```text
/app/*
/onboarding/*
```

according to the UI/UX rules.

---

## S.3 Sign-up

Required:

- email
- password

Handle:

- loading
- invalid email
- email already used
- weak password
- successful registration

Successful registration should lead into the onboarding flow according to the documented routing behavior.

---

## S.4 Login

Handle:

- invalid credentials
- loading
- successful authentication
- redirect to originally requested route when applicable

The route behavior from the UI/UX specification must be preserved.

---

## S.5 Forgot password

Implement:

```text
resetPasswordForEmail()
```

with appropriate:

- loading state
- error state
- success message

Do not build an elaborate account-recovery system beyond the documented requirement.

---

## S.6 Logout

Provide a clear logout action.

After logout:

- protected routes require authentication
- session state is cleared
- the user cannot access protected application content as an authenticated user

---

# Part T — Protected Route Rules

Implement exactly:

### Unauthenticated user → protected route

```text
/app/*
    ↓
/login
    ↓
successful login
    ↓
original destination
```

### Authenticated user → no track

```text
/app
    ↓
/onboarding/goal
```

The exact "no track" condition should be based on `user_active_track`.

Do not invent an alternate onboarding state machine.

---

# Part U — Profile Creation

The Phase 1 signup trigger creates:

```text
profiles
```

Phase 3 must verify that:

- one signup creates one profile
- refreshing does not create duplicates
- repeated auth-state handling does not create duplicates

Do not create a second frontend profile-creation pathway unless the authoritative architecture requires it.

---

# Part V — Authentication State

Create one centralized authentication state mechanism.

It should expose enough information for the app shell to determine:

```text
loading
authenticated
unauthenticated
```

Do not duplicate auth listeners throughout every page.

---

# Part W — Phase 3 Acceptance Criteria

- [ ] Signup works.
- [ ] Login works.
- [ ] Logout works.
- [ ] Forgot-password request works.
- [ ] Loading states work.
- [ ] Field-specific authentication errors render correctly.
- [ ] Protected routes redirect unauthenticated users.
- [ ] Original destination is preserved after successful login where required.
- [ ] Authenticated user with no track redirects to onboarding.
- [ ] Exactly one profile row is created.
- [ ] Refresh preserves the authenticated session.
- [ ] No authentication secret is exposed beyond the documented public Supabase variables.
- [ ] Phase 3 is committed as a clean checkpoint.

---

# Part X — Phase 4: Onboarding

## X.1 Objective

Implement:

```text
Goal selection
→
Starting knowledge
→
Active track creation
→
Home
```

This phase still does **not** implement the complete track UI.

---

## X.2 Goal selection

Route:

```text
/onboarding/goal
```

Use the seeded tracks.

Display per track:

- name
- one-line/short description
- rough scope indicator where available

V1 has:

```text
one goal → one recommended track
```

Do not implement:

- custom AI goal generation
- track comparison
- multiple simultaneous tracks
- track switching

---

## X.3 Goal-selection data flow

When a user selects a track:

1. verify it exists
2. move to starting-knowledge screen
3. do not create fake progress
4. do not mark any skill completed

---

## X.4 Starting knowledge

Route:

```text
/onboarding/knowledge
```

Display one self-report selector per pillar:

```text
Don't know
Beginner
Intermediate
Advanced
```

Store answers in:

```text
user_pillar_self_report
```

---

## X.5 Critical self-report rule

Self-report must **never**:

- insert `user_node_progress` rows
- set nodes to completed
- bypass a quiz
- bypass a prerequisite
- unlock a node by itself
- set a mastery state

It is used only to compute the suggested starting point framing.

---

# Part Y — Active Track Creation

After starting-knowledge submission:

Create exactly one:

```text
user_active_track
```

row.

Client is allowed to insert the onboarding enrollment row according to the RLS policy.

Do not create a V1 track-switching mechanism.

---

# Part Z — Onboarding Completion

Successful onboarding should navigate to:

```text
/app
```

The Home screen may be the next phase's visual implementation, but Phase 4 only needs to establish the correct application state and redirect.

---

# Part AA — Phase 4 Acceptance Criteria

- [ ] Goal selection loads real seeded tracks.
- [ ] User can select exactly one V1 track.
- [ ] No custom goal generation exists.
- [ ] Starting knowledge displays one selector per pillar.
- [ ] All four levels are available.
- [ ] Self-report data is persisted correctly.
- [ ] Self-report does not touch `user_node_progress`.
- [ ] Self-report does not bypass any quiz or prerequisite.
- [ ] `user_active_track` is created once.
- [ ] Onboarding completion redirects to `/app`.
- [ ] Refresh after onboarding preserves active-track state.
- [ ] An authenticated user with an active track no longer gets redirected back to goal selection.
- [ ] No V2 onboarding behavior has been introduced.
- [ ] Phase 4 is committed as a clean checkpoint.

---

# Part AB — Phase-by-Phase Antigravity Execution Protocol

For every phase, use the same procedure.

## 1. Read the authority

Antigravity must read:

- the relevant sections of Documents 1–6
- this phase guide section

Do not ask Antigravity to infer the entire product from one prompt.

## 2. Inspect existing code before editing

Before changing files:

- inspect repository
- inspect package configuration
- inspect Supabase configuration
- inspect migrations
- inspect existing routes/components

Never blindly overwrite working code.

## 3. Implement only the active phase

Do not implement future-phase features "while you're here."

## 4. Run validation

Use:

```text
type checks
build
lint
tests
browser verification
Supabase verification where applicable
```

The exact commands depend on the scaffold.

## 5. Inspect real behavior

Do not rely solely on:

```text
"build succeeded"
```

Verify actual:

- browser behavior
- network requests
- database rows
- RPC behavior
- RLS enforcement

## 6. Compare to acceptance criteria

Every checkbox must be consciously evaluated.

## 7. Fix phase-specific issues

Do not silently expand scope to solve unrelated future concerns.

## 8. Commit checkpoint

Suggested commits:

```text
phase-0-scaffold
phase-1-database-security
phase-2-test-track
phase-3-authentication
phase-4-onboarding
```

---

# Part AC — Cross-Phase Rules

## Never skip acceptance criteria

A phase is complete only when all its acceptance criteria pass.

If an exception is necessary:

- document it
- state why
- identify what remains unresolved
- obtain an explicit decision before proceeding

Do not silently carry failures into the next phase.

## Never trust generated claims

A statement such as:

> "RLS is implemented."

is not evidence.

Evidence is:

> actual policy exists + actual test demonstrates the intended access restriction.

## Never let Antigravity expand product scope

When Antigravity proposes:

- a new feature
- a new table
- a new backend service
- a new progression rule
- a new AI call
- a V2 interaction

stop and compare it against the authoritative documents.

If it is not required for the active phase, defer it.

---

# Part AD — First Four Phase Completion Map

```text
PHASE 0
Scaffold
  ↓
Working React/Vite/TypeScript application
  ↓
Routes exist
  ↓
Supabase client exists

PHASE 1
Database + Security
  ↓
Schema
  ↓
RLS
  ↓
RPCs
  ↓
Direct security tests pass

PHASE 2
Test Track
  ↓
Real schema content
  ↓
Progress/lock/quiz scenarios available
  ↓
Validation + seed works

PHASE 3
Authentication
  ↓
Signup/Login/Logout
  ↓
Protected routes
  ↓
Profiles

PHASE 4
Onboarding
  ↓
Goal selection
  ↓
Self-report
  ↓
Active track
  ↓
Ready for Track UI
```

After Phase 4, the application should be technically ready to begin:

```text
Phase 5 — Track Overview + Pillar Tree
Phase 6 — Skill Detail
Phase 7 — Quiz Flow
Phase 8 — Dashboard + Recommendations
Phase 9 — Responsive & Accessibility
Phase 10 — Security & E2E
Phase 11 — Real Content Cutover
```

---

# Final Rule for Antigravity

> **Implement the smallest correct phase, prove it works against the authoritative documents, commit it, and only then move forward.**

The goal of Phases 0–4 is not to make Track Creator look finished.

The goal is to create a **reliable foundation**:

```text
Codebase
   +
Database
   +
Security
   +
Trusted RPCs
   +
Validated Test Track
   +
Authentication
   +
Onboarding
```

Once these are proven, the learner-facing Track/Skill/Quiz experience can be built on top without changing the foundation.
