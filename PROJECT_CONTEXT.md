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
| **Phase 7** | Quiz Flow & Server Grading | `NEXT` | 5-question MCQ flow, RPC submission, grading feedback, retake flow |
| **Phase 8** | Home Dashboard & Recommendation Engine | `PENDING` | `/app` Active Learning panel, per-pillar focus, rule-based recommendation |
| **Phase 9** | Responsive & Accessibility Polish | `PENDING` | Mobile/desktop viewport testing, ARIA compliance, keyboard flows |
| **Phase 10** | Security & Integration Testing | `PENDING` | End-to-end user journey verification, secret leak audits |
| **Phase 11** | Real-Content Cutover | `PENDING` | Full 2-3 role track authoring, validation, and database seeding |

---

## 3. Latest Milestone Completed
**Phase 6: Skill Detail Page & Progress Trigger**
- Implemented `/app/node/:nodeId` with full content hierarchy (Breadcrumbs $\rightarrow$ Header $\rightarrow$ LockBanner $\rightarrow$ Definition $\rightarrow$ Content $\rightarrow$ Prerequisites $\rightarrow$ Resources $\rightarrow$ QuizActionButton).
- Verified `mark_node_opened` RPC trigger on mount, confirming idempotency and completed status non-regression.
- Cleanly handled overview-depth nodes with `deep_dive = null`.
- Verified lock banner links and quiz locked button states.
- Automated tests in `scripts/verify-phase6.ts` passed 100%.
