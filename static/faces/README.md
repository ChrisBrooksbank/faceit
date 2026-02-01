# Face Stimuli for FaceIt

This directory contains face stimuli used for perceptual discrimination training.

## Current Status

**Placeholder SVG files** - The current directory contains 120 geometric placeholder SVG images (20 face pairs × 6 morph levels). These are used for development and testing but should be replaced with real face images for production use.

## Requirements for Real Face Stimuli

According to the MVP specification (docs/mvp-specification.md section 7.4):

- **Minimum 20 unique face identities** (to create 20 pairs)
- **Neutral expression** only
- **Frontal view** only
- **Consistent lighting** across all images
- **Diverse demographics** (age, gender, ethnicity)
- **Format**: Optimized WebP images
- **Naming convention**: `{faceA}_{faceB}_{morphLevel}.webp`
- **Morph levels**: 28%, 40%, 52%, 64%, 76%, 88%

## Recommended Face Databases

### Option 1: Face Research Lab London Set (Recommended)

**Download**: https://figshare.com/articles/dataset/Face_Research_Lab_London_Set/5047666

**Details**:

- 102 adult faces at 1350x1350 pixels in full color
- Template files with 189 coordinate points for morphing
- Compatible with Psychomorph or WebMorph.org
- Self-reported age, gender, and ethnicity data included
- Freely available with appropriate citation

**License**: All individuals gave signed consent for images to be "used in lab-based and web-based studies in their original or altered forms and to illustrate research (e.g., in scientific journals, news media or presentations)."

**Citation**: DeBruine, Lisa; Jones, Benedict (2017): Face Research Lab London Set. figshare. Dataset. https://doi.org/10.6084/m9.figshare.5047666.v3

### Option 2: Utrecht ECVP Face Database

**Download**: Available through PICS database at https://pics.stir.ac.uk/2D_face_sets.htm

**Details**:

- 131 images of 49 men and 20 women
- Usually neutral and smile expressions
- 900x1200 resolution in color
- Collected at European Conference on Visual Perception, Utrecht, 2008

## How to Replace Placeholder Images

### Step 1: Download Face Database

1. Download the Face Research Lab London Set from Figshare (recommended)
2. Extract the archive to a temporary directory
3. Review the included `london_faces_info.csv` for demographic information

### Step 2: Select Face Pairs

Select 40 faces (20 pairs) that:

- Have neutral expressions
- Represent diverse demographics
- Have good quality frontal views
- Have consistent lighting

Document your selections in `metadata.json` (see structure below).

### Step 3: Generate Morph Images

**Option A: Use WebMorph.org (Recommended)**

1. Visit https://webmorph.org/
2. Upload pairs of faces
3. Use the provided template files from the London Set
4. Generate morphs at: 28%, 40%, 52%, 64%, 76%, 88%
5. Download the morphed images

**Option B: Use Psychomorph**

If you have access to Psychomorph software:

1. Import template files from the London Set
2. Create morphs for each pair at required levels
3. Export as high-quality images

### Step 4: Convert to WebP Format

Use the provided conversion script:

```bash
npm run convert-faces
```

This script (in `scripts/convert-to-webp.js`):

- Converts all images to WebP format
- Optimizes file size while maintaining quality
- Renames files to match the naming convention
- Generates/updates metadata.json

### Step 5: Update Metadata

The `metadata.json` file should contain:

```json
{
    "version": "1.0",
    "source": "Face Research Lab London Set",
    "citation": "DeBruine, Lisa; Jones, Benedict (2017): Face Research Lab London Set. figshare. Dataset.",
    "pairs": [
        {
            "id": 1,
            "faceA": {
                "id": "face1",
                "originalId": "001",
                "demographics": {
                    "age": 25,
                    "gender": "female",
                    "ethnicity": "white"
                }
            },
            "faceB": {
                "id": "face2",
                "originalId": "002",
                "demographics": {
                    "age": 28,
                    "gender": "female",
                    "ethnicity": "white"
                }
            },
            "morphLevels": [28, 40, 52, 64, 76, 88]
        }
    ]
}
```

### Step 6: Verify

Run the verification script to ensure all required files are present:

```bash
npm run verify-faces
```

This checks:

- All 120 image files exist (20 pairs × 6 levels)
- Images are in WebP format
- File names follow the convention
- metadata.json is valid and complete

## File Structure

```
static/faces/
├── README.md                    # This file
├── metadata.json                 # Face pair metadata
├── face1_face2_28.webp          # Face pair 1, morph level 28%
├── face1_face2_40.webp          # Face pair 1, morph level 40%
├── face1_face2_52.webp          # Face pair 1, morph level 52%
├── face1_face2_64.webp          # Face pair 1, morph level 64%
├── face1_face2_76.webp          # Face pair 1, morph level 76%
├── face1_face2_88.webp          # Face pair 1, morph level 88%
├── face3_face4_28.webp          # Face pair 2, morph level 28%
...                               # (120 files total)
└── face39_face40_88.webp        # Face pair 20, morph level 88%
```

## Privacy & Ethics

When selecting and using face images:

1. **Consent**: Only use images where individuals have given informed consent for research use
2. **Diversity**: Ensure the face set represents diverse demographics
3. **Attribution**: Properly cite the source database in all publications
4. **Local Storage**: All images stay on the user's device (offline-first PWA)
5. **No tracking**: No face data is ever transmitted to external servers

## Performance Considerations

- **Target file size**: < 50KB per WebP image (cached)
- **Total dataset size**: < 6MB (120 images × 50KB)
- **Loading strategy**: Service worker pre-caches all images on app install
- **Offline support**: All images available offline after first load

## Current Placeholder Information

The current placeholder SVG files:

- Were generated by `scripts/generate-placeholders.js`
- Use geometric shapes and colors to simulate face morphing
- Are suitable for development and testing
- Should NOT be used in production (not realistic faces)
- Can be safely deleted once real images are in place
