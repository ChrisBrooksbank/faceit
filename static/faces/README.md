# Face Stimuli for FaceIt

This directory contains the app-ready face morph stimuli used by FaceIt.

## Current Status

FaceIt now uses real JPEG morphs generated from the Face Research Lab London Set, version 5. The generated set contains 20 face pairs at 6 morph levels: 28, 40, 52, 64, 76, and 88.

The raw dataset is intentionally not stored here. Keep downloads under `.face-source/`, which is ignored by git.

## Files

- `metadata.json` - production asset contract consumed by the app
- `source-pairs.json` - deterministic source face pairing audit trail
- `face*_face*_*.jpg` - 120 generated 400x400 morph stimuli
- `contact-sheet.jpg` - visual QA sheet for the generated stimuli
- `ATTRIBUTION.md` - dataset attribution and license details

## Regenerate

Download the neutral-front images and information CSV from the Face Research Lab London Set, then run:

```bash
python scripts/generate-face-morphs.py \
    --source-dir .face-source/neutral_front/neutral_front \
    --info-csv .face-source/london_faces_info.csv \
    --output-dir static/faces \
    --contact-sheet
```

Then verify:

```bash
npm run verify-faces
```

## Source

- Dataset: https://figshare.com/articles/dataset/Face_Research_Lab_London_Set/5047666/5
- DOI: https://doi.org/10.6084/m9.figshare.5047666.v5
- License: CC BY 4.0

Citation:

DeBruine, Lisa; Jones, Benedict (2017). Face Research Lab London Set. figshare. Dataset. https://doi.org/10.6084/m9.figshare.5047666.v5
