// test/manifest.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { palettes } from "../src/palettes.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

test("package.json declares the Themes category", () => {
  assert.ok(pkg.categories.includes("Themes"));
});

test("contributes one theme per palette, files present, labels match", () => {
  const themes = pkg.contributes.themes;
  assert.equal(themes.length, palettes.length);
  for (const p of palettes) {
    const entry = themes.find((t) => t.label === p.label);
    assert.ok(entry, `no manifest entry for ${p.label}`);
    assert.equal(entry.uiTheme, "vs-dark");
    assert.ok(existsSync(join(root, entry.path)), `missing theme file ${entry.path}`);
  }
});
