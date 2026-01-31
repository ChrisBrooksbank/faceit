# FaceIt MVP Implementation Plan

## Gap Analysis: Specification vs Current Code

### IMPLEMENTED

| Component             | Location                                    | Status                 |
| --------------------- | ------------------------------------------- | ---------------------- |
| SvelteKit scaffold    | Project root                                | Complete               |
| Staircase algorithm   | `src/lib/core/staircase.ts`                 | Complete with 16 tests |
| PI20 scoring          | `src/lib/core/pi20.ts`                      | Complete with 19 tests |
| Type definitions      | `src/lib/types/index.ts`                    | Complete               |
| Basic layout          | `src/routes/+layout.svelte`                 | Minimal                |
| Home page placeholder | `src/routes/+page.svelte`                   | Placeholder only       |
| Quality guardrails    | ESLint, Prettier, Vitest, Playwright, Husky | Complete               |

### NOT IMPLEMENTED

| Component              | Spec Reference | Priority        |
| ---------------------- | -------------- | --------------- |
| IndexedDB storage      | Section 7.5    | P0 - Foundation |
| Svelte stores          | Section 7.1    | P0 - Foundation |
| Welcome screen         | Section 5.1    | P1 - Onboarding |
| PI20 Survey screen     | Section 5.2    | P1 - Onboarding |
| Perception Test screen | Section 5.3    | P1 - Onboarding |
| Results Profile screen | Section 5.4    | P1 - Onboarding |
| Expectations screen    | Section 5.5    | P1 - Onboarding |
| Home Dashboard         | Section 5.6    | P2 - Core       |
| Training Session       | Section 5.7    | P2 - Core       |
| Session Summary        | Section 5.8    | P2 - Core       |
| Progress View          | Section 5.9    | P3 - Polish     |
| Settings               | Section 5.10   | P3 - Polish     |
| Face stimuli           | Section 7.4    | P2 - Core       |
| Progress calculations  | Section 6.3    | P2 - Core       |

---

## TODO: Prioritized Implementation Tasks

### Phase 0: Foundation (Data Layer)

- [ ] **0.1 Create IndexedDB module**
    - File: src/lib/db/index.ts
    - Implements: FaceItDB schema from spec Section 7.5
    - Stores: users, sessions, assessments, progress
    - Uses: idb library (already in package.json)
    - Tests: src/lib/db/index.test.ts
    - Backpressure: npm run test:run must pass

- [ ] **0.2 Create Svelte stores for app state**
    - File: src/lib/stores/index.ts
    - Stores: userProfile, currentSession, progressMetrics
    - Derived: isOnboarded, hasSessionToday, currentStreak
    - Tests: src/lib/stores/index.test.ts
    - Backpressure: npm run test:run must pass

- [ ] **0.3 Create app initialization logic**
    - File: src/lib/core/init.ts
    - Loads user from IndexedDB on app start
    - Initializes stores
    - Handles first-time vs returning user
    - Backpressure: npm run check must pass

### Phase 1: Onboarding Flow

- [ ] **1.1 Create shared UI components**
    - File: src/lib/components/Button.svelte
    - File: src/lib/components/Card.svelte
    - File: src/lib/components/ProgressBar.svelte
    - File: src/lib/components/index.ts (barrel export)
    - Backpressure: npm run check must pass

- [ ] **1.2 Create Welcome screen**
    - File: src/routes/onboarding/+page.svelte
    - Content: Logo, tagline, privacy assurance, "Get Started"
    - Navigation: → /onboarding/pi20
    - Backpressure: npm run test:e2e must pass

- [ ] **1.3 Create LikertScale component**
    - File: src/lib/components/LikertScale.svelte
    - Props: question, value, onChange
    - 5 options: Strongly Disagree → Strongly Agree
    - Accessible: keyboard navigation, ARIA labels
    - Backpressure: npm run check must pass

- [ ] **1.4 Create PI20 Survey screen**
    - File: src/routes/onboarding/pi20/+page.svelte
    - Shows: 20 questions from PI20_QUESTIONS
    - Progress: question X of 20
    - State: responses array
    - Navigation: Back/Next, → /onboarding/perception when complete
    - Saves: responses to store
    - Backpressure: npm run test:e2e must pass

- [ ] **1.5 Create Perception Test screen**
    - File: src/routes/onboarding/perception/+page.svelte
    - Shows: 6 trials at fixed difficulty levels
    - Uses: Staircase display logic (not adaptive)
    - Needs: Placeholder face images
    - Navigation: → /onboarding/results when complete
    - Backpressure: npm run test:e2e must pass

- [ ] **1.6 Create placeholder face stimuli**
    - Directory: static/faces/
    - Create: 6 placeholder face images (colored squares as temp)
    - Naming: face_a.webp, face_b.webp, etc.
    - Note: Replace with real faces later
    - Backpressure: Build must succeed

- [ ] **1.7 Create Results Profile screen**
    - File: src/routes/onboarding/results/+page.svelte
    - Shows: PI20 score with interpretation
    - Shows: Perception test score
    - Uses: getPI20Result, getPI20Interpretation
    - Navigation: → /onboarding/expectations
    - Backpressure: npm run test:e2e must pass

- [ ] **1.8 Create Expectations screen**
    - File: src/routes/onboarding/expectations/+page.svelte
    - Content: "What to Expect" messages from spec
    - Checkbox: "I understand this requires consistent practice"
    - Saves: UserProfile to IndexedDB
    - Navigation: → / (dashboard)
    - Backpressure: npm run test:e2e must pass

### Phase 2: Core Training Loop

- [ ] **2.1 Create FaceDisplay component**
    - File: src/lib/components/FaceDisplay.svelte
    - Props: faceId, size, onClick
    - Handles: Image loading, placeholder
    - Backpressure: npm run check must pass

- [ ] **2.2 Create TrialDisplay component**
    - File: src/lib/components/TrialDisplay.svelte
    - Props: phase (target|mask|choice), faces, onSelect
    - Handles: Timing (2s target, 500ms mask)
    - Shows: 3 faces in choice phase
    - Backpressure: npm run check must pass

- [ ] **2.3 Create Home Dashboard**
    - File: src/routes/+page.svelte (update existing)
    - Shows: Streak, sessions count, threshold
    - Shows: "Start Session" button (or "Done for today")
    - State: From progressMetrics store
    - Navigation: → /training
    - Backpressure: npm run test:e2e must pass

- [ ] **2.4 Create Training Session screen**
    - File: src/routes/training/+page.svelte
    - Manages: Full session (50-60 trials)
    - Uses: staircaseAlgorithm from core
    - Shows: Trial number, current phase
    - Handles: Pause, exit with confirmation
    - Saves: Session to IndexedDB
    - Navigation: → /training/summary when complete
    - Backpressure: npm run test:e2e must pass

- [ ] **2.5 Create Session Summary screen**
    - File: src/routes/training/summary/+page.svelte
    - Shows: Accuracy %, threshold level
    - Shows: Comparison to previous session
    - Shows: Streak update
    - Navigation: → / (dashboard)
    - Backpressure: npm run test:e2e must pass

- [ ] **2.6 Create progress calculation logic**
    - File: src/lib/core/progress.ts
    - Functions: calculateStreak, calculateImprovement
    - Updates: ProgressMetrics after each session
    - Tests: src/lib/core/progress.test.ts
    - Backpressure: npm run test:run must pass

### Phase 3: Polish & Settings

- [ ] **3.1 Create Progress View screen**
    - File: src/routes/progress/+page.svelte
    - Shows: Threshold chart over time
    - Shows: Accuracy chart
    - Shows: Statistics summary
    - Uses: Chart library (or simple SVG)
    - Backpressure: npm run test:e2e must pass

- [ ] **3.2 Create Settings screen**
    - File: src/routes/settings/+page.svelte
    - Options: Reminder toggle, time picker
    - Options: Trials per session
    - Actions: Export data, clear data
    - Backpressure: npm run test:e2e must pass

- [ ] **3.3 Add real face stimuli**
    - Source: Utrecht ECVP or Face Research Lab
    - Process: Generate morph levels
    - Format: WebP, optimized
    - Count: 20 identity pairs minimum
    - Backpressure: Build must succeed

- [ ] **3.4 Add PWA icons**
    - Files: static/icons/icon-192.png, icon-512.png
    - Files: static/favicon.png
    - Backpressure: Build must succeed

- [ ] **3.5 Final E2E test coverage**
    - Test: Complete onboarding flow
    - Test: Complete training session
    - Test: Progress tracking
    - Backpressure: npm run test:e2e must pass

---

## Verification

After each task:

1. Run `npm run check` (typecheck, lint, format, knip, tests)
2. Run `npm run build` (ensure production build works)
3. Commit with descriptive message

After each phase:

1. Run `npm run test:e2e` (full E2E coverage)
2. Manual testing of user flow
3. Tag release (e.g., v0.1.0-phase0)

---

## Next Action

Start with **Task 0.1: Create IndexedDB module** - this is the foundation that all other features depend on.
