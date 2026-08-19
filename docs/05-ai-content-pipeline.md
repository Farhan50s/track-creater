# Track Creator — AI Content Pipeline

**Document 5 of 6 (consolidated set)**  
**Depends on:** `Skill & Content Model`, `Data Model & Technical Architecture`  
**Feeds into:** the authored V1 track content, `Implementation Plan`

> **Status: V1 LOCKED**
>
> This document owns the offline **Generate → Human Review → Validate** stages. It does not reopen product decisions already locked in Documents 1–4. It makes AI-assisted content generation deterministic, reviewable, reproducible, and safe to seed.

## Part A — Pipeline Ownership

| Stage | Owner | Authority |
|---|---|---|
| Generate | This document | Parts B–E, K |
| Human Review | This document | Part G |
| Validate | This document | Part H |
| Seed | Data Model & Technical Architecture | Part I.4 |
| Verify | Data Model & Technical Architecture | Part I.5 |
| Deploy | Data Model & Technical Architecture | Part B.2 |

Canonical flow:

`LOCKED SKELETON → GENERATE → JSON-SCHEMA VALIDATE → HUMAN REVIEW → FULL VALIDATE → SEED-ELIGIBILITY GATE → SEED → VERIFY → DEPLOY`

No stage may silently bypass the previous stage.

---

## Part B — Skeleton-First Rule

**Content generation never invents structure.**

Before any Gemini call, the complete track skeleton must exist and be locked. It defines track, pillars, topics, subtopics, skill nodes, IDs, names, classification, recommended depth, estimated time, ordering, and prerequisites.

AI fills only content fields:

- `one_sentence_definition`
- `why_it_matters`
- `quick_overview`
- `deep_dive`
- `quiz_pool`

The skeleton is authoritative. AI output must never modify structural metadata.

Skeleton: `content-drafts/{track_id}/skeleton.yaml`.

The structural bounds remain those locked in the Skill & Content Model: 5–8 pillars, 2–4 topics/pillar, 2–5 nodes/subtopic, valid single-parent hierarchy, and an acyclic prerequisite graph.

---

## Part C — Generation Scope

Use **one Gemini call per Skill Node**. Each call generates the definition, importance statement, overview, deep dive, and quiz pool together. Resources are never AI-generated.

The normal generation target is **exactly 9 questions**. Runtime/content validation accepts the locked **8–10** range.

Each call is independent except for lightweight context: target role, tree location, classification, depth, prerequisite names, and sibling names. The model is not allowed to redesign the tree.

---

## Part D — Prompt Contract

Use a fixed versioned system prompt requiring strict JSON, no markdown fences, no commentary, and no extra fields.

Rules:

- definition ≤25 words
- `why_it_matters`: 1–3 specific sentences
- overview: 80–150 words
- deep dive: 300–600 words for practical/implementation/advanced nodes; overview nodes may use a shorter/null deep dive when appropriate
- documentation tone, no marketing filler
- exactly 9 MCQs during generation
- exactly 4 options/question
- exactly one correct option
- `correct_index` 0–3
- no all/none-of-the-above
- plausible distractors
- questions test the current node, not future knowledge or wording recall
- avoid ambiguity and duplicate concepts

Per-node prompt supplies the locked role, node, location, classification, depth, estimated time, prerequisites, and siblings.

The generator must explicitly instruct the model that structural metadata is authoritative and must not be invented or changed.

---

## Part E — Output & Schema Validation

Each node becomes `content-drafts/{track_id}/{node_id}.yaml`.

Example:

```yaml
node_id: ...
name: ...
classification: required
recommended_depth: implementation
estimated_time_minutes: 90
prerequisites: [...]
one_sentence_definition: "..."
why_it_matters: "..."
quick_overview: "..."
deep_dive: "..."
quiz_pool:
  - question: "..."
    options: ["...", "...", "...", "..."]
    correct_index: 1
resources: []
content_version: 1
generated_at: 2026-08-19T00:00:00Z
reviewed: false
```

**Immediate schema gate:** every Gemini response must be parsed and validated against a strict JSON Schema before being written to disk. Invalid JSON, missing/extra fields, wrong types, invalid quiz structure, or invalid indexes cause retry/failure; malformed output is never silently converted into YAML.

**Metadata integrity gate:** the draft must exactly match the skeleton for IDs, name, classification, depth, estimated time, order, prerequisites, and hierarchy. Any mismatch is a hard failure.

---

## Part F — Resources

Resources are never AI-generated. They are manually selected after reviewing the generated content because plausible LLM URLs may be wrong or dead.

Each node requires 2–4 resources and exactly one `start_here`. URLs must be manually verified. The validator checks structural completeness; V1 does not claim automated reachability verification.

---

## Part G — Human Review

AI output is always a first draft.

For every node, the reviewer checks factual correctness, role/depth fit, clarity, prerequisite alignment, sibling overlap, definition/overview/deep-dive quality, every quiz question and answer, and all resources. Then the reviewer sets `reviewed: true`.

Review by subtopic is recommended because adjacent nodes make duplicate concepts, missing concepts, terminology inconsistencies, and quiz overlap easier to detect.

Any file with `reviewed: false` is not seed-eligible.

---

## Part H — Validation & Seed-Eligibility Gate

Validation is a **hard gate** over the complete track.

A track is seed-eligible only when:

1. The skeleton is valid.
2. Every skeleton node has exactly one draft.
3. Every draft maps to exactly one skeleton node.
4. No extra drafts exist.
5. Every draft is `reviewed: true`.
6. Structural validation passes.
7. Skeleton/draft metadata matches exactly.
8. Content validation passes.
9. Resource validation passes.
10. Quiz validation passes.
11. Full prerequisite DAG validation passes.
12. Cross-node consistency checks pass.
13. No blocking errors remain.
14. A seed-eligibility manifest is generated.

Checks include:

**Structural:** unique IDs, valid hierarchy, unique order within scope, valid parents, valid prerequisites, no self-prerequisites, no orphans, complete track membership.

**Content:** definition ≤25 words; overview 80–150; deep dive 300–600 when required; overview-depth may omit/shorten it; no placeholders or empty required fields.

**Resources:** 2–4 resources, exactly one `start_here`, valid fields, non-empty URLs.

**Quiz:** 8–10 questions, normally generated as 9; exactly 4 options, `correct_index` 0–3, no duplicate question text, no empty fields, no obvious ambiguity. Semantic quality remains subject to human review.

**Cross-node:** detect missing/extra nodes, invalid references, metadata mismatches, and deterministic structural inconsistencies. Semantic duplication may be a review warning when it cannot be reliably determined automatically.

**DAG:** complete graph traversal must reject cycles such as A→B→C→A.

Severity:

- `ERROR` = blocks seeding
- `WARNING` = requires review
- `INFO` = informational

V1 requires zero errors.

Successful validation creates a manifest such as:

```yaml
track_id: aiml-engineer
validated_at: 2026-08-19T00:00:00Z
validator_version: 1.0.0
seed_eligible: true
node_count: 120
reviewed_node_count: 120
error_count: 0
warning_count: 0
```

The seed process must refuse to run unless `seed_eligible: true` and the manifest matches the exact content set being seeded. If any file changes after validation, validation is stale and must be rerun.

---

## Part I — Seeding

Seeding remains owned by Data Model & Technical Architecture.

Dependency order:

`tracks → pillars → topics → subtopics → skill_nodes → node_prerequisites → resources → quiz_questions → quiz_answers`

The seed script uses the Supabase service-role key in a trusted local environment.

It must refuse to seed if the validation manifest is missing, says `seed_eligible: false`, is stale, or required reviewed files are missing.

---

## Part J — Regeneration & Versioning

Regeneration is always a **single-node operation**.

It reloads the locked skeleton, uses the same generation contract, validates the response, replaces only generated fields, preserves all structural metadata, sets `reviewed: false`, and requires human review + full validation again.

Prerequisites, classification, depth, estimated time, ordering, node ID, and hierarchy are never modified by regeneration.

### Content version semantics

`content_version` represents the **published content revision**, not the number of Gemini calls.

| Situation | Version |
|---|---:|
| First unpublished draft | 1 |
| Regenerated before first seed | remains 1 |
| First published version | 1 |
| Post-publication regeneration | increment |
| Next post-publication regeneration | increment again |

Thus pre-publication experimentation does not artificially inflate the published version.

After publication:

`published v1 → regenerate → review → validate → seed/update → published v2`.

---

## Part K — Script Architecture & Error Handling

Use Node.js with the Gemini API directly.

Recommended commands:

```bash
generate-track --track <track_id>
generate-node --track <track_id> --node <node_id>
regenerate-node --track <track_id> --node <node_id>
validate-track --track <track_id>
seed-track --track <track_id>
```

Use exponential backoff for transient 429/5xx/network failures.

A permanently failed node is recorded with node ID, category, attempts, timestamp, and status; independent nodes continue processing. The process exits non-zero when generation remains incomplete.

Idempotency:

- missing file → generate
- existing `reviewed:false` → may regenerate
- existing `reviewed:true` → skip

Never silently overwrite reviewed work.

Log operational metadata such as node ID, success/failure, retries, latency, model ID, and token usage where available. Do not unnecessarily place full prompts/responses in shared logs.

`GEMINI_API_KEY` remains local, uncommitted, and never appears in frontend/deployed code.

---

## Part L — Cost & Scale

At approximately 100–150 nodes, expect roughly 100–150 primary generation calls because content and quizzes are combined per node, plus retries or deliberate single-node regeneration.

The main bottleneck is human review and manual resource curation, not generation.

Budget roughly 10–20 minutes per node for review, editing, quiz checking, resource research, and URL verification: approximately 17–50 hours for 100–150 nodes.

---

## Part M — Reproducibility & Auditability

Generated drafts should record:

```yaml
generated_at: ...
generator_version: 1.0.0
prompt_version: 1.0.0
model: <model-id>
content_version: 1
reviewed: false
```

Never store the API key.

Where practical, store a fingerprint/hash of the locked skeleton metadata used to generate the draft. If the skeleton changes, existing content should not automatically be treated as current.

---

## Part N — Failure-Safety Invariants

These are mandatory V1 rules:

1. AI owns content generation, never learning architecture.
2. `reviewed:false` means not seed-eligible.
3. Invalid AI output cannot become a draft.
4. One failed node prevents the track from becoming seed-eligible.
5. Validation and seeding must refer to the same content set.
6. Regeneration cannot silently change prerequisites or other structural metadata.
7. AI-suggested resources are never trusted without manual verification.
8. Failed generation must be visible and reported.
9. A stale validation manifest cannot authorize seeding.

---

## Part O — End-to-End Workflow

```text
1. Author and lock skeleton
2. Validate skeleton
3. Generate node content
4. JSON-schema validate response
5. Save draft YAML
6. Human review
7. Manually curate resources
8. Set reviewed=true
9. Run full-track validation
10. Generate seed-eligibility manifest
11. Verify manifest matches current files
12. Seed through service-role pipeline
13. Verify database content
14. Deploy application
```

No user-facing runtime application path generates or modifies this content.

---

## Part P — Definition of Done

### Generation
- [ ] Skeleton-first workflow exists
- [ ] One-call-per-node generation works
- [ ] Prompt and generator versions are recorded
- [ ] JSON Schema validation is enforced
- [ ] Invalid output retries/fails visibly
- [ ] Reviewed files are protected

### Review
- [ ] Review checklist exists
- [ ] Resources are manually curated
- [ ] `reviewed` is enforced
- [ ] Skeleton metadata is compared exactly

### Validation
- [ ] Structural validation works
- [ ] Content validation works
- [ ] Resource validation works
- [ ] Quiz validation works
- [ ] DAG validation works
- [ ] Cross-node checks work
- [ ] Missing/extra files are detected
- [ ] Severity is explicit
- [ ] Seed manifest is generated

### Seeding
- [ ] Invalid tracks are rejected
- [ ] Stale manifests are rejected
- [ ] Only reviewed/validated content is seeded
- [ ] Service-role key remains local

### Versioning
- [ ] Single-node regeneration works
- [ ] Structural fields remain immutable
- [ ] Pre-publication regeneration keeps version 1
- [ ] Post-publication regeneration increments version
- [ ] Regeneration requires review and validation

### Operations
- [ ] Retry/backoff works
- [ ] Failed nodes are reported
- [ ] Batch processing continues after independent failures
- [ ] Incomplete runs exit non-zero
- [ ] Generation metadata is auditable

---

## Part Q — Deliberate V1 Exclusions

V1 excludes:

- in-app content-generation UI
- runtime AI calls
- AI-generated resource URLs
- automated resource reachability guarantees
- bulk/tree-wide regeneration
- AI-generated prerequisite structure
- AI-generated classification decisions
- AI-generated learning-tree architecture
- runtime adaptive quiz generation
- AI-powered learner recommendations
- per-topic failure diagnostics
- Practice Gates
- alternative/OR prerequisite logic

These remain outside the V1 scope established by the earlier locked documents.

---

## Final V1 Contract

> **AI accelerates content authoring; it never owns the learning architecture or the publishing decision.**

The authoritative flow is:

```text
LOCKED SKELETON
      ↓
AI GENERATION
      ↓
SCHEMA VALIDATION
      ↓
HUMAN REVIEW
      ↓
MANUAL RESOURCE CURATION
      ↓
FULL TRACK VALIDATION
      ↓
SEED-ELIGIBILITY MANIFEST
      ↓
SAFE SEED
      ↓
VERIFY
```

If any stage fails, that content cannot become published V1 content.
