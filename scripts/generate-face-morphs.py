#!/usr/bin/env python3
"""
Generate FaceIt morph stimuli from the Face Research Lab London Set.

This script uses the London Set neutral-front JPGs and their Psychomorph
template coordinate files. It performs a deterministic piecewise-affine
shape morph, then blends texture at each configured morph level. Each result is
cropped to an elliptical inner-face mask so hair and clothing (which morph into
ghosted overlays whose opacity leaks the morph level) are not part of the stimulus.

It intentionally depends only on Pillow from the bundled workspace runtime.
Raw source images should live outside git, for example:

    .face-source/neutral_front/neutral_front/*.jpg
    .face-source/neutral_front/neutral_front/*.tem
    .face-source/london_faces_info.csv

Usage:
    python scripts/generate-face-morphs.py \
        --source-dir .face-source/neutral_front/neutral_front \
        --info-csv .face-source/london_faces_info.csv \
        --output-dir static/faces
"""

from __future__ import annotations

import argparse
import csv
import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFilter


MORPH_LEVELS = [28, 40, 52, 64, 76, 88]
NUM_PAIRS = 20
BOUNDARY_POINTS = 8  # frame points appended by read_template
OUTPUT_SIZE = 400
BACKGROUND = (214, 217, 217)
FACE_TOP_FRACTION = 0.86  # share of the landmark height (chin up) kept inside the face mask
FACE_SIDE_MARGIN = 0.86
SEED = "faceit-london-set-v5-2026-04"
ARTICLE_URL = "https://figshare.com/articles/dataset/Face_Research_Lab_London_Set/5047666/5"
DOI = "10.6084/m9.figshare.5047666.v5"
LICENSE = "CC BY 4.0"
CITATION = (
    "DeBruine, Lisa; Jones, Benedict (2017). Face Research Lab London Set. "
    "figshare. Dataset. https://doi.org/10.6084/m9.figshare.5047666.v5"
)


@dataclass(frozen=True)
class SourceFace:
    source_id: str
    image_path: Path
    template_path: Path
    age: int | None
    gender: str
    ethnicity: str


@dataclass(frozen=True)
class FacePair:
    index: int
    face_a_number: int
    face_b_number: int
    face_a: SourceFace
    face_b: SourceFace


def read_source_info(info_csv: Path) -> dict[str, dict[str, str]]:
    with info_csv.open(newline="", encoding="utf-8-sig") as handle:
        return {row["face_id"]: row for row in csv.DictReader(handle)}


def parse_age(value: str | None) -> int | None:
    if not value:
        return None
    try:
        return int(value)
    except ValueError:
        return None


def discover_faces(source_dir: Path, info_csv: Path) -> list[SourceFace]:
    info = read_source_info(info_csv)
    faces: list[SourceFace] = []

    for image_path in sorted(source_dir.glob("*_03.jpg")):
        source_id = image_path.stem.split("_", maxsplit=1)[0]
        template_path = image_path.with_suffix(".tem")
        row = info.get(source_id)
        if not row or not template_path.exists():
            continue

        faces.append(
            SourceFace(
                source_id=source_id,
                image_path=image_path,
                template_path=template_path,
                age=parse_age(row.get("face_age")),
                gender=row.get("face_gender", ""),
                ethnicity=row.get("face_eth", ""),
            )
        )

    return faces


def age_difference(face_a: SourceFace, face_b: SourceFace) -> int:
    if face_a.age is None or face_b.age is None:
        return 99
    return abs(face_a.age - face_b.age)


def select_pairs(faces: list[SourceFace], num_pairs: int) -> list[FacePair]:
    groups: dict[tuple[str, str], list[SourceFace]] = {}
    for face in faces:
        groups.setdefault((face.gender, face.ethnicity), []).append(face)

    for group in groups.values():
        group.sort(key=lambda face: (face.age is None, face.age or 999, face.source_id))

    selected: list[tuple[SourceFace, SourceFace]] = []
    used: set[str] = set()

    while len(selected) < num_pairs:
        made_pair = False
        for key in sorted(groups, key=lambda item: (-len(groups[item]), item)):
            available = [face for face in groups[key] if face.source_id not in used]
            if len(available) < 2:
                continue

            best = min(
                ((a, b) for i, a in enumerate(available) for b in available[i + 1 :]),
                key=lambda pair: (age_difference(pair[0], pair[1]), pair[0].source_id, pair[1].source_id),
            )
            selected.append(best)
            used.update([best[0].source_id, best[1].source_id])
            made_pair = True

            if len(selected) >= num_pairs:
                break

        if not made_pair:
            break

    if len(selected) < num_pairs:
        candidates = [face for face in faces if face.source_id not in used]
        candidates.sort(key=lambda face: (face.gender, face.ethnicity, face.age or 999, face.source_id))
        for i in range(0, len(candidates) - 1, 2):
            selected.append((candidates[i], candidates[i + 1]))
            if len(selected) >= num_pairs:
                break

    pairs: list[FacePair] = []
    for index, (face_a, face_b) in enumerate(selected[:num_pairs]):
        pairs.append(
            FacePair(
                index=index + 1,
                face_a_number=index * 2 + 1,
                face_b_number=index * 2 + 2,
                face_a=face_a,
                face_b=face_b,
            )
        )

    return pairs


def read_template(path: Path, image_size: int) -> list[tuple[float, float]]:
    lines = path.read_text(encoding="utf-8").strip().splitlines()
    declared_count = int(lines[0])
    points = []
    scale = image_size / 1350

    for line in lines[1 : declared_count + 1]:
        x_text, y_text = line.split()[:2]
        points.append((float(x_text) * scale, float(y_text) * scale))

    if len(points) != declared_count:
        raise ValueError(f"{path} declared {declared_count} points but contained {len(points)}")

    edge = image_size - 1
    boundary = [
        (0.0, 0.0),
        (edge / 2, 0.0),
        (edge, 0.0),
        (edge, edge / 2),
        (edge, edge),
        (edge / 2, edge),
        (0.0, edge),
        (0.0, edge / 2),
    ]
    return points + boundary


def circumcircle(triangle: tuple[int, int, int], points: list[tuple[float, float]]) -> tuple[float, float, float]:
    ax, ay = points[triangle[0]]
    bx, by = points[triangle[1]]
    cx, cy = points[triangle[2]]
    determinant = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))

    if abs(determinant) < 1e-9:
        return (0.0, 0.0, -1.0)

    ux = (
        (ax * ax + ay * ay) * (by - cy)
        + (bx * bx + by * by) * (cy - ay)
        + (cx * cx + cy * cy) * (ay - by)
    ) / determinant
    uy = (
        (ax * ax + ay * ay) * (cx - bx)
        + (bx * bx + by * by) * (ax - cx)
        + (cx * cx + cy * cy) * (bx - ax)
    ) / determinant
    radius_squared = (ux - ax) ** 2 + (uy - ay) ** 2
    return (ux, uy, radius_squared)


def in_circumcircle(point: tuple[float, float], circle: tuple[float, float, float]) -> bool:
    x, y = point
    cx, cy, radius_squared = circle
    if radius_squared < 0:
        return False
    return (x - cx) ** 2 + (y - cy) ** 2 <= radius_squared + 1e-6


def triangulate(points: list[tuple[float, float]]) -> list[tuple[int, int, int]]:
    min_x = min(x for x, _ in points)
    max_x = max(x for x, _ in points)
    min_y = min(y for _, y in points)
    max_y = max(y for _, y in points)
    delta = max(max_x - min_x, max_y - min_y) * 20
    mid_x = (min_x + max_x) / 2
    mid_y = (min_y + max_y) / 2

    all_points = points + [
        (mid_x - delta, mid_y - delta),
        (mid_x, mid_y + delta),
        (mid_x + delta, mid_y - delta),
    ]
    super_indices = {len(points), len(points) + 1, len(points) + 2}
    triangles: list[tuple[int, int, int]] = [(len(points), len(points) + 1, len(points) + 2)]

    for point_index, point in enumerate(points):
        bad_triangles = [
            triangle for triangle in triangles if in_circumcircle(point, circumcircle(triangle, all_points))
        ]
        edge_counts: dict[tuple[int, int], int] = {}

        for triangle in bad_triangles:
            for edge in [(triangle[0], triangle[1]), (triangle[1], triangle[2]), (triangle[2], triangle[0])]:
                normalized = tuple(sorted(edge))
                edge_counts[normalized] = edge_counts.get(normalized, 0) + 1

        triangles = [triangle for triangle in triangles if triangle not in bad_triangles]
        boundary_edges = [edge for edge, count in edge_counts.items() if count == 1]
        triangles.extend((edge[0], edge[1], point_index) for edge in boundary_edges)

    return [triangle for triangle in triangles if not any(index in super_indices for index in triangle)]


def affine_coefficients(
    source: list[tuple[float, float]], destination: list[tuple[float, float]]
) -> tuple[float, float, float, float, float, float] | None:
    (x1, y1), (x2, y2), (x3, y3) = destination
    (u1, v1), (u2, v2), (u3, v3) = source
    determinant = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)

    if abs(determinant) < 1e-9:
        return None

    a = (u1 * (y2 - y3) + u2 * (y3 - y1) + u3 * (y1 - y2)) / determinant
    b = (u1 * (x3 - x2) + u2 * (x1 - x3) + u3 * (x2 - x1)) / determinant
    c = (
        u1 * (x2 * y3 - x3 * y2)
        + u2 * (x3 * y1 - x1 * y3)
        + u3 * (x1 * y2 - x2 * y1)
    ) / determinant
    d = (v1 * (y2 - y3) + v2 * (y3 - y1) + v3 * (y1 - y2)) / determinant
    e = (v1 * (x3 - x2) + v2 * (x1 - x3) + v3 * (x2 - x1)) / determinant
    f = (
        v1 * (x2 * y3 - x3 * y2)
        + v2 * (x3 * y1 - x1 * y3)
        + v3 * (x1 * y2 - x2 * y1)
    ) / determinant
    return (a, b, c, d, e, f)


def bounding_box(points: Iterable[tuple[float, float]], image_size: int) -> tuple[int, int, int, int] | None:
    xs = [x for x, _ in points]
    ys = [y for _, y in points]
    left = max(0, math.floor(min(xs)) - 1)
    top = max(0, math.floor(min(ys)) - 1)
    right = min(image_size, math.ceil(max(xs)) + 2)
    bottom = min(image_size, math.ceil(max(ys)) + 2)
    if right <= left or bottom <= top:
        return None
    return (left, top, right, bottom)


def warp_image(
    image: Image.Image,
    source_points: list[tuple[float, float]],
    destination_points: list[tuple[float, float]],
    triangles: list[tuple[int, int, int]],
    image_size: int,
) -> Image.Image:
    output = Image.new("RGB", (image_size, image_size), (245, 245, 245))

    for triangle in triangles:
        source_triangle = [source_points[index] for index in triangle]
        destination_triangle = [destination_points[index] for index in triangle]
        bbox = bounding_box(destination_triangle, image_size)
        coefficients = affine_coefficients(source_triangle, destination_triangle)
        if bbox is None or coefficients is None:
            continue

        left, top, right, bottom = bbox
        width = right - left
        height = bottom - top
        a, b, c, d, e, f = coefficients
        adjusted = (a, b, c + a * left + b * top, d, e, f + d * left + e * top)

        patch = image.transform((width, height), Image.Transform.AFFINE, adjusted, Image.Resampling.BICUBIC)
        mask = Image.new("L", (width, height), 0)
        local_triangle = [(x - left, y - top) for x, y in destination_triangle]
        ImageDraw.Draw(mask).polygon(local_triangle, fill=255)
        output.paste(patch, (left, top), mask)

    return output


def load_face(path: Path, image_size: int) -> Image.Image:
    return Image.open(path).convert("RGB").resize((image_size, image_size), Image.Resampling.LANCZOS)


def face_geometry(points: list[tuple[float, float]]) -> tuple[float, float, float, float]:
    """Return (center_x, top, chin, half_width) of the inner face from landmarks."""
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    chin = max(ys)
    top = chin - (chin - min(ys)) * FACE_TOP_FRACTION
    center_x = (min(xs) + max(xs)) / 2
    half_width = (max(xs) - min(xs)) / 2 * FACE_SIDE_MARGIN
    return center_x, top, chin, half_width


def isolate_face(image: Image.Image, landmarks: list[tuple[float, float]]) -> Image.Image:
    """Crop to the inner face (no hair, ears or clothing) on a neutral background.

    Hair and clothing blend into ghosted overlays in a morph, and their opacity changes
    with the morph level, which would let people answer without looking at the face.
    The crop is normalised from the landmarks, so features land in similar places in
    every output image (the app relies on this to highlight regions).
    """
    size = image.width
    center_x, top, chin, half_width = face_geometry(landmarks)
    center_y = (top + chin) / 2
    half_height = (chin - top) / 2 * 1.04
    half = max(half_width, half_height)
    box = (center_x - half, center_y - half, center_x + half, center_y + half)
    crop = image.crop(tuple(round(v) for v in box)).resize((size, size), Image.Resampling.LANCZOS)
    scale = size / (2 * half)

    mask = Image.new("L", (size, size), 0)
    cx, cy = size / 2, (center_y - box[1]) * scale
    rx, ry = half_width * scale, half_height * scale
    ImageDraw.Draw(mask).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(size * 0.012))
    output = Image.new("RGB", (size, size), BACKGROUND)
    output.paste(crop, (0, 0), mask)

    return output


def morph_pair(pair: FacePair, output_dir: Path, image_size: int) -> list[str]:
    image_a = load_face(pair.face_a.image_path, image_size)
    image_b = load_face(pair.face_b.image_path, image_size)
    points_a = read_template(pair.face_a.template_path, image_size)
    points_b = read_template(pair.face_b.template_path, image_size)
    mean_points = [((a[0] + b[0]) / 2, (a[1] + b[1]) / 2) for a, b in zip(points_a, points_b)]
    triangles = triangulate(mean_points)
    files: list[str] = []

    for level in MORPH_LEVELS:
        alpha = level / 100
        destination_points = [
            (alpha * a[0] + (1 - alpha) * b[0], alpha * a[1] + (1 - alpha) * b[1])
            for a, b in zip(points_a, points_b)
        ]
        warped_a = warp_image(image_a, points_a, destination_points, triangles, image_size)
        warped_b = warp_image(image_b, points_b, destination_points, triangles, image_size)
        morphed = isolate_face(
            Image.blend(warped_b, warped_a, alpha), destination_points[:-BOUNDARY_POINTS]
        )
        filename = f"face{pair.face_a_number}_face{pair.face_b_number}_{level}.jpg"
        morphed.save(output_dir / filename, format="JPEG", quality=88, optimize=True, progressive=True)
        files.append(filename)

    return files


def build_metadata(pairs: list[FacePair], generated_files: dict[int, list[str]], image_size: int) -> dict:
    metadata = {
        "version": "2.0",
        "source": "Face Research Lab London Set",
        "sourceVersion": 5,
        "sourceUrl": ARTICLE_URL,
        "doi": DOI,
        "license": LICENSE,
        "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
        "citation": CITATION,
        "isPlaceholder": False,
        "isProduction": True,
        "generation": {
            "method": "piecewise-affine template morph with texture blend, masked to the inner face",
            "script": "scripts/generate-face-morphs.py",
            "seed": SEED,
            "outputSize": [image_size, image_size],
            "morphLevels": MORPH_LEVELS,
            "sourceView": "neutral_front",
        },
        "facePairs": [
            {
                "id": pair.index,
                "faceA": f"face{pair.face_a_number}",
                "faceB": f"face{pair.face_b_number}",
                "sourceFaceA": pair.face_a.source_id,
                "sourceFaceB": pair.face_b.source_id,
                "morphLevels": MORPH_LEVELS,
                "files": generated_files[pair.index],
            }
            for pair in pairs
        ],
        "totalPairs": len(pairs),
        "totalMorphLevels": len(MORPH_LEVELS),
        "totalImages": len(pairs) * len(MORPH_LEVELS),
        "morphLevels": MORPH_LEVELS,
        "imageFormat": "jpg",
        "imageSize": [image_size, image_size],
    }
    return metadata


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=4) + "\n", encoding="utf-8")


def write_source_pairs(output_dir: Path, pairs: list[FacePair]) -> None:
    source_pairs = {
        "version": "1.0",
        "selectionSeed": SEED,
        "selectionRules": [
            "Use only neutral-front source images with matching template files.",
            "Prefer same self-reported gender and ethnicity groups.",
            "Within each group, prefer closest self-reported age.",
            "Round-robin across available groups to avoid selecting only the largest group.",
        ],
        "pairs": [
            {
                "id": pair.index,
                "faceA": f"face{pair.face_a_number}",
                "faceB": f"face{pair.face_b_number}",
                "sourceFaceA": pair.face_a.source_id,
                "sourceFaceB": pair.face_b.source_id,
            }
            for pair in pairs
        ],
    }
    (output_dir / "source-pairs.json").write_text(json.dumps(source_pairs, indent=4) + "\n", encoding="utf-8")


def write_contact_sheet(output_dir: Path, pairs: list[FacePair], image_size: int) -> None:
    thumb_size = 72
    padding = 8
    width = len(MORPH_LEVELS) * (thumb_size + padding) + padding
    height = len(pairs) * (thumb_size + padding) + padding
    sheet = Image.new("RGB", (width, height), (255, 255, 255))

    for row, pair in enumerate(pairs):
        for col, level in enumerate(MORPH_LEVELS):
            filename = f"face{pair.face_a_number}_face{pair.face_b_number}_{level}.jpg"
            image = Image.open(output_dir / filename).convert("RGB")
            image.thumbnail((thumb_size, thumb_size), Image.Resampling.LANCZOS)
            x = padding + col * (thumb_size + padding)
            y = padding + row * (thumb_size + padding)
            sheet.paste(image, (x, y))

    sheet.save(output_dir / "contact-sheet.jpg", format="JPEG", quality=85, optimize=True)


def clear_existing_outputs(output_dir: Path) -> None:
    for path in output_dir.glob("face*_face*_*.jpg"):
        path.unlink()


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate FaceIt face morph stimuli")
    parser.add_argument("--source-dir", type=Path, required=True)
    parser.add_argument("--info-csv", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, default=Path("static/faces"))
    parser.add_argument("--runtime-metadata", type=Path, default=Path("src/lib/data/face-metadata.json"))
    parser.add_argument("--num-pairs", type=int, default=NUM_PAIRS)
    parser.add_argument("--size", type=int, default=OUTPUT_SIZE)
    parser.add_argument("--contact-sheet", action="store_true")
    args = parser.parse_args()

    if not args.source_dir.exists():
        raise SystemExit(f"Source directory not found: {args.source_dir}")
    if not args.info_csv.exists():
        raise SystemExit(f"Info CSV not found: {args.info_csv}")

    args.output_dir.mkdir(parents=True, exist_ok=True)
    faces = discover_faces(args.source_dir, args.info_csv)
    pairs = select_pairs(faces, args.num_pairs)
    if len(pairs) < args.num_pairs:
        raise SystemExit(f"Only selected {len(pairs)} pairs; need {args.num_pairs}")

    clear_existing_outputs(args.output_dir)
    generated_files: dict[int, list[str]] = {}
    for pair in pairs:
        print(
            f"[{pair.index}/{len(pairs)}] "
            f"{pair.face_a.source_id} -> face{pair.face_a_number}, "
            f"{pair.face_b.source_id} -> face{pair.face_b_number}"
        )
        generated_files[pair.index] = morph_pair(pair, args.output_dir, args.size)

    metadata = build_metadata(pairs, generated_files, args.size)
    write_json(args.output_dir / "metadata.json", metadata)
    write_json(args.runtime_metadata, metadata)
    write_source_pairs(args.output_dir, pairs)
    if args.contact_sheet:
        write_contact_sheet(args.output_dir, pairs, args.size)

    print(f"Generated {len(pairs) * len(MORPH_LEVELS)} real morph images in {args.output_dir}")


if __name__ == "__main__":
    main()
