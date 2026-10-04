// Generates the PWA icons from one SVG glyph: `node scripts/generate-icons.mjs`
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const BRAND = '#0f766e';

// House outline + door, drawn on a 512 grid
const glyph = (scale) => `
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)"
     fill="none" stroke="#ffffff" stroke-width="30" stroke-linecap="round" stroke-linejoin="round">
    <path d="M120 250 L256 132 L392 250" />
    <path d="M158 226 V372 a20 20 0 0 0 20 20 H334 a20 20 0 0 0 20 -20 V226" />
    <path d="M226 392 V312 a30 30 0 0 1 60 0 V392" />
  </g>`;

// "any" icon: rounded square, transparent corners
const roundedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="${BRAND}" />${glyph(1)}
</svg>`;

// Maskable / Apple: full bleed, glyph inside the 80% safe zone
const fullBleedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${BRAND}" />${glyph(0.78)}
</svg>`;

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

await writeFile('src/app/icon.svg', roundedSvg);
await writeFile('public/icons/icon-192.png', await png(roundedSvg, 192));
await writeFile('public/icons/icon-512.png', await png(roundedSvg, 512));
await writeFile('public/icons/maskable-512.png', await png(fullBleedSvg, 512));
await writeFile('src/app/apple-icon.png', await png(fullBleedSvg, 180));
console.log('Icons generated');
