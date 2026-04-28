# Real Face Morphs Plan

## Goal

Replace the current generated JPG placeholders with licensed, research-appropriate morphed face stimuli, while preserving the app's privacy-first offline model and the current file contract used by onboarding and training.

## Source Dataset

Primary candidate: Face Research Lab London Set, Version 5.

- Dataset URL: https://figshare.com/articles/dataset/Face_Research_Lab_London_Set/5047666/5
- DOI: https://doi.org/10.6084/m9.figshare.5047666.v5
- License: CC BY 4.0
- Contents: 102 adult faces, 1350 x 1350 color images, plus template coordinate files for Psychomorph/WebMorph.
- Consent note from dataset page: participants consented to use in lab-based and web-based studies, including altered forms.

Keep the current placeholder assets available until the full morph set is generated and verified.

## Target Asset Contract

Maintain the app's existing static runtime contract:

```text
static/faces/
  face1_face2_28.jpg
  face1_face2_40.jpg
  face1_face2_52.jpg
  face1_face2_64.jpg
  face1_face2_76.jpg
  face1_face2_88.jpg
  ...
  metadata.json
```

Required output:

- 20 identity pairs minimum.
- 6 morph levels per pair: 28, 40, 52, 64, 76, 88.
- 120 final JPG files at 400 x 400 or 512 x 512.
- A generated `metadata.json` that records source dataset version, license, citation, file list, image dimensions, morph levels, and whether assets are placeholders.

## Implementation Phases

### Phase 1: Licensing And Attribution

1. Add `static/faces/ATTRIBUTION.md`.
2. Include dataset title, authors, DOI, version, license, and source URL.
3. Add a short in-app About entry linking to attribution.
4. Decide whether source images are stored outside git and only generated morph outputs are committed. Preferred: keep raw source images out of git and document the download path.

### Phase 2: Deterministic Pair Selection

1. Write `scripts/select-face-pairs.py`.
2. Read only dataset-provided metadata; do not infer demographics from images.
3. Select 20 stable pairs using a checked-in seed.
4. Persist the chosen source IDs to `static/faces/source-pairs.json`.
5. Reserve additional pairs for validation/holdout so later tests can use unseen identities.

### Phase 3: Morph Generation Pipeline

1. Prefer the London Set template coordinate files over runtime landmark detection.
2. Implement or update `scripts/generate-face-morphs.py` to:
    - Load two aligned source images and their template coordinates.
    - Interpolate shape coordinates per morph level.
    - Warp each source image into the interpolated shape.
    - Alpha-blend texture according to the morph level.
    - Crop/resize consistently.
    - Write optimized JPG outputs.
3. Generate `metadata.json` from the same script so filenames and metadata cannot drift.
4. Keep the script idempotent: same inputs and seed produce byte-stable or visually stable outputs.

### Phase 4: Verification Tools

1. Extend `npm run verify-faces` or add `scripts/verify-face-assets.js`.
2. Checks:
    - All files referenced by metadata exist.
    - No placeholder flag remains for production assets.
    - Every image is loadable, correct dimensions, and nonblank.
    - Every pair has all required morph levels.
    - No duplicate output files by hash within the same pair.
3. Add the verifier to `npm run check` once it is stable.

### Phase 5: App Integration

1. Replace hard-coded `FACE_PAIRS = 20` with metadata-driven face pair loading.
2. Keep the static path format so PWA caching remains simple.
3. Update onboarding perception and training trial generation to draw from metadata rather than numeric assumptions.
4. Ensure the service worker precaches the generated assets.
5. Show dataset attribution in Settings/About.

### Phase 6: QA And Release Gate

1. Run `npm run check`, `npm run build`, and `npm run test:e2e`.
2. Manually test:
    - `/onboarding/perception`
    - `/training`
    - `/training/summary`
    - offline reload after first load
3. Visually inspect a contact sheet of all 120 generated morphs.
4. Confirm no raw source dataset directory is accidentally staged.

## Risks

- Current placeholders are not scientifically valid training stimuli.
- The existing morphing script mentions dlib fallback; template-based morphing should be preferred for reproducibility.
- The app currently assumes exactly 20 sequential face pairs; metadata-driven selection will make future datasets easier.
- Licensing is permissive, but attribution must travel with the app and any deployed build.

## Done Definition

Real morph support is done when the app uses non-placeholder London Set morphs, the generated asset verifier passes in `npm run check`, E2E still passes, and `static/faces/metadata.json` plus `ATTRIBUTION.md` clearly identify the source dataset, license, DOI, and generation settings.
