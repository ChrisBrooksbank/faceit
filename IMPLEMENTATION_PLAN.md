# Implementation Plan

## Status

- Planning iterations: 0
- Build iterations: 16
- Last updated: 2026-02-01

## Current Phase: Core Training (Phase 2)

Onboarding flow to guide new users through assessment.

## Tasks

### Phase 0: Foundation

- [x] Create IndexedDB module with FaceItDB schema (spec: 00-foundation.md)
- [x] Create Svelte stores for app state (spec: 00-foundation.md)
- [x] Create app initialization logic (spec: 00-foundation.md)

### Phase 1: Onboarding

- [x] Create shared UI components (Button, Card, ProgressBar) (spec: 01-onboarding.md)
- [x] Create Welcome screen at /onboarding (spec: 01-onboarding.md)
- [x] Create LikertScale component (spec: 01-onboarding.md)
- [x] Create PI20 Survey screen at /onboarding/pi20 (spec: 01-onboarding.md)
- [x] Create placeholder face stimuli in static/faces/ (spec: 01-onboarding.md)
- [x] Create Perception Test screen at /onboarding/perception (spec: 01-onboarding.md)
- [x] Create Results Profile screen at /onboarding/results (spec: 01-onboarding.md)
- [x] Create Expectations screen at /onboarding/expectations (spec: 01-onboarding.md)

### Phase 2: Core Training

- [x] Create FaceDisplay component (spec: 02-core-training.md)
- [x] Create TrialDisplay component (spec: 02-core-training.md)
- [x] Update Home Dashboard at / (spec: 02-core-training.md)
- [x] Create Training Session screen at /training (spec: 02-core-training.md)
- [x] Create Session Summary screen at /training/summary (spec: 02-core-training.md)
- [ ] Create progress calculation logic (spec: 02-core-training.md)

### Phase 3: Polish & Settings

- [ ] Create Progress View screen at /progress (spec: 03-polish-settings.md)
- [ ] Create Settings screen at /settings (spec: 03-polish-settings.md)
- [ ] Add real face stimuli (spec: 03-polish-settings.md)
- [ ] Add PWA icons (spec: 03-polish-settings.md)
- [ ] Final E2E test coverage (spec: 03-polish-settings.md)
- [ ] Accessibility audit (spec: 03-polish-settings.md)

## Completed

### Phase 0: Foundation

- [x] Create IndexedDB module with FaceItDB schema
    - Created `src/lib/db/index.ts` with full CRUD operations for all stores
    - Created comprehensive test suite in `src/lib/db/index.test.ts`
    - Added fake-indexeddb for test environment
    - Updated ProgressMetrics type to include userId
    - All 22 tests passing

- [x] Create Svelte stores for app state
    - Created `src/lib/stores/index.ts` with core stores (userProfile, currentSession, progressMetrics)
    - Created derived stores (isOnboarded, hasSessionToday, currentStreak)
    - Created action functions (setUserProfile, setCurrentSession, setProgressMetrics, resetStores)
    - Created comprehensive test suite in `src/lib/stores/index.test.ts`
    - All 21 tests passing

- [x] Create app initialization logic
    - Created `src/lib/init.ts` with initApp() and isFirstLaunch() functions
    - Created `src/lib/utils/logger.ts` for structured logging
    - Created comprehensive test suite in `src/lib/init.test.ts`
    - Integrated initialization in `src/routes/+layout.ts` load function
    - Updated `src/routes/+layout.svelte` to receive isOnboarded data
    - All 8 tests passing (86 tests total in project)
    - All validation checks passing

### Phase 1: Onboarding

- [x] Create shared UI components (Button, Card, ProgressBar)
    - Created `src/lib/components/Button.svelte` with primary/secondary variants
    - Created `src/lib/components/Card.svelte` as content container
    - Created `src/lib/components/ProgressBar.svelte` with visual progress indicator
    - Created `src/lib/components/index.ts` barrel export
    - Added component exports to `src/lib/index.ts`
    - Created basic test suites for all components
    - All 6 component tests passing (92 tests total in project)
    - All validation checks passing

- [x] Create Welcome screen at /onboarding
    - Created `src/routes/onboarding/+page.svelte`
    - Displays FaceIt logo and tagline "Train your brain to recognize faces better"
    - Shows privacy assurance "All data stays on your device" with lock icon
    - "Get Started" button navigates to `/onboarding/pi20`
    - Uses existing Button and Card components
    - All 92 tests passing
    - All validation checks passing

- [x] Create LikertScale component
    - Created `src/lib/components/LikertScale.svelte` with 5-point scale (1-5)
    - Props: value (PI20Response | null), onchange callback, disabled flag
    - Labels: Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree
    - Accessible: 44px tap targets, aria-pressed, keyboard navigable
    - Visual feedback: selected state with primary color, hover states
    - Created test suite in `src/lib/components/LikertScale.test.ts`
    - Exported from `src/lib/components/index.ts`
    - All 94 tests passing
    - All validation checks passing

- [x] Create PI20 Survey screen at /onboarding/pi20
    - Created `src/routes/onboarding/pi20/+page.svelte`
    - Uses existing Button, Card, LikertScale, and ProgressBar components
    - Displays progress indicator (question X of 20)
    - Shows current question text from PI20_QUESTIONS
    - Collects responses using LikertScale component
    - Back/Next navigation with state management
    - Back button returns to Welcome screen when on first question
    - Next button disabled until current question is answered
    - Final question shows "Continue" button that navigates to /onboarding/perception
    - Uses Svelte 5 runes ($state, $derived) for reactivity
    - All 94 tests passing (routes excluded from coverage)
    - All validation checks passing

- [x] Create placeholder face stimuli in static/faces/
    - Created `scripts/generate-placeholders.js` to generate placeholder SVG faces
    - Generated 120 morph images (20 face pairs × 6 morph levels)
    - Morph levels: 28%, 40%, 52%, 64%, 76%, 88%
    - Naming convention: `face{A}_face{B}_{morphLevel}.svg`
    - Created `static/faces/metadata.json` with face pair metadata
    - SVG faces use geometric patterns, colors, and variations to simulate morphing
    - Each face has distinctive features (hue, shape, eye spacing, patterns)
    - Morph level displayed as debug text on each image
    - Ready to be replaced with real photos + morphs in Phase 3
    - All 94 tests passing
    - All validation checks passing

- [x] Create Perception Test screen at /onboarding/perception
    - Created `src/routes/onboarding/perception/+page.svelte`
    - Implements 6 trials at fixed difficulty levels (88%, 76%, 64%, 52%, 40%, 28%)
    - Three phases per trial: target display (2000ms) → mask (500ms) → 3-choice selection
    - Uses placeholder face stimuli from static/faces/
    - Tracks correct responses (0-6)
    - Shows completion screen with score
    - Navigates to /onboarding/results when complete
    - Uses existing Button, Card, and ProgressBar components
    - Uses Svelte 5 runes ($state, $derived) for reactivity
    - All 94 tests passing
    - All validation checks passing

- [x] Create Results Profile screen at /onboarding/results
    - Created `src/lib/stores/onboarding.ts` for temporary onboarding data storage
    - Created comprehensive test suite in `src/lib/stores/onboarding.test.ts` (7 tests)
    - Updated `src/routes/onboarding/pi20/+page.svelte` to save responses to store
    - Updated `src/routes/onboarding/perception/+page.svelte` to save score to store
    - Created `src/routes/onboarding/results/+page.svelte`
    - Displays PI20 score with severity badge and interpretation
    - Displays perception test score (X/6) with interpretation
    - Shows combined profile summary explaining what results mean for training
    - Validates data exists, redirects to missing screens if incomplete
    - Uses existing Button and Card components
    - Uses Svelte 5 runes ($state, $derived) for reactivity
    - Navigates to /onboarding/expectations when complete
    - All 101 tests passing
    - All validation checks passing

- [x] Create Expectations screen at /onboarding/expectations
    - Created `src/routes/onboarding/expectations/+page.svelte`
    - Displays four key expectations based on MVP spec:
        - "This is training, not a cure"
        - "Research shows 50-60% of people see measurable improvement"
        - "Benefits typically appear after 2-4 weeks of consistent practice"
        - "Daily practice (10 minutes) works better than occasional longer sessions"
    - Requires checkbox acknowledgment before continuing
    - Creates UserProfile with PI20 results and baseline perception score
    - Creates initial ProgressMetrics with zero values
    - Saves both to IndexedDB using saveUserProfile() and saveProgressMetrics()
    - Updates stores using setUserProfile() and setProgressMetrics()
    - Clears onboarding data using resetOnboardingData()
    - Validates onboarding data exists, redirects if incomplete
    - Navigates to / (dashboard) when complete
    - Uses existing Button and Card components
    - Uses logger for error handling
    - Uses Svelte 5 runes ($state) for reactivity
    - All 101 tests passing
    - All validation checks passing
    - Completes Phase 1: Onboarding

### Phase 2: Core Training

- [x] Create FaceDisplay component
    - Created `src/lib/components/FaceDisplay.svelte` with multiple size variants (small, medium, large)
    - Supports both display mode (non-selectable) and choice mode (selectable)
    - Props: faceId, selectable, selected, onclick, size, ariaLabel
    - Displays face stimuli from `/faces/{faceId}.svg`
    - Accessible: proper ARIA labels, aria-pressed state, keyboard navigable
    - Visual feedback: border highlight on hover/selection, tap target >44px
    - Created test suite in `src/lib/components/FaceDisplay.test.ts` (2 tests)
    - Exported from `src/lib/components/index.ts`
    - All 103 tests passing
    - All validation checks passing

- [x] Create TrialDisplay component
    - Created `src/lib/components/TrialDisplay.svelte` with automatic phase progression
    - Props: faces (targetFaceId, choiceFaceIds, correctPosition), onSelect callback, size variant
    - Three phases: target (2000ms) → mask (500ms) → choice (user selection)
    - Uses FaceDisplay component for rendering faces
    - Automatic timing transitions using setTimeout
    - Handles choice selection with validation
    - Uses Svelte 5 runes ($state, $derived, $effect) for reactivity
    - Resets phases when faces change (new trial)
    - Created test suite in `src/lib/components/TrialDisplay.test.ts` (2 tests)
    - Exported from `src/lib/components/index.ts`
    - All 105 tests passing
    - All validation checks passing

- [x] Update Home Dashboard at /
    - Updated `src/routes/+page.svelte` with conditional rendering based on onboarding status
    - Not onboarded: Shows welcome message and "Start Assessment" button
    - Onboarded: Shows personalized dashboard with:
        - Greeting with current streak (🔥 X day streak!)
        - Session status (completed today or ready to start)
        - "Start Session" button (disabled if completed today, shows "Done for today")
        - Quick stats: current streak, total sessions, average threshold
        - Links to /progress and /settings
    - Added fullWidth prop to Button component for better layout control
    - Uses existing Button and Card components
    - Uses stores: userProfile, progressMetrics, hasSessionToday, currentStreak
    - Mobile-responsive stats grid (3 columns → 1 column on small screens)
    - All 105 tests passing
    - All validation checks passing

- [x] Create Training Session screen at /training
    - Created `src/routes/training/+page.svelte` with full training session functionality
    - Implements adaptive staircase algorithm with 50-60 trials (configurable via user settings)
    - Session management:
        - Session ID generation (UUID)
        - Start time tracking
        - Trial counting and progress tracking
        - Automatic trial progression with 1000ms delay between trials
    - Trial generation:
        - Random face pair selection from 20 pairs (40 faces total)
        - Morph level matching closest available level (28, 40, 52, 64, 76, 88)
        - Three-alternative forced choice with randomized correct position
        - Distractor faces from different pair with varied morph levels
    - Uses TrialDisplay component for three-phase trial presentation
    - Staircase state management:
        - Updates difficulty based on response (2-down/1-up rule)
        - Tracks reversals for threshold calculation
        - Records trial data (response time, correct/incorrect, positions)
    - Progress display:
        - Trial X of Y counter
        - ProgressBar component showing completion percentage
        - Pause button in header
    - Pause/exit functionality:
        - Pause menu overlay with Resume/Exit options
        - Exit confirmation dialog with warning about streak
        - Saves partial session data when exiting early
    - Session completion:
        - Calculates accuracy, threshold level, duration
        - Saves complete session to IndexedDB
        - Updates progress metrics (streak, total sessions, best threshold, training time)
        - Streak logic: consecutive day tracking, breaks if >1 day gap
        - Navigates to /training/summary
    - Uses existing components: Button, Card, ProgressBar, TrialDisplay
    - Uses stores: userProfile, progressMetrics, setCurrentSession, setProgressMetrics
    - Validates user is onboarded before starting session
    - All 105 tests passing
    - All validation checks passing

- [x] Create Session Summary screen at /training/summary
    - Created `src/routes/training/summary/+page.svelte` with comprehensive session results
    - Session summary display:
        - Green checkmark icon and "Session Complete!" header
        - Key stats in card grid: Today's Accuracy, Threshold Level (with comparison arrow), Current Streak
        - Threshold comparison: shows ↓ (improving), ↑ (declining), or → (stable) vs previous session
        - Trend indicator: "📈 Improving", "📉 Keep Practicing", or "➡️ Stable" with explanatory message
        - Dynamic encouragement message based on accuracy level (80%+, 70%+, 60%+, <60%)
        - Streak-specific message (first day, 2 days, 7+ days, etc.)
        - Session details: Duration (MM:SS format), Trials completed
    - Fetches previous sessions using getSessionsByDate() to calculate trend
    - Trend calculation: >2% threshold decrease = improving, >2% increase = declining, else stable
    - Redirects to dashboard if no session data exists
    - Uses existing Button and Card components
    - Uses stores: currentSession, currentStreak
    - Mobile-responsive: grid layout adapts to single column on small screens
    - All 105 tests passing
    - All validation checks passing

## Notes

- Staircase algorithm already implemented in src/lib/core/staircase.ts
- PI20 scoring already implemented in src/lib/core/pi20.ts
- Types already defined in src/lib/types/index.ts
- Quality guardrails (ESLint, Prettier, Vitest, Playwright) already configured
