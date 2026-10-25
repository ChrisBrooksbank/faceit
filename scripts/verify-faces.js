#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const FACES_DIR = join(PROJECT_ROOT, 'static', 'faces');
const METADATA_PATH = join(FACES_DIR, 'metadata.json');
const RUNTIME_METADATA_PATH = join(PROJECT_ROOT, 'src', 'lib', 'data', 'face-metadata.json');
const EXPECTED_LEVELS = [28, 40, 52, 64, 76, 88];
const EXPECTED_PAIRS = 40;

async function fileExists(path) {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
}

async function readMetadata() {
    const content = await readFile(METADATA_PATH, 'utf-8');
    return JSON.parse(content);
}

async function validateRuntimeMetadata(metadata) {
    const content = await readFile(RUNTIME_METADATA_PATH, 'utf-8');
    const runtimeMetadata = JSON.parse(content);

    if (JSON.stringify(runtimeMetadata) !== JSON.stringify(metadata)) {
        return ['Runtime face metadata does not match static metadata.json'];
    }

    return [];
}

function validateMetadata(metadata) {
    const errors = [];

    if (metadata.isPlaceholder !== false) {
        errors.push('metadata.json still marks the face set as placeholder');
    }

    if (metadata.isProduction !== true) {
        errors.push('metadata.json does not mark the face set as production-ready');
    }

    if (!Array.isArray(metadata.facePairs) || metadata.facePairs.length !== EXPECTED_PAIRS) {
        errors.push(`Expected ${EXPECTED_PAIRS} facePairs in metadata.json`);
    }

    if (JSON.stringify(metadata.morphLevels) !== JSON.stringify(EXPECTED_LEVELS)) {
        errors.push(`Expected morph levels ${EXPECTED_LEVELS.join(', ')}`);
    }

    if (metadata.imageFormat !== 'jpg') {
        errors.push('Expected metadata.imageFormat to be "jpg"');
    }

    return errors;
}

function expectedFileRecords(metadata) {
    return metadata.facePairs.flatMap(pair =>
        pair.morphLevels.map(level => ({
            pairId: pair.id,
            level,
            filename: `${pair.faceA}_${pair.faceB}_${level}.jpg`,
        }))
    );
}

async function imageSignature(filePath) {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    const stats = await image.stats();
    const buffer = await image.raw().toBuffer();
    const hash = createHash('sha256').update(buffer).digest('hex');

    return {
        hash,
        metadata,
        entropy: stats.entropy,
    };
}

function validateImageShape(filename, metadata) {
    const errors = [];

    if (metadata.format !== 'jpeg') {
        errors.push(`${filename}: expected JPEG, found ${metadata.format}`);
    }

    if (metadata.width !== 400 || metadata.height !== 400) {
        errors.push(`${filename}: expected 400x400, found ${metadata.width}x${metadata.height}`);
    }

    return errors;
}

async function verifyImage(record, pairHashes) {
    const filePath = join(FACES_DIR, record.filename);
    const errors = [];

    if (!(await fileExists(filePath))) {
        return [`Missing ${record.filename}`];
    }

    const signature = await imageSignature(filePath);
    errors.push(...validateImageShape(record.filename, signature.metadata));

    if (signature.entropy < 4) {
        errors.push(`${record.filename}: image appears too visually flat`);
    }

    const hashes = pairHashes.get(record.pairId) ?? new Set();
    if (hashes.has(signature.hash)) {
        errors.push(`${record.filename}: duplicate pixels within pair ${record.pairId}`);
    }
    hashes.add(signature.hash);
    pairHashes.set(record.pairId, hashes);

    return errors;
}

async function verifyImages(records) {
    const errors = [];
    const pairHashes = new Map();

    for (const record of records) {
        errors.push(...(await verifyImage(record, pairHashes)));
    }

    return errors;
}

async function main() {
    console.log('FaceIt Face Stimuli Verification\n');
    const metadata = await readMetadata();
    const records = expectedFileRecords(metadata);
    const errors = [
        ...validateMetadata(metadata),
        ...(await validateRuntimeMetadata(metadata)),
        ...(await verifyImages(records)),
    ];

    if (errors.length > 0) {
        console.error('Verification failed:');
        errors.forEach(error => console.error(`- ${error}`));
        process.exit(1);
    }

    console.log(`Verified ${records.length} real JPEG morph stimuli.`);
    console.log(`${metadata.source} (${metadata.license})`);
}

main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
});
