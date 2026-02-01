#!/usr/bin/env node

/**
 * Verify face stimuli files for FaceIt
 *
 * This script checks that all required face morph images are present
 * and properly formatted for use in the FaceIt app.
 *
 * Usage:
 *   node scripts/verify-faces.js
 *
 * Checks:
 *   - All 120 files exist (20 pairs × 6 morph levels)
 *   - Files follow naming convention
 *   - metadata.json is valid and complete
 *   - File formats are correct (SVG for placeholders, WebP for production)
 */

import { readdir, readFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '..');
const FACES_DIR = join(PROJECT_ROOT, 'static', 'faces');
const METADATA_PATH = join(FACES_DIR, 'metadata.json');

// Expected configuration
const FACE_PAIRS = 20;
const MORPH_LEVELS = [28, 40, 52, 64, 76, 88];
const TOTAL_FILES = FACE_PAIRS * MORPH_LEVELS.length; // 120

/**
 * Check if file exists
 */
async function fileExists(path) {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
}

/**
 * Parse filename to extract face pair and morph level
 */
function parseFilename(filename) {
    // Expected format: face1_face2_28.webp or face1_face2_28.svg
    const match = filename.match(/^face(\d+)_face(\d+)_(\d+)\.(webp|svg)$/i);

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
 * Verify all required files exist
 */
async function verifyFiles() {
    console.log('Checking face stimulus files...\n');

    const files = await readdir(FACES_DIR);
    const imageFiles = files.filter(
        f => f.endsWith('.webp') || f.endsWith('.svg') || f.endsWith('.png')
    );

    console.log(`Found ${imageFiles.length} image files`);

    // Parse all image files
    const parsedFiles = imageFiles
        .map(filename => ({
            filename,
            ...parseFilename(filename),
        }))
        .filter(file => file.faceA !== undefined);

    console.log(`  ${parsedFiles.length} match naming convention\n`);

    // Check file format consistency
    const extensions = new Set(parsedFiles.map(f => f.extension));
    const isPlaceholder = extensions.has('svg');
    const isProduction = extensions.has('webp');

    if (isPlaceholder && isProduction) {
        console.warn('⚠️  Warning: Mix of SVG and WebP files detected');
        console.warn('   You may want to remove SVG placeholders after adding WebP images\n');
    }

    const expectedFormat = isProduction ? 'webp' : 'svg';
    console.log(`Format: ${isProduction ? 'Production (WebP)' : 'Placeholder (SVG)'}\n`);

    // Check for missing files
    const errors = [];
    const warnings = [];

    for (let pairNum = 1; pairNum <= FACE_PAIRS; pairNum++) {
        const faceA = pairNum * 2 - 1; // 1, 3, 5, ..., 39
        const faceB = pairNum * 2; // 2, 4, 6, ..., 40

        for (const morphLevel of MORPH_LEVELS) {
            const expectedFile = `face${faceA}_face${faceB}_${morphLevel}.${expectedFormat}`;
            const file = parsedFiles.find(
                f =>
                    f.faceA === faceA &&
                    f.faceB === faceB &&
                    f.morphLevel === morphLevel &&
                    f.extension === expectedFormat
            );

            if (!file) {
                errors.push(`Missing: ${expectedFile}`);
            }
        }
    }

    // Check for unexpected files
    parsedFiles.forEach(file => {
        // Validate face IDs are in expected range
        if (file.faceA < 1 || file.faceA > 40 || file.faceB < 1 || file.faceB > 40) {
            warnings.push(`Unexpected face ID range: ${file.filename}`);
        }

        // Validate morph level
        if (!MORPH_LEVELS.includes(file.morphLevel)) {
            warnings.push(`Unexpected morph level: ${file.filename}`);
        }

        // Validate pair structure (odd faceA, even faceB, consecutive)
        if (file.faceA % 2 === 0 || file.faceB % 2 !== 0 || file.faceB !== file.faceA + 1) {
            warnings.push(`Non-standard pair structure: ${file.filename}`);
        }
    });

    return { errors, warnings, isPlaceholder, parsedFiles };
}

/**
 * Verify metadata.json file
 */
async function verifyMetadata() {
    console.log('Checking metadata.json...\n');

    if (!(await fileExists(METADATA_PATH))) {
        console.warn('⚠️  metadata.json not found (optional for placeholders)\n');
        return { valid: false, isPlaceholder: true };
    }

    try {
        const content = await readFile(METADATA_PATH, 'utf-8');
        const metadata = JSON.parse(content);

        // Check required fields
        const errors = [];
        const warnings = [];

        if (!metadata.version) {
            warnings.push('Missing version field');
        }

        if (!metadata.source) {
            warnings.push('Missing source field');
        }

        // Support both 'pairs' and 'facePairs' field names
        const pairs = metadata.pairs || metadata.facePairs;

        if (!pairs || !Array.isArray(pairs)) {
            errors.push('Missing or invalid pairs/facePairs array');
        } else {
            // Check pairs
            if (pairs.length !== FACE_PAIRS) {
                warnings.push(`Expected ${FACE_PAIRS} pairs, found ${pairs.length}`);
            }

            // Validate pair structure
            pairs.forEach((pair, index) => {
                if (!pair.faceA || !pair.faceB) {
                    errors.push(`Pair ${index + 1}: missing faceA or faceB`);
                }

                if (!pair.morphLevels || !Array.isArray(pair.morphLevels)) {
                    errors.push(`Pair ${index + 1}: missing morphLevels array`);
                } else if (JSON.stringify(pair.morphLevels) !== JSON.stringify(MORPH_LEVELS)) {
                    warnings.push(
                        `Pair ${index + 1}: unexpected morph levels: ${pair.morphLevels.join(', ')}`
                    );
                }
            });
        }

        // Check if this is placeholder metadata (contains "placeholder" in source)
        const isPlaceholder = metadata.source?.toLowerCase().includes('placeholder') || false;

        return { valid: errors.length === 0, errors, warnings, isPlaceholder };
    } catch (error) {
        return {
            valid: false,
            errors: [`Failed to parse metadata.json: ${error.message}`],
            warnings: [],
        };
    }
}

/**
 * Main verification function
 */
async function main() {
    console.log('FaceIt Face Stimuli Verification\n');
    console.log('='.repeat(50));
    console.log('');

    let hasErrors = false;

    // Verify files
    const fileCheck = await verifyFiles();

    if (fileCheck.errors.length > 0) {
        console.error('❌ File Errors:');
        fileCheck.errors.forEach(error => console.error(`   ${error}`));
        console.error('');
        hasErrors = true;
    }

    if (fileCheck.warnings.length > 0) {
        console.warn('⚠️  File Warnings:');
        fileCheck.warnings.forEach(warning => console.warn(`   ${warning}`));
        console.warn('');
    }

    if (fileCheck.errors.length === 0) {
        console.log(`✓ All ${TOTAL_FILES} required files present\n`);
    }

    // Verify metadata
    const metadataCheck = await verifyMetadata();

    if (metadataCheck.errors && metadataCheck.errors.length > 0) {
        console.error('❌ Metadata Errors:');
        metadataCheck.errors.forEach(error => console.error(`   ${error}`));
        console.error('');
        hasErrors = true;
    }

    if (metadataCheck.warnings && metadataCheck.warnings.length > 0) {
        console.warn('⚠️  Metadata Warnings:');
        metadataCheck.warnings.forEach(warning => console.warn(`   ${warning}`));
        console.warn('');
    }

    if (metadataCheck.valid) {
        console.log('✓ metadata.json is valid\n');
    }

    // Summary
    console.log('='.repeat(50));
    console.log('');

    if (fileCheck.isPlaceholder && metadataCheck.isPlaceholder) {
        console.log('📋 Status: Using PLACEHOLDER face stimuli');
        console.log('');
        console.log('For production use:');
        console.log('  1. Download real face database (see static/faces/README.md)');
        console.log('  2. Generate morph images');
        console.log('  3. Run: npm run convert-faces <input-directory>');
        console.log('  4. Update metadata.json with real face information');
        console.log('  5. Run: npm run verify-faces to verify');
    } else if (!fileCheck.isPlaceholder) {
        console.log('✓ Status: Using PRODUCTION face stimuli');
    }

    console.log('');

    if (hasErrors) {
        console.error('❌ Verification failed. Please fix the errors above.');
        process.exit(1);
    } else {
        console.log('✓ Verification passed!');
        process.exit(0);
    }
}

main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
});
