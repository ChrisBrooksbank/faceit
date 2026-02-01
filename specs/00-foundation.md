# Foundation - Data Layer

## Overview

Create the IndexedDB storage layer and Svelte stores that all other features depend on.

## User Stories

- As a user, I want my training data saved locally so that I don't lose progress
- As a user, I want the app to remember me between sessions so that I can continue training
- As a user, I want my data to never leave my device so that my privacy is protected

## Requirements

### 0.1 IndexedDB Module

- [ ] Create `src/lib/db/index.ts` with FaceItDB schema
- [ ] Object stores: `users`, `sessions`, `assessments`, `progress`
- [ ] Use `idb` library (already in package.json)
- [ ] Implement CRUD operations for each store
- [ ] Create `src/lib/db/index.test.ts` with full test coverage

**Schema from MVP spec Section 7.5:**

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

### 0.2 Svelte Stores

- [ ] Create `src/lib/stores/index.ts`
- [ ] Stores: `userProfile`, `currentSession`, `progressMetrics`
- [ ] Derived stores: `isOnboarded`, `hasSessionToday`, `currentStreak`
- [ ] Create `src/lib/stores/index.test.ts` with tests

### 0.3 App Initialization

- [ ] Create `src/lib/core/init.ts`
- [ ] Load user from IndexedDB on app start
- [ ] Initialize stores with loaded data
- [ ] Handle first-time vs returning user detection

## Acceptance Criteria

- [ ] `npm run test:run` passes with all new tests
- [ ] `npm run check` passes (typecheck, lint, format, knip)
- [ ] Data persists across browser refreshes
- [ ] No cloud/network calls for storage

## Technical Notes

- Use existing types from `src/lib/types/index.ts`
- Follow existing code patterns in `src/lib/core/`
- IndexedDB operations should be async/await

## Out of Scope

- Cloud sync (deferred to Phase 2+)
- Data migration between versions
- Multi-device support
