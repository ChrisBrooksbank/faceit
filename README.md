# FaceIt

A Progressive Web App to help people with prosopagnosia improve face recognition through evidence-based training.

## About

FaceIt uses **perceptual discrimination training** - users practice telling apart very similar faces at adaptive difficulty levels. Small laboratory studies of face-perception training in developmental prosopagnosia have reported improvements on trained and some untrained faces, with some gains still present months later. The evidence base is limited, results vary a lot between people, and transfer to everyday recognition is not guaranteed. FaceIt is a practice tool, not a clinical treatment or a diagnosis.

## The Problem

Prosopagnosia (face blindness) affects approximately 2% of the population. Despite this prevalence, no widely available, research-backed app exists specifically for face recognition training. FaceIt aims to fill this gap.

## Features (MVP)

- **PI20 Self-Assessment** - Validated 20-question survey to assess face recognition difficulty
- **Baseline Perception Test** - Quick test to establish starting ability
- **Adaptive Training** - Staircase algorithm maintains optimal difficulty (converges on ~71% accuracy)
- **Progress Tracking** - Monitor improvement over time
- **Offline-First** - All data stays on your device; works without internet
- **Daily Sessions** - 10-minute sessions designed for consistent practice

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/ChrisBrooksbank/faceit.git
cd faceit

# Install dependencies
npm install

# Initialize Playwright (for E2E tests)
npx playwright install

# Run development server
npm run dev
```

### Building for Production

```bash
npm run build
npm run preview
```

## Scripts

| Command                 | Description               |
| ----------------------- | ------------------------- |
| `npm run dev`           | Start development server  |
| `npm run build`         | Production build          |
| `npm run preview`       | Preview production build  |
| `npm test`              | Run tests in watch mode   |
| `npm run test:run`      | Run tests once            |
| `npm run test:coverage` | Generate coverage report  |
| `npm run test:e2e`      | Run Playwright E2E tests  |
| `npm run lint`          | Check for lint errors     |
| `npm run lint:fix`      | Fix lint errors           |
| `npm run format`        | Format code with Prettier |
| `npm run typecheck`     | TypeScript type checking  |
| `npm run knip`          | Find unused code          |
| `npm run check`         | Run all checks            |

## How It Works

### Training Approach

Each training trial follows this structure:

1. **Target Display** (2 sec) - A face is shown to remember
2. **Visual Mask** (500ms) - Brief pattern to clear visual memory
3. **Choice** - Pick the exact match from three images of the same two-person blend
4. **Feedback** - After a mistake, see your choice next to the right answer with the most different facial regions outlined, or flicker between the two images
5. **Adapt** - Difficulty adjusts based on performance

Difficulty is the morph distance between the target and the wrong answers (12 to 48 morph units). The **staircase algorithm** adjusts it:

- Two correct answers in a row → wrong answers get closer to the target (harder)
- One wrong answer → wrong answers move further away (easier)
- Sessions resume from where the last one ended; new users start at the easiest level
- As the task gets harder, each image is also shown with a small simulated change of angle, position and lighting, so you have to match the face rather than a pixel-identical picture

The stimuli are cropped to the inner face (no hair or clothing) because hair blends into a ghosted overlay whose opacity would otherwise reveal the answer.

**Known limitations:** all faces are neutral, front-facing photos from a single set, so real changes of viewpoint and expression are only simulated. Adding genuinely different photos of each person is the main planned improvement.

### What to Expect

- Training is not a cure, and evidence for how well it carries over to everyday recognition is limited and mixed
- Benefits typically appear after 2-4 weeks of consistent practice
- Daily 10-minute sessions work better than occasional longer sessions

## Privacy

FaceIt is designed with privacy as a core principle:

- **No cloud storage** - All data stays on your device
- **No accounts required** - No personal information collected
- **No tracking** - No analytics or third-party services
- **Your data, your control** - Export or delete anytime

## Documentation

- [MVP Specification](docs/mvp-specification.md) - Detailed feature specifications
- [Research Summary](docs/prosopagnosia-research.md) - Scientific background
- [User Research](docs/interview-report.md) - Interview insights

## Technology

- **SvelteKit** - Full-stack Svelte framework with routing and SSG
- **Svelte 5** - Reactive UI with minimal bundle size (~2KB)
- **TypeScript** - Strict type-safe development
- **Zod** - Runtime validation for config and data
- **IndexedDB** (via idb) - Local data persistence
- **PWA** - Installable, offline-capable (@vite-pwa/sveltekit)
- **Vitest** - Unit testing with 80% coverage threshold
- **Playwright** - E2E testing across browsers
- **ESLint + Prettier** - Code quality and formatting
- **Knip** - Dead code detection
- **Husky** - Pre-commit hooks

## Research Background

FaceIt's approach is based on peer-reviewed research:

- Perceptual discrimination training shows 3+ month retention
- Staircase procedures optimize learning at threshold difficulty
- The PI20 questionnaire is a validated screening tool (Cronbach's α = 0.93)

See [prosopagnosia-research.md](docs/prosopagnosia-research.md) for detailed research citations.

## Contributing

_Contribution guidelines coming soon_

## License

_License to be determined_

## Acknowledgments

- Research participants who shared their experiences
- The prosopagnosia research community
- Face databases: Utrecht ECVP, Face Research Lab London

---

**Note:** FaceIt is not a medical device and does not diagnose or treat prosopagnosia. It is a training tool based on published research. Consult healthcare providers for medical advice.
