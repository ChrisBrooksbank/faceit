# CLAUDE.md

This file provides guidance to Claude Code when working with this codebase.

## Project Overview

FaceIt is a Progressive Web App to help people with prosopagnosia improve face recognition through evidence-based perceptual discrimination training.

## Technology Stack

- **SvelteKit** - Full-stack framework with file-based routing
- **Svelte 5** - Reactive UI components (minimal bundle ~2KB)
- **TypeScript** - Strict type checking
- **Zod** - Runtime validation
- **IndexedDB** (via idb) - Local data persistence

## Development Commands

```bash
npm run dev            # Start SvelteKit dev server
npm run build          # Production build (static site)
npm run preview        # Preview production build
npm test               # Vitest watch mode
npm run test:run       # Run tests once
npm run test:coverage  # Coverage report (80% threshold)
npm run test:e2e       # Run Playwright E2E tests
npm run lint           # ESLint + svelte-check
npm run format         # Prettier format all files
npm run check          # Run ALL checks (typecheck, lint, format, knip, tests)
```

## Architecture

### SvelteKit Project Structure

```
src/
├── routes/              # File-based routing (SvelteKit)
│   ├── +page.svelte     # Home/Dashboard
│   ├── +layout.svelte   # Root layout
│   ├── onboarding/      # Onboarding flow
│   ├── training/        # Training session
│   └── progress/        # Progress view
├── lib/                 # Shared code ($lib alias)
│   ├── components/      # Reusable Svelte components
│   ├── stores/          # Svelte stores for state
│   ├── core/            # Business logic (staircase, PI20)
│   ├── db/              # IndexedDB operations
│   ├── utils/           # Helpers (logger, etc.)
│   └── types/           # TypeScript types
├── app.html             # HTML template
└── app.d.ts             # App-level type declarations
static/                  # Static assets (icons, face stimuli)
e2e/                     # Playwright E2E tests
docs/                    # Documentation
```

### Key Patterns

**Svelte 5 Runes (reactivity):**

```svelte
<script lang="ts">
    let count = $state(0);
    let doubled = $derived(count * 2);

    function increment() {
        count++;
    }
</script>
```

**Svelte Stores (shared state):**

```typescript
import { writable } from 'svelte/store';

export const userProfile = writable<UserProfile | null>(null);
```

**Component imports use $lib alias:**

```svelte
<script lang="ts">
    import { Button } from '$lib/components';
    import { staircaseAlgorithm } from '$lib/core/staircase';
</script>
```

## Quality Guardrails

This project has strict quality checks that run:

1. **On save** - TypeScript + svelte-check in editor
2. **On commit** - Pre-commit hook runs typecheck + lint-staged
3. **On push** - CI runs full check suite + E2E tests
4. **Periodically** - Run `npm run check` to find issues

### ESLint Rules

- `complexity: 10` - Functions should have low cyclomatic complexity
- `max-depth: 4` - Avoid deeply nested code
- `max-lines-per-function: 50` - Keep functions small
- `no-explicit-any: error` - No `any` types allowed

### Test Coverage

- Minimum 80% coverage required for statements, branches, functions, lines
- Unit tests in `*.test.ts` files in `src/lib/`
- E2E tests in `e2e/` directory using Playwright

## Domain Knowledge

### Training Algorithm

FaceIt uses a staircase algorithm for adaptive difficulty:

- Morph levels: 28% (hard) → 88% (easy)
- Correct answer = harder (lower morph)
- Incorrect answer = easier (higher morph)
- Target ~75% accuracy at threshold

### Key Data Types

See `src/lib/types/` for:

- `UserProfile` - PI20 score, baseline, settings
- `TrainingSession` - Trials, accuracy, threshold
- `ProgressMetrics` - Streaks, improvement rate

### PI20 Assessment

20 Likert-scale questions (1-5), items 8 and 9 reverse-scored.
Score interpretation:

- 20-64: Typical
- 65-74: Mild prosopagnosia
- 75-84: Moderate
- 85-100: Severe
