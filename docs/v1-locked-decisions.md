# Track Creator — V1 Locked Decisions

**Status:** Locked for implementation
**Supersedes:** `Track Creator — Master Product Requirements Draft v0.1` (that document remains a reference/idea bank for V2+, not something Antigravity should follow directly)
**Purpose:** This is the single source of truth for what V1 actually is. Every decision below was closed after a Claude ↔ ChatGPT convergence pass on the full PRD. If a question isn't answered here, it isn't decided — bring it back before implementing, don't infer an answer from the reference PRD.

---

## 1. Product one-liner

A standalone app where the user picks a role goal, gets a hand-authored skill tree, and must demonstrate completion of each skill (via quiz) before it counts as progressed — explore anything, but only advance officially through evidence.

---

## 2. V1 Role Templates

Hand-authored, not AI-generated per user. Final count and exact roles to be confirmed, but scope is **2–3 templates** (candidates: AI/ML Engineer, Full-Stack Developer, Data Scientist).

## 3. Track Structure

| Decision | V1 |
|---|---|
| Max depth | 4 levels: Pillar → Topic → Subtopic → Skill Node — **treated as a V1 authoring/UI constraint, not a hard data-model limit** (schema shouldn't need a rewrite to go deeper later) |
| Skill Node definition | The smallest independently learnable unit that deserves its own completion state. Authoring rule: *if it needs its own explanation, resources, and quiz, it's a Skill Node.* Prevents micro-node bloat. |
| Shared skills across roles (e.g. "Neural Networks" in two templates) | **Duplicate, not shared.** Each role tree owns independent copies of its nodes. A canonical shared-skill library is a V2+ concern once there are enough templates to justify it. |
| Branches / specializations | Represented as alternate child sets under a shared parent, tagged as specialization nodes. |

## 4. Skill Classification

Every node is tagged: **Required / Recommended / Optional / Specialization.** Prevents the tree from reading as one giant mandatory checklist.

## 5. Skill Depth

Recommended depth (Overview / Practical / Implementation / Advanced) is role-specific and baked into the node's generated content at authoring time — not computed live.

## 6. Assessment (starting point)

**Self-report only.** User marks each pillar's starting familiarity (Don't know / Beginner / Intermediate / Advanced) to pre-mark nodes. No diagnostic quiz in V1 — it's a separate subsystem to validate on its own later.

## 7. Prerequisites & Progression — the core mechanic

This is the most important section. Two separate axes, never conflated:

- **Exploration** — the learner can open and read *any* visible node at any time, regardless of prerequisites.
- **Progression** — a node only counts as officially advanced/current once its prerequisite's completion requirements are met.

**Prerequisites are soft-locked, not hidden.** A locked node shows why:

> 🔒 Model Evaluation — Complete these first: ✅ Regression, ✅ Classification, ❌ Supervised Learning (1 requirement remaining)

**Gating is per-pillar, not global.** Multiple pillars can be "in progress" simultaneously (Mathematics, Python, and Machine Learning can all be active at once) — a career isn't one linear chain, and forcing it to look like one would be artificial. *Within* a pillar, progression through its nodes is sequential.

**"Current Focus" is per-pillar**, shown as a small set (e.g. "Your Active Learning: 🎯 Classification in Machine Learning, 🎯 NumPy in Python, 🎯 Probability in Mathematics"), not a single global focus. The app can still recommend one overall "next" action, but doesn't force a single-file order across unrelated pillars.

### Progressive Mastery Principle (formal product principle)

> A learner may explore any visible skill in the track, but official progression within a learning branch requires completion of the prerequisite skill's defined completion requirements. The system prioritizes demonstrated learning over self-reported completion.

## 8. Completion Requirements (V1)

A skill becomes **Completed** when:

1. The learner has opened/studied the skill content.
2. The learner takes its MCQ checkpoint.
3. The learner scores **at least 4 out of 5 correct** (this is the literal rule — see Progress, Prerequisite & Quiz Specification for why a flat "70%" doesn't divide evenly across 5 questions).
4. The next eligible node in that pillar becomes available for progression.

**No Practice gate in V1.** Knowledge gate (MCQ) only — a Practice gate (coding exercise, fill-in-blank, etc.) has no defined content type or authoring pipeline yet, and would double the authoring workload before the single quiz-gate mechanic is even proven to solve the "moving on too early" problem. Revisit in V2 only if the MCQ gate alone turns out to be insufficient.

**No per-topic failure diagnostics in V1.** On failure, show:

> 40% — Not passed. Review the material and try again.

Not a subtopic-tagged breakdown ("Weak in: Precision, Recall, F1") — that requires tagging every quiz question with a subtopic and rolling up wrong answers, which is a real schema addition on top of the simple question-pool model. Add once there's real quiz-failure data worth diagnosing.

## 9. Progress States (database model)

Exactly **3 user-facing states**: `Not Started` → `In Progress` → `Completed`. No separate "Verified" or "Mastered" tier — completion is already gated by the quiz, so a second verification state would track the same event twice.

Implementation notes (no new state machine needed):
- One `requirements_met` boolean/check gates the transition to `Completed`.
- One `is_current_focus` flag per pillar (not one global flag).

## 10. Quiz Model

| Decision | V1 |
|---|---|
| Question types | MCQ only — deterministic grading, zero AI cost at quiz time |
| Pool size | 8–10 pre-authored questions per node, generated once at authoring time |
| Served per attempt | 5, randomly selected |
| Pass threshold | 4 out of 5 correct (not "70%" — see Progress spec) |
| Retries | Unlimited, reshuffled subset each attempt |
| Grading | DB comparison against stored answer key — no live AI call |

## 11. Content Model

- **Generation:** batch, one-off seed script at authoring time — not an in-app generation UI. Generates quick-overview and deep-dive variants per node, per role-specific framing.
- **Cache key:** `(node_id, depth_level)`, generated once and reused for every user who reaches that node.
- **Lifecycle:** Generate → human review/edit → approve → publish. AI output is a first draft, never auto-published.
- **Node changes:** regenerate only the affected node's content — never rebuild the whole tree.
- **Cost model:** ~100–150 nodes × 2 depth variants + ~6–9 quiz questions each ≈ one-time seed batch (roughly 250–300 content generations, 600–900 quiz-question generations). Zero live AI cost per user at learn-time or quiz-time.

## 12. Track Selection

**One goal → one recommended track.** No track-comparison UI in V1 (e.g. comparing AI Engineer vs ML Engineer vs LLM Engineer side by side) — that solves a problem you don't have real users hitting yet.

## 13. UI

**Vertical expandable tree + skill detail page only.** The "visual graph overview" (node-and-edge graph visualization) is **cut from V1 entirely** — highest-effort, most uncertain-payoff piece of the whole product, and hard to get right on mobile. Add it in V2 once the tree/detail loop is validated with real usage.

Skill detail page required sections: What is it? / Why does it matter (role-specific)? / Prerequisites / How deep should I go? / Subtopics / Curated resources / Self-check quiz / Progress status.

Track overview screen shows: track name, target role, overall progress %, per-pillar progress, current focus per active pillar, recommended next skill.

Node card shows: name, status, required/recommended/optional tag, lock state (with reason if locked), progress.

## 14. Recommendation Engine

**Rule-based for V1**: recommend the next incomplete Required node in the current pillar whose prerequisites are satisfied. No ranking model, no AI-assisted recommendation.

## 15. Resources

Per node: a small curated set (not a link dump), optionally categorized as Start Here / Alternative / Practice / Reference. Hand-picked at authoring time, stored alongside the node content.

## 16. Identity & Integration

- **Standalone authentication** for V1, separate from StudyHub AI. SSO/shared-session is deferred until the actual StudyHub integration is built — don't solve it speculatively now.
- Standalone app, separate repo/deployment.
- Future integration with StudyHub AI (dashboard tile, "Ask AI" scoped to a node, "create linked note," "add to planner") happens via API — not tight code coupling. Exact API-vs-embed shape is a later decision, not needed to build V1.

---

## 17. Explicit V1 Exclusions

Do not let these creep back in during implementation:

- AI-generated custom trees (custom goal input)
- Diagnostic assessment quiz
- Practice gates / project gates
- Per-topic failure diagnostics
- Visual graph UI
- Track comparison / multiple recommended tracks
- Shared/canonical skill library across roles
- Social features, public roadmaps, sharing, forking
- Plugin marketplace abstraction
- Auto-refreshing content via periodic web search
- Live AI at learn-time or quiz-time (all AI cost is one-time, at authoring)

## 18. V1 Core Loop (what's actually being built)

```
Choose goal
  → Self-report starting knowledge (pre-marks nodes)
  → Receive curated track
  → Expand tree, explore freely
  → Open a skill node (any node, any time)
  → Read content (quick overview / deep dive)
  → Take MCQ quiz
  → 4/5 correct → Completed → next node in that pillar unlocks for progression
  → <4/5 correct → "Review and retry"
  → Repeat across pillars (multiple pillars can be active in parallel)
```

## 19. Documentation Sequence From Here

```
Product Requirements (done — reference PRD)
  → V1 Locked Decisions (this document)
  → UI/UX Specification
  → Skill/Content Model
  → Data Model
  → AI/Content Pipeline
  → Technical Architecture
  → Implementation Plan
  → Antigravity Development
```

Next document to write: **UI/UX Specification** — the vertical tree + skill detail page, spec'd screen by screen, mobile-first.
