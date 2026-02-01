#!/usr/bin/env node

/**
 * Generate PWA icons for FaceIt app
 * Creates 192x192 and 512x512 PNG icons from an SVG base
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = join(__dirname, '..', 'static', 'icons');

// SVG icon design for FaceIt
// Simple, recognizable face icon with a focus element (representing recognition/training)
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="url(#bgGradient)"/>

  <!-- Face outline -->
  <ellipse cx="256" cy="256" rx="160" ry="180" fill="none" stroke="#ffffff" stroke-width="8" opacity="0.3"/>

  <!-- Eyes -->
  <circle cx="206" cy="220" r="20" fill="#ffffff"/>
  <circle cx="306" cy="220" r="20" fill="#ffffff"/>

  <!-- Pupils -->
  <circle cx="206" cy="220" r="10" fill="#1e40af"/>
  <circle cx="306" cy="220" r="10" fill="#1e40af"/>

  <!-- Focus/recognition indicator (crosshair on left eye) -->
  <g opacity="0.9">
    <circle cx="206" cy="220" r="35" fill="none" stroke="#fbbf24" stroke-width="4"/>
    <line x1="171" y1="220" x2="186" y2="220" stroke="#fbbf24" stroke-width="3"/>
    <line x1="226" y1="220" x2="241" y2="220" stroke="#fbbf24" stroke-width="3"/>
    <line x1="206" y1="185" x2="206" y2="200" stroke="#fbbf24" stroke-width="3"/>
    <line x1="206" y1="240" x2="206" y2="255" stroke="#fbbf24" stroke-width="3"/>
  </g>

  <!-- Nose (simple line) -->
  <path d="M 256 240 L 256 280" stroke="#ffffff" stroke-width="6" fill="none" opacity="0.6"/>

  <!-- Smile -->
  <path d="M 206 310 Q 256 340 306 310" stroke="#ffffff" stroke-width="8" fill="none" stroke-linecap="round"/>
</svg>`;

console.log('Generating PWA icons for FaceIt...\n');

// Save the base SVG
const svgPath = join(staticDir, 'icon.svg');
writeFileSync(svgPath, iconSvg, 'utf8');
console.log(`✓ Created base SVG icon: ${svgPath}`);

// Instructions for generating PNG files
console.log('\n📋 Next steps to generate PNG icons:');
console.log('\nOption 1: Using ImageMagick (recommended)');
console.log('  brew install imagemagick  # macOS');
console.log('  apt install imagemagick   # Linux');
console.log('  choco install imagemagick # Windows');
console.log('  Then run:');
console.log(
    `  magick convert -background none -density 300 "${svgPath}" -resize 192x192 "${join(staticDir, 'icon-192.png')}"`
);
console.log(
    `  magick convert -background none -density 300 "${svgPath}" -resize 512x512 "${join(staticDir, 'icon-512.png')}"`
);

console.log('\nOption 2: Using Inkscape');
console.log(
    `  inkscape --export-type=png --export-width=192 --export-filename="${join(staticDir, 'icon-192.png')}" "${svgPath}"`
);
console.log(
    `  inkscape --export-type=png --export-width=512 --export-filename="${join(staticDir, 'icon-512.png')}" "${svgPath}"`
);

console.log('\nOption 3: Using sharp (Node.js library)');
console.log('  npm install sharp');
console.log('  node scripts/generate-png-icons.js');

console.log('\nOption 4: Using an online SVG to PNG converter');
console.log(`  1. Open ${svgPath} in a browser`);
console.log('  2. Use an online converter like https://cloudconvert.com/svg-to-png');
console.log('  3. Convert to 192x192 and 512x512 PNG');
console.log(`  4. Save as icon-192.png and icon-512.png in ${staticDir}`);

console.log('\n✨ Base SVG icon created successfully!');
