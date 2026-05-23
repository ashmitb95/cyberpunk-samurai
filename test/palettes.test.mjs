// test/palettes.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { palettes } from "../src/palettes.mjs";

const HEX = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const COLOR_KEYS = ["bg","bgDark","bgLight","fg","comment","keyword","string","func","cls","prop","num","accent","selection","cursor"];
const ANSI_KEYS = ["red","green","yellow","blue","magenta","cyan"];

test("there are exactly 9 palettes", () => {
  assert.equal(palettes.length, 9);
});

test("slugs are unique", () => {
  const slugs = palettes.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("every palette has required fields and valid hex", () => {
  for (const p of palettes) {
    assert.ok(p.slug, "slug present");
    assert.match(p.label, /^Cyberpunk Samurai: /);
    assert.equal(p.type, "dark");
    for (const k of COLOR_KEYS) {
      assert.ok(p.colors[k], `${p.slug} missing color ${k}`);
      assert.match(p.colors[k], HEX, `${p.slug}.${k} not hex`);
    }
    for (const k of ANSI_KEYS) {
      assert.ok(p.ansi[k], `${p.slug} missing ansi ${k}`);
      assert.match(p.ansi[k], HEX, `${p.slug}.ansi.${k} not hex`);
    }
  }
});
