# Track Creator — Master Product Requirements Draft

**Status:** Product Discovery / Pre-Development  
**Version:** 0.1  
**Product Type:** Standalone web application  
**Future Relationship:** Optional integration with StudyHub AI through API/embed  
**Primary Objective:** Help a learner move from a desired career/skill goal to a structured, detailed, navigable, and verifiable learning path.

---

## 1. Product Definition

### 1.1 Product concept

Track Creator is a standalone learning-path platform where a user tells the application what they want to learn or what role they want to become.

The application presents a structured **skill track** consisting of:

- Major skill pillars
- Subskills
- Deeper concepts
- Prerequisites
- Optional branches
- Specializations
- Recommended resources
- Learning guidance
- Practice
- Verification
- Progress

The original concept is explicitly based on a tree/graph in which users begin with broad pillars and progressively expand into more specific, concrete learnable units.

### 1.2 Product philosophy

Track Creator should not feel like:

- A generic AI chatbot
- A static syllabus
- A giant checklist
- A random collection of links
- A generic AI-generated roadmap
- A gamified task manager

It should feel like:

> **A living map of the skills required to reach a specific learning or career goal.**

### 1.3 Core product promise

The platform should answer five questions for the learner:

1. **Where do I want to go?**
2. **What do I need to learn?**
3. **What should I learn first?**
4. **How deeply do I need to learn each thing?**
5. **How do I know that I actually know it?**

---

# 2. Target Users

## 2.1 Primary users

### Students

University and college students who:

- Want a career direction
- Are overwhelmed by large technology fields
- Do not know what to learn next
- Need a structured path
- Want to track progress

### Self-learners

People learning independently through:

- YouTube
- Documentation
- Courses
- Books
- Projects
- Online resources

### Career starters

Users who know the desired destination but lack clarity about the skills required.

Example:

> "I want to become an AI Engineer, but I don't know what I need to learn."

## 2.2 Future users

Potential future audiences:

- Career switchers
- Working developers
- Professional upskillers
- Teachers
- Mentors
- Universities
- Training organizations
- Companies creating internal learning paths

These should not drive V1 scope.

---

# 3. Core User Journey

The primary experience should follow:

**Goal → Assessment → Track → Explore → Learn → Practice → Verify → Progress → Recommendation**

### Step 1 — Define goal

The user chooses or describes:

- A career
- A technology
- A subject
- A skill
- A specialization

Example:

> "I want to become an AI/ML Engineer."

### Step 2 — Establish current level

The application determines what the user already knows.

Potential mechanisms:

- Self-reported knowledge
- Quick diagnostic assessment
- Existing profile information
- Future skill evidence

### Step 3 — Present appropriate track

The user receives a structured path containing:

- Foundation
- Core skills
- Advanced skills
- Specializations
- Optional branches

### Step 4 — Explore

The user navigates through the skill graph.

### Step 5 — Learn

The user opens a skill and receives appropriate material and guidance.

### Step 6 — Practice

The user completes:

- Questions
- Exercises
- Coding practice
- Projects where available

### Step 7 — Verify

The system checks understanding rather than relying entirely on a "completed" checkbox.

The existing product context specifically proposes a self-check quiz before completion.

### Step 8 — Progress

The user's skill state changes.

### Step 9 — Recommend

The system recommends what the user should learn next.

---

# 4. Product Terminology

The following terminology should be used consistently.

## Goal

The desired destination.

Examples:

- AI/ML Engineer
- Full-Stack Developer
- Data Scientist

## Track

A structured route toward a goal.

## Pillar

A major category within a track.

Example:

> Machine Learning

## Skill Node

An individual learning unit.

Example:

> Classification

## Subskill

A more specific skill beneath another skill.

## Prerequisite

A skill that supports or is required for another skill.

## Branch

An alternative direction from a shared foundation.

## Specialization

A focused path such as:

- Computer Vision
- NLP
- MLOps
- LLM Engineering

## Mastery

The verified level of competence in a node.

---

# 5. Track Structure

A Track Creator track should support hierarchical depth.

Example:

```text
AI/ML Engineer
│
├── Mathematics
│   ├── Linear Algebra
│   │   ├── Vectors
│   │   ├── Matrices
│   │   └── Matrix Operations
│   └── Probability
│
├── Python
│   ├── Fundamentals
│   ├── NumPy
│   └── Python for ML
│
├── Machine Learning
│   ├── Supervised Learning
│   │   ├── Regression
│   │   └── Classification
│   ├── Unsupervised Learning
│   └── Model Evaluation
│
└── Deep Learning
    ├── Neural Networks
    ├── CNNs
    └── Transformers
```

The system must support expansion from broad concepts to concrete learnable units.

---

# 6. Multiple Tracks and Career Directions

A major product requirement is that a broad field should not necessarily map to one giant roadmap.

For example, "AI" may lead to several directions.

Potential tracks:

- AI Engineer
- ML Engineer
- AI Research
- LLM Engineer
- Computer Vision
- NLP
- Data Science

The system should eventually allow users to compare and choose among relevant paths.

### Track recommendation

The application may recommend a track based on:

- User goal
- Existing skills
- Interests
- Desired type of work
- Current level
- Time available

This should eventually become a recommendation layer rather than simply presenting every possible branch.

---

# 7. Role Templates

For V1, tracks should primarily be **curated and hand-authored** rather than generated independently for every user.

The existing decision is:

- Start with approximately 2–3 role templates.
- Keep the underlying skill trees stable.
- Add custom-goal AI generation later.

Candidate V1 templates:

1. AI/ML Engineer
2. Full-Stack Developer
3. Data Scientist

Final role selection remains a product decision to be locked before implementation.

---

# 8. Custom Goal Input

Future requirement, not necessarily V1.

The user should eventually be able to enter:

> "I want to become an AI Engineer focused on RAG systems."

or:

> "I want to learn backend development using Python and FastAPI."

The AI can then map the request to:

- Existing track
- Existing specialization
- Custom path
- Combination of existing nodes

This should remain outside the initial V1 unless product discovery proves it essential.

The existing context explicitly defers custom roadmap generation.

---

# 9. Skill Assessment

## 9.1 Initial assessment

The application should determine the user's starting point.

Possible mechanisms:

### Self-assessment

The user marks:

- Don't know
- Beginner
- Intermediate
- Advanced

### Diagnostic quiz

The platform tests selected foundational skills.

### Future evidence-based assessment

Possible later signals:

- Projects
- GitHub
- Uploaded work
- Coding assessments
- Completed quizzes

## 9.2 Assessment output

The system should produce:

### Known

Skills the user already understands.

### Developing

Skills with partial knowledge.

### Missing

Skills they should learn.

### Recommended review

Known concepts where the assessment indicates weak understanding.

---

# 10. Skill Depth

The platform must distinguish between **knowing that a topic exists** and **actually needing deep expertise in it**.

Possible depth levels:

### Overview

Understand what it is and why it matters.

### Practical

Understand it and use it in normal projects.

### Implementation

Build or implement solutions using it.

### Advanced

Understand deeper mechanisms, limitations, optimization, and real-world tradeoffs.

### Research / Expert

Only required for certain specialized paths.

The recommended depth should depend on the selected role.

For example:

> Linear Algebra

might require moderate understanding for an AI application engineer but significantly deeper knowledge for an AI researcher.

---

# 11. Required vs Optional Skills

Every node should have a role in the track.

Possible classifications:

### Required

Necessary for the target track.

### Recommended

Strongly useful but not strictly required.

### Optional

Useful depending on interests or work.

### Specialization

Only relevant after entering a branch.

### Advanced

Not required to become functional at the target role.

This prevents the roadmap from becoming an unrealistic giant checklist.

---

# 12. Prerequisites

Prerequisites must be represented explicitly.

Example:

```text
Vectors
   ↓
Matrices
   ↓
Linear Algebra
   ↓
Neural Networks
```

A skill may have:

- One prerequisite
- Multiple prerequisites
- Alternative prerequisites

The system should eventually support prerequisite graphs rather than assuming everything is strictly linear.

---

# 13. Prerequisite Behavior

This needs a deliberate product decision.

The product should support at least the conceptual states:

### Hard prerequisite

The learner should complete the prerequisite before progressing.

### Recommended prerequisite

The learner can continue but is warned.

### No prerequisite

The learner can enter freely.

A promising UX approach is:

> **Visible but intelligently warned**

rather than hiding knowledge from the user.

Final hard-vs-soft behavior must be confirmed before implementation.

---

# 14. Skill Graph / Roadmap Interface

The skill graph is one of the most important parts of the product.

The interface must support:

- Expand/collapse
- Node selection
- Parent/child relationships
- Prerequisite visualization
- Branches
- Progress indicators
- Locked/unlocked states
- Current position
- Recommended next node
- Navigation into deeper maps

---

# 15. Graph UX Direction

This is an explicit design decision still requiring validation.

Candidate patterns:

### A. Horizontal graph

Advantages:

- Visually impressive
- Strong sense of relationships

Problems:

- Complex
- Difficult on small screens
- Can become visually overwhelming

### B. Vertical expandable tree

Advantages:

- Easier to understand
- Easier to implement
- Mobile-friendly

Problems:

- Less distinctive
- Can become long

### C. Linear path with branch points

Advantages:

- Extremely easy to follow
- Familiar learning UX

Problems:

- Doesn't represent complex skill relationships well

### Proposed direction

Explore a **hybrid model**:

**Visual graph overview → structured expandable skill view → individual skill detail page**

This preserves the visual identity of a skill graph without forcing users to navigate a giant graph at all times.

---

# 16. Responsive UI Requirements

The product must support:

- Desktop
- Tablet
- Mobile

The desktop experience can emphasize the skill graph.

The mobile experience should prioritize:

- Expandable hierarchy
- Cards
- Node details
- Progress
- Recommended next step

The mobile interface should not simply scale down a desktop graph.

---

# 17. Track Overview Screen

When opening a track, the user should immediately understand:

- What the track is
- What the target role is
- Overall progress
- Major pillars
- Current learning location
- Recommended next skill
- Remaining branches
- Estimated scope

Example:

> **AI/ML Engineer**

**Progress: 37%**

**Current focus:** Machine Learning

**Recommended next:** Model Evaluation

**Completed pillars:** Python, Data Fundamentals

---

# 18. Node Card Requirements

Each skill node should communicate enough information without forcing the user to open it.

Potential information:

- Skill name
- Status
- Difficulty
- Required/recommended/optional
- Progress
- Estimated time
- Prerequisite status
- Recommended depth

---

# 19. Skill Detail Page

Every significant skill should have a dedicated detail experience.

### Required content

**What is it?**

Simple explanation.

**Why does it matter?**

Role-specific purpose.

**What do I need to know?**

Prerequisites and supporting knowledge.

**How deep should I go?**

Role-specific recommended depth.

**What should I learn?**

Subtopics.

**How can I learn it?**

Curated resources.

**How do I know I understand it?**

Quiz/checkpoint.

---

# 20. Quick Overview vs Deep Dive

The product context explicitly proposes a quick-overview/deep-dive toggle.

### Quick Overview

Provides:

- Definition
- Purpose
- Main ideas
- Relationship to surrounding skills

### Deep Dive

Provides:

- Detailed concepts
- Mechanisms
- Examples
- Common mistakes
- Practical usage
- Role-specific details

The deep dive should not automatically become an unnecessarily long article.

---

# 21. AI Content Generation

The AI should support content creation but should not necessarily generate the entire product dynamically for every user.

For V1:

- Role trees are curated.
- Node content can be AI-assisted.
- Content is reviewed and editable.
- Generated content should be stored and reused.

The existing product context emphasizes low/no recurring cost and explicitly recommends hand-authored templates rather than per-user AI-generated trees.

---

# 22. Content Lifecycle

A node's AI-generated content should follow:

**Generate → Review → Edit → Approve → Publish**

The application should never assume that AI-generated educational content is automatically correct.

Content should be editable after generation.

If a node changes:

- Regenerate only that content
- Do not rebuild the entire track

---

# 23. Node Content Reuse

A shared concept should ideally avoid unnecessary duplication.

For example:

> Neural Networks

could appear in multiple tracks.

The product should eventually distinguish:

- Shared skill identity
- Role-specific context
- Role-specific recommended depth

This is an important architecture/product decision to resolve before schema finalization.

---

# 24. Resource System

Every major node should have a small curated selection of resources.

Possible resource types:

- Documentation
- Article
- Course
- Video
- Book
- Tutorial
- Official guide
- Practice environment

The platform should prioritize:

> **few high-quality resources**

over:

> **large lists of links**

---

# 25. Resource Recommendation

Resources can be categorized:

### Start here

Primary recommendation.

### Alternative

Different teaching style.

### Practice

For hands-on learning.

### Reference

For future lookup.

The application should explain why a resource is recommended where practical.

---

# 26. Quizzes

Every important learning node should have a verification mechanism.

The initial product context specifies a self-check quiz before completion.

Potential question types:

- Multiple choice
- True/false
- Scenario-based
- Short answer
- Code understanding
- Output prediction

V1 should probably prioritize inexpensive, deterministic grading.

Final question format remains a product decision.

---

# 27. Quiz Question Pool

Instead of generating new questions on every attempt, V1 can maintain a question pool.

Potential model:

- 5–10 questions per node
- Select a subset per attempt
- Store answer keys
- Allow retries
- Track performance

This supports low operating cost.

---

# 28. Completion Rules

Completion should not simply be:

> User clicks "Done."

Possible sequence:

**Learn → Practice → Self-check → Pass → Complete**

However, the product should distinguish between:

- Visited
- Learning
- Practiced
- Completed
- Verified
- Mastered

Final status model requires locking before implementation.

---

# 29. Skill Mastery

A useful progression model could be:

### Not Started

No interaction.

### Exploring

The user opened/reviewed the skill.

### Learning

The user is actively studying it.

### Practicing

The user is applying it.

### Verified

The user passed the checkpoint.

### Mastered

The user has demonstrated stronger competence through advanced verification/project evidence.

V1 may use fewer states to avoid unnecessary complexity.

---

# 30. Progress Tracking

The platform must track:

- Overall track completion
- Pillar completion
- Node status
- Verified skills
- Assessment results
- Quiz attempts
- Milestones

The existing context already requires overall and per-pillar progress.

---

# 31. Progress Calculation

Progress should not necessarily be a simple count of every node.

A 5-minute skill should not automatically have the same weight as a 20-hour skill.

Potential future weighting factors:

- Importance
- Depth
- Estimated effort
- Required status

V1 may intentionally use simpler node-based completion before introducing weighted progress.

---

# 32. Recommendations

The platform should eventually answer:

## "What should I learn next?"

The recommendation engine should consider:

- Prerequisites
- Current progress
- Current skill level
- Track priority
- Weak areas
- Selected specialization
- Previous activity
- Available time

The recommendation should explain:

> **Why this is your next recommended skill.**

Example:

> "Model Evaluation is recommended because you've completed the required ML fundamentals and it unlocks several downstream skills."

---

# 33. Milestones

Major accomplishments should be represented separately from raw percentage.

Examples:

- Foundations Complete
- First ML Model
- Machine Learning Complete
- First AI Project
- First RAG System
- Deployment Fundamentals Complete
- Track Ready

The existing product context explicitly includes milestones and badges per completed pillar.

---

# 34. Motivation

Possible motivation mechanisms:

- Streaks
- Milestones
- Badges
- Progress visualization
- "Next skill" recommendation

Gamification should remain secondary to learning.

The product should avoid becoming a shallow point-collecting application.

---

# 35. Exploration Mode

A learner may encounter a skill that is not part of their current active path.

The application should eventually allow:

**Explore this skill**

without forcing it into the main track.

Possible actions:

- Preview
- Learn more
- Add to track
- Start specialization
- Bookmark

This supports curiosity without destroying track structure.

---

# 36. Specialization Branching

A shared foundation can lead into specialized tracks.

Example:

```text
Core AI
   │
   ├── Machine Learning
   │
   └── Deep Learning
          │
          ├── Computer Vision
          ├── NLP
          ├── LLM Engineering
          └── Generative AI
```

The system should clearly communicate where specialization begins.

---

# 37. Track Recommendations

When several tracks are possible, the platform should provide recommendations.

Example:

> **Recommended: AI Engineer**

> Based on your goal of building AI applications and your existing programming background.

The recommendation should be explainable rather than merely producing a score.

---

# 38. Search

The application should eventually provide global skill search.

Example:

> Search "RAG"

Results might include:

- Retrieval-Augmented Generation
- Embeddings
- Vector Databases
- Chunking
- Reranking
- Retrieval Evaluation

Search should identify where the skill appears in the user's active track.

---

# 39. Skill Relationships

A skill should eventually expose relationships such as:

### Requires

Prerequisites.

### Related to

Conceptually connected skills.

### Used in

Careers/projects that use it.

### Leads to

Future skills unlocked by it.

### Part of

Tracks or specializations containing it.

This turns Track Creator into a genuine skill graph rather than a collection of nested lists.

---

# 40. Personal Notes and Learning Records

Potential future functionality:

- Add personal notes
- Bookmark a skill
- Save resources
- Add questions
- Record reflections
- Save project evidence

These become especially valuable during future StudyHub AI integration.

---

# 41. Future AI Assistant

The current context specifically identifies a future:

> **"Ask AI" scoped to a node**

Potential experience:

User opens:

> Neural Networks

Then:

**Ask AI**

The AI knows:

- Current role
- Current node
- Prerequisites
- Current level
- Related skills

and can answer questions within that context.

This should remain a future integration point rather than making the entire application dependent on live AI.

---

# 42. AI Explanation Requirements

AI-generated explanations should be:

- Role-specific
- Level-appropriate
- Focused
- Accurate
- Practical
- Consistent with neighboring nodes
- Explicit about prerequisite knowledge

The system should avoid exhaustive explanations when the chosen role does not require exhaustive depth.

This aligns with the current product direction of **"scoped depth, not exhaustive."**

---

# 43. Cost Requirements

Track Creator is a student-built product and must prioritize low operating cost.

The existing architectural principles explicitly state that architecture should default to low/no cost unless spending has a clear reason.

Therefore:

- Avoid unnecessary live AI generation.
- Cache reusable content.
- Prefer deterministic grading where practical.
- Reuse shared content.
- Batch AI generation during authoring.
- Do not regenerate unchanged content.
- Treat live AI as an opt-in capability rather than the core dependency.

---

# 44. AI Authoring Model

The likely content flow should be:

```text
Human defines track
        ↓
Human defines node hierarchy
        ↓
AI drafts explanations/questions
        ↓
Human reviews
        ↓
Human edits/approves
        ↓
Content stored
        ↓
Users consume stored content
```

This combines AI productivity with human quality control.

---

# 45. User-Created Custom Tracks

Future feature.

A power user could eventually:

- Create a track
- Add nodes
- Define prerequisites
- Reorder nodes
- Add resources
- Add projects
- Publish privately/publicly

However, the current project context explicitly defers a custom roadmap builder from V1.

---

# 46. Public Roadmaps

Future feature.

Users could publish:

> My AI Engineer Journey

Possible functionality:

- Public link
- Progress visibility
- Fork
- Save
- Follow
- Share

The current context explicitly defers public roadmaps/social proof until there is meaningful user volume.

---

# 47. Teacher/Mentor Roadmaps

Future possibility.

A teacher could create:

> "University AI Fundamentals"

A mentor could create:

> "6-Month ML Engineering Path"

An organization could eventually create:

> "Junior AI Engineer Onboarding"

This could transform the platform into a learning-path publishing ecosystem.

---

# 48. Job-Readiness

Future functionality.

A goal could eventually be evaluated as:

### AI/ML Engineer Readiness

- Programming
- Machine Learning
- Deep Learning
- Evaluation
- Deployment
- Projects
- Practical experience

The platform could identify:

- Strengths
- Gaps
- Missing projects
- Missing practical skills

This should not be promised as an accurate employment assessment until a reliable methodology exists.

---

# 49. StudyHub AI Integration

Track Creator must remain independent from StudyHub AI.

The current architecture decision is:

- Separate application
- Separate repository
- Separate deployment
- Defined API/embed contract
- No tight source-code coupling

Future integration candidates include:

### Ask AI

Ask StudyHub's AI about a Track Creator skill.

### Create Note

Create a StudyHub note associated with a skill.

### Add to Planner

Turn a learning task into a StudyHub Planner item.

### Dashboard

Show Track Creator progress inside StudyHub.

These are already identified future integration hooks.

---

# 50. Integration Identity

Authentication architecture must be decided before implementing cross-app integration.

Potential approaches:

- Separate accounts
- Shared authentication
- SSO
- Token-based handoff

The existing context specifically warns that authentication handoff should be decided before building rather than retrofitted later.

---

# 51. Data Model — Product-Level Requirements

The eventual data model must represent at minimum:

### Roles

Career targets.

### Tracks

Structured paths.

### Nodes

Individual skills.

### Relationships

Parent/child and graph relationships.

### Prerequisites

Dependencies between nodes.

### Node content

Explanations and learning information.

### Quiz items

Questions and answer data.

### User progress

User-specific skill state.

### Assessment results

Initial/current skill estimates.

### Milestones

Major achievements.

Final schema should be designed after the product relationship model is completely settled.

---

# 52. Node Reuse

The product should account for repeated concepts across tracks.

Example:

```text
AI Engineer
    ↓
Neural Networks

Data Scientist
    ↓
Neural Networks

ML Engineer
    ↓
Neural Networks
```

The underlying concept should ideally not require three completely unrelated copies of the same skill.

However, role-specific context may differ.

Therefore we need to distinguish:

**Skill identity**

from:

**Skill usage within a track.**

This is an important schema decision.

---

# 53. Content Ownership

The application should distinguish between:

### Platform content

Curated and controlled by Track Creator.

### AI-generated draft

Created during authoring.

### Approved content

Reviewed and published.

### User content

Notes, bookmarks, progress, reflections.

This prevents educational content and personal learning data from becoming mixed.

---

# 54. Admin / Authoring Requirements

Before public users can rely on the tracks, the creator/admin should have a way to:

- Create roles
- Create tracks
- Create nodes
- Arrange hierarchy
- Add relationships
- Define prerequisites
- Assign required/optional status
- Set recommended depth
- Generate AI content
- Edit AI content
- Review content
- Create quiz pools
- Publish/unpublish content

A sophisticated CMS does not need to be built immediately, but the product architecture should leave room for it.

---

# 55. Content Quality Requirements

AI-generated educational material must be reviewed.

The product should prioritize:

- Accuracy
- Consistency
- Appropriate depth
- Clear explanations
- No unnecessary filler
- No fabricated resources
- Correct prerequisites
- Appropriate role-specific recommendations

Content quality is more important than maximizing the number of nodes.

---

# 56. UI Design Principles

The UI should feel:

- Modern
- Technical
- Clean
- Educational
- Interactive
- Focused
- Visually memorable

It should avoid:

- Excessive gradients
- Excessive animation
- Dashboard clutter
- Huge walls of text
- Too many colors
- Gamification overload
- Generic "AI SaaS" styling

---

# 57. Visual Hierarchy

The interface should visually distinguish:

**Goal**

from:

**Pillar**

from:

**Skill**

from:

**Subskill**

from:

**Prerequisite**

from:

**Optional branch**

from:

**Completed**

from:

**Current**

from:

**Locked**

The graph must communicate meaning visually without requiring the user to inspect every node.

---

# 58. Motion and Interaction

Potential animations:

- Node expansion
- Graph zoom
- Branch reveal
- Progress transitions
- Completion feedback
- Navigation transitions

Animations should reinforce structure rather than exist solely for decoration.

---

# 59. Accessibility

The product should support:

- Keyboard navigation
- Clear focus states
- Adequate text contrast
- Screen-reader-friendly structure where practical
- Non-color-only status indicators
- Responsive layouts
- Readable typography

A graph interface must provide an accessible alternative representation.

---

# 60. Performance

The application should remain responsive even for large tracks.

Potential requirements:

- Lazy-load deep nodes
- Avoid rendering an entire massive graph simultaneously
- Efficient node expansion
- Cached content
- Optimized transitions
- Paginated or virtualized long resource lists where necessary

---

# 61. V1 Scope

The current recommended V1 remains intentionally narrow.

### V1 should include:

- 2–3 curated role templates
- Goal selection
- Structured skill hierarchy
- Expandable skill tree/graph
- Prerequisite relationships
- Required/recommended/optional classification
- Node detail pages
- AI-assisted authored explanations
- Quick overview/deep dive
- Curated resources
- Quiz/checkpoint
- Progress tracking
- Per-pillar progress
- Basic milestones
- Recommended next skill

This matches the current documented V1 recommendation.

---

# 62. Explicit V1 Exclusions

Do not allow scope to silently expand into:

- Fully AI-generated custom trees
- Public social roadmaps
- Social feeds
- Public progress competitions
- Generic plugin marketplace
- Automatic periodic web research
- Sophisticated career/job matching
- Full teacher platform
- Full custom roadmap editor
- Complex gamification
- Live AI everywhere

The existing context explicitly defers several of these items.

---

# 63. Future V2 Candidates

Potential V2 features:

- Personalized assessments
- Adaptive paths
- Skill-gap analysis
- "What should I learn next?"
- AI scoped assistant
- Custom goals
- Better mastery verification
- Coding challenges
- Project-based verification
- Study plans
- Personal notes
- Skill search
- Explore mode
- Specialization switching

---

# 64. Future V3 Candidates

Potential V3 ecosystem:

- Custom track builder
- Public tracks
- Track sharing
- Track forking
- Community
- Teacher/mentor tracks
- Organization tracks
- Career-readiness analysis
- Portfolio integration
- Job-oriented skill requirements
- External integrations

---

# 65. Product Success Metrics

V1 should not primarily optimize for:

- Number of nodes
- Number of AI generations
- Number of features
- Number of pages

Instead, measure whether users actually benefit from the core loop.

Potential metrics:

### Activation

Percentage of users who choose a goal and open their first track.

### Exploration

Number of nodes explored.

### Learning

Number of nodes opened and studied.

### Verification

Percentage of learning nodes followed by assessment.

### Completion

Percentage of users completing at least one meaningful branch.

### Retention

Whether users return to continue their track.

### Recommendation success

Whether users follow recommended next skills.

### Core question

> **Do users come back because the skill track genuinely helps them know what to learn next?**

That is the key product validation question.

---

# 66. Core Product Risks

## Risk 1 — Roadmaps become enormous

Mitigation:

- Curated scope
- Role-specific depth
- Required/recommended/optional categories
- Progressive expansion

## Risk 2 — AI-generated content is mediocre

Mitigation:

- AI drafts
- Human review
- Controlled templates
- No automatic publishing

## Risk 3 — Graph UI looks cool but is difficult to use

Mitigation:

- Prototype several layouts
- Test mobile early
- Consider hybrid graph + structured view

## Risk 4 — Users skip everything

Mitigation:

- Verification
- Prerequisites
- Diagnostic assessment
- Meaningful progress

## Risk 5 — Product becomes another generic AI wrapper

Mitigation:

- Skill graph as core product
- Structured knowledge model
- Curated tracks
- Real prerequisites
- Persistent progress

## Risk 6 — Scope explosion

Mitigation:

- Strict V1 boundary
- Defer community/custom generation/integrations
- Prove the core learning loop first

The original context itself flags the risk of spreading development across multiple unfinished projects, so scope control is especially important for this product.

---

# 67. Core Product Differentiation

The product should ultimately differentiate through the combination of:

**Structured skill graph**

+

**Role-specific depth**

+

**Prerequisite intelligence**

+

**Personalized starting point**

+

**Verification**

+

**Next-skill recommendation**

The strongest conceptual differentiator is:

> **The system doesn't merely tell you what exists in a field. It constructs an understandable path through the field based on where you are and where you want to go.**

---

# 68. Open Product Decisions

These should be explicitly resolved before technical architecture is finalized.

### Track structure

- How many levels can a node have?
- How are branches represented?
- How are shared skills represented?

### Assessment

- Self-report only?
- Diagnostic quiz?
- Both?

### Mastery

- What statuses exist?
- What qualifies as completion?
- What qualifies as mastery?

### Prerequisites

- Hard?
- Soft?
- Hybrid?

### Quiz

- MCQ?
- Short answer?
- Hybrid?
- How many questions?
- What score is required?

### Content

- Exact AI generation workflow?
- Exact review workflow?
- Shared vs role-specific content?

### Track selection

- Does one goal show one recommended track?
- Or multiple possible tracks?

### UI

- Graph?
- Tree?
- Hybrid?
- What is the mobile representation?

### Recommendations

- Rule-based in V1?
- AI-assisted?
- Fully dynamic later?

### Identity

- Standalone authentication?
- Future StudyHub SSO?

### Future integration

- API-first?
- Embed?
- Both?

---

# 69. Recommended Product Architecture Direction

At a conceptual level:

```text
                    TRACK CREATOR
                         │
        ┌────────────────┼────────────────┐
        │                │                │
      Goals            Tracks           Skills
        │                │                │
        └────────────────┼────────────────┘
                         │
                  Skill Relationships
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       Learning       Verification    Progress
          │              │              │
          └──────────────┼──────────────┘
                         │
                  Recommendation
                         │
                  Future Integrations
                         │
                    StudyHub AI
```

The application should remain independently deployable and independently understandable.

---

# 70. Product North Star

The eventual experience should feel like this:

> **"I know where I want to go. Track Creator shows me the path, explains why every important step matters, lets me explore alternatives, tells me what I should learn next, and helps me prove that I actually learned it."**

That is the product we should design around.

---

# 71. Current Product Status

### Already strongly established

- Standalone application
- Separate repo/deployment
- Future API/embed integration
- Curated V1 role templates
- Expandable hierarchy
- Prerequisites
- AI-assisted node content
- Curated resources
- Quiz/checkpoint
- Progress
- Milestones
- Future StudyHub integration
- Explicit V1 scope control

### Product concepts added during brainstorming

- Multiple role directions
- Track comparison
- Required/recommended/optional classification
- Role-specific learning depth
- Skill assessment
- Skill-gap concept
- Skill-state progression
- "What should I learn next?"
- Explore mode
- Specialization branching
- Skill relationship model
- Hybrid graph + structured UI
- Stronger product-level distinction between a skill graph and a simple roadmap

### Still requiring deliberate decisions

- Exact graph UI
- Assessment model
- Mastery model
- Quiz model
- Prerequisite behavior
- Shared skill architecture
- Track recommendation model
- Authentication/integration model
- Exact V1 role templates
- Exact progress calculation

---

# 72. Product Development Principle

The development sequence should be:

**Product Requirements → Information Architecture → UX/UI Specification → Skill/Content Model → Data Model → AI/Content Pipeline → Technical Architecture → Implementation Plan → Antigravity Development**

Do not allow Antigravity to determine the product architecture implicitly through generated code.

The application should be fully specified at the product and architectural level first, then implementation prompts should translate those decisions into code.

---

## Current conclusion

The original idea has evolved from:

> **"An AI-generated roadmap."**

into:

> **"A structured skill-navigation platform that maps a learner's current state to a desired career or learning goal."**

That distinction should guide every later requirement.

The first objective is therefore not to build a giant AI system. It is to make the **skill-track experience itself excellent**: clear goal selection, well-designed skill hierarchy, useful branching, understandable prerequisites, good node content, meaningful verification, and an excellent visual way to navigate the track.

Only after that core experience is validated should personalization, dynamic generation, social features, career intelligence, and deep StudyHub integration expand around it.