// test/build.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildAll } from "../src/build.mjs";
import { palettes } from "../src/palettes.mjs";

test("buildAll writes one valid JSON theme per palette", () => {
  const out = mkdtempSync(join(tmpdir(), "cnc-"));
  const files = buildAll(out);
  assert.equal(files.length, palettes.length);
  for (const p of palettes) {
    const file = join(out, `${p.slug}.json`);
    assert.ok(existsSync(file), `missing ${p.slug}.json`);
    const theme = JSON.parse(readFileSync(file, "utf8"));
    assert.equal(theme.name, p.label);
    assert.equal(theme.type, "dark");
    assert.ok(theme.colors["editor.background"]);
  }
});
