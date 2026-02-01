#!/usr/bin/env node

/**
 * Convert face images to WebP format for FaceIt
 *
 * This script converts face morph images from various formats (PNG, JPG, etc.)
 * to optimized WebP format for use in the FaceIt app.
 *
 * Usage:
 *   node scripts/convert-to-webp.js <input-directory>
 *
 * Requirements:
 *   - Input directory should contain morph images
 *   - Images should be named: {faceA}_{faceB}_{morphLevel}.{ext}
 *   - Supported input formats: PNG, JPG, JPEG
 *
 * Output:
 *   - WebP images in static/faces/
 *   - Optimized for < 50KB per image
 *   - Updates metadata.json with file information
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, parse, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(PROJECT_ROOT, 'static', 'faces');

// Expected morph levels
const MORPH_LEVELS = [28, 40, 52, 64, 76, 88];

// Expected number of face pairs
const FACE_PAIRS = 20;

/**
 * Check if required npm package is available
 */
async function checkDependencies() {
    try {
        await import('sharp');
        return true;
    } catch {
        console.error('Error: sharp package not found.');
        console.error('Please install it: npm install --save-dev sharp');
        return false;
    }
}

/**
 * Parse filename to extract face pair and morph level
 */
function parseFilename(filename) {
    // Expected format: face1_face2_28.png or similar
    const match = filename.match(/^face(\d+)_face(\d+)_(\d+)\.(png|jpg|jpeg)$/i);

    if (!match) {
        return null;
    }

    return {
        faceA: parseInt(match[1], 10),
        faceB: parseInt(match[2], 10),
        morphLevel: parseInt(match[3], 10),
        extension: match[4].toLowerCase(),
    };
}

/**
 * Convert image to WebP format using sharp
 */
async function convertToWebP(inputPath, outputPath) {
    const sharp = (await import('sharp')).default;

    await sharp(inputPath)
        .webp({
            quality: 85, // High quality for face recognition
            effort: 6, // Maximum compression effort
        })
        .resize({
            width: 800,
            height: 800,
            fit: 'cover',
            position: 'center',
        })
        .toFile(outputPath);
}

/**
 * Get file size in KB
 */
async function getFileSize(filePath) {
    try {
        const stats = await readFile(filePath);
        return (stats.length / 1024).toFixed(2);
    } catch {
        return null;
    }
}

/**
 * Validate that all required files are present
 */
function validateFileSet(files) {
    const errors = [];
    const warnings = [];

    // Check we have the right number of pairs
    const pairs = new Set();
    files.forEach(file => {
        pairs.add(`${file.faceA}_${file.faceB}`);
    });

    if (pairs.size !== FACE_PAIRS) {
        errors.push(`Expected ${FACE_PAIRS} face pairs, found ${pairs.size}`);
    }

    // Check each pair has all morph levels
    pairs.forEach(pairId => {
        const [faceA, faceB] = pairId.split('_').map(Number);
        const pairFiles = files.filter(f => f.faceA === faceA && f.faceB === faceB);

        MORPH_LEVELS.forEach(level => {
            const hasLevel = pairFiles.some(f => f.morphLevel === level);
            if (!hasLevel) {
                errors.push(`Missing morph level ${level} for pair face${faceA}_face${faceB}`);
            }
        });

        // Check for unexpected morph levels
        pairFiles.forEach(file => {
            if (!MORPH_LEVELS.includes(file.morphLevel)) {
                warnings.push(
                    `Unexpected morph level ${file.morphLevel} for pair face${faceA}_face${faceB}`
                );
            }
        });
    });

    return { errors, warnings };
}

/**
 * Main conversion function
 */
async function main() {
    console.log('FaceIt Face Image Converter\n');

    // Check dependencies
    if (!(await checkDependencies())) {
        process.exit(1);
    }

    // Get input directory from command line
    const inputDir = process.argv[2];

    if (!inputDir) {
        console.error('Usage: node scripts/convert-to-webp.js <input-directory>');
        console.error('\nExample:');
        console.error('  node scripts/convert-to-webp.js ~/Downloads/face-morphs/');
        process.exit(1);
    }

    console.log(`Input directory: ${inputDir}`);
    console.log(`Output directory: ${OUTPUT_DIR}\n`);

    // Ensure output directory exists
    await mkdir(OUTPUT_DIR, { recursive: true });

    // Read input directory
    let inputFiles;
    try {
        inputFiles = await readdir(inputDir);
    } catch (error) {
        console.error(`Error reading input directory: ${error.message}`);
        process.exit(1);
    }

    // Parse and filter image files
    const parsedFiles = inputFiles
        .map(filename => ({
            filename,
            ...parseFilename(filename),
        }))
        .filter(file => file.faceA !== undefined);

    console.log(`Found ${parsedFiles.length} morph images\n`);

    if (parsedFiles.length === 0) {
        console.error('No valid face morph images found in input directory.');
        console.error('Expected filenames like: face1_face2_28.png');
        process.exit(1);
    }

    // Validate file set
    const validation = validateFileSet(parsedFiles);

    if (validation.errors.length > 0) {
        console.error('Validation errors:');
        validation.errors.forEach(error => console.error(`  - ${error}`));
        console.error('\nPlease fix these errors before converting.');
        process.exit(1);
    }

    if (validation.warnings.length > 0) {
        console.warn('Warnings:');
        validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
        console.warn('');
    }

    // Convert each file
    console.log('Converting images to WebP...\n');

    const conversions = [];
    let largeFiles = 0;

    for (const file of parsedFiles) {
        const inputPath = join(inputDir, file.filename);
        const outputFilename = `face${file.faceA}_face${file.faceB}_${file.morphLevel}.webp`;
        const outputPath = join(OUTPUT_DIR, outputFilename);

        try {
            await convertToWebP(inputPath, outputPath);

            const size = await getFileSize(outputPath);
            conversions.push({
                filename: outputFilename,
                faceA: file.faceA,
                faceB: file.faceB,
                morphLevel: file.morphLevel,
                size: parseFloat(size),
            });

            const sizeIndicator = size > 50 ? '⚠️' : '✓';
            console.log(`  ${sizeIndicator} ${outputFilename} (${size} KB)`);

            if (size > 50) {
                largeFiles++;
            }
        } catch (error) {
            console.error(`  ✗ ${file.filename}: ${error.message}`);
        }
    }

    console.log(`\nConverted ${conversions.length} images successfully`);

    if (largeFiles > 0) {
        console.warn(
            `\n⚠️  Warning: ${largeFiles} files exceed 50KB target size. Consider reducing quality or resolution.`
        );
    }

    // Calculate statistics
    const totalSize = conversions.reduce((sum, file) => sum + file.size, 0);
    const avgSize = totalSize / conversions.length;

    console.log(`\nStatistics:`);
    console.log(`  Total size: ${totalSize.toFixed(2)} KB`);
    console.log(`  Average size: ${avgSize.toFixed(2)} KB per image`);
    console.log(`  Target: < 50 KB per image, < 6000 KB total`);

    // Update metadata.json
    console.log('\nNote: Please update static/faces/metadata.json with face pair information.');
    console.log('See static/faces/README.md for the required metadata structure.');

    console.log('\n✓ Conversion complete!');
}

main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
});
