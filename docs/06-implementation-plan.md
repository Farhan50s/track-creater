# Track Creator — Implementation Plan

**Document 6 of 6 (consolidated set) — final document before Antigravity**
**Depends on:** all of Documents 1–5
**Owns:** build sequencing, phase-by-phase acceptance criteria, overall V1 Definition of Done, Antigravity hand-off structure

**This document does not reopen or duplicate decisions.** Where a prior document already owns something exactly (RLS/RPC testing → Data Model doc Part L; content pipeline gates → AI Content Pipeline doc Part H), this document references it by name instead of restating it — restating it would create two sources of truth that can drift out of sync. This document's only job is: *in what order do we build this, and how do we know each piece is actually done.*

---

## Part A — Build Philosophy

**Schema first, real content in parallel with frontend, not before it.** The single biggest risk to this project's timeline isn't any technical decision — it's the ~15–50 hours of content authoring (AI Content Pipeline doc, Part L) sitting on the critical path in front of every other phase. That's the wrong shape. The plan below deliberately unblocks frontend development with a tiny hand-authored test track (Phase 2) as soon as the schema exists, so full content authoring for the real 2–3 role tracks can run **in parallel** with Phases 3–9, not before them.

**Parallel-track note:** Part L is intentionally a parallel workstream rather than another sequential numbered phase. It may begin after the schema/skeleton foundations are available and continues independently while Phases 3–9 are implemented.

```
Phase 0 → Phase 1 → Phase 2 (test track)
                          │
        ┌─────────────────┼─────────────────────────────┐
        ▼                                                 ▼
Phases 3–9 (frontend features,                  Content authoring for
built and tested against                        real 2–3 role tracks
the test track)                                 (AI Content Pipeline doc,
                                                 running independently)
        │                                                 │
        └─────────────────────┬───────────────────────────┘
                               ▼
                    Phase 10 (security/integration testing)
                               ▼
                    Phase 11 (real-content cutover)
```

---

## Part B — Phase 0: Environment & Scaffold

**Builds:** repo structure, Vite + React + TypeScript project init, Supabase project creation (standalone, per Data Model doc Part A), `.env` files for `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (Data Model doc Part H), base routing shell matching the route tree in the UI/UX doc, Part A.1.

**Acceptance criteria:**
- [ ] App boots to a blank shell at every route in UI/UX doc A.1 without errors
- [ ] Supabase project exists, is reachable from the frontend with the anon key
- [ ] `.env` is gitignored; no secret committed
- [ ] No feature logic yet — this phase is scaffolding only

---

## Part C — Phase 1: Database, RLS, RPC Functions

**Builds:** every table in Data Model doc Part C, every index (C.11), both RPC functions with full hardening (Part E.0–E.2), all RLS policies (Part F), the `profiles` signup trigger.

This phase is testable **entirely inside Supabase Studio / SQL, with no frontend involved** — deliberately sequenced first and in isolation so schema bugs are caught before any UI is built against a shifting foundation.

**Acceptance criteria (maps directly to Data Model doc Part L.1–L.3, don't re-derive — run those tests here):**
- [ ] All Data Model doc Part L.1 progress-transition tests pass via direct RPC calls
- [ ] All Part L.2 prerequisite tests pass
- [ ] All Part L.3 security tests pass, including: user A cannot read/write user B's rows; no client policy exists on `user_node_progress`, `quiz_attempts`, or `quiz_answers`; `search_path` and `EXECUTE` grants match Part E.0 exactly
- [ ] `node_in_users_active_track()` correctly rejects a node from an unenrolled track (Data Model doc Part E.0)
- [ ] Database migrations are version-controlled and can recreate the schema, indexes, RLS policies, triggers, and RPC functions from a clean Supabase project

---

## Cross-Phase Completion Rule

A phase is complete only when **all of its acceptance criteria pass**. Dependent phases should not be treated as complete while a prior phase still has known failed acceptance criteria. If a deliberate exception is necessary, record the exception explicitly before proceeding rather than silently carrying the failure forward.

## Part D — Phase 2: Test Track (unblocks everything else)

**Builds:** one small, entirely fictional or trivial skill tree — e.g. 1 pillar, 2 topics, 4–6 skill nodes with real prerequisite edges, placeholder content that doesn't need to be good (this is throwaway, not draft-quality real content). Seeded by hand or via a minimal run of the AI Content Pipeline scripts against a toy skeleton — either is fine, the only requirement is that it exercises every field and relationship the real schema supports (a locked node, a specialization branch, a node with a cross-pillar-style prerequisite if feasible at this tiny scale).

**Why this phase exists, explicitly:** every frontend phase below needs *something* seeded to render against. Waiting for the real 100–150-node authored tracks (AI Content Pipeline doc, Part L) before starting any UI work would idle frontend development for the length of the entire authoring effort. This phase exists purely to remove that dependency.

**Test-track rule:** the content may be synthetic/minimal because this track is disposable; its **schema, relationships, progression behavior, prerequisite graph, and validation requirements must be fully real**. Structural validity is never relaxed.

**Acceptance criteria:**
- [ ] Test track passes the same validation gate as real content would (AI Content Pipeline doc, Part H) — it's not exempt from the rules just because it's throwaway
- [ ] Contains at least one locked node, one unlocked required node, one specialization node, one node with an empty `deep_dive` (overview depth)

---

## Part E — Phase 3: Authentication

**Builds:** sign up / login / forgot password / logout (UI/UX doc, C.2), protected route redirect behavior (UI/UX doc, A.3), `profiles` row creation via the Phase 1 trigger.

**Acceptance criteria:**
- [ ] All UI/UX doc C.2 states implemented: loading, field-specific errors, success redirect
- [ ] Unauthenticated access to any `/app/*` route redirects to `/login` and returns to the original route post-login (UI/UX doc, A.3)
- [ ] Signing up creates exactly one `profiles` row, no duplicates on retry

---

## Part F — Phase 4: Onboarding

**Builds:** goal selection (UI/UX doc, C.3), starting-knowledge self-report (C.4), `user_active_track` insert, `user_pillar_self_report` inserts.

**Acceptance criteria:**
- [ ] Self-report never writes to `user_node_progress` (UI/UX doc, C.4's explicit rule — verify no accidental status writes here)
- [ ] `user_active_track` insert succeeds once and only once per user; attempting to re-run onboarding after a track is already active is not a supported flow in V1 (Data Model doc, C.2) — this phase doesn't need to handle it gracefully beyond not crashing
- [ ] Completing onboarding redirects to `/app`

---

## Part G — Phase 5: Track Overview + Pillar Tree

**Builds:** Track Overview screen (UI/UX doc, C.6), Pillar view expandable tree (C.7), Node Card component (C.8) — this is where the Progress spec's client-side derived logic (Progress spec, Part D) gets implemented in TypeScript for the first time: `is_locked`, `pillar_percent`, `tree_order`.

**Acceptance criteria:**
- [ ] `is_locked` matches Progress spec Part B.1 exactly against the test track's known-locked node
- [ ] `pillar_percent` matches Progress spec Part D.1 (required-nodes-only, correct rounding)
- [ ] Tree traversal order matches Progress spec C.2 (Topic.order → Subtopic.order → SkillNode.order) — verify against the test track's authored order, not just "looks right"
- [ ] Locked nodes are visible and tappable, not hidden (UI/UX doc, C.8)

---

## Part H — Phase 6: Skill Detail Page

**Builds:** full detail page (UI/UX doc, C.9) — content sections, lock banner with `unmet_prerequisites` (Progress spec, B.3), Quick Overview/Deep Dive toggle, resources display, quiz entry button gated by `can_start_quiz` (Progress spec, F.6).

**Acceptance criteria:**
- [ ] Opening a node triggers `mark_node_opened()` on first view and avoids unnecessary duplicate calls during normal rendering; repeated calls must remain harmless because the RPC is idempotent (Data Model doc, E.1)
- [ ] Lock banner text matches the exact format from UI/UX doc C.9 / Progress spec B.3 ("Complete these first: ✅ ... ❌ ...")
- [ ] Start Quiz button is disabled with a tooltip when `is_locked` is true, per UI/UX doc C.9 — and attempting to call the quiz RPC anyway (e.g. via devtools) is rejected server-side, not just hidden client-side (this is the actual security boundary, not the disabled button)
- [ ] `deep_dive == null` renders gracefully (no "undefined" or broken toggle) for overview-depth nodes

---

## Part I — Phase 7: Quiz Flow

**Builds:** full quiz flow (UI/UX doc, C.10) — start screen, question navigation, submission via `submit_quiz_attempt()`, result screen, retry, abandonment behavior.

**Acceptance criteria (maps to Data Model doc Part L.4, run those tests here):**
- [ ] Exactly 5 questions served, randomly selected client-side (AI Content Pipeline doc doesn't apply here — this is Progress spec F.2/Data Model E.3 territory)
- [ ] Submitting fewer/more/duplicate question IDs is rejected server-side (Data Model doc, E.2 step 2) — test this directly, don't just trust the UI never produces malformed payloads
- [ ] 4/5 passes, 3/5 fails — verify the literal integer rule, not a percentage calculation anywhere in the code (Progress spec, F.1)
- [ ] Abandoning mid-quiz creates no `quiz_attempts` row (UI/UX doc, C.10)
- [ ] A failed retake on an already-`completed` node leaves status `completed` (Progress spec, F.4 / Data Model E.2 step 5)

---

## Part J — Phase 8: Home Dashboard + Recommendation Engine

**Builds:** Home screen (UI/UX doc, C.5) — Active Learning panel, single "Recommended Next" card, track-complete state. This is where the full Progress spec Part E algorithm gets implemented: `focus_pillar`, `recommended_next` with the four-step fallback (current required → blocked-prerequisite pointer → recommended/optional → next pillar), `active_pillars`.

**Acceptance criteria:**
- [ ] `focus_pillar` correctly prioritizes an already-started pillar over an untouched one, tie-broken by pillar order (Progress spec, E.1) — construct a test-track scenario with two active pillars at different %s and verify the higher one wins
- [ ] The blocked-required-node fallback (Progress spec, E.2, fix #3) correctly points at the actual missing prerequisite, even when it's in a different pillar than the focus pillar — this is the one most likely to be implemented wrong if the fallback order isn't followed exactly, so give it a dedicated test case
- [ ] Track-complete state (Progress spec, E.4) triggers correctly at 100% required-node completion and lists remaining optional nodes if any

---

## Part K — Phase 9: Responsive & Accessibility Polish

**Builds:** breakpoint behavior (UI/UX doc, B.5), keyboard/focus/contrast requirements (B.6), skeleton loading states (C.11) across every screen built in Phases 3–8.

**Acceptance criteria:**
- [ ] Every screen tested at the three breakpoints defined in UI/UX doc B.5 — not just "looks fine on my monitor"
- [ ] Quiz options are real focusable/labelled elements, not `<div onClick>` (UI/UX doc, B.6)
- [ ] Status is never color-only anywhere (lock state, progress state, required/recommended/optional/specialization tags) — spot-check against B.6 explicitly

---

## Part L — Parallel Track: Real Content Authoring

**Runs independently of Phases 3–9**, using the full AI Content Pipeline doc end-to-end (Parts B–J) for each of the 2–3 real role tracks: skeleton authoring, generation, human review against the Skill & Content Model's Part G checklist, manual resource curation, full validation, seed-eligibility manifest.

**Acceptance criteria:** the AI Content Pipeline doc's own Part P Definition of Done, in full, for each real track — not re-derived here. This phase is "done" when every track has a `seed_eligible: true` manifest (AI Content Pipeline doc, Part H).

---

## Part M — Phase 10: Security & Integration Testing

**Runs after Phases 1–9 are functionally complete**, against the test track. Executes the full Data Model doc Part L test suite (L.1–L.5) end-to-end through the actual deployed frontend, not just direct RPC calls this time — the Phase 1 tests proved the database enforces the rules; this phase proves the *shipped app* actually calls the database correctly and can't be tricked by browser devtools into bypassing what Phase 1 already secured.

**Additional end-to-end flows** (Data Model doc, Part L doesn't cover full-journey tests — this is genuinely new, not a duplicate):
- [ ] Sign up → onboarding → open node → fail quiz → retry → pass quiz → next node unlocks → repeat across two pillars in parallel → both show correctly in Active Learning panel
- [ ] Attempt to access a locked node's quiz directly via URL manipulation — rejected server-side
- [ ] Attempt to submit a quiz for a node outside the user's active track — rejected server-side (Data Model doc, E.0)
- [ ] Refresh mid-session at every major route — state reloads correctly from the server, nothing resets to a client-only default

---

## Part N — Phase 11: Real-Content Cutover

**Builds:** switching the deployed app from the Phase 2 test track to the real, validated, seeded role tracks from Phase L. Test track is removed or clearly marked non-production before public launch.

**Acceptance criteria:**
- [ ] All real tracks seeded via the AI Content Pipeline doc's Part I process (service-role key, dependency order, post-seed verification per Data Model doc I.5)
- [ ] Full Phase 10 test suite re-run against real content, not just the test track — a subtle content-authoring mistake (e.g. a cyclical prerequisite the validator somehow missed) is a different risk class than a frontend bug, worth one more pass
- [ ] Test track removed from the onboarding goal-selection list

---

## Part O — Final V1 Definition of Done (product-level)

This is the complete, end-to-end checklist — the union of every phase's acceptance criteria stated as user-facing outcomes, plus the Data Model doc's own Part O technical-readiness checklist (referenced, not repeated):

- [ ] A new user can register, complete onboarding, and land on a populated Home screen
- [ ] The tree renders correctly across all breakpoints with accurate lock/progress/classification states
- [ ] A locked node is explorable but its quiz is inaccessible, both client- and server-side
- [ ] Completing a quiz at 4/5+ unlocks the correct next node, matching `tree_order`
- [ ] Multiple pillars progress independently and simultaneously, each with its own Current Focus
- [ ] The Home screen recommendation correctly implements the anti-hopping fallback priority (Progress spec, E.2)
- [ ] No live AI call exists anywhere in the deployed application's code path (Data Model doc, invariant list)
- [ ] No secret (service-role key, Gemini key) exists in any frontend bundle
- [ ] All real V1 role tracks are seeded, validated, and reviewed — no placeholder/test content remains live
- [ ] Data Model doc's Part O checklist is fully checked
- [ ] AI Content Pipeline doc's Part P checklist is fully checked for every real track
- [ ] Every phase's acceptance criteria have passed, or any explicitly approved exception is documented

---

## Part P — Antigravity Hand-off Notes

Each phase above (B through K, plus N) is scoped to become **one Antigravity prompt**, built and reviewed independently rather than handing over the entire six-document set at once — a single giant prompt would force Antigravity to infer sequencing and priority that this document has already decided explicitly. When writing each prompt: cite the specific document + Part being implemented (e.g. "Progress spec, Part E.2") rather than re-explaining the rule in your own words in the prompt — pointing Antigravity at the authoritative section keeps the prompt itself short and keeps the documents as the actual source of truth, not a paraphrase of them that could drift.

---

## Part Q — What this document deliberately excludes

- Any new product or technical decision — every rule referenced here already has exactly one home in Documents 1–5
- V2 features (visual graph, custom AI tracks, practice gates, social features, and the rest of the exclusion lists already stated in each prior document) — not re-listed here to avoid a seventh place these could quietly drift out of sync
- Marketing/launch planning, pricing, or anything beyond "the V1 product exists and works end-to-end"
