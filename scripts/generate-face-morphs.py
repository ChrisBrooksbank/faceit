#!/usr/bin/env python3
"""
Face Morph Generator for FaceIt Training App

This script generates morphed face images for prosopagnosia training.
Uses the Face Research Lab London Set as source faces.

Requirements:
- Python 3.8+
- facemorpher library
- dlib with shape_predictor_68_face_landmarks.dat
- Face Research Lab London Set images

Usage:
    python generate-face-morphs.py --source-dir ./london_faces --output-dir ../static/faces

Download source faces from:
    https://figshare.com/articles/dataset/Face_Research_Lab_London_Set/5047666
"""

import os
import sys
import argparse
import subprocess
from pathlib import Path

# Check for required libraries
try:
    import cv2
    import numpy as np
    from PIL import Image
except ImportError as e:
    print(f"Missing required library: {e}")
    print("Install with: pip install -r requirements-morphing.txt")
    sys.exit(1)

# Try to import facemorpher
try:
    import facemorpher
    HAS_FACEMORPHER = True
except ImportError:
    HAS_FACEMORPHER = False
    print("Warning: facemorpher not available, will use fallback blending")


# Configuration
MORPH_LEVELS = [28, 40, 52, 64, 76, 88]  # Percentage of face A
NUM_PAIRS = 20  # Number of face pairs to generate
OUTPUT_SIZE = (400, 400)  # Target image size
SHAPE_PREDICTOR_PATH = "shape_predictor_68_face_landmarks.dat"


def find_source_faces(source_dir: Path) -> list[Path]:
    """Find neutral front-facing face images in source directory."""
    faces = []

    # Look for common naming patterns in the London Set
    patterns = [
        "*.jpg",
        "*.JPG",
        "*.jpeg",
        "*.png",
    ]

    for pattern in patterns:
        faces.extend(source_dir.glob(pattern))
        # Also check neutral_front subdirectory
        faces.extend(source_dir.glob(f"neutral_front/{pattern}"))

    # Filter to only neutral front faces if directory structure indicates it
    neutral_faces = [f for f in faces if "neutral" in str(f).lower() or len(faces) < 200]

    if neutral_faces:
        faces = neutral_faces

    # Sort for reproducibility
    faces = sorted(set(faces))

    print(f"Found {len(faces)} source face images")
    return faces


def create_face_pairs(faces: list[Path], num_pairs: int) -> list[tuple[Path, Path]]:
    """Create pairs of faces for morphing."""
    if len(faces) < num_pairs * 2:
        print(f"Warning: Only {len(faces)} faces available, need {num_pairs * 2}")
        num_pairs = len(faces) // 2

    pairs = []
    for i in range(num_pairs):
        face_a = faces[i * 2]
        face_b = faces[i * 2 + 1]
        pairs.append((face_a, face_b))

    return pairs


def load_and_preprocess(image_path: Path) -> np.ndarray:
    """Load and preprocess a face image."""
    img = cv2.imread(str(image_path))
    if img is None:
        raise ValueError(f"Could not load image: {image_path}")

    # Resize to output size
    img = cv2.resize(img, OUTPUT_SIZE)

    return img


def morph_faces_facemorpher(face_a_path: Path, face_b_path: Path, alpha: float) -> np.ndarray:
    """
    Generate a morph between two faces using facemorpher.

    Args:
        face_a_path: Path to first face image
        face_b_path: Path to second face image
        alpha: Blend ratio (0.0 = 100% face B, 1.0 = 100% face A)

    Returns:
        Morphed face image as numpy array
    """
    # facemorpher uses a different alpha convention
    # We want alpha to represent the percentage of face A
    result = facemorpher.morpher([str(face_a_path), str(face_b_path)],
                                  alpha=alpha,
                                  out_img=True)
    return result


def morph_faces_blend(face_a: np.ndarray, face_b: np.ndarray, alpha: float) -> np.ndarray:
    """
    Simple alpha blending fallback when facemorpher is not available.

    This is a basic blend without facial landmark alignment, but works
    reasonably well for aligned faces from the London Set.

    Args:
        face_a: First face image
        face_b: Second face image
        alpha: Blend ratio (0.0 = 100% face B, 1.0 = 100% face A)

    Returns:
        Blended face image as numpy array
    """
    return cv2.addWeighted(face_a, alpha, face_b, 1 - alpha, 0)


def generate_morphs(pairs: list[tuple[Path, Path]],
                    output_dir: Path,
                    use_facemorpher: bool = True) -> None:
    """Generate morphed faces for all pairs at all morph levels."""

    output_dir.mkdir(parents=True, exist_ok=True)

    total_morphs = len(pairs) * len(MORPH_LEVELS)
    current = 0

    for pair_idx, (face_a_path, face_b_path) in enumerate(pairs):
        # Load faces for fallback blending
        if not use_facemorpher:
            face_a = load_and_preprocess(face_a_path)
            face_b = load_and_preprocess(face_b_path)

        # Face numbering: pair 0 = face1 & face2, pair 1 = face3 & face4, etc.
        face_a_num = pair_idx * 2 + 1
        face_b_num = pair_idx * 2 + 2

        for morph_level in MORPH_LEVELS:
            current += 1
            alpha = morph_level / 100.0  # Convert percentage to 0-1

            output_filename = f"face{face_a_num}_face{face_b_num}_{morph_level}.jpg"
            output_path = output_dir / output_filename

            print(f"[{current}/{total_morphs}] Generating {output_filename}...")

            try:
                if use_facemorpher and HAS_FACEMORPHER:
                    morphed = morph_faces_facemorpher(face_a_path, face_b_path, alpha)
                else:
                    morphed = morph_faces_blend(face_a, face_b, alpha)

                # Resize to target size
                morphed = cv2.resize(morphed, OUTPUT_SIZE)

                # Save as JPG with good quality
                cv2.imwrite(str(output_path), morphed,
                           [cv2.IMWRITE_JPEG_QUALITY, 90])

            except Exception as e:
                print(f"  Error generating morph: {e}")
                continue

    print(f"\nGenerated {current} morph images in {output_dir}")


def generate_base_faces(pairs: list[tuple[Path, Path]], output_dir: Path) -> None:
    """
    Generate base face images (100% versions) for use as clear references.
    These are the original unmodified faces, used for comparison.
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    for pair_idx, (face_a_path, face_b_path) in enumerate(pairs):
        face_a_num = pair_idx * 2 + 1
        face_b_num = pair_idx * 2 + 2

        # Load and resize
        face_a = load_and_preprocess(face_a_path)
        face_b = load_and_preprocess(face_b_path)

        # Save as 100% versions
        # face1_face1_100 = pure face 1
        # face2_face2_100 = pure face 2
        output_a = output_dir / f"face{face_a_num}_face{face_a_num}_100.jpg"
        output_b = output_dir / f"face{face_b_num}_face{face_b_num}_100.jpg"

        cv2.imwrite(str(output_a), face_a, [cv2.IMWRITE_JPEG_QUALITY, 90])
        cv2.imwrite(str(output_b), face_b, [cv2.IMWRITE_JPEG_QUALITY, 90])

        print(f"Saved base faces: face{face_a_num} and face{face_b_num}")


def main():
    parser = argparse.ArgumentParser(
        description="Generate morphed face images for FaceIt training app"
    )
    parser.add_argument(
        "--source-dir", "-s",
        type=Path,
        required=True,
        help="Directory containing source face images (Face Research Lab London Set)"
    )
    parser.add_argument(
        "--output-dir", "-o",
        type=Path,
        default=Path("../static/faces"),
        help="Output directory for morphed images (default: ../static/faces)"
    )
    parser.add_argument(
        "--num-pairs", "-n",
        type=int,
        default=NUM_PAIRS,
        help=f"Number of face pairs to generate (default: {NUM_PAIRS})"
    )
    parser.add_argument(
        "--no-facemorpher",
        action="store_true",
        help="Use simple alpha blending instead of facemorpher"
    )
    parser.add_argument(
        "--base-faces",
        action="store_true",
        help="Also generate base (100%%) face images"
    )

    args = parser.parse_args()

    # Validate source directory
    if not args.source_dir.exists():
        print(f"Error: Source directory not found: {args.source_dir}")
        sys.exit(1)

    # Find source faces
    faces = find_source_faces(args.source_dir)
    if len(faces) < 2:
        print("Error: Not enough source faces found")
        sys.exit(1)

    # Create face pairs
    pairs = create_face_pairs(faces, args.num_pairs)
    print(f"Created {len(pairs)} face pairs for morphing")

    # Check facemorpher availability
    use_facemorpher = HAS_FACEMORPHER and not args.no_facemorpher
    if use_facemorpher:
        # Check for shape predictor
        if not Path(SHAPE_PREDICTOR_PATH).exists():
            print(f"Warning: {SHAPE_PREDICTOR_PATH} not found")
            print("Download from: http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2")
            print("Falling back to simple blending")
            use_facemorpher = False

    if use_facemorpher:
        print("Using facemorpher for face morphing")
    else:
        print("Using simple alpha blending (faces should be pre-aligned)")

    # Generate morphs
    generate_morphs(pairs, args.output_dir, use_facemorpher)

    # Optionally generate base faces
    if args.base_faces:
        print("\nGenerating base face images...")
        generate_base_faces(pairs, args.output_dir)

    print("\nDone! Face morphs generated successfully.")
    print(f"Output location: {args.output_dir.absolute()}")


if __name__ == "__main__":
    main()
