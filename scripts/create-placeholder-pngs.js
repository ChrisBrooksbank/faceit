#!/usr/bin/env node

/**
 * Create minimal valid PNG placeholders for PWA icons
 * These are temporary placeholders that should be replaced with proper icons
 * generated from the SVG using ImageMagick, Inkscape, sharp, or an online converter
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { deflateSync } from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = join(__dirname, '..', 'static', 'icons');

/**
 * Create a minimal valid PNG with a solid color
 * This is a placeholder until proper icons are generated
 */
function createMinimalPNG(width, height) {
    // PNG signature
    const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    // IHDR chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData.writeUInt8(8, 8); // bit depth
    ihdrData.writeUInt8(2, 9); // color type (2 = RGB)
    ihdrData.writeUInt8(0, 10); // compression
    ihdrData.writeUInt8(0, 11); // filter
    ihdrData.writeUInt8(0, 12); // interlace

    const ihdr = createChunk('IHDR', ihdrData);

    // Simple 2x2 image data (blue color #2563eb)
    const imageData = Buffer.from([
        0x00, // filter byte for first row
        0x25,
        0x63,
        0xeb, // blue pixel 1
        0x25,
        0x63,
        0xeb, // blue pixel 2
        0x00, // filter byte for second row
        0x25,
        0x63,
        0xeb, // blue pixel 3
        0x25,
        0x63,
        0xeb, // blue pixel 4
    ]);

    // Compress using deflate
    const compressedData = deflateSync(imageData);

    const idat = createChunk('IDAT', compressedData);

    // IEND chunk
    const iend = createChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([signature, ihdr, idat, iend]);
}

/**
 * Create a PNG chunk with proper CRC
 */
function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);

    const typeBuffer = Buffer.from(type, 'ascii');
    const crc = calculateCRC(Buffer.concat([typeBuffer, data]));
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc, 0);

    return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

/**
 * Calculate CRC32 for PNG chunks
 */
function calculateCRC(buffer) {
    let crc = 0xffffffff;
    for (let i = 0; i < buffer.length; i++) {
        crc = crc ^ buffer[i];
        for (let j = 0; j < 8; j++) {
            crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
}

console.log('Creating placeholder PNG icons...\n');
console.log('⚠️  Note: These are minimal placeholder PNGs with a solid blue color.');
console.log('   For production, generate proper icons from icon.svg using:');
console.log('   - ImageMagick (magick convert)');
console.log('   - Inkscape');
console.log('   - sharp (npm install sharp && node scripts/generate-png-icons.js)');
console.log('   - Online converter (cloudconvert.com)\n');

// Create 192x192 placeholder
const png192 = createMinimalPNG(192, 192);
writeFileSync(join(staticDir, 'icon-192.png'), png192);
console.log('✓ Created icon-192.png (192x192 placeholder)');

// Create 512x512 placeholder
const png512 = createMinimalPNG(512, 512);
writeFileSync(join(staticDir, 'icon-512.png'), png512);
console.log('✓ Created icon-512.png (512x512 placeholder)');

console.log('\n✨ Placeholder PNG icons created successfully!');
console.log('\n💡 To replace with proper icons, run one of the commands from generate-icons.js');
