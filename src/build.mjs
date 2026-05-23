// src/build.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { palettes } from "./palettes.mjs";
import { buildTheme } from "./template.mjs";

export function buildAll(outDir) {
  mkdirSync(outDir, { recursive: true });
  const written = [];
  for (const p of palettes) {
    const theme = buildTheme(p);
    const file = join(outDir, `${p.slug}.json`);
    writeFileSync(file, JSON.stringify(theme, null, 2) + "\n");
    written.push(file);
  }
  return written;
}

// CLI: `node src/build.mjs` writes into <repo>/themes
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const out = join(root, "themes");
  const files = buildAll(out);
  console.log(`Wrote ${files.length} themes to ${out}`);
}
