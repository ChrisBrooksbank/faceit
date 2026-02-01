# Core Training Loop

## Overview

Implement the daily training session with adaptive staircase difficulty.

## User Stories

- As a user, I want to see my current progress at a glance so I stay motivated
- As a user, I want to complete a 10-minute training session so I can improve
- As a user, I want adaptive difficulty so training stays challenging but not frustrating
- As a user, I want to see session results so I know how I performed

## Requirements

### 2.1 FaceDisplay Component

- [ ] Create `src/lib/components/FaceDisplay.svelte`
- [ ] Props: `faceId`, `size`, `onClick`
- [ ] Handle image loading states
- [ ] Show placeholder while loading

### 2.2 TrialDisplay Component

- [ ] Create `src/lib/components/TrialDisplay.svelte`
- [ ] Props: `phase` (target|mask|choice), `faces`, `onSelect`
- [ ] Target phase: Show single face for 2000ms
- [ ] Mask phase: Show pattern mask for 500ms
- [ ] Choice phase: Show 3 faces, wait for selection
- [ ] Handle timing transitions automatically

### 2.3 Home Dashboard

- [ ] Update `src/routes/+page.svelte` (currently placeholder)
- [ ] Show greeting with current streak
- [ ] Show "Start Session" button (primary action)
- [ ] If session completed today, show "Done for today" state
- [ ] Quick stats: streak, total sessions, current threshold
- [ ] Link to progress view
- [ ] Link to settings

### 2.4 Training Session Screen

- [ ] Create `src/routes/training/+page.svelte`
- [ ] Manage full session (50-60 trials based on settings)
- [ ] Use `staircaseAlgorithm` from `src/lib/core/staircase.ts`
- [ ] Show trial number progress
- [ ] Show current phase (target/mask/choice)
- [ ] Show feedback (correct/incorrect) after each trial
- [ ] Pause button with overlay
- [ ] Exit button with confirmation dialog
- [ ] Save completed session to IndexedDB
- [ ] Navigate to `/training/summary` when complete

**Staircase Parameters (from MVP spec):**

- Morph range: 28% (hardest) to 88% (easiest)
- Step size: 4% morph change
- Starting level: 60% (medium difficulty)
- Rule: 2 correct in a row → harder, 1 incorrect → easier

### 2.5 Session Summary Screen

- [ ] Create `src/routes/training/summary/+page.svelte`
- [ ] Show accuracy percentage
- [ ] Show threshold level (with comparison to previous)
- [ ] Show trend indicator (improving/stable/declining)
- [ ] Show streak update
- [ ] Encouragement message
- [ ] "Done" button navigates to `/`

### 2.6 Progress Calculation Logic

- [ ] Create `src/lib/core/progress.ts`
- [ ] `calculateStreak(sessions)`: count consecutive days trained
- [ ] `calculateImprovement(sessions)`: threshold change over time
- [ ] `updateProgressMetrics(userId)`: update stored metrics after session
- [ ] Create `src/lib/core/progress.test.ts` with tests

## Acceptance Criteria

- [ ] Can complete a full 50-60 trial session
- [ ] Staircase adapts difficulty correctly
- [ ] Session data persists to IndexedDB
- [ ] Progress metrics update after session
- [ ] Streak calculation works correctly
- [ ] `npm run test:e2e` passes for training flow
- [ ] `npm run check` passes

## Technical Notes

- Face stimuli are in `static/faces/`
- Use existing staircase algorithm - don't reimplement
- Session should work offline (all assets cached)

## Out of Scope

- Multiple viewing angles (Phase 2)
- Varied expressions (Phase 3)
- Personal face uploads (Phase 2)
