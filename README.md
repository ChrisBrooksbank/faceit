# FaceIt

A Progressive Web App to help people with prosopagnosia improve face recognition through evidence-based training.

## About

FaceIt uses **perceptual discrimination training** - a scientifically validated approach where users practice distinguishing between similar faces at adaptive difficulty levels. Research shows this type of training can produce improvements that:

- Last 3+ months after training
- Generalize to untrained faces
- Transfer to different viewing angles and expressions

## The Problem

Prosopagnosia (face blindness) affects approximately 2% of the population. Despite this prevalence, no widely available, research-backed app exists specifically for face recognition training. FaceIt aims to fill this gap.

## Features (MVP)

- **PI20 Self-Assessment** - Validated 20-question survey to assess face recognition difficulty
- **Baseline Perception Test** - Quick test to establish starting ability
- **Adaptive Training** - Staircase algorithm maintains optimal difficulty (~75% accuracy)
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
3. **Choice** - Pick the target from three similar faces
4. **Feedback** - Learn if you were correct
5. **Adapt** - Difficulty adjusts based on performance

The **staircase algorithm** automatically adjusts difficulty:

- Get it right → faces become more similar (harder)
- Get it wrong → faces become more different (easier)
- System converges to your perceptual threshold

### What to Expect

- Training is not a cure, but research shows 50-60% of people see measurable improvement
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

- **Vite** - Fast build tool and dev server
- **TypeScript** - Strict type-safe development
- **Zod** - Runtime validation for config and data
- **IndexedDB** (via idb) - Local data persistence
- **PWA** - Installable, offline-capable
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
