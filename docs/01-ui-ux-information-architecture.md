# Track Creator — UI/UX & Information Architecture Specification

**Document 1 of 6 (consolidated set)**
**Depends on:** `V1 Locked Decisions`
**Feeds into:** Data Model & Technical Architecture, Implementation Plan

This document specifies every screen, state, and navigation rule needed to build V1 without Antigravity inventing behavior. Design-system choices marked "default" are reasonable starting points, not locked forever — change them here before implementation if they don't fit, but don't leave them undecided.

---

## Part A — Information Architecture

### A.1 Route tree

```text
/                          Landing (unauthenticated)
/signup
/login
/forgot-password

/onboarding/goal            Select role template
/onboarding/knowledge        Self-report starting knowledge (per pillar)

/app                        Home / Dashboard
/app/track                  Track overview (current active track)
/app/track/:pillarId        Pillar view (expanded tree scoped to one pillar)
/app/node/:nodeId           Skill detail page
/app/node/:nodeId/quiz      Quiz flow
/app/profile                Account settings
```

### A.2 Progression granularity

**Only Skill Nodes participate in completion/progression gating.** Pillar, Topic, and Subtopic are organizational containers used for tree display only — they have no status, cannot be "completed," and are never prerequisites themselves. A prerequisite always points to a specific Skill Node.

### A.3 Navigation rules

- **Deep link to a locked node** (`/app/node/:nodeId` where prerequisites aren't met): the page loads normally — exploration is always allowed. The page renders with a visible lock banner instead of the "mark as current" affordance. Never redirect or 404 a locked node.
- **Deep link to a quiz for a node not yet studied**: redirect to the node detail page instead — the quiz shouldn't be reachable before the content has been viewed at least once.
- **Refresh at any route**: full state reloads from the server (track, progress, current node) — no client-only state that vanishes on refresh.
- **Back behavior**: browser back always works normally (standard routing, no custom history hijacking). Quiz-in-progress is the one exception — see Part C, quiz abandonment.
- **Breadcrumbs**: shown on `/app/track/:pillarId` and `/app/node/:nodeId` as `Track > Pillar > Node`, each segment a link back up the hierarchy.
- **Unauthenticated user hits any `/app/*` route**: redirect to `/login`, then back to the originally requested route after successful login.
- **Authenticated user with no track yet hits `/app`**: redirect to `/onboarding/goal`.

---

## Part B — Design System (defaults)

### B.1 Theme

- **Dark mode as default**, light mode as a toggle (matches your existing pattern from the GPA Calculator PWA and general preference for dark UI).
- Dark background: `#111318` (charcoal — reuse from prior project for visual consistency across your build-in-public portfolio).
- Light background: `#F7F8FA` (light neutral grey) — the GPA Calculator's `#0d1323` was a dark-mode/accent value, not a light background, so it isn't reused here.
- Primary accent: one strong color reserved for progression/success states only (e.g. a green/teal in the `#10B981`–`#14B8A6` range) — so "unlocked / completed" always reads as the same color across the whole app, never reused decoratively.
- Warning/lock color: muted amber or grey, not red — a locked node isn't an error, it's a normal state.

### B.2 Typography

- One sans-serif system font stack (e.g. Inter or system-ui) — no custom font loading overhead for a solo-maintained app.
- Scale: `12 / 14 / 16 / 20 / 24 / 32` px, four weights max (400, 500, 600, 700).
- Body text 16px minimum — this is an educational app, sustained reading matters.

### B.3 Spacing & shape

- 4px base spacing unit (4/8/12/16/24/32/48).
- Border radius: 8px cards, 6px buttons/badges, 4px inputs — consistent, not decorative variation per component.
- Shadows: one subtle elevation level for cards, none for flat backgrounds. Avoid heavy drop-shadows — matches a "calm learning tool" feel over a "flashy dashboard" feel.

### B.4 Components needed

Badges (Required/Recommended/Optional/Specialization — distinct colors, not just text), progress bar (per-pillar and overall), lock icon + inline lock reason, status icon (Not Started / In Progress / Completed — three distinct icons, not just color, for accessibility), buttons (primary/secondary/disabled), toast (quiz result, save confirmations), quiz option selector, expandable tree row (chevron + indent).

### B.5 Responsive breakpoints

- Mobile: <640px — single column, tree collapses to accordion, no side-by-side panels.
- Tablet: 640–1024px — tree + detail can coexist as two columns if space allows, otherwise stacked.
- Desktop: >1024px — same single-column tree → detail page navigation as mobile/tablet, just with more horizontal breathing room (wider cards, more padding). No persistent split panel in V1 — see C.7.

### B.6 Accessibility

- Status is never color-only: lock/progress/required-tag all pair an icon or text label with color.
- All interactive elements keyboard-reachable and focus-visible (tree rows, quiz options, buttons).
- Quiz options are actual `<button>`/`<label>` elements, not `<div onClick>`, for screen-reader and keyboard support.
- Minimum contrast ratio 4.5:1 for body text in both themes.

---

## Part C — Screens

For each screen: purpose, key components, states, mobile vs desktop notes.

### C.1 Landing (`/`)

**Purpose:** explain the product in one screen, get the user to sign up.
**Components (in order):**
1. Hero — one-line product promise + primary CTA (sign up)
2. How it works — the core loop in 4–5 short steps (goal → track → explore → quiz → progress)
3. Example skill track — a small static preview of one real pillar (e.g. Machine Learning) with a few nodes shown in their actual lock/progress states, so a visitor sees the real product shape before signing up
4. Progressive Mastery concept — one short section on "explore freely, progress by evidence," since this is the product's real differentiator
5. Secondary CTA to sign up
6. Footer — minimal (login link, portfolio/GitHub credit)
**States:** none beyond loading (static page).

### C.2 Sign up / Login / Forgot password

**Purpose:** standard auth (Supabase Auth or equivalent, standalone from StudyHub per locked decisions).
**Components:** email/password fields, submit, link to the other two screens.
**States:** loading (submitting), error (invalid credentials / email taken / weak password — inline, field-specific, not a generic toast), success (redirect to onboarding or `/app`).
**Mobile:** full-width form, no side imagery — keep it fast on a small screen.

### C.3 Onboarding — Goal selection (`/onboarding/goal`)

**Purpose:** pick one of the 2–3 role templates.
**Components:** a card per role template — name, one-line description, rough scope indicator (e.g. "6 pillars · ~40 skills"). No AI-generated custom goal input (excluded from V1).
**States:** loading (fetching templates), empty (shouldn't happen — templates are seeded, but if it does, show a clear "content not available yet" message, not a blank screen).
**Action:** selecting a card advances to Starting Knowledge. No "confirm" step needed — one tap, one screen.

### C.4 Onboarding — Starting knowledge (`/onboarding/knowledge`)

**Purpose:** self-report familiarity per pillar, per the locked self-report-only assessment decision.
**Components:** one row per pillar in the selected track — pillar name + a 4-option selector (Don't know / Beginner / Intermediate / Advanced).
**Behavior:** self-report never writes to any node's status field. Every node starts as `Not Started` regardless of reported familiarity — the report is used only to compute the *suggested starting node* per pillar (e.g. an `Advanced` report on a pillar points the recommendation at a later node in that pillar instead of the first one). Completion always requires passing the quiz; self-report can change where the app points the learner, never what counts as done.
**States:** loading, submit → redirect to `/app`.

### C.5 Home / Dashboard (`/app`)

**Purpose:** immediate orientation — what track, how far along, what's next.
**Components:**
- Track name + overall progress %
- **Active Learning** panel — one row per active pillar showing its current-focus node and quiz requirement (per-pillar current focus, not global — per locked decisions §7)
- "Recommended next" single action (rule-based recommendation)
- Link into full track overview
**States:** loading, no-track (redirect handled at routing level, shouldn't reach here), normal.
**Mobile:** stacked cards, Active Learning panel scrollable if more than ~3 pillars are active.

### C.6 Track overview (`/app/track`)

**Purpose:** the full picture — every pillar, high-level progress.
**Components:** list/grid of pillar cards, each showing: name, % complete, node count, lock/unlock state at the pillar level (pillars themselves aren't locked in V1 — all pillars are explorable/startable from the beginning; only nodes *within* a pillar gate each other).
**Action:** tap a pillar → `/app/track/:pillarId`.

### C.7 Pillar view (`/app/track/:pillarId`)

**Purpose:** the expandable tree for one pillar — this is the core navigation surface.
**Components:** vertical expandable tree (Topic → Subtopic → Skill Node), each row a Node Card (see C.8), expand/collapse per branch, breadcrumb back to Track Overview.
**States:** loading, normal, empty (a pillar with no authored content yet — shouldn't occur in production but handle gracefully, e.g. for local dev before seeding).
**V1 layout (all breakpoints):** single-column tree that navigates to a dedicated skill detail page — no persistent split panel. This is the same interaction on mobile, tablet, and desktop; a persistent tree+detail split view is a V2 candidate to revisit only if real usage shows the extra navigation hop is a problem.

### C.8 Node Card (component, used inside the tree)

**Displays:** name, status icon (Not Started / In Progress / Completed), Required/Recommended/Optional/Specialization badge, lock icon if progression-locked.
**Locked state:** dimmed but fully tappable (exploration always allowed) — tapping opens the detail page in "locked" mode (see C.9).
**Current-focus state:** visually distinguished (e.g. accent border or 🎯 marker) — at most one per pillar. Current focus is **computed automatically, not manually assigned**: it always points to the first incomplete Required Skill Node in that pillar whose prerequisites are satisfied, recalculated whenever progress changes. Every pillar has a current focus from the moment the track is created — the learner doesn't need to "start" a pillar first for it to have one.

### C.9 Skill detail page (`/app/node/:nodeId`)

**Purpose:** everything needed to learn and complete one skill. The core content surface of the product.
**Sections, in order:**
1. Header — name, Required/Recommended/Optional badge, status
2. **Lock banner** (only if progression-locked) — "Complete these first: ✅ Regression, ✅ Classification, ❌ Supervised Learning (1 remaining)" with links to the incomplete prerequisite(s)
3. What is it? (short definition)
4. Why does it matter? (role-specific)
5. Quick Overview / Deep Dive toggle — collapsed to Quick Overview by default, Deep Dive expands in place (no separate page)
6. Prerequisites (list with completion checkmarks)
7. Curated resources (Start Here / Alternative / Practice / Reference tags where applicable)
8. Self-check — button to start quiz. **Disabled with a tooltip if node is progression-locked** (you can read a locked node, but can't take its quiz until its own prerequisites are met — this is distinct from the node's own lock banner in step 2, same rule applied to the action button)
**States:** loading, normal, locked (button disabled, banner shown), completed (quiz section shows "Completed ✓ — Retake quiz" instead of "Start quiz").

### C.10 Quiz flow (`/app/node/:nodeId/quiz`)

**Start screen:** "5 questions · 4/5 required to pass · Unlimited retries" + Start button.
**Question screen:** one question at a time, 4 MCQ options, Next disabled until an option is selected, no Previous (keeps it simple and prevents answer-changing gymnastics — acceptable for a 5-question deterministic quiz; revisit only if user feedback demands it).
**Submit:** after question 5, auto-submits and scores immediately (no separate "review answers" screen for V1).
**Result screen:**
- **Pass (≥4/5 correct):** score, "Completed ✓", next eligible node in the pillar surfaced directly with a link, confetti/celebratory micro-animation is fine here but keep it lightweight.
- **Fail (<4/5 correct):** score, "Review the material and try again" (no per-topic diagnostics per locked decisions), buttons: "Review content" (back to node detail) or "Retry quiz" (reshuffled 5 from the pool).
**Abandonment:** if the user navigates away mid-quiz, the attempt is discarded (not saved as a failed attempt) — starting again always begins fresh at question 1.
**Retake rule:** retaking a quiz never removes `Completed` status. A completed node's retake can update the stored score/timestamp on a pass, but a failed retake leaves the node `Completed` — there is no "uncomplete" path in V1.

### C.11 Loading / Error / Empty states (global patterns, applied per screen above)

- **Loading:** skeleton placeholders matching the shape of the content (tree rows, card outlines) — not a generic spinner for anything that takes more than ~300ms.
- **API failure:** inline retry affordance ("Couldn't load this — Retry"), never a silent blank screen.
- **Offline:** a small persistent banner ("You're offline. Some actions may be unavailable until you reconnect.") if the app detects no connection — V1 doesn't queue actions locally, so don't promise syncing that isn't implemented.
- **Empty states:** only theoretically reachable before content is seeded — message + no dead-end (link back to Track Overview or Home).

---

## Part D — What this document deliberately excludes

- Visual graph/node-edge UI (cut from V1 per locked decisions)
- Track comparison screens
- Custom goal input screen
- Social/sharing screens
- Admin/authoring UI (content is seeded via script, not an in-app editor, per locked decisions)

If any of these come up during implementation, that's a signal scope is drifting — check the V1 Locked Decisions doc before building around it.
