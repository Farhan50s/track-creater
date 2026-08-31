# Track Creator — Project State Ledger (`PROJECT_CONTEXT.md`)

## 1. Project Overview
Track Creator is a role-aligned skill tracking web application built on progressive mastery principles.

- **Stack**: React, Vite, TypeScript, Supabase (PostgreSQL, RLS, Auth, RPCs).
- **Backend Model**: Supabase is the sole backend. All progress mutations and quiz scoring execute through hardened Postgres RPCs (`mark_node_opened`, `submit_quiz_attempt`).

---

## 2. Phase Execution State Ledger

| Phase | Description | Status | Verification Evidence |
|---|---|---|---|
| **Phase 0** | Environment & Scaffold | `PASS` | Clean Vite/React scaffold, routing placeholders, centralized Supabase client |
| **Phase 1** | Database, RLS & RPC Functions | `PASS` | 8 SQL migrations, RLS enabled on all tables, `quiz_answers` security, `handle_new_user` trigger |
| **Phase 2** | Test Track & Seeding | `PASS` | `track-creator-test` seeded (2 pillars, 6 nodes), DAG validation pipeline, hash manifests |
| **Phase 3** | Authentication & Protected Routing | `PASS` | `AuthContext`, `ProtectedRoute`, `PublicOnlyRoute`, `OnboardingGuard`, session restore |
| **Phase 4** | Onboarding & Track Activation | `PASS` | Goal selection (`/onboarding/goal`), self-report (`/onboarding/knowledge`), zero progress invariant |
| **Phase 5** | Track Overview & Expandable Pillar Tree | `PASS` | `/app/track` overview, `/app/track/:pillarId` tree, soft-locked nodes, required-only percentages |
| **Phase 6** | Skill Detail Page & Progress Trigger | `PASS` | `/app/node/:nodeId` learning surface, `mark_node_opened` RPC on mount, lock banner, curated resources, overview-depth null deep-dive handling |
| **Phase 7** | Quiz Flow & Server Grading | `PASS` | `/app/node/:nodeId/quiz` 3-screen carousel, Fisher-Yates sampling (5 questions), zero answer-key leaks, literal 4/5 integer threshold, non-degrading retakes, abandonment safeguard |
| **Phase 8** | Home Dashboard & Recommendation Engine | `PASS` | `/app` landing dashboard, TrackSummaryBanner with required-only completion %, Active Learning panel with parallel pillar cards, 4-step recommendation engine, 100% completion celebration card |
| **Phase 9** | Responsive & Accessibility Polish | `NEXT` | Mobile/desktop viewport testing, ARIA compliance, keyboard flows |
| **Phase 10** | Security & Integration Testing | `PENDING` | End-to-end user journey verification, secret leak audits |
| **Phase 11** | Real-Content Cutover | `PENDING` | Full 2-3 role track authoring, validation, and database seeding |

---

## 3. Latest Milestone Completed
**Phase 8: Home Dashboard & Recommendation Engine**
- Built `/app` live home landing surface replacing previous placeholder shell.
- Implemented pure deterministic `computeFocusPillar` and `computeRecommendedAction` engine resolving "Recommended next", cross-pillar "Complete this first", and "Optional next" states.
- Implemented `TrackSummaryBanner` with required-only overall progress percentage and quick stats chips.
- Implemented `ActiveLearningSection` and `ActivePillarCard` supporting parallel progression with independent `🎯 Current Focus` markers.
- Implemented `TrackCompletedCard` for 100% completion celebration state.
- Automated tests in `scripts/verify-phase8.ts` passed 100% across all 6 test vectors.
