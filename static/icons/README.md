# PWA Icons for FaceIt

This directory contains the Progressive Web App icons for FaceIt.

## Files

- `icon.svg` - Base SVG icon design (512x512 viewBox)
- `icon-192.png` - PWA icon for smaller displays (192x192)
- `icon-512.png` - PWA icon for larger displays (512x512)
- `../favicon.png` - Browser favicon (32x32)
- `../favicon.svg` - SVG favicon (used by modern browsers)

## Icon Design

The FaceIt icon features:

- **Blue gradient background** (#2563eb to #1d4ed8) - matches app theme
- **Simple face outline** - represents the focus on face recognition
- **Eyes with pupils** - clear facial features
- **Focus indicator** (yellow crosshair) - represents the training/recognition aspect
- **Friendly smile** - welcoming and positive

## Current Status

The current PNG files (`icon-192.png`, `icon-512.png`, `favicon.png`) are **placeholder images** created programmatically. They display a solid blue color but are valid PNG files that work as PWA icons.

## Generating Proper Icons

To replace the placeholders with high-quality icons rendered from `icon.svg`, use one of these methods:

### Option 1: ImageMagick (Recommended)

```bash
# Install ImageMagick
brew install imagemagick  # macOS
apt install imagemagick   # Linux
choco install imagemagick # Windows

# Generate icons
magick convert -background none -density 300 static/icons/icon.svg -resize 192x192 static/icons/icon-192.png
magick convert -background none -density 300 static/icons/icon.svg -resize 512x512 static/icons/icon-512.png
magick convert -background none -density 300 static/icons/icon.svg -resize 32x32 static/favicon.png
```

### Option 2: Inkscape

```bash
inkscape --export-type=png --export-width=192 --export-filename=static/icons/icon-192.png static/icons/icon.svg
inkscape --export-type=png --export-width=512 --export-filename=static/icons/icon-512.png static/icons/icon.svg
inkscape --export-type=png --export-width=32 --export-filename=static/favicon.png static/icons/icon.svg
```

### Option 3: sharp (Node.js)

```bash
npm install sharp
node scripts/generate-png-icons.js
```

### Option 4: Online Converter

1. Open `icon.svg` in a browser
2. Use https://cloudconvert.com/svg-to-png or similar
3. Convert to 192x192 and 512x512
4. Save as `icon-192.png` and `icon-512.png` in this directory
5. Convert to 32x32 and save as `favicon.png` in static/

## Quick Regeneration

To regenerate all icons (SVG + placeholder PNGs + favicon):

```bash
npm run generate-icons
```

This creates the base SVG and placeholder PNGs. For production use, follow the steps above to create proper PNG renders.

## Customization

To customize the icon design:

1. Edit `scripts/generate-icons.js` to modify the SVG markup
2. Run `npm run generate-icons` to regenerate the SVG
3. Use one of the methods above to render to PNG

The icon uses standard SVG elements:

- `<circle>` and `<ellipse>` for shapes
- `<linearGradient>` for the background
- `<path>` for the smile
- `<line>` for the focus indicator

Adjust colors, positions, and shapes as needed to match your brand.
