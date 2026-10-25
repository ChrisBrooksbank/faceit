"""Compute per-image facial region boxes for the mistake-feedback highlights.

Runs the MediaPipe face landmarker on every stimulus in static/faces and writes
src/lib/data/region-boxes.json: { "<image id>": { "<region>": [left, top, right, bottom] } }
as fractions of the image. Images where no face is detected are omitted; the app falls
back to the fixed REGION_BOXES in src/lib/core/face-differences.ts for them.

Usage: python scripts/compute-region-boxes.py [--landmarker-model PATH]
Requires: pip install mediapipe
"""

import argparse
import json
from pathlib import Path

REGION_LANDMARKS = {
    "brows": [70, 63, 105, 66, 107, 55, 46, 300, 293, 334, 296, 336, 285, 276],
    "eyes": [33, 133, 159, 145, 160, 144, 362, 263, 386, 374, 385, 380],
    "nose": [6, 98, 327, 129, 358, 49, 279, 2, 1],
    "mouth": [61, 291, 0, 17, 37, 267, 84, 314, 91, 321],
    "jawline": [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323],
}
PADDING = 0.03


def region_box(points: list[tuple[float, float]], indices: list[int]) -> list[float]:
    xs = [points[i][0] for i in indices]
    ys = [points[i][1] for i in indices]
    box = [min(xs) - PADDING, min(ys) - PADDING, max(xs) + PADDING, max(ys) + PADDING]
    return [round(min(max(v, 0.0), 1.0), 3) for v in box]


def main() -> None:
    import mediapipe as mp
    from mediapipe.tasks.python import BaseOptions, vision

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--faces-dir", type=Path, default=Path("static/faces"))
    parser.add_argument("--output", type=Path, default=Path("src/lib/data/region-boxes.json"))
    parser.add_argument(
        "--landmarker-model", type=Path, default=Path(".face-source/models/face_landmarker.task")
    )
    args = parser.parse_args()

    options = vision.FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=str(args.landmarker_model)), num_faces=1
    )
    detector = vision.FaceLandmarker.create_from_options(options)
    boxes: dict[str, dict[str, list[float]]] = {}
    missing: list[str] = []

    for path in sorted(args.faces_dir.glob("face*_face*_*.jpg")):
        result = detector.detect(mp.Image.create_from_file(str(path)))
        if not result.face_landmarks:
            missing.append(path.stem)
            continue
        points = [(p.x, p.y) for p in result.face_landmarks[0]]
        boxes[path.stem] = {
            region: region_box(points, indices) for region, indices in REGION_LANDMARKS.items()
        }

    args.output.write_text(json.dumps(boxes, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Wrote {len(boxes)} images to {args.output}; no face detected in {len(missing)}")
    for stem in missing:
        print(f"  missing: {stem}")


if __name__ == "__main__":
    main()
