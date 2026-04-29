# Landmark Difference Feedback Plan

## Goal

Improve wrong-answer feedback by using the existing London Set face landmarks to identify which broad facial regions differ most between the selected image and the correct match.

The feedback must remain training-safe: it should guide attention without pretending to diagnose exactly what the user perceived, without making the task a rule-memorization exercise, and without making future trials easier by leaking answer patterns.

## Current State

- Face stimuli are generated from the Face Research Lab London Set v5.
- `scripts/generate-face-morphs.py` already reads each source face `.tem` template.
- Morphs are generated from two source faces using piecewise-affine shape morphing and texture blending.
- Trial choices now come from nearby morph levels within the same identity pair.
- Wrong-answer feedback currently shows:
    - the user's selected image
    - the exact match
    - a region-aware landmark cue when data exists
    - a generic comparison prompt when data is unavailable

Current limitation: the app uses broad coordinate-band landmark regions rather than manually verified semantic landmark indices. Feedback should remain cautious.

## Implementation Status

Implemented in:

- `scripts/generate-face-differences.py`
- `src/lib/data/face-differences.json`
- `src/lib/core/face-differences.ts`
- `src/lib/core/face-differences.test.ts`
- wrong-answer feedback in onboarding and training

The generated data currently uses `regionMapping: "coordinate-band-v1"`. This is landmark-based and reproducible, but still intentionally broad.

## Proposed Data Model

Generate a static JSON file consumed by the app:

```text
src/lib/data/face-differences.json
```

Shape:

```json
{
    "version": "1.0",
    "method": "landmark-region-distance",
    "regions": ["eyes", "brows", "nose", "mouth", "jawline"],
    "comparisons": {
        "face1_face2_64__face1_face2_76": {
            "topRegions": ["mouth", "jawline"],
            "scores": {
                "eyes": 0.18,
                "brows": 0.12,
                "nose": 0.31,
                "mouth": 0.57,
                "jawline": 0.44
            }
        }
    }
}
```

Keys should be order-insensitive. A helper can normalize `a__b` so selected/correct order does not matter.

## Landmark Region Mapping

Use London Set `.tem` point indices. First implementation should include a documented mapping created by inspecting a few template files and confirming against rendered points.

Candidate regions:

- `eyes`: inner/outer eye corners, upper/lower eyelid points
- `brows`: brow ridge points
- `nose`: bridge, tip, nostril boundary
- `mouth`: lip outline and mouth corners
- `jawline`: chin, jaw, cheek outline

If the `.tem` schema differs from common 68-point landmarks, do not assume dlib indices. Add a small visual debug script that renders numbered landmarks over source images for verification.

## Difference Scoring

For each face pair and each pair of morph levels used together in trials:

1. Reconstruct morphed landmark positions for each morph level:
    - `point = alpha * pointA + (1 - alpha) * pointB`
    - `alpha = morphLevel / 100`
2. For each region, compute mean normalized Euclidean distance between corresponding region points.
3. Normalize by inter-ocular distance or face bounding-box diagonal so scores are comparable across identities.
4. Optionally include texture difference later, but do not start there. Landmark shape differences are easier to explain and less noisy.

Initial comparisons only need adjacent choices used by the app:

- 28 vs 40
- 40 vs 52
- 52 vs 64
- 64 vs 76
- 76 vs 88
- 52 vs 76, 64 vs 88, etc. if the trial generator can present them together

## Script Changes

Add a new script instead of overloading image generation at first:

```text
scripts/generate-face-differences.py
```

Inputs:

- `.face-source/neutral_front/neutral_front/*.tem`
- `static/faces/source-pairs.json`
- `static/faces/metadata.json`

Outputs:

- `src/lib/data/face-differences.json`
- optional `static/faces/landmark-debug/*.jpg` when `--debug-overlays` is passed

Why separate:

- Allows iteration without regenerating all JPEGs.
- Keeps training assets stable while validating the feedback model.
- Makes it easier to test the JSON contract.

## App Integration

Create:

```text
src/lib/core/face-differences.ts
```

Responsibilities:

- Normalize comparison keys.
- Return top 1-2 regions for selected vs correct image.
- Fall back to generic guidance if no comparison data exists.

Example API:

```ts
getDifferenceCue(selectedFaceId: string, correctFaceId: string): string
```

Example output:

```text
Look again at the mouth shape and jawline.
```

Use cautious copy:

- Good: "The biggest landmark differences are around..."
- Good: "Try comparing..."
- Avoid: "You missed the mouth."
- Avoid: "The mouth is why you got this wrong."

## UI Changes

Wrong-answer feedback should keep the side-by-side comparison and replace the generic hint with a region-aware hint when available:

```text
Try comparing the mouth shape and jawline.
```

If confidence is low or regions are tied:

```text
Try comparing stable features: eye spacing, nose width, mouth shape, and jawline.
```

Do not show numeric scores to users in the main training flow.

## Tests

Add focused tests:

- `face-differences.ts` normalizes comparison order.
- Missing data returns the generic fallback.
- Top-region selection is deterministic.
- Generated JSON validates against a Zod schema or equivalent TypeScript runtime guard.
- Trial feedback renders without exposing the correct answer before the response.

Keep current face trial tests that ensure choices come from the same identity pair and are unique exact images.

## Validation

Before shipping:

1. Generate debug overlays for 3-5 source pairs.
2. Manually confirm region mappings are plausible.
3. Run `npm run check`.
4. Test wrong-answer feedback on `/onboarding/perception` and `/training`.
5. Confirm feedback never appears after correct answers.
6. Confirm feedback does not change staircase behavior except for the existing post-wrong-answer pause.

## Risks

- Incorrect `.tem` index mapping could give misleading feedback.
- Landmark-only scoring ignores texture changes such as skin tone, shadows, or hairline.
- Too-specific feedback may encourage users to over-focus on one feature rather than holistic face perception.
- More feedback may slow training; keep it brief and only after wrong answers.

## Recommended Rollout

Phase 1:

- Build landmark debug overlay.
- Confirm `.tem` point mapping.
- Generate region-difference JSON.
- Add app fallback helper and tests.

Phase 2:

- Use region-aware hints only on wrong answers.
- Keep generic fallback.
- Deploy behind normal flow, no settings toggle needed.

Phase 3:

- Review whether users benefit from the hints.
- Consider optional "show me why" expanded feedback if the brief hint is not enough.

## Done Definition

Landmark-based feedback is done when:

- Difference JSON is generated reproducibly from checked-in scripts and ignored raw source files.
- Region mapping is documented and visually verified.
- Wrong-answer feedback can name the top differing broad regions.
- The app falls back gracefully when data is missing.
- `npm run check` passes.
- The training staircase and trial generation remain unchanged except for the feedback hint text.
