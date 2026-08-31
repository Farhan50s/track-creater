---
description: "Core architectural and progression invariants for Track Creator frontend, tree ordering, and verification"
always_on: true
---

# Track Creator Core Invariants & Architectural Rules

## 1. Progression & Prerequisite Logic
- **Track-Wide Progress Fetching**: Always load `user_node_progress` across the entire active track (or user scope), NOT isolated to a single pillar. Cross-pillar prerequisites (e.g. Pillar B Node 1 requiring Pillar A Node 2) break if progress is queried per-pillar.
- **Required-Only Progress Computation**: Only nodes with `classification === 'required'` participate in `calculatePillarPercent` numerator and denominator. `recommended`, `optional`, and `specialization` nodes must NEVER alter completion percentage.
- **Soft-Lock Exploration Pattern**: Locked nodes (`is_locked === true`) must remain visible, dimmed, badged with 🔒, and fully tappable/clickable to navigate to `/app/node/:nodeId`. Never hide or disable navigation on locked nodes.
- **Deterministic Tree Traversal Order**: Tree order must strictly follow `Topic.order_index ASC` → `Subtopic.order_index ASC` → `SkillNode.order_index ASC`. When topics contain direct child nodes (`parent_subtopic_id = null`), sort them by their hierarchy path and `order_index`.
- **Current Focus Rules**: Current focus per pillar is computed automatically as the first incomplete required node in `tree_order` whose prerequisites are satisfied. If all required nodes are completed, or all incomplete required nodes are locked, handle gracefully (e.g., "Pillar Completed" or "Blocked by prerequisite"). Specialization, recommended, and optional nodes are never assigned as default current focus.
- **Human-Readable Prerequisites**: In UI tooltips and lock hints, always map prerequisite node IDs to their human-readable node names rather than raw slug strings.

## 2. Onboarding & Security Invariants
- **Zero Progress Writes on Onboarding**: Self-report during onboarding writes exclusively to `user_pillar_self_report` and `user_active_track`. It must NEVER write to `user_node_progress` or mark any node as in-progress/completed.
- **Write Sequencing**: In multi-step database mutations, persist child/supporting records (e.g. self-report) before state-locking parent records (e.g. active track) to allow safe retries on failure.
- **Test Runner Standards**: Standardize automated test scripts with `npx tsx scripts/verify-phaseX.ts` and `npx tsc --noEmit`.
