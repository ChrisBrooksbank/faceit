# CLAUDE.md

This file provides guidance to Claude Code when working with this codebase.

## Project Overview

FaceIt is a Progressive Web App to help people with prosopagnosia improve face recognition through evidence-based perceptual discrimination training.

## Development Commands

```bash
npm run dev            # Start Vite dev server
npm run build          # Production build
npm run preview        # Preview production build
npm test               # Vitest watch mode
npm run test:run       # Run tests once
npm run test:coverage  # Coverage report (80% threshold)
npm run test:e2e       # Run Playwright E2E tests
npm run test:e2e:ui    # Run Playwright with UI
npm run lint           # ESLint check
npm run lint:fix       # ESLint auto-fix
npm run format         # Prettier format all files
npm run typecheck      # TypeScript type check
npm run knip           # Find unused code
npm run check          # Run ALL checks (typecheck, lint, format, knip, tests)
```

## Architecture

### TypeScript with ES Modules

Path aliases configured:

- `@/*` → `src/*`
- `@api/*` → `src/api/*`
- `@core/*` → `src/core/*`
- `@utils/*` → `src/utils/*`
- `@config/*` → `src/config/*`
- `@types/*` → `src/types/*`

### Project Structure

```
src/
├── main.ts              # Application entry point
├── main.test.ts         # Example test
├── api/                 # External API clients (IndexedDB operations)
├── core/                # Core business logic (staircase algorithm, PI20 scoring)
├── config/              # Configuration with Zod validation
├── utils/               # Logger, helpers (debounce, throttle, retry)
└── types/               # Shared TypeScript types
e2e/                     # Playwright E2E tests
docs/                    # Documentation (MVP spec, research)
```

### Key Patterns

Use Logger instead of console.log:

```typescript
import { Logger } from '@utils/logger';
Logger.info('Message');
Logger.warn('Warning');
Logger.error('Error');
Logger.success('Done');
Logger.debug('Debug'); // Only in debug mode
```

Config is loaded asynchronously and validated with Zod:

```typescript
import { loadConfig, getConfig } from '@config';

// At startup (once):
await loadConfig();

// After initialization:
const config = getConfig();
```

Retry logic for flaky operations:

```typescript
import { retryWithBackoff } from '@utils/helpers';
const data = await retryWithBackoff(() => fetchData());
```

## Quality Guardrails

This project has strict quality checks that run:

1. **On save** - TypeScript type checking in editor
2. **On commit** - Pre-commit hook runs typecheck + lint-staged
3. **On push** - CI runs full check suite + E2E tests
4. **Periodically** - Run `npm run knip` to find dead code

### ESLint Rules

- `complexity: 10` - Functions should have low cyclomatic complexity
- `max-depth: 4` - Avoid deeply nested code
- `max-lines-per-function: 50` - Keep functions small
- `no-explicit-any: error` - No `any` types allowed

### Test Coverage

- Minimum 80% coverage required for statements, branches, functions, lines
- Unit tests in `*.test.ts` files alongside source
- E2E tests in `e2e/` directory using Playwright

## Domain Knowledge

### Training Algorithm

FaceIt uses a staircase algorithm for adaptive difficulty:

- Morph levels: 28% (hard) → 88% (easy)
- Correct answer = harder (lower morph)
- Incorrect answer = easier (higher morph)
- Target ~75% accuracy at threshold

### Key Data Types

See `src/types/index.ts` for:

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
