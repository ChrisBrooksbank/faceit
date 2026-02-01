#!/usr/bin/env node
/**
 * Generate placeholder JPG images for face morphs
 *
 * Creates simple placeholder images that allow the app to function
 * while real morphed faces are being generated.
 *
 * This script requires the 'sharp' package:
 *   npm install --save-dev sharp
 *
 * Usage: node scripts/generate-placeholder-jpgs.js
 *
 * After running this, replace the images with real morphed faces using:
 *   python scripts/generate-face-morphs.py --source-dir ./london_faces -o ./static/faces
 */

import { mkdirSync, existsSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'static', 'faces');
const NUM_PAIRS = 20;
const MORPH_LEVELS = [28, 40, 52, 64, 76, 88];
const SIZE = 400;

// Try to import sharp
let sharp;
try {
    sharp = (await import('sharp')).default;
} catch {
    console.error('Error: sharp package not installed.');
    console.error('Install it with: npm install --save-dev sharp');
    console.error('');
    console.error('Alternative: Use the Python script to generate real morphed faces:');
    console.error(
        '  python scripts/generate-face-morphs.py --source-dir ./london_faces -o ./static/faces'
    );
    process.exit(1);
}

// Generate a color based on face number using golden ratio
function getFaceColor(faceNum) {
    const hue = (faceNum * 137.508) % 360;
    // Convert HSL to RGB
    const h = hue / 360;
    const s = 0.6;
    const l = 0.75;

    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}

// Blend two colors based on alpha
function blendColors(colorA, colorB, alpha) {
    return {
        r: Math.round(colorA.r * alpha + colorB.r * (1 - alpha)),
        g: Math.round(colorA.g * alpha + colorB.g * (1 - alpha)),
        b: Math.round(colorA.b * alpha + colorB.b * (1 - alpha)),
    };
}

// Create a placeholder face image
async function createPlaceholderFace(faceANum, faceBNum, morphLevel) {
    const alpha = morphLevel / 100;
    const colorA = getFaceColor(faceANum);
    const colorB = getFaceColor(faceBNum);
    const blended = blendColors(colorA, colorB, alpha);

    // Create SVG content
    const svg = `
    <svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="${SIZE}" height="${SIZE}" fill="rgb(${blended.r}, ${blended.g}, ${blended.b})"/>

      <!-- Face outline -->
      <ellipse cx="${SIZE / 2}" cy="${SIZE / 2}" rx="140" ry="180"
               fill="rgb(${Math.min(255, blended.r + 20)}, ${Math.min(255, blended.g + 20)}, ${Math.min(255, blended.b + 20)})"
               stroke="rgb(${Math.max(0, blended.r - 40)}, ${Math.max(0, blended.g - 40)}, ${Math.max(0, blended.b - 40)})"
               stroke-width="3"/>

      <!-- Eyes -->
      <ellipse cx="${SIZE / 2 - 50}" cy="${SIZE / 2 - 30}" rx="18" ry="22" fill="#333"/>
      <ellipse cx="${SIZE / 2 + 50}" cy="${SIZE / 2 - 30}" rx="18" ry="22" fill="#333"/>

      <!-- Eye highlights -->
      <ellipse cx="${SIZE / 2 - 45}" cy="${SIZE / 2 - 35}" rx="6" ry="6" fill="#fff"/>
      <ellipse cx="${SIZE / 2 + 55}" cy="${SIZE / 2 - 35}" rx="6" ry="6" fill="#fff"/>

      <!-- Eyebrows -->
      <line x1="${SIZE / 2 - 75}" y1="${SIZE / 2 - 65}" x2="${SIZE / 2 - 25}" y2="${SIZE / 2 - 60}"
            stroke="#555" stroke-width="4" stroke-linecap="round"/>
      <line x1="${SIZE / 2 + 25}" y1="${SIZE / 2 - 60}" x2="${SIZE / 2 + 75}" y2="${SIZE / 2 - 65}"
            stroke="#555" stroke-width="4" stroke-linecap="round"/>

      <!-- Nose -->
      <path d="M ${SIZE / 2} ${SIZE / 2 - 10} L ${SIZE / 2 - 12} ${SIZE / 2 + 40} L ${SIZE / 2 + 12} ${SIZE / 2 + 40} Z"
            fill="rgb(${Math.max(0, blended.r - 20)}, ${Math.max(0, blended.g - 20)}, ${Math.max(0, blended.b - 20)})"/>

      <!-- Mouth -->
      <ellipse cx="${SIZE / 2}" cy="${SIZE / 2 + 80}" rx="${35 + (morphLevel % 20)}" ry="15"
               fill="rgb(${Math.max(0, blended.r - 30)}, ${Math.max(0, blended.g - 30)}, ${Math.max(0, blended.b - 30)})"/>

      <!-- Identifying patterns (vary by face pair) -->
      <circle cx="${SIZE / 2 - 30 + ((faceANum * 100 + faceBNum) % 60)}" cy="60" r="5"
              fill="rgb(${Math.max(0, blended.r - 50)}, ${Math.max(0, blended.g - 50)}, ${Math.max(0, blended.b - 50)})"/>
      <circle cx="${SIZE / 2 - 30 + ((faceANum * 100 + faceBNum + 37) % 60)}" cy="75" r="5"
              fill="rgb(${Math.max(0, blended.r - 50)}, ${Math.max(0, blended.g - 50)}, ${Math.max(0, blended.b - 50)})"/>
      <circle cx="${SIZE / 2 - 30 + ((faceANum * 100 + faceBNum + 74) % 60)}" cy="90" r="5"
              fill="rgb(${Math.max(0, blended.r - 50)}, ${Math.max(0, blended.g - 50)}, ${Math.max(0, blended.b - 50)})"/>

      <!-- Labels for debugging -->
      <text x="${SIZE / 2}" y="${SIZE - 40}" text-anchor="middle" font-size="14" fill="#666">
        Face ${faceANum} + ${faceBNum}
      </text>
      <text x="${SIZE / 2}" y="${SIZE - 20}" text-anchor="middle" font-size="14" fill="#666">
        ${morphLevel}% morph
      </text>
    </svg>
    `;

    // Convert SVG to JPG using sharp
    return await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer();
}

// Main function
async function main() {
    console.log('Generating placeholder face images...\n');

    // Create output directory if it doesn't exist
    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`Created directory: ${OUTPUT_DIR}`);
    }

    // Remove existing SVG files
    const existingFiles = readdirSync(OUTPUT_DIR);
    const svgFiles = existingFiles.filter(f => f.endsWith('.svg'));
    if (svgFiles.length > 0) {
        console.log(`Removing ${svgFiles.length} existing SVG files...`);
        svgFiles.forEach(f => unlinkSync(join(OUTPUT_DIR, f)));
    }

    let count = 0;
    const total = NUM_PAIRS * MORPH_LEVELS.length;

    // Generate morphs for each pair at each level
    for (let pair = 0; pair < NUM_PAIRS; pair++) {
        const faceA = pair * 2 + 1;
        const faceB = pair * 2 + 2;

        for (const level of MORPH_LEVELS) {
            const filename = `face${faceA}_face${faceB}_${level}.jpg`;
            const filepath = join(OUTPUT_DIR, filename);

            const buffer = await createPlaceholderFace(faceA, faceB, level);
            await sharp(buffer).toFile(filepath);
            count++;

            if (count % 20 === 0) {
                console.log(`  Generated ${count}/${total} images...`);
            }
        }
    }

    console.log(`\nGenerated ${count} placeholder face images in ${OUTPUT_DIR}`);
    console.log('\nThese are placeholder images for development/testing.');
    console.log('\nTo use real morphed faces for proper prosopagnosia training:');
    console.log('1. Download Face Research Lab London Set from:');
    console.log('   https://figshare.com/articles/dataset/Face_Research_Lab_London_Set/5047666');
    console.log('2. Install Python dependencies:');
    console.log('   pip install -r scripts/requirements-morphing.txt');
    console.log('3. Run the morphing script:');
    console.log(
        '   python scripts/generate-face-morphs.py --source-dir ./london_faces -o ./static/faces'
    );
}

main().catch(console.error);
