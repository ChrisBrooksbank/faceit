# FaceIt MVP Specification

**Version:** 1.0
**Date:** 2026-01-31
**Status:** Draft

---

## 1. Overview

### 1.1 Product Vision

FaceIt is a Progressive Web App (PWA) designed to help people with prosopagnosia (face blindness) improve their face recognition abilities through evidence-based perceptual discrimination training.

### 1.2 Problem Statement

Approximately 2% of the population has developmental prosopagnosia, yet no widely available, research-backed app exists specifically for face recognition training. Current solutions are either:

- Research prototypes unavailable to consumers
- Generic brain games not designed for prosopagnosia
- Expensive assistive devices ($4,500+) that assist but don't train

### 1.3 Target User

Primary user profile based on interview research:

- Adults with developmental prosopagnosia (lifelong)
- Experience context-dependent recognition failures
- Motivated to practice regularly (10 min/day commitment)
- Privacy-conscious; prefer offline, personal solutions
- Want to improve underlying ability, not use real-time recognition aids

### 1.4 Success Criteria

| Metric                    | Target                             | Measurement                   |
| ------------------------- | ---------------------------------- | ----------------------------- |
| Threshold improvement     | 15% decrease in morph level needed | Staircase convergence point   |
| PI20 score reduction      | 5+ points after 4 weeks            | Re-assessment survey          |
| Session completion rate   | >80%                               | Sessions started vs completed |
| 4-week retention          | >40% users still active            | DAU tracking                  |
| User-reported improvement | Positive qualitative feedback      | In-app survey                 |

---

## 2. MVP Scope

### 2.1 In Scope (Phase 1)

| Feature                                | Justification                                                     |
| -------------------------------------- | ----------------------------------------------------------------- |
| **PI20 Self-Assessment**               | Free, validated, 5 min, Creative Commons licensed                 |
| **Quick Perception Test**              | CFPT-style task to establish baseline perception ability          |
| **Perceptual Discrimination Training** | Best evidence: 3+ month retention, generalizes to untrained faces |
| **Adaptive Difficulty (Staircase)**    | Research-validated; maintains optimal ~75% accuracy               |
| **Progress Dashboard**                 | Tracks improvement over time, provides motivation                 |
| **Daily 10-min Sessions**              | Aligned with user commitment and research protocols               |
| **Expectations Onboarding**            | Sets realistic 50-60% improvement expectation                     |

### 2.2 Out of Scope (Deferred)

| Feature                      | Phase    | Reason for Deferral                                 |
| ---------------------------- | -------- | --------------------------------------------------- |
| Personal face uploads        | Phase 2  | Privacy complexity, consent management              |
| Spaced repetition training   | Phase 2  | Requires personal faces for ecological validity     |
| Holistic processing training | Phase 2  | More complex implementation, different user profile |
| Multiple viewing angles      | Phase 2  | Requires larger stimulus set                        |
| Varied expressions           | Phase 3  | Requires expanded face database                     |
| Real-time face recognition   | Never    | User explicitly rejected as "creepy"                |
| Cloud sync                   | Phase 2+ | Privacy-first approach; local storage only for MVP  |

---

## 3. Training Approach: Perceptual Discrimination

### 3.1 Scientific Rationale

Perceptual discrimination training was selected as the MVP training approach based on research evidence:

1. **Strongest retention**: Benefits persist 3+ months post-training
2. **Generalization**: Skills transfer to untrained faces, angles, and expressions
3. **Matches user profile**: Interview subject shows perception issues (movie recognition problem)
4. **Implementation simplicity**: Staircase procedure is well-documented
5. **Stimulus availability**: Can use public face databases

### 3.2 How It Works

**Perceptual learning** improves the brain's ability to discriminate between similar stimuli through practice at threshold difficulty. Morphed faces create a continuous similarity space where training at the edge of ability forces the brain to extract diagnostic features.

### 3.3 Trial Structure

Each trial follows this sequence:

```
┌─────────────────────────────────────┐
│  1. TARGET FACE DISPLAY             │
│     Duration: 2000ms                │
│     Shows: Single face to remember  │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  2. VISUAL MASK                     │
│     Duration: 500ms                 │
│     Shows: Pattern mask             │
│     Purpose: Clear visual memory    │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  3. THREE-ALTERNATIVE FORCED CHOICE │
│     Shows: 3 faces side by side     │
│     Task: "Which face did you see?" │
│     One correct, two distractors    │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  4. RESPONSE & FEEDBACK             │
│     User taps their choice          │
│     Feedback: Correct/Incorrect     │
│     Duration: 1000ms                │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  5. DIFFICULTY ADJUSTMENT           │
│     Correct → Harder (lower morph)  │
│     Incorrect → Easier (higher morph│
└─────────────────────────────────────┘
```

### 3.4 Staircase Algorithm

The adaptive staircase procedure maintains training at the optimal difficulty threshold (~75% accuracy).

**Parameters:**

- Morph range: 28% (hardest) to 88% (easiest)
- Step size: 4% morph change per adjustment
- Starting level: 60% morph (medium difficulty)
- Reversal tracking: Record threshold at direction changes

**Algorithm:**

```
function updateDifficulty(currentMorph, isCorrect, consecutiveCorrect):
    if isCorrect:
        consecutiveCorrect++
        if consecutiveCorrect >= 2:  // Two correct in a row
            newMorph = max(currentMorph - STEP_SIZE, MIN_MORPH)
            consecutiveCorrect = 0
            recordReversal(newMorph)  // If direction changed
    else:
        newMorph = min(currentMorph + STEP_SIZE, MAX_MORPH)
        consecutiveCorrect = 0
        recordReversal(newMorph)  // If direction changed

    return newMorph
```

**Threshold Calculation:**

- Average of last 6 reversals = perceptual threshold
- Lower threshold = better discrimination ability

### 3.5 Session Structure

| Parameter          | Value           | Rationale                               |
| ------------------ | --------------- | --------------------------------------- |
| Trials per session | 50-60           | ~10 minutes at 10-12 sec/trial          |
| Sessions per day   | 1 recommended   | Spaced practice principle               |
| Days per week      | 5-7 recommended | Consistent practice for neuroplasticity |
| Minimum duration   | 4 weeks         | Research shows effects emerge by week 4 |

### 3.6 Morph Generation

**For MVP:** Pre-generated morphs stored as static assets

**Morph levels:**

- 88% target / 12% distractor (very easy)
- 76% target / 24% distractor
- 64% target / 36% distractor
- 52% target / 48% distractor
- 40% target / 60% distractor
- 28% target / 72% distractor (very hard)

**Stimulus set:**

- 20 unique identity pairs minimum
- Each pair morphed at all 6 levels
- Results in 120 morph images minimum

---

## 4. User Flows

### 4.1 Onboarding Flow (~10 minutes)

```
┌──────────────┐
│   Welcome    │
│   Screen     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   PI20       │
│   Survey     │──── 20 questions, ~5 min
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Perception  │
│    Test      │──── 6 trials, ~2 min
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Results    │
│   Profile    │──── Score interpretation
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Set       │
│ Expectations │──── Realistic outcomes
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   First      │
│  Session     │──── Guided training
└──────────────┘
```

### 4.2 Daily Training Flow (~10 minutes)

```
┌──────────────┐
│    Home      │
│  Dashboard   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Start     │
│   Session    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Training   │
│    Trials    │──── 50-60 trials
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Session    │
│   Summary    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Home      │
│  Dashboard   │──── Updated stats
└──────────────┘
```

### 4.3 Progress Review Flow

```
Dashboard → Progress View → Historical Charts → Return to Dashboard
```

---

## 5. Screen Specifications

### 5.1 Welcome Screen

**Purpose:** Introduce FaceIt and its value proposition

**Content:**

- App logo and name
- Tagline: "Train your brain to recognize faces better"
- Brief description (2-3 sentences)
- Privacy assurance: "All data stays on your device"
- "Get Started" button

**Actions:**

- "Get Started" → PI20 Survey

### 5.2 PI20 Survey Screen

**Purpose:** Assess self-reported face recognition difficulty

**Content:**

- Progress indicator (question X of 20)
- Current question text
- 5-point Likert scale response options
- Back/Next navigation

**PI20 Questions (Complete List):**

1. My face recognition ability is worse than most people.
2. I have always had a bad memory for faces.
3. I find it notably easier to recognize people who have a distinctive feature (e.g., birthmark, glasses, unusual hair).
4. I sometimes find movies hard to follow because of difficulties recognizing characters.
5. If I met a colleague or classmate out of context (e.g., at the supermarket), I might fail to recognize them.
6. When people change their hairstyle, or wear hats, I have problems recognizing them.
7. I sometimes have to warn new people I meet that I am "bad with faces."
8. I find it easy to picture individual faces in my mind. _(reverse scored)_
9. I am better than most people at putting a "name to a face." _(reverse scored)_
10. Without hearing someone's voice, I struggle to recognize them.
11. It is hard for me to recognize familiar people when I am in an unfamiliar place.
12. In the past, I have lost track of a friend in a shopping mall because they have changed their clothes.
13. The first time I meet a new person, I carefully study their face so I can recognize them later.
14. When I was at school, I struggled to recognize my classmates.
15. When my close friends or family change their appearance, I have trouble recognizing them.
16. At family gatherings, I sometimes confuse members of my own family.
17. I have recognized people I have met before, but have mistaken them for someone else.
18. I find it difficult to follow the plot of TV shows because the characters look too similar.
19. I often have to ask people where I have met them before.
20. I have sometimes not recognized close family members when they have unexpectedly approached me.

**Scoring:**

- Scale: 1 (Strongly Disagree) to 5 (Strongly Agree)
- Items 8, 9: Reverse scored (6 - response)
- Total: Sum of all items (range 20-100)

**Interpretation:**
| Score Range | Interpretation |
|-------------|----------------|
| 20-64 | Typical face recognition |
| 65-74 | Mild prosopagnosia likely |
| 75-84 | Moderate prosopagnosia |
| 85-100 | Severe prosopagnosia |

### 5.3 Perception Test Screen

**Purpose:** Establish baseline face perception ability using CFPT-style task

**Content:**

- Instructions (first time only)
- Target face display area
- Three response options (after mask)
- Progress indicator
- Feedback display

**Test Parameters:**

- 6 trials total
- Fixed difficulty levels: 88%, 76%, 64%, 52%, 40%, 28%
- One trial at each level, randomized order
- Score: Number correct out of 6

**Baseline Interpretation:**
| Score | Interpretation |
|-------|----------------|
| 6/6 | Excellent baseline |
| 4-5/6 | Good baseline |
| 2-3/6 | Moderate impairment |
| 0-1/6 | Significant impairment |

### 5.4 Results Profile Screen

**Purpose:** Present assessment results and explain what they mean

**Content:**

- PI20 score with interpretation
- Perception test score with interpretation
- Combined profile summary
- Explanation of what this means for training
- "Continue" button

**Profile Categories:**

- **Perceptual difficulty indicated:** Low perception test score → perceptual discrimination training recommended (our MVP approach)
- **Mixed profile:** Both scores indicate difficulty → comprehensive training needed
- **Mild indicators:** Borderline scores → training may help, set conservative expectations

### 5.5 Expectations Screen

**Purpose:** Set realistic expectations about outcomes

**Content:**

- Title: "What to Expect"
- Key messages:
    - "This is training, not a cure"
    - "Research shows 50-60% of people see measurable improvement"
    - "Benefits typically appear after 2-4 weeks of consistent practice"
    - "Daily practice (10 minutes) works better than occasional longer sessions"
    - "Improvement may transfer to real-world face recognition"
- Commitment prompt: "I understand this requires consistent practice"
- "Start Training" button

### 5.6 Home Dashboard Screen

**Purpose:** Central hub showing progress and starting sessions

**Content:**

- Greeting with user's current streak
- Today's session status (completed/available)
- "Start Session" button (primary action)
- Quick stats:
    - Current streak (days)
    - Total sessions completed
    - Current threshold level
- Progress chart preview (tap for full view)
- Settings icon

**States:**

- Session available: "Start Session" button prominent
- Session completed today: Celebratory message, button grayed or shows "Done for today"

### 5.7 Training Session Screen

**Purpose:** Conduct perceptual discrimination training trials

**Content:**

- Session progress (trial X of 60)
- Current phase indicator:
    - Target display phase
    - Mask phase
    - Choice phase
- Face display area(s)
- Feedback indicator (correct/incorrect)
- Pause button
- Exit button (with confirmation)

**Interactions:**

- Choice phase: Tap one of three faces
- Pause: Overlay with resume/exit options
- Exit: Confirmation dialog, option to save partial progress

### 5.8 Session Summary Screen

**Purpose:** Summarize training session results

**Content:**

- Session complete message
- Today's accuracy percentage
- Current threshold level (with comparison to previous)
- Trend indicator (improving/stable/declining)
- Streak update
- Encouragement message
- "Done" button → Dashboard

### 5.9 Progress View Screen

**Purpose:** Show long-term improvement trends

**Content:**

- Threshold chart (line graph over time)
- Accuracy chart (line graph over time)
- Statistics:
    - Total training time
    - Best threshold achieved
    - Average accuracy
    - Longest streak
- PI20 comparison (if re-assessed)
- "Back" button → Dashboard

### 5.10 Settings Screen

**Purpose:** Configure app preferences

**Content:**

- Notification settings:
    - Daily reminder toggle
    - Reminder time picker
- Session settings:
    - Trials per session (50/60/70)
- Data:
    - Export data (JSON download)
    - Clear all data (with confirmation)
- About:
    - App version
    - Privacy policy link
    - Research references link

---

## 6. Data Model

### 6.1 User Profile

```typescript
interface UserProfile {
    id: string; // UUID, generated on first launch
    createdAt: Date; // Onboarding completion timestamp
    pi20Score: number; // 20-100, from initial assessment
    pi20Responses: number[]; // Array of 20 responses (1-5)
    baselinePerception: number; // 0-6, from perception test
    onboardingComplete: boolean; // Has completed full onboarding
    settings: UserSettings;
}

interface UserSettings {
    reminderEnabled: boolean;
    reminderTime: string; // HH:MM format
    trialsPerSession: number; // 50, 60, or 70
}
```

### 6.2 Training Session

```typescript
interface TrainingSession {
    id: string; // UUID
    userId: string; // Reference to user
    date: Date; // Session start timestamp
    duration: number; // Actual duration in seconds
    trialsCompleted: number; // Number of trials completed
    trialsTotal: number; // Target trials for session
    accuracy: number; // Percentage correct (0-100)
    thresholdLevel: number; // Final threshold (morph percentage)
    thresholdHistory: number[]; // Threshold at each reversal
    trials: Trial[]; // Individual trial data
    completed: boolean; // Did user complete full session
}

interface Trial {
    trialNumber: number;
    targetFaceId: string; // ID of target face shown
    distractorFaceIds: string[]; // IDs of distractor faces
    morphLevel: number; // Difficulty (28-88)
    responseTime: number; // Milliseconds to respond
    correct: boolean; // Was response correct
    selectedPosition: number; // 0, 1, or 2 (which face selected)
    correctPosition: number; // 0, 1, or 2 (where target was)
}
```

### 6.3 Progress Metrics

```typescript
interface ProgressMetrics {
    userId: string;
    currentStreak: number; // Consecutive days trained
    longestStreak: number; // Best streak achieved
    totalSessions: number; // Lifetime sessions completed
    totalTrainingTime: number; // Lifetime seconds trained
    avgThreshold: number; // Average of last 5 sessions
    bestThreshold: number; // Lowest threshold achieved
    avgAccuracy: number; // Average accuracy last 5 sessions
    lastSessionDate: Date; // When last session completed
    improvementRate: number; // Threshold change per week
}
```

### 6.4 Re-Assessment (for tracking progress)

```typescript
interface Assessment {
    id: string;
    userId: string;
    date: Date;
    type: 'initial' | 'periodic';
    pi20Score: number;
    pi20Responses: number[];
    perceptionScore: number; // If perception test included
}
```

---

## 7. Technical Architecture

### 7.1 Technology Stack

| Layer      | Technology          | Rationale                                     |
| ---------- | ------------------- | --------------------------------------------- |
| Build      | Vite 5+             | Fast dev server, optimized builds, PWA plugin |
| Language   | TypeScript (strict) | Type safety, better DX                        |
| Validation | Zod                 | Runtime validation for config and data        |
| PWA        | vite-plugin-pwa     | Workbox service worker, offline support       |
| Storage    | IndexedDB (via idb) | Large local storage, no cloud needed          |
| Testing    | Vitest + Playwright | Unit tests + E2E tests                        |
| Linting    | ESLint + Prettier   | Code quality and formatting                   |
| Dead Code  | Knip                | Unused exports/dependencies detection         |
| Pre-commit | Husky + lint-staged | Quality gates before commit                   |
| CI         | GitHub Actions      | Automated checks on push/PR                   |

### 7.2 PWA Requirements

**Manifest (configured in vite.config.ts):**

- Name: "FaceIt - Face Recognition Training"
- Short name: "FaceIt"
- Theme color: #2563eb
- Background color: #f5f5f5
- Display: standalone
- Orientation: portrait
- Icons: 192x192, 512x512

**Service Worker (Workbox via vite-plugin-pwa):**

- Cache all static assets (JS, CSS, HTML, icons)
- Cache face stimulus images (WebP format)
- Offline-first for all functionality
- Auto-update when new version available

### 7.3 Offline-First Architecture

All functionality must work without network connection:

1. **Assets:** Pre-cached during install
2. **Stimuli:** Face images bundled as static assets
3. **Data:** Stored in IndexedDB
4. **No cloud sync:** User data never leaves device

### 7.4 Face Stimuli Management

**Source databases (public, research-appropriate):**

- Utrecht ECVP Face Database
- Face Research Lab London Set

**Requirements:**

- Minimum 20 unique face identities
- Neutral expression
- Frontal view
- Consistent lighting
- Diverse demographics (age, gender, ethnicity)

**Morph generation (pre-processing):**

- Generate all morph levels offline
- Store as optimized WebP images
- Naming: `{faceA}_{faceB}_{morphLevel}.webp`

### 7.5 Data Storage Schema (IndexedDB)

```
FaceItDB
├── users (object store)
│   └── {id}: UserProfile
├── sessions (object store)
│   └── {id}: TrainingSession
│   └── index: by-date
├── assessments (object store)
│   └── {id}: Assessment
│   └── index: by-date
└── progress (object store)
    └── {userId}: ProgressMetrics
```

---

## 8. Non-Functional Requirements

### 8.1 Performance

| Metric                 | Target          |
| ---------------------- | --------------- |
| First Contentful Paint | < 1.5s          |
| Time to Interactive    | < 3s            |
| Trial transition time  | < 100ms         |
| Image load time        | < 50ms (cached) |

### 8.2 Accessibility

- WCAG 2.1 AA compliance
- Minimum tap target: 44x44px
- Sufficient color contrast (4.5:1 minimum)
- Screen reader compatible
- Keyboard navigable

### 8.3 Privacy

- No data collection
- No analytics (or privacy-respecting only)
- No third-party tracking
- All data local to device
- Data export available
- Data deletion available

### 8.4 Browser Support

| Browser        | Version |
| -------------- | ------- |
| Chrome         | 90+     |
| Safari         | 14+     |
| Firefox        | 90+     |
| Edge           | 90+     |
| Safari iOS     | 14+     |
| Chrome Android | 90+     |

### 8.5 Code Quality Guardrails

The project enforces code quality through automated tooling:

**Static Analysis:**

| Tool       | Purpose                          | Enforcement    |
| ---------- | -------------------------------- | -------------- |
| TypeScript | Type safety (strict mode)        | Pre-commit, CI |
| ESLint     | Code patterns, potential bugs    | Pre-commit, CI |
| Prettier   | Consistent code formatting       | Pre-commit, CI |
| Knip       | Unused code/exports/dependencies | CI             |

**Testing:**

| Tool       | Purpose                   | Coverage Requirement |
| ---------- | ------------------------- | -------------------- |
| Vitest     | Unit tests                | 80% minimum          |
| Playwright | E2E tests (cross-browser) | Critical paths       |

**ESLint Rules (enforced):**

- `complexity: 10` - Maximum cyclomatic complexity
- `max-depth: 4` - Maximum nesting depth
- `max-lines-per-function: 50` - Keep functions small
- `no-explicit-any: error` - No `any` types allowed
- `explicit-function-return-type: warn` - Document return types

**Pre-commit Hooks (Husky):**

1. TypeScript type checking
2. ESLint with auto-fix
3. Prettier formatting

**CI Pipeline (GitHub Actions):**

1. Type check
2. Lint check
3. Format check
4. Knip (unused code detection)
5. Unit tests
6. Security audit
7. E2E tests (on separate job)

---

## 9. Future Phases Roadmap

### Phase 2: Personal Faces & Memory Training

**Features:**

- Personal face uploads (with consent flow)
- Spaced repetition training for face-name pairs
- Multiple viewing angles training
- Name association games

**Technical additions:**

- Camera access for photo capture
- On-device face detection
- More complex stimulus management

### Phase 3: Holistic Processing & Advanced

**Features:**

- Holistic processing training module
- Varied expressions training
- Compensatory strategy toolkit
- Social disclosure resources

### Phase 4: Community & Insights

**Features:**

- Optional anonymized progress sharing
- Comparative benchmarks
- Research participation opt-in
- Community resources

---

## 10. Success Metrics & Analytics

### 10.1 Key Performance Indicators

**Engagement:**

- Daily Active Users (DAU)
- Session completion rate
- Streak distribution
- Time in training

**Effectiveness:**

- Threshold improvement over time
- PI20 score changes (periodic re-assessment)
- User-reported improvement (in-app survey)

**Retention:**

- Week 1 retention
- Week 4 retention
- Week 12 retention
- Churn reasons (exit survey)

### 10.2 Privacy-Respecting Analytics

If analytics implemented:

- No PII collected
- Aggregate metrics only
- Opt-in only
- Local processing where possible

---

## 11. Open Questions

### 11.1 Stimulus Set

- Which specific face databases to use?
- How many unique identities minimum?
- How to ensure demographic diversity?
- Pre-generated morphs vs. runtime morphing?

### 11.2 Algorithm Tuning

- Optimal step size for staircase?
- How many reversals for stable threshold?
- Session length (50 vs 60 vs 70 trials)?

### 11.3 User Experience

- How to handle failed onboarding (user quits mid-PI20)?
- What if perception test shows no impairment?
- How to motivate without gamification overload?

### 11.4 Validation

- Should we include control tasks (non-face stimuli)?
- How to verify training transfer to real life?
- When to prompt for PI20 re-assessment?

---

## 12. Appendices

### Appendix A: PI20 Scoring Reference

**Standard scoring:**

- Sum all 20 items
- Items 8 and 9 reverse scored: (6 - response)
- Range: 20-100

**Validation statistics:**

- Internal consistency: Cronbach's α = 0.93
- Correlation with CFMT: r = -0.68
- Face-specific: No correlation with object recognition

### Appendix B: CFPT Reference

The Cambridge Face Perception Test measures face discrimination without memory demands:

- 16 trials (8 upright, 8 inverted)
- Sort 6 morphed faces by similarity to target
- Error score = deviation from correct order
- Higher score = worse performance

Our Quick Perception Test is a simplified version:

- 6 trials only
- Fixed morph levels
- Three-alternative forced choice (not sorting)
- Provides quick baseline without full CFPT duration

### Appendix C: Research References

**Perceptual learning in prosopagnosia:**

- ScienceDirect - Perceptual Learning in DP (2019)
- MIT Press - Perceptual Learning in AP (2017)

**Assessment tools:**

- Royal Society - PI20 Original Paper (2014)
- PMC - PI20 Validation (2015)

**Training protocols:**

- PMC - Rehabilitation of Face Recognition: Critical Review (2014)
- Oxford Brain - Holistic Training Study (2014)

### Appendix D: Morph Level Examples

| Level | Target % | Distractor % | Difficulty     |
| ----- | -------- | ------------ | -------------- |
| 88    | 88%      | 12%          | Very Easy      |
| 76    | 76%      | 24%          | Easy           |
| 64    | 64%      | 36%          | Medium         |
| 52    | 52%      | 48%          | Hard           |
| 40    | 40%      | 60%          | Very Hard      |
| 28    | 28%      | 72%          | Extremely Hard |

At 28% morph, the "target" face is actually more similar to the distractor identity than itself, making discrimination extremely challenging.

---

_Document version 1.0 - Initial MVP specification_
