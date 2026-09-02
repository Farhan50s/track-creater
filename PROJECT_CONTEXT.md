# Track Creator — Project State Ledger (`PROJECT_CONTEXT.md`)

## 1. Project Overview
Track Creator is a role-aligned skill tracking web application built on progressive mastery principles.

- **Stack**: React, Vite, TypeScript, Supabase (PostgreSQL, RLS, Auth, RPCs).
- **Backend Model**: Supabase is the sole backend. All progress mutations and quiz scoring execute through hardened Postgres RPCs (`mark_node_opened`, `submit_quiz_attempt`).

---

## 2. Complete Phase Execution State Ledger

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
| **Phase 11** | Real-Content Cutover & Production Rollout | `PASS` | Production track `ai-engineer` authored (3 pillars, 10 nodes, 80 quiz questions), Kahn's DAG acyclic validation, database seeded, `/onboarding/goal` cutover |
| **Release Polish** | Scoping, Navigation & Landing/Profile | `PASS` | Active track node scoping fixed (67% for 2/3 completed), clean production header nav, dark-themed hero landing page, account settings profile page |
| **Canonical Track 2** | Full-Stack TypeScript Developer (`fullstack-ts`) | `PASS` | Canonical 23-node DAG authored (3 pillars, 9 topics, 10 subtopics, 23 skill nodes, 184 quiz questions, 46 resources), Kahn's DAG acyclicity verified, seeded into Supabase, verified with live onboarding & quiz progression |
| **Phase 12** | Ergonomics & Review Suite | `PASS` | Migration 0009 authored, post-quiz explanation review card with color-coded choices and explanation callouts, PrismJS markdown syntax highlighter, in-app track switching on `/onboarding/goal` and header active track pill |

---

## 3. Production Tracks Catalog
1. **AI & Machine Learning Engineer** (`ai-engineer`): 3 Pillars · 10 Skills · 80 Quiz Questions
2. **Full-Stack TypeScript Developer** (`fullstack-ts`): 3 Pillars · 23 Skills · 184 Quiz Questions
