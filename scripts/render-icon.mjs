// scripts/render-icon.mjs
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "assets/icon.svg"));
await sharp(svg).resize(256, 256).png().toFile(join(root, "assets/icon.png"));
console.log("Wrote assets/icon.png");
