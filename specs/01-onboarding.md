# Onboarding Flow

## Overview

Guide new users through assessment and set realistic expectations before training begins.

## User Stories

- As a new user, I want to understand what the app does so I can decide to use it
- As a user, I want to assess my face recognition difficulty so training is personalized
- As a user, I want to know what outcomes to expect so I have realistic expectations

## Requirements

### 1.1 Shared UI Components

- [ ] Create `src/lib/components/Button.svelte` - primary/secondary variants
- [ ] Create `src/lib/components/Card.svelte` - content container
- [ ] Create `src/lib/components/ProgressBar.svelte` - visual progress indicator
- [ ] Create `src/lib/components/index.ts` - barrel export

### 1.2 Welcome Screen

- [ ] Create `src/routes/onboarding/+page.svelte`
- [ ] Content: Logo, tagline "Train your brain to recognize faces better"
- [ ] Privacy assurance: "All data stays on your device"
- [ ] "Get Started" button navigates to `/onboarding/pi20`

### 1.3 LikertScale Component

- [ ] Create `src/lib/components/LikertScale.svelte`
- [ ] Props: `question`, `value`, `onChange`
- [ ] 5 options: Strongly Disagree (1) to Strongly Agree (5)
- [ ] Accessible: keyboard navigation, ARIA labels
- [ ] Minimum tap target: 44x44px

### 1.4 PI20 Survey Screen

- [ ] Create `src/routes/onboarding/pi20/+page.svelte`
- [ ] Display 20 questions from PI20 (see MVP spec Section 5.2)
- [ ] Progress indicator: "Question X of 20"
- [ ] Back/Next navigation
- [ ] Store responses in Svelte store
- [ ] Navigate to `/onboarding/perception` when complete

**PI20 Questions (items 8, 9 are reverse-scored):**

1. My face recognition ability is worse than most people.
2. I have always had a bad memory for faces.
3. I find it notably easier to recognize people who have a distinctive feature.
4. I sometimes find movies hard to follow because of difficulties recognizing characters.
5. If I met a colleague or classmate out of context, I might fail to recognize them.
6. When people change their hairstyle, or wear hats, I have problems recognizing them.
7. I sometimes have to warn new people I meet that I am "bad with faces."
8. I find it easy to picture individual faces in my mind. (REVERSE)
9. I am better than most people at putting a "name to a face." (REVERSE)
10. Without hearing someone's voice, I struggle to recognize them.
11. It is hard for me to recognize familiar people when I am in an unfamiliar place.
12. In the past, I have lost track of a friend in a shopping mall because they have changed clothes.
13. The first time I meet a new person, I carefully study their face so I can recognize them later.
14. When I was at school, I struggled to recognize my classmates.
15. When my close friends or family change their appearance, I have trouble recognizing them.
16. At family gatherings, I sometimes confuse members of my own family.
17. I have recognized people I have met before, but have mistaken them for someone else.
18. I find it difficult to follow the plot of TV shows because the characters look too similar.
19. I often have to ask people where I have met them before.
20. I have sometimes not recognized close family members when they have unexpectedly approached me.

### 1.5 Placeholder Face Stimuli

- [ ] Create `static/faces/` directory
- [ ] Create 6+ placeholder images (colored squares as temporary)
- [ ] Naming: `face_a.webp`, `face_b.webp`, etc.
- [ ] Note: Replace with real faces in Phase 3

### 1.6 Perception Test Screen

- [ ] Create `src/routes/onboarding/perception/+page.svelte`
- [ ] 6 trials at fixed difficulty levels: 88%, 76%, 64%, 52%, 40%, 28%
- [ ] Display target face (2000ms) → mask (500ms) → 3 choices
- [ ] Track correct responses (0-6)
- [ ] Navigate to `/onboarding/results` when complete

### 1.7 Results Profile Screen

- [ ] Create `src/routes/onboarding/results/+page.svelte`
- [ ] Display PI20 score with interpretation (use `getPI20Result`, `getPI20Interpretation`)
- [ ] Display perception test score with interpretation
- [ ] "Continue" button navigates to `/onboarding/expectations`

**PI20 Interpretation:**

- 20-64: Typical face recognition
- 65-74: Mild prosopagnosia likely
- 75-84: Moderate prosopagnosia
- 85-100: Severe prosopagnosia

### 1.8 Expectations Screen

- [ ] Create `src/routes/onboarding/expectations/+page.svelte`
- [ ] Key messages from MVP spec Section 5.5:
    - "This is training, not a cure"
    - "Research shows 50-60% of people see measurable improvement"
    - "Benefits typically appear after 2-4 weeks of consistent practice"
    - "Daily practice (10 minutes) works better than occasional longer sessions"
- [ ] Checkbox: "I understand this requires consistent practice"
- [ ] Save UserProfile to IndexedDB
- [ ] Navigate to `/` (dashboard)

## Acceptance Criteria

- [ ] Complete onboarding flow works end-to-end
- [ ] PI20 scoring matches existing `src/lib/core/pi20.ts` logic
- [ ] All screens are keyboard accessible
- [ ] `npm run test:e2e` passes for onboarding flow
- [ ] `npm run check` passes

## Out of Scope

- Skipping onboarding for returning users (handled by init logic)
- Re-taking PI20 assessment (Phase 3)
- Real face images (Phase 3)
