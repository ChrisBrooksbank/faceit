# AGENTS.md - Operational Guide

Keep this file under 60 lines. It's loaded every iteration.

## Build Commands

```bash
npm run dev            # Start SvelteKit dev server
npm run build          # Production build (static site)
npm run preview        # Preview production build
```

## Test Commands

```bash
npm test               # Vitest watch mode
npm run test:run       # Run tests once
npm run test:coverage  # Coverage report (80% threshold)
npm run test:e2e       # Run Playwright E2E tests
```

## Validation (run before finishing each task)

```bash
npm run check          # Run ALL checks (typecheck, lint, format, knip, tests)
```

This runs: `svelte-check && eslint . && prettier --check . && knip && vitest run`

## Project Patterns

- **Svelte 5 runes**: Use `$state()`, `$derived()`, not legacy `let` reactivity
- **Imports**: Use `$lib/` alias for src/lib imports
- **Types**: Strict TypeScript, no `any` allowed
- **Tests**: Co-locate as `*.test.ts` in `src/lib/`
- **E2E**: Place in `e2e/` directory

## Key Files

- `src/lib/types/index.ts` - All type definitions
- `src/lib/core/staircase.ts` - Staircase algorithm (implemented)
- `src/lib/core/pi20.ts` - PI20 scoring (implemented)
- `docs/mvp-specification.md` - Full MVP spec

## ESLint Limits

- `complexity: 10` - Max cyclomatic complexity
- `max-depth: 4` - Max nesting depth
- `max-lines-per-function: 50` - Keep functions small
