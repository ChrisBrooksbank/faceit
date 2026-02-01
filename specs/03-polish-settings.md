# Polish & Settings

## Overview

Add progress visualization, settings, and final polish for MVP release.

## User Stories

- As a user, I want to see my improvement over time so I stay motivated
- As a user, I want to configure reminders so I don't forget to train
- As a user, I want to export my data so I own my information
- As a user, I want the app to work offline so I can train anywhere

## Requirements

### 3.1 Progress View Screen

- [ ] Create `src/routes/progress/+page.svelte`
- [ ] Threshold chart: line graph over time (sessions on x-axis)
- [ ] Accuracy chart: line graph over time
- [ ] Statistics summary:
    - Total training time
    - Best threshold achieved
    - Average accuracy
    - Longest streak
- [ ] PI20 comparison (if re-assessed)
- [ ] "Back" button to dashboard

**Chart implementation:**

- Use simple SVG charts (no heavy library)
- Or lightweight library like chart.js if needed
- Must work offline

### 3.2 Settings Screen

- [ ] Create `src/routes/settings/+page.svelte`
- [ ] Notification settings:
    - Daily reminder toggle
    - Reminder time picker
- [ ] Session settings:
    - Trials per session (50/60/70)
- [ ] Data management:
    - Export data (JSON download)
    - Clear all data (with confirmation)
- [ ] About section:
    - App version
    - Privacy policy link
    - Research references link

### 3.3 Real Face Stimuli

- [ ] Source faces from Utrecht ECVP or Face Research Lab
- [ ] Process into morph levels (28%, 40%, 52%, 64%, 76%, 88%)
- [ ] Optimize as WebP format
- [ ] Minimum 20 identity pairs (120 morph images)
- [ ] Replace placeholder images in `static/faces/`
- [ ] Update any hardcoded face references

**Naming convention:** `{faceA}_{faceB}_{morphLevel}.webp`

### 3.4 PWA Assets

- [ ] Create `static/icons/icon-192.png`
- [ ] Create `static/icons/icon-512.png`
- [ ] Create `static/favicon.png`
- [ ] Verify PWA manifest configuration
- [ ] Test offline functionality

### 3.5 Final E2E Tests

- [ ] Test: Complete onboarding flow (welcome → expectations)
- [ ] Test: Complete training session (start → summary)
- [ ] Test: Progress tracking (multiple sessions)
- [ ] Test: Settings changes persist
- [ ] Test: Data export works
- [ ] Test: Offline functionality

### 3.6 Accessibility Audit

- [ ] WCAG 2.1 AA compliance check
- [ ] Keyboard navigation for all interactions
- [ ] Screen reader testing
- [ ] Color contrast verification (4.5:1 minimum)
- [ ] Minimum tap targets (44x44px)

## Acceptance Criteria

- [ ] Progress charts render correctly with real data
- [ ] Settings persist across sessions
- [ ] Data export produces valid JSON
- [ ] All E2E tests pass
- [ ] PWA installs correctly
- [ ] App works fully offline
- [ ] `npm run check` passes
- [ ] `npm run build` produces optimized output

## Technical Notes

- Keep bundle size minimal (Svelte advantage)
- Charts should be simple SVG or very lightweight
- Test on mobile viewport sizes

## Out of Scope

- Push notifications (requires server)
- Analytics (privacy-first MVP)
- User accounts/authentication
