#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

/**
 * Generate placeholder face stimuli for FaceIt MVP
 *
 * Creates:
 * - 20 identity pairs (40 unique faces)
 * - 6 morph levels per pair: 28%, 40%, 52%, 64%, 76%, 88%
 * - Total: 120 morph images as SVG files
 *
 * Naming convention: face{A}_face{B}_{morphLevel}.svg
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Face ID pairs (20 pairs = 40 unique identities)
const FACE_PAIRS = [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [9, 10],
    [11, 12],
    [13, 14],
    [15, 16],
    [17, 18],
    [19, 20],
    [21, 22],
    [23, 24],
    [25, 26],
    [27, 28],
    [29, 30],
    [31, 32],
    [33, 34],
    [35, 36],
    [37, 38],
    [39, 40],
];

// Morph levels (target percentage)
const MORPH_LEVELS = [28, 40, 52, 64, 76, 88];

// Output directory
const FACES_DIR = join(__dirname, '..', 'static', 'faces');

/**
 * Generate a distinctive SVG face with geometric patterns
 */
function generateFaceSVG(faceId, morphLevel, targetId, distractorId) {
    // Calculate blend ratio
    const targetRatio = morphLevel / 100;
    const distractorRatio = 1 - targetRatio;

    // Generate colors based on face IDs
    const hue1 = (targetId * 137) % 360;
    const hue2 = (distractorId * 137) % 360;
    const blendedHue = hue1 * targetRatio + hue2 * distractorRatio;

    // Pattern selection based on face IDs
    const pattern1 = targetId % 5;
    const pattern2 = distractorId % 5;
    const blendedPattern = Math.round(pattern1 * targetRatio + pattern2 * distractorRatio);

    // Generate face shape variations
    const faceShape1 = 100 + (targetId % 20);
    const faceShape2 = 100 + (distractorId % 20);
    const blendedFaceShape = faceShape1 * targetRatio + faceShape2 * distractorRatio;

    // Eye spacing variations
    const eyeSpacing1 = 60 + (targetId % 30);
    const eyeSpacing2 = 60 + (distractorId % 30);
    const blendedEyeSpacing = eyeSpacing1 * targetRatio + eyeSpacing2 * distractorRatio;

    // Build SVG
    const svg = `<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="300" height="400" fill="#f5f5f5"/>

  <!-- Face outline -->
  <ellipse cx="150" cy="200" rx="${blendedFaceShape}" ry="140"
           fill="hsl(${blendedHue}, 70%, 85%)"
           stroke="hsl(${blendedHue}, 50%, 60%)" stroke-width="2"/>

  <!-- Eyes -->
  <ellipse cx="${150 - blendedEyeSpacing / 2}" cy="180" rx="15" ry="20" fill="#333"/>
  <ellipse cx="${150 + blendedEyeSpacing / 2}" cy="180" rx="15" ry="20" fill="#333"/>

  <!-- Nose -->
  <path d="M 150 200 L ${145 + (targetId % 10)} 220 L ${155 - (distractorId % 10)} 220 Z"
        fill="hsl(${blendedHue}, 50%, 70%)"/>

  <!-- Mouth -->
  <ellipse cx="150" cy="260" rx="30" ry="${10 + blendedPattern * 2}"
           fill="hsl(${blendedHue}, 60%, 65%)"/>

  <!-- Pattern overlay (distinctive feature) -->
  ${generatePattern(blendedPattern, blendedHue)}

  <!-- Debug text (morphLevel indicator) -->
  <text x="150" y="380" text-anchor="middle" font-size="12" fill="#999">
    ${morphLevel}% morph
  </text>
</svg>`;

    return svg;
}

/**
 * Generate distinctive pattern based on face characteristics
 */
function generatePattern(patternType, hue) {
    const patterns = [
        // Pattern 0: Dots on cheeks
        `<circle cx="100" cy="210" r="8" fill="hsl(${hue}, 80%, 75%)" opacity="0.6"/>
     <circle cx="200" cy="210" r="8" fill="hsl(${hue}, 80%, 75%)" opacity="0.6"/>`,

        // Pattern 1: Eyebrows
        `<rect x="120" y="160" width="25" height="4" fill="#333" rx="2"/>
     <rect x="155" y="160" width="25" height="4" fill="#333" rx="2"/>`,

        // Pattern 2: Hair
        `<path d="M 50 140 Q 100 100 150 120 Q 200 100 250 140"
              fill="hsl(${(hue + 180) % 360}, 40%, 30%)" opacity="0.8"/>`,

        // Pattern 3: Freckles
        `<circle cx="120" cy="200" r="2" fill="#8b4513"/>
     <circle cx="130" cy="205" r="2" fill="#8b4513"/>
     <circle cx="170" cy="200" r="2" fill="#8b4513"/>
     <circle cx="180" cy="205" r="2" fill="#8b4513"/>`,

        // Pattern 4: Face lines
        `<line x1="100" y1="230" x2="110" y2="240" stroke="#999" stroke-width="1"/>
     <line x1="200" y1="230" x2="190" y2="240" stroke="#999" stroke-width="1"/>`,
    ];

    return patterns[Math.floor(patternType) % patterns.length];
}

/**
 * Generate all face stimuli
 */
function generateAllStimuli() {
    console.log('Generating placeholder face stimuli...\n');

    let count = 0;

    for (const [faceA, faceB] of FACE_PAIRS) {
        for (const morphLevel of MORPH_LEVELS) {
            const filename = `face${faceA}_face${faceB}_${morphLevel}.svg`;
            const filepath = join(FACES_DIR, filename);

            const svg = generateFaceSVG(filename, morphLevel, faceA, faceB);
            writeFileSync(filepath, svg);

            count++;
            if (count % 20 === 0) {
                console.log(`Generated ${count} / 120 images...`);
            }
        }
    }

    console.log(`\n✓ Generated ${count} face stimuli in static/faces/\n`);
}

/**
 * Generate metadata file for face pairs
 */
function generateMetadata() {
    const metadata = {
        version: '1.0',
        description: 'Placeholder face stimuli for FaceIt MVP',
        facePairs: FACE_PAIRS.map(([faceA, faceB]) => ({
            faceA: `face${faceA}`,
            faceB: `face${faceB}`,
            morphLevels: MORPH_LEVELS,
            files: MORPH_LEVELS.map(level => `face${faceA}_face${faceB}_${level}.svg`),
        })),
        totalPairs: FACE_PAIRS.length,
        totalMorphLevels: MORPH_LEVELS.length,
        totalImages: FACE_PAIRS.length * MORPH_LEVELS.length,
        morphLevels: MORPH_LEVELS,
    };

    const metadataPath = join(FACES_DIR, 'metadata.json');
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log('✓ Generated metadata.json\n');
}

// Main execution
try {
    mkdirSync(FACES_DIR, { recursive: true });
    generateAllStimuli();
    generateMetadata();

    console.log('✓ Placeholder generation complete!');
    console.log('\nNext steps:');
    console.log('  - Replace with real face photos + morphs in Phase 3');
    console.log('  - Use metadata.json to load face pairs in training logic\n');
} catch (error) {
    console.error('Error generating placeholders:', error);
    process.exit(1);
}
