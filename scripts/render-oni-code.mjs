// Render the oni mask "made out of tiny code lines".
// Source: assets/icon-mask.svg (the original grayscale oni mask).
// Output: assets/icon.svg  (vector: a field of tiny code-line rects, masked by
//                           the brightened oni paths -> luminance mask)
//         assets/icon.png  (512px raster of the same SVG)
// The mask's luminance modulates the code, so code shows on the mask's lit areas
// (face/flames) and fades to black in its shadows.

import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 896, H = 842; // original mask coordinate space
const BOOST = 1.2; // highlight boost on top of normalising the mask to full range

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pull the path elements out of the source mask and brighten their gray fills
// so they make a strong luminance mask.
function brightenedMask(src) {
  const inner = src.slice(src.indexOf(">", src.indexOf("<svg")) + 1, src.lastIndexOf("</svg>"));
  const grays = [...inner.matchAll(/fill="#([0-9a-fA-F]{6})"/g)].map((m) =>
    parseInt(m[1].slice(0, 2), 16)
  );
  const maxV = Math.max(...grays, 1);
  const factor = (255 / maxV) * BOOST;
  return inner.replace(/fill="#([0-9a-fA-F]{6})"/g, (_, hex) => {
    const v = Math.min(255, Math.round(parseInt(hex.slice(0, 2), 16) * factor));
    const h = v.toString(16).padStart(2, "0");
    return `fill="#${h}${h}${h}"`;
  });
}

function codeField() {
  const rnd = mulberry32(20770525);
  const colors = [
    "#46d6ff", "#46d6ff", "#46d6ff",
    "#5a6e84", "#5a6e84",
    "#8be9ff",
    "#ff4d6a",
    "#cfe6f5",
  ];
  const lineH = 13;
  const rects = [];
  for (let y = 4; y < H - 4; y += lineH) {
    let x = 8 + Math.floor(rnd() * 44);
    while (x < W - 14) {
      const w = 16 + Math.floor(rnd() * 92);
      if (x + w > W - 8) break;
      rects.push(
        `<rect x="${x}" y="${y}" width="${w}" height="7" rx="3" fill="${colors[Math.floor(rnd() * colors.length)]}"/>`
      );
      x += w + 8 + Math.floor(rnd() * 12);
    }
  }
  return rects.join("\n    ");
}

function buildSvg(src) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <mask id="oni" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      ${brightenedMask(src)}
    </mask>
  </defs>
  <rect width="${W}" height="${H}" fill="#000000"/>
  <g mask="url(#oni)">
    ${codeField()}
  </g>
</svg>
`;
}

async function main() {
  const src = readFileSync(join(root, "assets/icon-mask.svg"), "utf8");
  const svg = buildSvg(src);
  writeFileSync(join(root, "assets/icon.svg"), svg);
  await sharp(Buffer.from(svg)).resize(512, 512).png().toFile(join(root, "assets/icon.png"));
  console.log("Wrote assets/icon.svg and assets/icon.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
