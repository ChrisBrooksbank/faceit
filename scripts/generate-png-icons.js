#!/usr/bin/env node

/**
 * Generate PNG icons from SVG using sharp
 * This is an optional helper script that requires sharp to be installed
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = join(__dirname, '..', 'static', 'icons');

async function generatePNGIcons() {
    try {
        // Try to import sharp (it may not be installed)
        const sharp = (await import('sharp')).default;

        const svgPath = join(staticDir, 'icon.svg');
        const svgBuffer = readFileSync(svgPath);

        console.log('Generating PNG icons using sharp...\n');

        // Generate 192x192 icon
        const png192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
        writeFileSync(join(staticDir, 'icon-192.png'), png192);
        console.log('✓ Created icon-192.png (192x192)');

        // Generate 512x512 icon
        const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
        writeFileSync(join(staticDir, 'icon-512.png'), png512);
        console.log('✓ Created icon-512.png (512x512)');

        console.log('\n✨ PNG icons generated successfully!');
    } catch (error) {
        if (error.code === 'ERR_MODULE_NOT_FOUND') {
            console.error('❌ Error: sharp is not installed. Install it with: npm install sharp');
            console.error(
                '\nAlternatively, use one of the other methods mentioned in generate-icons.js'
            );
        } else {
            console.error('❌ Error generating PNG icons:', error.message);
        }
        process.exit(1);
    }
}

generatePNGIcons();
