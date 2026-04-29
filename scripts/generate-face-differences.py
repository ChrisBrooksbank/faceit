#!/usr/bin/env python3
"""
Generate region-level landmark difference data for FaceIt feedback.

The London Set templates used by FaceIt are 189-point Psychomorph `.tem`
files, not the common 68-point dlib schema. This script therefore groups
landmarks into broad regions by normalized coordinate bands within each face
instead of assuming external point indices.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Callable


REGIONS = ["eyes", "brows", "nose", "mouth", "jawline"]
REGION_VERSION = "coordinate-band-v1"

Point = tuple[float, float]
RegionRule = Callable[[float, float], bool]


def read_template(path: Path) -> list[Point]:
    lines = path.read_text(encoding="utf-8").strip().splitlines()
    declared_count = int(lines[0])
    points: list[Point] = []

    for line in lines[1 : declared_count + 1]:
        x_text, y_text = line.split()[:2]
        points.append((float(x_text), float(y_text)))

    if len(points) != declared_count:
        raise ValueError(f"{path} declared {declared_count} points but contained {len(points)}")

    return points


def normalize_points(points: list[Point]) -> list[Point]:
    xs = [point[0] for point in points]
    ys = [point[1] for point in points]
    min_x = min(xs)
    max_x = max(xs)
    min_y = min(ys)
    max_y = max(ys)
    width = max(max_x - min_x, 1.0)
    height = max(max_y - min_y, 1.0)

    return [((x - min_x) / width, (y - min_y) / height) for x, y in points]


def region_rules() -> dict[str, RegionRule]:
    return {
        "eyes": lambda x, y: 0.16 <= y <= 0.55
        and ((0.08 <= x <= 0.43) or (0.57 <= x <= 0.92)),
        "brows": lambda x, y: 0.04 <= y <= 0.38
        and ((0.08 <= x <= 0.46) or (0.54 <= x <= 0.92)),
        "nose": lambda x, y: 0.34 <= x <= 0.66 and 0.34 <= y <= 0.70,
        "mouth": lambda x, y: 0.24 <= x <= 0.76 and 0.58 <= y <= 0.86,
        "jawline": lambda x, y: y >= 0.72 or (y >= 0.54 and (x <= 0.18 or x >= 0.82)),
    }


def region_indices(points_a: list[Point], points_b: list[Point]) -> dict[str, list[int]]:
    mean_points = [((a[0] + b[0]) / 2, (a[1] + b[1]) / 2) for a, b in zip(points_a, points_b)]
    normalized = normalize_points(mean_points)
    rules = region_rules()
    mapped: dict[str, list[int]] = {}

    for region, rule in rules.items():
        mapped[region] = [index for index, (x, y) in enumerate(normalized) if rule(x, y)]

    empty_regions = [region for region, indices in mapped.items() if not indices]
    if empty_regions:
        raise ValueError(f"No template points found for regions: {', '.join(empty_regions)}")

    return mapped


def face_diagonal(points_a: list[Point], points_b: list[Point]) -> float:
    points = points_a + points_b
    xs = [point[0] for point in points]
    ys = [point[1] for point in points]
    width = max(xs) - min(xs)
    height = max(ys) - min(ys)
    return max(math.hypot(width, height), 1.0)


def morphed_points(points_a: list[Point], points_b: list[Point], morph_level: int) -> list[Point]:
    alpha = morph_level / 100
    return [
        (alpha * a[0] + (1 - alpha) * b[0], alpha * a[1] + (1 - alpha) * b[1])
        for a, b in zip(points_a, points_b)
    ]


def region_scores(
    points_a: list[Point],
    points_b: list[Point],
    regions: dict[str, list[int]],
    level_a: int,
    level_b: int,
) -> dict[str, float]:
    morphed_a = morphed_points(points_a, points_b, level_a)
    morphed_b = morphed_points(points_a, points_b, level_b)
    normalizer = face_diagonal(points_a, points_b)
    scores: dict[str, float] = {}

    for region, indices in regions.items():
        distances = [
            math.hypot(
                morphed_a[index][0] - morphed_b[index][0],
                morphed_a[index][1] - morphed_b[index][1],
            )
            / normalizer
            for index in indices
        ]
        scores[region] = round(sum(distances) / len(distances), 5)

    return scores


def top_regions(scores: dict[str, float]) -> list[str]:
    ranked = sorted(scores, key=lambda region: (-scores[region], region))
    if len(ranked) < 2:
        return ranked

    strongest = scores[ranked[0]]
    if strongest <= 0:
        return [ranked[0]]

    if scores[ranked[1]] >= strongest * 0.75:
        return ranked[:2]

    return ranked[:1]


def comparison_key(face_a: str, face_b: str) -> str:
    return "__".join(sorted([face_a, face_b]))


def template_path(source_dir: Path, source_id: str) -> Path:
    return source_dir / f"{source_id}_03.tem"


def build_differences(source_dir: Path, metadata: dict) -> dict:
    comparisons: dict[str, dict] = {}
    region_counts: dict[str, list[int]] = {region: [] for region in REGIONS}

    for pair in metadata["facePairs"]:
        points_a = read_template(template_path(source_dir, pair["sourceFaceA"]))
        points_b = read_template(template_path(source_dir, pair["sourceFaceB"]))
        if len(points_a) != len(points_b):
            raise ValueError(f"Template point count mismatch for pair {pair['id']}")

        regions = region_indices(points_a, points_b)
        for region, indices in regions.items():
            region_counts[region].append(len(indices))

        levels = pair["morphLevels"]
        for start_index, level_a in enumerate(levels):
            for level_b in levels[start_index + 1 :]:
                face_a = f"{pair['faceA']}_{pair['faceB']}_{level_a}"
                face_b = f"{pair['faceA']}_{pair['faceB']}_{level_b}"
                scores = region_scores(points_a, points_b, regions, level_a, level_b)
                comparisons[comparison_key(face_a, face_b)] = {
                    "topRegions": top_regions(scores),
                    "scores": scores,
                }

    return {
        "version": "1.0",
        "method": "landmark-region-distance",
        "regionMapping": REGION_VERSION,
        "source": metadata["source"],
        "sourceVersion": metadata["sourceVersion"],
        "morphLevels": metadata["morphLevels"],
        "regions": REGIONS,
        "regionPointCounts": {
            region: {
                "min": min(counts),
                "max": max(counts),
                "average": round(sum(counts) / len(counts), 2),
            }
            for region, counts in region_counts.items()
        },
        "comparisons": comparisons,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate FaceIt landmark difference feedback data")
    parser.add_argument(
        "--source-dir",
        type=Path,
        default=Path(".face-source/neutral_front/neutral_front"),
    )
    parser.add_argument("--metadata", type=Path, default=Path("static/faces/metadata.json"))
    parser.add_argument("--output", type=Path, default=Path("src/lib/data/face-differences.json"))
    args = parser.parse_args()

    metadata = json.loads(args.metadata.read_text(encoding="utf-8"))
    differences = build_differences(args.source_dir, metadata)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(differences, indent=4) + "\n", encoding="utf-8")

    print(f"Wrote {len(differences['comparisons'])} landmark comparisons to {args.output}")


if __name__ == "__main__":
    main()
