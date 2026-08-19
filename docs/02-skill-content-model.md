# Track Creator — Skill & Content Model / Authoring Standards

**Document 2 of 6 (consolidated set)** — corrected version
**Depends on:** `V1 Locked Decisions`, `UI/UX & Information Architecture`
**Feeds into:** Data Model & Technical Architecture, AI Content Pipeline, and the actual authored V1 track content

Purpose: define exactly what a Pillar, Topic, Subtopic, and Skill Node *are* — as precise data shapes with exact fields, not concepts — so the database schema and the AI content pipeline both build against the same definition, and so you (the author) have a repeatable, checkable process for producing 100–150 consistent nodes across 2–3 roles.

---

## Part A — Entity Definitions

### A.1 Track

One track = one role template (e.g. "AI/ML Engineer").

| Field | Type | Notes |
|---|---|---|
| `track_id` | string, slug | See Part H naming convention |
| `name` | string | Display name, e.g. "AI/ML Engineer" |
| `description` | string, 1–2 sentences | Shown on goal-selection screen |
| `pillars` | ordered list of Pillar IDs | Display order matters — author-controlled, not alphabetical |

**Derived track statistics:** pillar count and Skill Node count are computed from the authored tree for display (e.g. the onboarding scope indicator). They are not duplicated as stored fields.

### A.2 Pillar

A major category within a track (e.g. "Machine Learning"). **Organizational only — a Pillar has no status and cannot be completed.**

| Field | Type | Notes |
|---|---|---|
| `pillar_id` | string, slug | Unique within the track |
| `track_id` | string | Parent track |
| `name` | string | e.g. "Machine Learning" |
| `description` | string, 1 sentence | Shown on Track Overview pillar card |
| `order` | integer | Display order within track |
| `topics` | ordered list of Topic IDs | |

**Authoring bound:** 5–8 pillars per track.

### A.3 Topic

Organizational only — no status, cannot be completed, cannot be a prerequisite.

| Field | Type | Notes |
|---|---|---|
| `topic_id` | string, slug | Unique within the pillar |
| `pillar_id` | string | Parent pillar |
| `name` | string | |
| `order` | integer | |
| `subtopics` | ordered list of Subtopic IDs | |

**Authoring bound:** 2–4 topics per pillar.

### A.4 Subtopic

Organizational only — no status, cannot be completed, cannot be a prerequisite. May be skipped (see A.7).

| Field | Type | Notes |
|---|---|---|
| `subtopic_id` | string, slug | Unique within the topic |
| `topic_id` | string | Parent topic |
| `name` | string | |
| `order` | integer | |
| `skill_nodes` | ordered list of Skill Node IDs | |

**Authoring bound:** 2–5 skill nodes per subtopic.

### A.5 Skill Node

**The only entity with status, progression gating, content, and a quiz.**

| Field | Type | Notes |
|---|---|---|
| `node_id` | string, slug | Globally unique — see Part H |
| `subtopic_id` (or `topic_id`) | string | Parent — see A.7 |
| `name` | string | e.g. "Logistic Regression" |
| `classification` | enum | `required` \| `recommended` \| `optional` \| `specialization` — Part B |
| `recommended_depth` | enum | `overview` \| `practical` \| `implementation` \| `advanced` — Part B |
| `estimated_time_minutes` | integer | Informational only — see rule below |
| `prerequisites` | list of Skill Node IDs | Can reference nodes in any pillar — Part C |
| `one_sentence_definition` | string | |
| `why_it_matters` | string, role-specific | |
| `quick_overview` | string, 80–150 words | |
| `deep_dive` | string, 300–600 words | See B.2 for `overview`-depth exception |
| `resources` | list of Resource objects | Part E |
| `quiz_pool` | list of **8–10** Question objects | Part F |
| `content_version` | integer | Part I |

**Estimated-time authoring rule:** `estimated_time_minutes` must be a positive integer and should be reviewed for plausibility during authoring. It is informational only in V1 and never participates in gating, progress weighting, or scheduling.

### A.6 Prerequisite (relationship, not an entity)

A directed edge: Skill Node A requires Skill Node B. See Part C.

### A.7 Depth flexibility

Skill Nodes may attach directly to a Topic when a Subtopic layer would be an empty wrapper around one node. Skill Node is always the deepest level and the only level with status/gating.

---

## Part B — Classification & Depth

### B.1 Classification (exactly one per node)

| Value | Meaning | Effect on gating |
|---|---|---|
| `required` | Necessary for the target role | Counts toward pillar completion %; participates in "current focus" and "recommended next" |
| `recommended` | Strongly useful, not strictly necessary | Doesn't block `required` progression; excluded from "recommended next" unless no required nodes remain |
| `optional` | Useful depending on interests | Same as `recommended`, looser framing in its content |
| `specialization` | Only relevant after entering a branch | See B.3 |

**Rule:** pillar progress % is calculated from `required` nodes only.

### B.2 Recommended depth (exactly one per node, role-specific)

| Value | Meaning |
|---|---|
| `overview` | Know it exists and why it matters |
| `practical` | Can use it correctly in normal project work |
| `implementation` | Can build/implement it from scratch |
| `advanced` | Deeper mechanisms, tradeoffs, optimization |

**Content rule for `overview` depth:** the node uses the same content schema, but the Quick Overview is the intended learning endpoint. A Deep Dive may be omitted when the topic doesn't warrant more depth, or may contain only brief supporting detail rather than being forced to the full 300–600-word range. The UI must not imply every overview-level node requires a full deep dive.

### B.3 Branches / specializations

**V1 specialization rule:** specialization branches are freely explorable and never hidden or hard-locked. There is **no separate "enter specialization" entity or workflow.** A learner begins progressing within a specialization simply by studying its Skill Nodes. Specialization nodes follow their own prerequisite chain within the branch. They become the branch-local current focus only once the learner has begun working in that branch (i.e. once at least one node in it is In Progress or Completed) — they are never automatically assigned as a pillar's Current Focus the way a `required` node is. Specialization nodes never alter the shared-foundation required-progress percentage.

---

## Part C — Prerequisites

**V1 supports only simple AND-prerequisites** — no alternative/OR prerequisites (deferred to V2).

**Prerequisites can cross pillars.**

**No cycles** — validated at authoring/seed time (Part I).

**Prerequisites always point to Skill Nodes**, regardless of the target node's own classification (a `required` node can validly depend on a `recommended` node — the check only cares about `Completed` status, not classification).

**Depth of prerequisite chains:** keep to 1–3 hops where possible.

---

## Part D — Content Field Standards

| Field | Length | Tone rule |
|---|---|---|
| `one_sentence_definition` | ≤25 words | Plain, no marketing language |
| `why_it_matters` | 1–3 sentences | Role-specific |
| `quick_overview` | 80–150 words | No code samples |
| `deep_dive` | 300–600 words | Mechanisms, examples, common mistakes; short code okay if useful |

Global tone rule: exact numbers and precise terminology over marketing language.

---

## Part E — Resources

2–4 resources per node.

| Field | Type |
|---|---|
| `title` | string |
| `url` | string |
| `type` | enum: `documentation` \| `article` \| `course` \| `video` \| `book` \| `tutorial` \| `practice` |
| `tag` | enum: `start_here` \| `alternative` \| `practice` \| `reference` |
| `why` | string, ≤20 words, optional |

**Rule:** exactly one `start_here` resource per node.

**Resource validation rule:** every published resource URL must be checked during human review for reachability and relevance. AI-generated or placeholder URLs must never be published without verification.

---

## Part F — Quiz Question Standards

**8–10 questions** per pool, all MCQ, 4 options, exactly one correct.

- No "all/none of the above."
- Distractors plausible, not filler.
- Questions test only this node's own content.
- No subtopic/category tagging (no consumer for it in V1).
- Avoid echoing `quick_overview` sentence-for-sentence.

```yaml
question: string
options: [string, string, string, string]
correct_index: 0-3
```

---

## Part G — Authoring Checklist

**Per node:**
- [ ] Name specific, not vague
- [ ] `one_sentence_definition` ≤25 words
- [ ] `why_it_matters` role-specific
- [ ] `classification` deliberate
- [ ] `recommended_depth` matches role need
- [ ] `prerequisites` minimal — true hard dependencies only
- [ ] No duplicate concept vs sibling
- [ ] Not a micro-skill
- [ ] `quick_overview`/`deep_dive` within word bounds
- [ ] Exactly one `start_here` resource
- [ ] Every resource URL manually verified reachable and relevant
- [ ] 8–10 quiz questions, answer key double-checked

**Per pillar, once authored:**
- [ ] 5–8 pillars, 2–4 topics/pillar, 2–5 nodes/subtopic (or documented exception)
- [ ] Any specialization branch has explicit structure, no undefined "enter" workflow
- [ ] No cycles in prerequisite graph (validated programmatically)
- [ ] Every required node reachable from "no prerequisites"

---

## Part H — Naming & ID Conventions

Format: `{track_slug}__{pillar_slug}.{topic_slug}.{subtopic_slug}.{node_slug}`

Example: `aiml-engineer__machine-learning.supervised-learning.classification.logistic-regression`

IDs globally unique, lowercase, hyphen-separated, stable once published (renaming `name` doesn't change `node_id`).

---

## Part I — Content Lifecycle & Versioning

**Generate → Review → Edit → Approve → Publish.**

`content_version` increments on any post-publish regeneration/edit of `quick_overview`, `deep_dive`, `resources`, or `quiz_pool`. Informational/auditable only in V1.

**Regeneration scope:** one node's content regenerates independently — never a bulk tree rebuild. A `prerequisites` change is a structural edit, not a content regeneration — re-run the cycle-check.

**Historical quiz attempts are not invalidated by quiz_pool changes.** Existing `Completed` status stands regardless of later pool edits.

---

## Part J — Worked Example

```yaml
node_id: aiml-engineer__machine-learning.supervised-learning.classification.logistic-regression
name: Logistic Regression
classification: required
recommended_depth: implementation
estimated_time_minutes: 90
prerequisites:
  - aiml-engineer__mathematics.probability.foundations.probability-basics
  - aiml-engineer__python.fundamentals.core.numpy-basics

one_sentence_definition: >
  A classification algorithm that models the probability of a binary
  outcome using a linear combination of inputs passed through a sigmoid function.

why_it_matters: >
  As an AI/ML Engineer, logistic regression is usually your first real
  classification baseline — fast to train, easy to interpret, and the
  model you compare every fancier classifier against before deciding
  the complexity is actually earning its keep.

quick_overview: >
  Logistic regression predicts the probability that an input belongs to
  one of two classes. It works by taking a weighted sum of the input
  features and passing it through the sigmoid function, which squashes
  any real number into a range between 0 and 1, interpreted as a
  probability. A threshold (usually 0.5) converts it into a class
  prediction. Despite the name, it's a classification method. Related
  to Linear Regression (shares the linear combination step) and feeds
  into Model Evaluation.

deep_dive: >
  [300-600 words: sigmoid function rationale, linear decision boundary,
  training via log-loss minimization, class imbalance and threshold
  adjustment, L1/L2 regularization, calibration pitfall, a worked
  example scenario.]

resources:
  - title: "Logistic Regression — StatQuest"
    url: "https://example.com/statquest-logistic-regression"
    type: video
    tag: start_here
    why: "Clearest visual walkthrough of the sigmoid and decision boundary"
  - title: "scikit-learn LogisticRegression docs"
    url: "https://example.com/sklearn-logistic-regression"
    type: documentation
    tag: reference
  - title: "Kaggle Titanic dataset"
    url: "https://example.com/kaggle-titanic"
    type: practice
    tag: practice
    why: "Small, fast binary classification dataset to implement this on directly"

quiz_pool:
  - question: "What function converts logistic regression's linear output into a probability?"
    options: ["ReLU", "Sigmoid", "Softmax", "Tanh"]
    correct_index: 1
  - question: "Logistic regression is best described as:"
    options: ["A regression algorithm for continuous outputs", "A classification algorithm despite its name", "An unsupervised clustering method", "A dimensionality reduction technique"]
    correct_index: 1
  - question: "What does the decision boundary of logistic regression look like in feature space?"
    options: ["Always curved", "Linear", "Always circular", "Depends only on the sigmoid function's shape"]
    correct_index: 1
  # ... 5-7 more, covering training objective, regularization, threshold, class imbalance

content_version: 1
```

---

## Part K — V1 Rules Confirmed by This Document

- Specialization branches are normal Topic/Pillar structure plus `specialization` classification — no separate branch-entry workflow.
- `overview` depth does not require a full deep dive when unjustified.
- Track-level pillar/node counts are derived, not stored redundantly.
- Resource URLs are verified before publication.
- Estimated time is display-only, never affects progression/percentage/scheduling.

## Part L — What this document deliberately excludes

- Alternative/OR prerequisites (V2)
- Cross-role shared skill library (V2)
- Per-question subtopic tagging (excluded per locked decisions)
- In-app content authoring UI (content authored offline, seeded)
- Estimated time used for anything beyond display
