# Implementation Plan

## Status

- Planning iterations: 0
- Build iterations: 1
- Last updated: 2026-02-01

## Current Phase: Foundation (Phase 0)

Focus on data layer before UI.

## Tasks

### Phase 0: Foundation

- [x] Create IndexedDB module with FaceItDB schema (spec: 00-foundation.md)
- [ ] Create Svelte stores for app state (spec: 00-foundation.md)
- [ ] Create app initialization logic (spec: 00-foundation.md)

### Phase 1: Onboarding

- [ ] Create shared UI components (Button, Card, ProgressBar) (spec: 01-onboarding.md)
- [ ] Create Welcome screen at /onboarding (spec: 01-onboarding.md)
- [ ] Create LikertScale component (spec: 01-onboarding.md)
- [ ] Create PI20 Survey screen at /onboarding/pi20 (spec: 01-onboarding.md)
- [ ] Create placeholder face stimuli in static/faces/ (spec: 01-onboarding.md)
- [ ] Create Perception Test screen at /onboarding/perception (spec: 01-onboarding.md)
- [ ] Create Results Profile screen at /onboarding/results (spec: 01-onboarding.md)
- [ ] Create Expectations screen at /onboarding/expectations (spec: 01-onboarding.md)

### Phase 2: Core Training

- [ ] Create FaceDisplay component (spec: 02-core-training.md)
- [ ] Create TrialDisplay component (spec: 02-core-training.md)
- [ ] Update Home Dashboard at / (spec: 02-core-training.md)
- [ ] Create Training Session screen at /training (spec: 02-core-training.md)
- [ ] Create Session Summary screen at /training/summary (spec: 02-core-training.md)
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

## Notes

- Staircase algorithm already implemented in src/lib/core/staircase.ts
- PI20 scoring already implemented in src/lib/core/pi20.ts
- Types already defined in src/lib/types/index.ts
- Quality guardrails (ESLint, Prettier, Vitest, Playwright) already configured
