# Track Creator — AI Agent Operating Manual (`ANTIGRAVITY.md`)

> **CRITICAL INSTRUCTION FOR ALL AI AGENTS & CODING ENGINES:**
> You are an **implementation engine, not a product decision-maker**.
> You must read this entire document before inspecting or modifying any code in this repository.
> Every rule, constraint, and workflow below is **LOCKED and MANDATORY**.

---

## 1. Authority Hierarchy & Source of Truth

When working on this codebase, always refer to `/docs` for product rules, schemas, and logic. If there appears to be a conflict between a prompt, an existing file, and the documentation, follow this strict precedence order:

1. `docs/v1-locked-decisions.md` — Master root of all scope and V1 decisions.
2. `docs/01-ui-ux-information-architecture.md` — Screen specifications, layout tokens, route tree, and navigation rules.
3. `docs/02-skill-content-model.md` — Hierarchy bounds, taxonomy, depth definitions, and content schemas.
4. `docs/03-progress-prerequisite-quiz-specification.md` — Deterministic progress algorithms, locking, current focus, and quiz scoring.
5. `docs/04-data-model-technical-architecture.md` — Postgres schemas, RLS policies, RPC functions, and security boundaries.
6. `docs/05-ai-content-pipeline.md` — Offline content generation, validation gates, and seeding rules.
7. `docs/06-implementation-plan.md` — Phase sequencing (0–11) and acceptance criteria.
8. `docs/07-antigravity-phases-0-4-implementation-guide.md` — Granular execution guide for early phases.
9. `docs/08-antigravity-component-phase-verification.md` — Testing protocols, status vocabulary, and verification report standards.
10. `PROJECT_CONTEXT.md` — Cross-AI collaboration history and state ledger.

**Rule on Discrepancies:** NEVER invent new rules or silently "fix" documentation. If you find an ambiguity or conflict, stop, report it explicitly, and request human clarification.

---

## 2. Core Architectural Invariants (Non-Negotiable)

1. **The Client Controls Presentation; The Database Controls Truth:**
   - The frontend may compute derived display states (`is_locked`, `current_focus`, `pillar_percent`, `recommended_next`).
   - The Postgres backend independently validates and enforces prerequisites, quiz eligibility, active track membership, and state changes.
   - Disabling a button in React is UX only—the database RPC is the actual security boundary.

2. **Progress Writes Go Strictly Through Hardened RPC Functions:**
   - All progress mutations must call `mark_node_opened()` or `submit_quiz_attempt()`.
   - Direct client-side `INSERT`, `UPDATE`, or `DELETE` on `user_node_progress` and `quiz_attempts` is strictly forbidden by RLS.

3. **Zero Client Profile Writes:**
   - User profiles are created exclusively by the PostgreSQL trigger (`handle_new_user()`) on `auth.users`.
   - The frontend must NEVER execute an `INSERT` or `UPSERT` on the `profiles` table.

4. **Literal Quiz Threshold ($4/5$ Correct):**
   - A quiz consists of 5 questions served from a node's pool.
   - Passing requires at least **4 out of 5** correct (`score >= 4`).
   - Do NOT convert this to a percentage (e.g. "70%") in code, database logic, or UI copy (70% of 5 is 3.5).

5. **Quiz Answer Protection:**
   - `quiz_answers` has RLS enabled with ZERO `SELECT` policies for `anon` and `authenticated` roles.
   - Correct answer indices are never exposed to the client before or during quiz attempts.

6. **Unidirectional Progress & Non-Degrading Retakes:**
   - Progression is strictly one-way: `not_started` → `in_progress` → `completed`.
   - A failed retake (<4/5) on an already `completed` node updates `last_quiz_score` and logs an attempt, but NEVER removes `completed` status.

7. **Sparse Progress Representation:**
   - Absence of a row in `user_node_progress` represents `not_started`.
   - Opening a node creates an `in_progress` row. Do not pre-populate progress rows for all nodes at enrollment.

8. **Required-Only Progress Calculation:**
   - `pillar_percent` is calculated from `required` nodes only: `Math.round((completed_required / total_required) * 100)`.
   - `recommended`, `optional`, and `specialization` nodes do not affect completion percentages.

9. **Parallel Pillar Progression:**
   - The product is not a single linear pipeline. Multiple pillars can be active simultaneously (e.g., Python and Mathematics progressing in parallel), each with its own `current_focus`.

10. **Zero Runtime AI:**
    - The deployed web application makes zero live calls to Gemini or any LLM.
    - AI is used solely offline during batch content authoring before database seeding.

11. **Strict Secrets Isolation:**
    - `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` are trusted local secrets and must NEVER appear in client bundles, React source code, committed `.env` files, or public repositories.

---

## 3. The 7-Step Phase Execution Loop

For every assigned phase, follow this exact sequence:

```text
1. Inspect
   └── Read relevant sections of docs/ and inspect existing codebase before modifying files.
2. Plan
   └── Create a minimal implementation plan adhering strictly to the active phase boundaries.
3. Implement
   └── Build only the assigned phase. Do NOT build future-phase components early.
4. Static & Automated Verification
   └── Run `npx tsc --noEmit`, `npm run build`, and the dedicated `scripts/verify-phaseX.ts`.
5. Browser & Behavioral Verification
   └── Test real browser interactions, route transitions, and database state.
6. Scope Audit
   └── Inspect the Git diff to ensure no new tables, RPCs, or premature UI were added.
7. Verification Report & Stop
   └── Generate `docs/phase-X-verification-report.md`, present evidence, and await approval.
```

---

## 4. Forbidden Actions & Anti-Patterns

* **DO NOT** reinitialize Git, delete `.git`, change remotes, or commit without explicit instruction.
* **DO NOT** create a separate backend server (FastAPI, Express, custom REST/GraphQL API). Supabase is the sole backend.
* **DO NOT** create custom visual graph/canvas libraries (e.g. React Flow, D3 graph canvas). V1 uses a vertical expandable tree.
* **DO NOT** add third-party OAuth, SMS auth, or magic links. V1 uses email/password auth only.
* **DO NOT** install npm dependencies unless strictly required and approved.
* **DO NOT** accept `"build succeeded"` as proof of completion. Evidence of verified behavior is required.

---

## 5. Verification Report Standard

Every phase must conclude with a markdown report at `docs/phase-[X]-verification-report.md` using this format:

```markdown
# Phase [X] Verification Report

## Summary
Status: PASS / FAIL / BLOCKED

## Implementation
- [Component/Feature 1]: PASS/FAIL (Details)
- [Component/Feature 2]: PASS/FAIL (Details)

## Automated Tests (`scripts/verify-phase[X].ts`)
| Test | Status | Evidence |
|---|---|---|
| [Test Name] | PASS/FAIL | [Actual row/token/error observed] |

## Behavioral & Security Checks
| Scenario | Status | Evidence |
|---|---|---|
| [Scenario Name] | PASS/FAIL | [Actual response/state observed] |

## Regression & Static Checks
- Build (`npm run build`): PASS/FAIL
- TypeScript (`npx tsc --noEmit`): PASS/FAIL
- Existing Routes & Migrations: PASS/FAIL

## Scope Check
- No future-phase features added: YES/NO
- No database schema modifications: YES/NO
- No new RPCs added: YES/NO
- No AI runtime calls added: YES/NO

## Final Decision
PASS / FAIL / BLOCKED

## Recommended Next Step
[Clear next action]
```

---

## 6. Project Phase Map

* **Phase 0: Environment & Scaffold** — `PASS` (Scaffolding, route placeholders, centralized Supabase client)
* **Phase 1: Database, RLS & RPC Functions** — `PASS` (Schema, triggers, hardened RPCs, answer security)
* **Phase 2: Test Track & Seeding** — `PASS` (Disposable 6-node acyclic test track, validation pipeline)
* **Phase 3: Authentication & Protected Routing** — `PASS` (AuthContext, guards, login/signup/forgot-password)
* **Phase 4: Onboarding & Track Activation** — `PASS` (Goal selection, self-report, zero-progress invariant)
* **Phase 5: Track Overview & Expandable Pillar Tree** — `PASS` (Tree UI, progression algorithms, node cards)
* **Phase 6: Skill Detail Page** — `PASS` (Content view, deep-dive toggle, lock banners, resources, mark_node_opened trigger)
* **Phase 7: Quiz Flow & Server Grading** — `PASS` (Fisher-Yates sampling, submit_quiz_attempt RPC, non-degrading retakes, abandonment safeguard)
* **Phase 8: Home Dashboard & Recommendation Engine** — `PASS` (Active Learning panel, 4-step recommendation engine, required-only metrics, 100% completion card)
* **Phase 9: Responsive & Accessibility Polish** — `PASS` (WCAG 2.1 AA focus rings, keyboard accordions, ARIA labels, >=44px touch targets, zero overflow)
* **Phase 10: Security & Integration Testing** — `PASS` (7 adversarial attack tests, 9-step lifecycle E2E, 0 bundle secrets leaked)
* **Phase 11: Real-Content Cutover** — `PASS` (Production 'ai-engineer' track authored, Kahn's DAG validated, 10 nodes seeded, onboarding cutover verified)
