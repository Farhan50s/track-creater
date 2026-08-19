# Track Creator — Component & Phase Verification Specification

**Document 8 — Verification & Testing Guide for Antigravity**

**Purpose:** This document tells Antigravity how to verify each component and phase after implementation. It is a testing/verification specification, not a new product specification.

**Depends on:** Documents 1–7, especially:
- V1 Locked Decisions
- UI/UX & Information Architecture
- Progress, Prerequisite & Quiz Specification
- Data Model & Technical Architecture
- AI Content Pipeline
- Implementation Plan
- Antigravity Phases 0–4 Implementation Guide

---

# Part A — Verification Philosophy

## A.1 Core rule

> **Do not report a component as complete because it builds. Prove that it behaves correctly in the real application.**

Every implemented component must be checked at the appropriate level:

```text
Static/code verification
        ↓
Unit/component verification
        ↓
Integration verification
        ↓
Browser/UI verification
        ↓
Database/RLS verification
        ↓
End-to-end verification
```

Not every component requires every level, but every acceptance criterion must have an observable verification method.

---

# Part B — Evidence Requirements

For every verification task, Antigravity should report:

```text
Component / Phase:
Expected behavior:
Test performed:
Actual result:
Status:
Evidence:
```

### Acceptable evidence

- test output
- browser behavior
- network request/response inspection
- actual database row
- actual RPC result
- RLS rejection
- screenshot where useful
- console output
- build/type-check result

### Unacceptable evidence

Do not treat these as proof by themselves:

- "Implementation looks correct."
- "The function is present."
- "Build passed."
- "No errors appeared."
- "The AI verified it."
- "The code logically should work."

---

# Part C — Test Status Vocabulary

Use exactly:

```text
PASS
FAIL
BLOCKED
NOT TESTED
```

### PASS

Expected behavior was observed and evidence exists.

### FAIL

Expected behavior was not observed.

### BLOCKED

Testing could not proceed because a dependency/environment issue prevented verification.

### NOT TESTED

The component exists, but its verification has not yet been executed.

Never mark `PASS` when the correct status is `BLOCKED` or `NOT TESTED`.

---

# Part D — Global Verification Checklist

Before declaring any phase complete:

## Build

- [ ] TypeScript passes
- [ ] production build passes
- [ ] lint passes if configured
- [ ] no unresolved runtime errors
- [ ] no unexpected browser console errors

## Runtime

- [ ] required route loads
- [ ] expected UI appears
- [ ] loading state works
- [ ] error state works where applicable
- [ ] refresh preserves expected state

## Backend

- [ ] expected Supabase request occurs
- [ ] correct table/function is used
- [ ] response is handled correctly
- [ ] actual database state changes as expected

## Security

- [ ] protected resources require authentication
- [ ] RLS is enforced
- [ ] protected mutation cannot be performed directly
- [ ] no secret appears in browser code or network payloads

## UX

- [ ] desktop behavior checked
- [ ] mobile behavior checked
- [ ] keyboard/focus behavior checked where applicable
- [ ] status is not communicated by color alone

---

# Part E — Phase 0 Verification: Environment & Scaffold

## E.1 Project boot

Test:

```bash
npm install
npm run dev
npm run build
```

### Expected

- installation succeeds
- dev server starts
- production build succeeds
- no TypeScript compilation errors

## E.2 Route smoke test

Open each route:

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

### Expected

- route resolves
- no crash
- no malformed URL handling
- placeholder screen identifies the route

## E.3 Environment test

Verify:

- [ ] Supabase URL comes from environment
- [ ] anon key comes from environment
- [ ] no hard-coded secret exists
- [ ] `.env` is ignored
- [ ] `.env.example` contains placeholders only

## E.4 Supabase client test

Verify in browser/network:

- Supabase client initializes
- no duplicate client initialization exists
- no request is made to a non-existent backend

## E.5 Phase 0 exit

PASS only when all Phase 0 acceptance criteria in Document 7 are satisfied.

---

# Part F — Phase 1 Verification: Database, RLS & RPC

This is the most security-sensitive test phase.

## F.1 Schema verification

Verify existence of:

```text
tracks
pillars
topics
subtopics
skill_nodes
node_prerequisites
resources
quiz_questions
quiz_answers
profiles
user_active_track
user_pillar_self_report
user_node_progress
quiz_attempts
```

Verify expected:

- primary keys
- foreign keys
- CHECK constraints
- unique constraints
- indexes

## F.2 Clean migration verification

Create/use a clean Supabase environment and run migrations from scratch.

Expected:

- schema builds without manual fixes
- migrations are reproducible
- no undocumented dashboard changes are required

---

# Part G — RLS Verification

Use at least two test users:

```text
User A
User B
```

## G.1 Content reads

Authenticated User A should be able to read:

- tracks
- pillars
- topics
- subtopics
- skill_nodes
- resources
- quiz_questions

## G.2 Answer-key protection

User A must NOT be able to read:

```text
quiz_answers
```

Test both:

- frontend client query
- direct authenticated database access through the client role

Expected:

```text
DENIED
```

## G.3 User isolation

Create progress/attempt data for User A.

Attempt as User B:

- read User A progress
- mutate User A progress
- read User A attempts

Expected:

```text
DENIED
```

## G.4 Direct progress mutation

Attempt direct client-side:

```text
INSERT user_node_progress
UPDATE user_node_progress
DELETE user_node_progress
```

Expected:

```text
DENIED
```

## G.5 Direct attempt mutation

Attempt:

```text
INSERT quiz_attempts
UPDATE quiz_attempts
DELETE quiz_attempts
```

Expected:

```text
DENIED
```

## G.6 Active-track isolation

Assign User A to Track A.

Attempt to create progress for a node from Track B.

Expected:

```text
REJECTED
```

---

# Part H — RPC Verification

## H.1 `mark_node_opened()`

### Test 1 — first open

Input:

```text
valid active-track node
```

Expected:

```text
progress row created
status = in_progress
first_opened_at populated
```

### Test 2 — repeated open

Call again.

Expected:

```text
no duplicate row
status unchanged
first_opened_at unchanged
```

### Test 3 — foreign-track node

Expected:

```text
rejected
```

### Test 4 — nonexistent node

Expected:

```text
rejected safely
```

---

# Part I — Quiz RPC Verification

## I.1 Valid submission

Use:

```text
5 valid question IDs
5 answers
```

Expected:

- attempt row created
- correct score calculated
- passed value correct
- node completion changes only when score >= 4

## I.2 Score matrix

Test:

```text
0/5 → fail
1/5 → fail
2/5 → fail
3/5 → fail
4/5 → PASS
5/5 → PASS
```

This is an exact integer rule.

## I.3 Invalid question count

Test:

```text
0
1
4
6
7
```

Expected:

```text
rejected
```

## I.4 Duplicate question IDs

Submit repeated IDs.

Expected:

```text
rejected
```

## I.5 Wrong-node questions

Use five valid questions from another node.

Expected:

```text
rejected
```

## I.6 Invalid answer indices

Test:

```text
-1
4
5
999
```

Expected:

```text
rejected
```

## I.7 Locked node

Attempt quiz submission while prerequisite is incomplete.

Expected:

```text
rejected
no attempt row
no progress completion
```

## I.8 Unopened node

Attempt quiz submission without an `in_progress` record.

Expected:

```text
rejected
```

## I.9 Retake after completion

Complete the node.

Then submit:

```text
3/5
```

Expected:

```text
status remains completed
```

Then submit:

```text
5/5
```

Expected:

```text
status remains completed
last_quiz_score updates
```

---

# Part J — Phase 2 Test Track Verification

The test track must exercise real relationships.

Verify:

- [ ] locked node exists
- [ ] immediately eligible required node exists
- [ ] specialization node exists
- [ ] overview-depth node with `deep_dive = null` exists
- [ ] prerequisite edge works
- [ ] quiz pool exists
- [ ] resources exist
- [ ] content validates
- [ ] seed process succeeds

The test track must not use special bypasses that real production content would not use.

---

# Part K — Phase 3 Authentication Verification

## K.1 Signup

Test:

```text
valid email + valid password
```

Expected:

- account created
- profile created exactly once
- onboarding is the next appropriate destination

## K.2 Duplicate signup

Use an existing email.

Expected:

```text
field-specific error
```

## K.3 Invalid password

Expected:

```text
clear field-specific error
```

## K.4 Login

Valid credentials:

```text
login succeeds
session exists
```

## K.5 Invalid login

Expected:

```text
clear authentication error
```

## K.6 Logout

After logout:

- session removed
- protected route blocked

## K.7 Protected route

Unauthenticated user opens:

```text
/app
```

Expected:

```text
redirect to /login
```

Then after login:

```text
return to original destination
```

## K.8 Refresh

Refresh authenticated page.

Expected:

```text
session remains valid
```

## K.9 Forgot password

Expected:

- request accepted
- appropriate success/error message
- no raw backend error shown

---

# Part L — Phase 4 Onboarding Verification

## L.1 Goal selection

Expected:

- real seeded tracks appear
- track cards contain expected metadata
- selecting one track advances to knowledge selection

Ensure no custom AI track generation exists.

## L.2 Starting knowledge

For every pillar test:

```text
Don't know
Beginner
Intermediate
Advanced
```

Expected:

- selected value persists
- row is stored in `user_pillar_self_report`

## L.3 Self-report integrity

Immediately after onboarding, verify:

```text
user_node_progress
```

contains no auto-completed nodes.

Self-report must not:

- complete a node
- unlock by itself
- bypass a quiz

## L.4 Active track creation

Expected:

```text
one user_active_track row
```

No duplicate row.

## L.5 Onboarding completion

Expected:

```text
/onboarding/knowledge
        ↓
/app
```

Refresh should preserve active track.

---

# Part M — Component-Level UI Verification

Use this section after each frontend component is built.

## M.1 Buttons

Test:

- default
- hover
- focus
- disabled
- loading
- click action
- keyboard activation

Expected:

- correct action
- no double-submission
- accessible focus state

## M.2 Forms

For each form test:

- valid input
- empty input
- invalid input
- loading submission
- server error
- success
- keyboard submission

## M.3 Expandable tree row

Test:

- collapsed
- expanded
- keyboard interaction
- locked node
- current-focus node
- completed node
- classification badge

## M.4 Status indicators

Test:

```text
Not Started
In Progress
Completed
```

Expected:

- distinct visual state
- text/icon supports color
- accessible label

## M.5 Lock state

Test:

- visible
- tappable
- opens detail page
- shows lock reason
- does not start quiz

## M.6 Progress bar

Test:

- 0%
- partial
- 100%
- required-node-only calculation

## M.7 Modal/dialog/toast

Verify:

- keyboard focus
- close behavior
- readable text
- no duplicate notifications
- no blocking errors incorrectly shown as success

---

# Part N — Skill Detail Verification

After Phase 6 implementation, test:

## N.1 Content

- definition renders
- role-specific explanation renders
- quick overview renders
- deep dive expands/collapses
- null deep dive does not break the UI
- resources render correctly

## N.2 Locked node

Expected:

- content remains readable
- lock banner appears
- prerequisite links are correct
- Start Quiz disabled
- direct RPC still rejected

## N.3 Open event

Opening the page:

```text
not_started → in_progress
```

Verify:

- actual RPC call
- actual database row
- refresh preserves state
- no unnecessary repeated state transitions

---

# Part O — Quiz UI Verification

## O.1 Start screen

Verify:

- 5 questions
- 4/5 required to pass
- unlimited retries

## O.2 Question UI

Test:

- one question visible
- four options
- no Next before selection
- keyboard navigation
- focus state

## O.3 Submission

Test:

- all answers selected
- final submit
- actual RPC call
- server result displayed

## O.4 Pass

With 4/5:

Expected:

```text
Completed
next eligible node shown
```

## O.5 Fail

With 3/5:

Expected:

```text
Review and Retry
```

Node remains incomplete.

## O.6 Abandonment

Leave quiz before submit.

Expected:

```text
no attempt row
```

## O.7 Retake

Completed node → failed retake.

Expected:

```text
still Completed
```

---

# Part P — Progress & Recommendation Verification

## P.1 Current Focus

Verify exact tree order:

```text
Topic.order
→ Subtopic.order
→ SkillNode.order
```

Current Focus must be:

```text
first incomplete required node
whose prerequisites are satisfied
```

## P.2 Multiple active pillars

Create progress in two pillars.

Expected:

- both appear in Active Learning
- each has its own focus
- neither blocks the other unnecessarily

## P.3 Focus pillar

Create two active pillars with different percentages.

Expected:

```text
higher completion % wins
```

Tie:

```text
pillar.order wins
```

## P.4 Recommendation fallback

Verify this priority:

```text
1. current eligible required node
2. actual blocking prerequisite when a required path is blocked
3. recommended/optional content when required work is finished
4. next pillar when appropriate
```

The recommendation must not tell the learner to ignore an outstanding required prerequisite in favor of optional content.

## P.5 Completion

At:

```text
100% required-node completion
```

Expected:

```text
track complete
```

Optional/recommended/specialization nodes do not block required completion.

---

# Part Q — Responsive Verification

Test at minimum:

```text
Mobile: <640px
Tablet: 640–1024px
Desktop: >1024px
```

For every phase-built screen verify:

- no horizontal overflow
- readable text
- usable controls
- tree remains navigable
- quiz remains usable
- buttons remain tappable
- content does not overlap
- no broken layout after orientation/resize

---

# Part R — Accessibility Verification

For every interactive screen:

- [ ] keyboard navigation works
- [ ] focus is visible
- [ ] controls are reachable in logical order
- [ ] status is not color-only
- [ ] buttons are semantic buttons
- [ ] quiz options are semantic interactive elements
- [ ] text contrast is acceptable
- [ ] lock/progress information is understandable without color

Where a tree is expandable, verify:

- focus target
- expand/collapse control
- current state is announced or otherwise exposed
- keyboard access works

---

# Part S — Browser/Network Verification

For every feature involving Supabase:

Inspect actual network behavior.

Verify:

```text
UI action
  ↓
expected Supabase request
  ↓
expected response
  ↓
expected database state
  ↓
expected UI state
```

Examples:

```text
Open node
→ mark_node_opened RPC
→ progress row
→ In Progress UI
```

```text
Pass quiz
→ submit_quiz_attempt RPC
→ attempt row + progress completion
→ Completed UI
```

Do not rely on mocked frontend state as proof.

---

# Part T — Security Verification in Browser

Attempt malicious/manual actions:

## T.1 Direct URL manipulation

Open locked quiz route directly.

Expected:

- quiz is not usable
- server still rejects invalid submission

## T.2 DevTools mutation attempt

Attempt to call:

```text
submit_quiz_attempt
```

manually with:

- locked node
- wrong-node questions
- 6 questions
- duplicate questions
- invalid answer index

All must fail.

## T.3 Cross-user attempt

Using User B's session, attempt to target User A's node/progress data.

Expected:

```text
rejected
```

## T.4 Answer-key query

Attempt to query:

```text
quiz_answers
```

from browser client.

Expected:

```text
denied
```

---

# Part U — Phase 10 End-to-End Verification

Perform the complete real journey:

```text
Signup
 ↓
Login/session
 ↓
Choose track
 ↓
Self-report knowledge
 ↓
Home
 ↓
Open pillar
 ↓
Open skill
 ↓
In Progress
 ↓
Read
 ↓
Start quiz
 ↓
Fail
 ↓
Retry
 ↓
Pass 4/5
 ↓
Completed
 ↓
Next node available
 ↓
Continue in another pillar
 ↓
Active Learning shows both pillars
 ↓
Refresh
 ↓
Everything remains correct
```

This is the minimum true product-flow verification.

---

# Part V — Real-Content Cutover Verification

When real content replaces the test track:

## V.1 Content integrity

Verify:

- all real tracks are validated
- all are `seed_eligible: true`
- all required nodes exist
- all quiz pools are valid
- all prerequisites are valid
- no placeholder text remains

## V.2 UI integrity

Open representative nodes from:

- every track
- every pillar
- different depths
- locked/unlocked examples
- specialization examples
- nodes with cross-pillar prerequisites

## V.3 Progress integrity

Test at least one end-to-end path per real track.

---

# Part W — Regression Testing After Each Phase

Before starting the next phase, rerun:

### Always

- build
- TypeScript
- current phase acceptance tests
- critical previously completed flow

### After backend changes

Also rerun:

- RLS smoke tests
- RPC smoke tests
- auth/session smoke test

### After UI changes

Also rerun:

- route smoke test
- mobile smoke test
- keyboard smoke test

### After data/content changes

Also rerun:

- content validation
- prerequisite validation
- seed verification where applicable

---

# Part X — Final V1 Verification Checklist

Do not declare V1 complete until all are PASS:

## Product

- [ ] User can register
- [ ] User can choose a role
- [ ] User can self-report starting knowledge
- [ ] User receives the correct track
- [ ] User can explore locked nodes
- [ ] User cannot officially progress through unmet prerequisites
- [ ] User can study a node
- [ ] User can take the quiz when eligible
- [ ] 4/5 completes the node
- [ ] 3/5 does not
- [ ] Completed cannot regress
- [ ] Multiple pillars can progress independently
- [ ] Recommendation behavior matches the specification

## Technical

- [ ] Migrations reproducible
- [ ] RLS verified
- [ ] RPC security verified
- [ ] Answer keys protected
- [ ] Secrets protected
- [ ] No live AI runtime path
- [ ] Real content validated
- [ ] Real content seeded correctly

## UX

- [ ] All required screens work
- [ ] Loading states work
- [ ] Error states work
- [ ] Empty states work
- [ ] Mobile verified
- [ ] Tablet verified
- [ ] Desktop verified
- [ ] Accessibility verified

## Evidence

- [ ] All phase acceptance criteria PASS
- [ ] No unresolved critical FAIL
- [ ] No unacknowledged BLOCKED item
- [ ] Final browser verification completed
- [ ] Final database/security verification completed

---

# Part Y — Antigravity Test Report Template

After each phase, produce a report in this format:

```markdown
# Phase X Verification Report

## Summary

Status: PASS / FAIL / BLOCKED

## Build

- TypeScript: PASS/FAIL
- Production build: PASS/FAIL
- Lint: PASS/FAIL

## Acceptance Criteria

| Criterion | Status | Evidence |
|---|---|---|
| ... | PASS | ... |
| ... | PASS | ... |
| ... | FAIL | ... |

## Database Verification

- Expected rows:
- Actual rows:
- RPC:
- Result:

## Security Verification

- RLS:
- Unauthorized mutation:
- Cross-user access:
- Answer-key protection:

## UI Verification

- Desktop:
- Tablet:
- Mobile:
- Keyboard:

## Known Issues

1. ...

## Scope Check

- No future-phase features added: YES/NO
- No product decisions changed: YES/NO

## Final Decision

PASS / FAIL / BLOCKED

## Recommended Next Step

...
```

---

# Final Verification Rule

> **Antigravity must prove each component against the authoritative specification before declaring it complete.**

The correct workflow is:

```text
BUILD
  ↓
TEST
  ↓
OBSERVE REAL RESULT
  ↓
COMPARE WITH SPECIFICATION
  ↓
FIX
  ↓
RETEST
  ↓
ACCEPT
  ↓
COMMIT
  ↓
NEXT PHASE
```

A successful build is not the end of a phase.

**Verified behavior is the end of a phase.**
