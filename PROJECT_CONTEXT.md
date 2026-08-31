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
| **Phase 9** | Responsive & Accessibility Polish | `PASS` | WCAG 2.1 AA `:focus-visible` emerald rings, Enter/Space accordion key controls, semantic `role="radiogroup"` / `role="radio"` quiz options, $\ge 44\text{px}$ touch targets, and zero horizontal overflow at 375px/768px/1440px |
| **Phase 10** | Security & Integration Testing | `PASS` | 7 adversarial penetration attack tests passed against live Supabase; 9-step learner lifecycle verified; 0 secret keys leaked in production client bundle |
| **Phase 11** | Real-Content Cutover | `NEXT` | Full 2-3 role track authoring, validation, and database seeding |

---

## 3. Latest Milestone Completed
**Phase 10: Security Hardening & Penetration Audit**
- Executed 7 targeted penetration attacks in `scripts/verify-phase10-security.ts`:
  1. Locked quiz submission attack blocked (0 attempts recorded).
  2. Unopened node quiz attack blocked.
  3. Foreign track node attack blocked.
  4. Malformed quiz payloads (<5, >5, duplicates, out-of-bound indices) rejected.
  5. Wrong-node question injection rejected.
  6. Direct RLS table mutations blocked.
  7. Cross-user snooping blocked by `auth.uid() = user_id`.
- Executed full 9-step learner lifecycle in `scripts/verify-phase10-e2e.ts`: signup $\rightarrow$ profile trigger $\rightarrow$ track enrollment $\rightarrow$ node open $\rightarrow$ failing quiz $\rightarrow$ passing quiz $\rightarrow$ unlock cascade $\rightarrow$ non-degrading retake.
- Audited compiled bundle (`dist/`): 0 secret keys leaked.
