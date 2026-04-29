# Real Face Morphs Implementation Plan

## Goal

Replace the generated placeholders with licensed, research-appropriate morphed face stimuli, while preserving the app's privacy-first offline model and the file contract used by onboarding and training.

Status: implemented. The active app now uses generated London Set JPEG morphs, metadata-driven trial generation, production asset verification, and in-app attribution.

## Source Dataset

Primary candidate: Face Research Lab London Set, Version 5.

- Dataset URL: https://figshare.com/articles/dataset/Face_Research_Lab_London_Set/5047666/5
- DOI: https://doi.org/10.6084/m9.figshare.5047666.v5
- License: CC BY 4.0
- Contents: 102 adult faces, 1350 x 1350 color images, plus template coordinate files for Psychomorph/WebMorph.
- Consent note from dataset page: participants consented to use in lab-based and web-based studies, including altered forms.

Raw source files stay outside git in `.face-source/`. Only generated app-ready stimuli and reproducible scripts are checked in.

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

Done.

### Phase 2: Deterministic Pair Selection

Done in `scripts/generate-face-morphs.py`. Pairing reads only dataset-provided age, gender, and ethnicity metadata, then writes `static/faces/source-pairs.json`.

### Phase 3: Morph Generation Pipeline

Done. The generator uses the London Set `.tem` landmark files for piecewise-affine shape morphing, blends texture at each morph level, writes optimized 400 x 400 JPEGs, and regenerates `metadata.json`.

### Phase 4: Verification Tools

Done. `npm run verify-faces` is included in `npm run check` and validates metadata, dimensions, loadability, entropy, and within-pair duplicate hashes.

### Phase 5: App Integration

Done. `src/lib/core/faces.ts` centralizes the metadata-driven face contract for onboarding and training, and the PWA cache now includes JPEG and JSON assets.

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
