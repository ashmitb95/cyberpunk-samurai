// test/template.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTheme } from "../src/template.mjs";
import { palettes } from "../src/palettes.mjs";

const arasaka = palettes.find((p) => p.slug === "arasaka-corpo");

test("buildTheme returns the core theme shape", () => {
  const t = buildTheme(arasaka);
  assert.equal(t.name, "Cyberpunk Samurai: Arasaka Corpo");
  assert.equal(t.type, "dark");
  assert.equal(t.semanticHighlighting, true);
  assert.equal(typeof t.colors, "object");
  assert.ok(Array.isArray(t.tokenColors));
  assert.equal(typeof t.semanticTokenColors, "object");
});

test("workbench maps palette roles to the right keys", () => {
  const t = buildTheme(arasaka);
  assert.equal(t.colors["editor.background"], "#090d14");
  assert.equal(t.colors["editor.foreground"], "#e3eaf2");
  assert.equal(t.colors["editorCursor.foreground"], "#fcee0a");
  assert.equal(t.colors["statusBar.border"], "#f63a4c");
  assert.equal(t.colors["editor.selectionBackground"], "#21323f");
  assert.equal(t.colors["terminal.ansiRed"], "#f63a4c");
  assert.equal(t.colors["terminal.ansiBrightWhite"], "#ffffff");
});

test("comment token is italic and uses the comment color", () => {
  const t = buildTheme(arasaka);
  const comment = t.tokenColors.find((r) => r.scope.includes("comment"));
  assert.ok(comment);
  assert.equal(comment.settings.foreground, "#4a5568");
  assert.equal(comment.settings.fontStyle, "italic");
});

test("semantic property uses the prop color", () => {
  const t = buildTheme(arasaka);
  assert.equal(t.semanticTokenColors.property, "#f63a4c");
});
