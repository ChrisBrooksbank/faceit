# Face Morphs: Next Steps

## Current State

The app now uses JPG face images instead of SVG placeholders. Currently, placeholder JPG images are being used that show stylized colored faces with morph level indicators. These are suitable for development but not for actual prosopagnosia training.

## Goal

Replace placeholder images with real morphed face images from the Face Research Lab London Set for effective prosopagnosia training.

## Implementation Steps

### Step 1: Download Face Research Lab London Set

1. Go to: https://figshare.com/articles/dataset/Face_Research_Lab_London_Set/5047666
2. Download the dataset (~500MB)
3. Extract the `neutral_front` folder containing neutral expression faces
4. Place in project root as `london_faces/` directory

### Step 2: Set Up Python Environment

```bash
# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r scripts/requirements-morphing.txt

# Download dlib shape predictor model
# From: http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2
# Extract and place in scripts/ directory
```

### Step 3: Generate Morphed Faces

```bash
python scripts/generate-face-morphs.py --source-dir ./london_faces -o ./static/faces
```

This will:

- Select 20 face pairs from the 102 available faces
- Generate morphs at 6 levels: 28%, 40%, 52%, 64%, 76%, 88%
- Output 120 JPG files (400x400px) to `static/faces/`

### Step 4: Verify Results

```bash
npm run dev
```

1. Navigate to `/onboarding/perception`
2. Verify real face images display correctly
3. Complete all 6 perception test trials
4. Navigate to `/training` and verify faces load correctly
5. Run `npm run check` to ensure no broken references

## Files Involved

- `scripts/generate-face-morphs.py` - Main morphing script
- `scripts/requirements-morphing.txt` - Python dependencies
- `static/faces/*.jpg` - Output face images (120 files)

## Technical Notes

- The facemorpher library uses dlib for facial landmark detection
- If facemorpher is not available, the script falls back to simple alpha blending
- The Face Research Lab London Set faces are pre-aligned, so blending works reasonably well
- Images are saved as 90% quality JPEG at 400x400px

## Verification Checklist

- [ ] Downloaded Face Research Lab London Set
- [ ] Installed Python dependencies
- [ ] Downloaded shape_predictor_68_face_landmarks.dat
- [ ] Ran generate-face-morphs.py successfully
- [ ] Verified 120 JPG files in static/faces/
- [ ] Tested perception test at /onboarding/perception
- [ ] Tested training session at /training
- [ ] All npm run check passes
