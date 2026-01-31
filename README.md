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

*Coming soon - project is currently in specification phase*

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/faceit.git
cd faceit

# Install dependencies
npm install

# Run development server
npm run dev
```

### Building for Production

```bash
npm run build
npm run start
```

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

- **Next.js** - React framework with static site generation
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **IndexedDB** - Local data persistence
- **PWA** - Installable, offline-capable

## Research Background

FaceIt's approach is based on peer-reviewed research:

- Perceptual discrimination training shows 3+ month retention
- Staircase procedures optimize learning at threshold difficulty
- The PI20 questionnaire is a validated screening tool (Cronbach's α = 0.93)

See [prosopagnosia-research.md](docs/prosopagnosia-research.md) for detailed research citations.

## Contributing

*Contribution guidelines coming soon*

## License

*License to be determined*

## Acknowledgments

- Research participants who shared their experiences
- The prosopagnosia research community
- Face databases: Utrecht ECVP, Face Research Lab London

---

**Note:** FaceIt is not a medical device and does not diagnose or treat prosopagnosia. It is a training tool based on published research. Consult healthcare providers for medical advice.
