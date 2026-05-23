# Cyberpunk Night City Theme Family — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and locally package a VS Code extension that contributes five dark Cyberpunk/Night City color themes from a single palette-driven generator.

**Architecture:** Each theme is a ~15-color palette object (`src/palettes.mjs`). A pure function `buildTheme(palette)` (`src/template.mjs`) maps a palette to a complete VS Code theme object (workbench `colors`, TextMate `tokenColors`, `semanticTokenColors`). A build script (`src/build.mjs`) emits `themes/<slug>.json` for all five. The generated JSON is committed so the published extension needs no build step. Logic is unit-tested with Node's built-in test runner; visual quality is verified manually from an installed `.vsix`.

**Tech Stack:** Plain Node.js ESM (`.mjs`), `node:test` + `node:assert` (no test deps), `@vscode/vsce` (via `npx`) for packaging, `sharp` (dev) to rasterize the icon.

**Spec:** `docs/superpowers/specs/2026-05-23-cyberpunk-night-city-theme-design.md`

**Working dir:** `~/projects/cyberpunk-night-city` (git repo already initialized; spec already committed).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `package.json` | Extension manifest + npm scripts. Declares the 5 themes under `contributes.themes`. |
| `src/palettes.mjs` | The 5 palette objects: meta + 14 role colors + 6 ANSI hues each. The only place colors live. |
| `src/template.mjs` | `buildTheme(palette)` → full theme object. The only place role→VS Code key mapping lives. |
| `src/build.mjs` | `buildAll(outDir)` writes `themes/<slug>.json` for every palette + CLI entry. |
| `themes/*.json` | Generated, committed theme files VS Code loads. |
| `scripts/render-icon.mjs` | Rasterizes `assets/icon.svg` → `assets/icon.png`. |
| `assets/icon.svg` / `assets/icon.png` | Marketplace icon source + raster. |
| `test/*.test.mjs` | Unit tests for palettes, template, build, and manifest consistency. |
| `README.md` / `CHANGELOG.md` / `LICENSE` | Marketplace docs + fan-theme disclaimer + MIT. |
| `.vscodeignore` | Keeps `src/`, `test/`, `docs/`, etc. out of the `.vsix`. |

**Role key note:** the palette uses `cls` for the class/type role (the spec's "class") to avoid the reserved word.

---

## Task 1: Project manifest & npm setup

**Files:**
- Create: `package.json`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "cyberpunk-night-city",
  "displayName": "Cyberpunk Night City",
  "description": "Five dark Cyberpunk/Night City themes — Arasaka, Samurai, Japantown — built on One Dark comfort with neon accents.",
  "version": "0.1.0",
  "publisher": "REPLACE_WITH_PUBLISHER_ID",
  "license": "MIT",
  "type": "module",
  "engines": { "vscode": "^1.70.0" },
  "categories": ["Themes"],
  "keywords": ["cyberpunk", "neon", "dark", "theme", "synthwave", "night city", "arasaka", "samurai", "japantown"],
  "galleryBanner": { "color": "#090d14", "theme": "dark" },
  "scripts": {
    "build": "node src/build.mjs",
    "test": "node --test"
  },
  "contributes": {
    "themes": [
      { "label": "Cyberpunk Night City: Arasaka Corpo", "uiTheme": "vs-dark", "path": "./themes/arasaka-corpo.json" },
      { "label": "Cyberpunk Night City: Samurai", "uiTheme": "vs-dark", "path": "./themes/samurai.json" },
      { "label": "Cyberpunk Night City: Arasaka Dim", "uiTheme": "vs-dark", "path": "./themes/arasaka-dim.json" },
      { "label": "Cyberpunk Night City: Samurai Dim", "uiTheme": "vs-dark", "path": "./themes/samurai-dim.json" },
      { "label": "Cyberpunk Night City: Japantown", "uiTheme": "vs-dark", "path": "./themes/japantown.json" }
    ]
  }
}
```

> `publisher` stays as the placeholder until the user creates a Marketplace publisher (Open Item). The `.vsix` will still build for local install; only `vsce publish` needs a real publisher.

- [ ] **Step 2: Verify it parses**

Run: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('ok')"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "Add extension manifest and npm scripts"
```

---

## Task 2: Palettes module (TDD)

**Files:**
- Test: `test/palettes.test.mjs`
- Create: `src/palettes.mjs`

- [ ] **Step 1: Write the failing test**

```js
// test/palettes.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { palettes } from "../src/palettes.mjs";

const HEX = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const COLOR_KEYS = ["bg","bgDark","bgLight","fg","comment","keyword","string","func","cls","prop","num","accent","selection","cursor"];
const ANSI_KEYS = ["red","green","yellow","blue","magenta","cyan"];

test("there are exactly 5 palettes", () => {
  assert.equal(palettes.length, 5);
});

test("slugs are unique", () => {
  const slugs = palettes.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("every palette has required fields and valid hex", () => {
  for (const p of palettes) {
    assert.ok(p.slug, "slug present");
    assert.match(p.label, /^Cyberpunk Night City: /);
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/palettes.test.mjs`
Expected: FAIL — cannot find module `../src/palettes.mjs`.

- [ ] **Step 3: Write the implementation**

```js
// src/palettes.mjs
// One object per theme. `cls` = class/type role (avoids the reserved word).
// `ansi` = 6 base terminal hues; the template derives the full ANSI 16 + black/white.

export const palettes = [
  {
    slug: "arasaka-corpo",
    label: "Cyberpunk Night City: Arasaka Corpo",
    type: "dark",
    colors: {
      bg: "#090d14", bgDark: "#06090f", bgLight: "#10151e",
      fg: "#e3eaf2", comment: "#4a5568",
      keyword: "#f63a4c", string: "#56b6c2", func: "#6f9fd8",
      cls: "#88c0d0", prop: "#f63a4c", num: "#cdb88a",
      accent: "#f63a4c", selection: "#21323f", cursor: "#fcee0a",
    },
    ansi: { red: "#f63a4c", green: "#8fc7a0", yellow: "#cdb88a", blue: "#6f9fd8", magenta: "#b98ad9", cyan: "#56b6c2" },
  },
  {
    slug: "arasaka-dim",
    label: "Cyberpunk Night City: Arasaka Dim",
    type: "dark",
    colors: {
      bg: "#0c1018", bgDark: "#080c13", bgLight: "#141a24",
      fg: "#c2ccd6", comment: "#4a5568",
      keyword: "#d86575", string: "#5aa6b0", func: "#6e96c4",
      cls: "#82b3c0", prop: "#d86575", num: "#c0ac84",
      accent: "#d86575", selection: "#22303c", cursor: "#fcee0a",
    },
    ansi: { red: "#d86575", green: "#82b89a", yellow: "#c0ac84", blue: "#6e96c4", magenta: "#a98ac0", cyan: "#5aa6b0" },
  },
  {
    slug: "samurai",
    label: "Cyberpunk Night City: Samurai",
    type: "dark",
    colors: {
      bg: "#15120a", bgDark: "#100d07", bgLight: "#1d1910",
      fg: "#e8e4cb", comment: "#736f50",
      keyword: "#fcee0a", string: "#c8e64b", func: "#00d7f2",
      cls: "#ff5cae", prop: "#ff3864", num: "#ff3864",
      accent: "#fcee0a", selection: "#ff38642e", cursor: "#fcee0a",
    },
    ansi: { red: "#ff3864", green: "#b8e600", yellow: "#fcee0a", blue: "#4aa8ff", magenta: "#ff5cae", cyan: "#00d7f2" },
  },
  {
    slug: "samurai-dim",
    label: "Cyberpunk Night City: Samurai Dim",
    type: "dark",
    colors: {
      bg: "#17140c", bgDark: "#120f08", bgLight: "#1f1b12",
      fg: "#cfccb4", comment: "#635f47",
      keyword: "#d6c93a", string: "#a8c050", func: "#4eaebd",
      cls: "#d97aa6", prop: "#d95f7a", num: "#d95f7a",
      accent: "#d6c93a", selection: "#d95f7a26", cursor: "#fcee0a",
    },
    ansi: { red: "#d95f7a", green: "#a8c050", yellow: "#d6c93a", blue: "#5a96cc", magenta: "#d97aa6", cyan: "#4eaebd" },
  },
  {
    slug: "japantown",
    label: "Cyberpunk Night City: Japantown",
    type: "dark",
    colors: {
      bg: "#120e1a", bgDark: "#0d0a14", bgLight: "#1a1524",
      fg: "#b9b4cc", comment: "#5a5470",
      keyword: "#b98ad9", string: "#5cc2b0", func: "#5bb8d6",
      cls: "#e69ec4", prop: "#d98aa8", num: "#d6b066",
      accent: "#d98aa8", selection: "#d98aa833", cursor: "#fcee0a",
    },
    ansi: { red: "#d98aa8", green: "#7fcaa0", yellow: "#d6b066", blue: "#5bb8d6", magenta: "#b98ad9", cyan: "#5cc2b0" },
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/palettes.test.mjs`
Expected: PASS — 3 tests, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add test/palettes.test.mjs src/palettes.mjs
git commit -m "Add five theme palettes with tests"
```

---

## Task 3: Template module (TDD)

**Files:**
- Test: `test/template.test.mjs`
- Create: `src/template.mjs`

- [ ] **Step 1: Write the failing test**

```js
// test/template.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTheme } from "../src/template.mjs";
import { palettes } from "../src/palettes.mjs";

const arasaka = palettes.find((p) => p.slug === "arasaka-corpo");

test("buildTheme returns the core theme shape", () => {
  const t = buildTheme(arasaka);
  assert.equal(t.name, "Cyberpunk Night City: Arasaka Corpo");
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/template.test.mjs`
Expected: FAIL — cannot find module `../src/template.mjs`.

- [ ] **Step 3: Write the implementation**

```js
// src/template.mjs
// Maps a palette to a complete VS Code color theme object.
// Single source of truth for role -> VS Code key / TextMate scope mapping.

// Append a 2-digit hex alpha to a #rrggbb color (VS Code accepts #rrggbbaa).
const A = (hex, a) => `${hex}${a}`;

export function buildTheme(p) {
  const c = p.colors;
  const a = p.ansi;
  return {
    name: p.label,
    type: p.type,
    semanticHighlighting: true,
    colors: workbench(c, a),
    tokenColors: tokens(c),
    semanticTokenColors: semantic(c),
  };
}

function workbench(c, a) {
  return {
    // base
    "focusBorder": c.accent,
    "foreground": c.fg,
    "errorForeground": "#ff5c66",
    "descriptionForeground": c.comment,
    "icon.foreground": c.fg,
    // editor
    "editor.background": c.bg,
    "editor.foreground": c.fg,
    "editorCursor.foreground": c.cursor,
    "editor.selectionBackground": c.selection,
    "editor.selectionHighlightBackground": A(c.accent, "22"),
    "editor.wordHighlightBackground": A(c.func, "22"),
    "editor.lineHighlightBackground": c.bgLight,
    "editor.findMatchBackground": A(c.accent, "55"),
    "editor.findMatchHighlightBackground": A(c.accent, "33"),
    "editorLineNumber.foreground": c.comment,
    "editorLineNumber.activeForeground": c.fg,
    "editorIndentGuide.background1": c.bgLight,
    "editorIndentGuide.activeBackground1": c.comment,
    "editorWhitespace.foreground": c.bgLight,
    "editorBracketMatch.background": A(c.accent, "22"),
    "editorBracketMatch.border": c.accent,
    // bracket pair colorization
    "editorBracketHighlight.foreground1": c.keyword,
    "editorBracketHighlight.foreground2": c.func,
    "editorBracketHighlight.foreground3": c.string,
    "editorBracketHighlight.foreground4": c.cls,
    "editorBracketHighlight.foreground5": c.num,
    "editorBracketHighlight.foreground6": c.prop,
    "editorBracketHighlight.unexpectedBracket.foreground": "#ff5c66",
    // gutter + git decorations
    "editorGutter.modifiedBackground": c.func,
    "editorGutter.addedBackground": a.green,
    "editorGutter.deletedBackground": a.red,
    "gitDecoration.modifiedResourceForeground": c.func,
    "gitDecoration.untrackedResourceForeground": a.green,
    "gitDecoration.deletedResourceForeground": a.red,
    "gitDecoration.ignoredResourceForeground": c.comment,
    // diff editor
    "diffEditor.insertedTextBackground": A(a.green, "1a"),
    "diffEditor.removedTextBackground": A(a.red, "1a"),
    // tabs + groups
    "editorGroupHeader.tabsBackground": c.bgDark,
    "editorGroupHeader.noTabsBackground": c.bgDark,
    "tab.activeBackground": c.bg,
    "tab.inactiveBackground": c.bgDark,
    "tab.activeForeground": c.fg,
    "tab.inactiveForeground": c.comment,
    "tab.activeBorderTop": c.accent,
    "tab.border": c.bgDark,
    // title bar
    "titleBar.activeBackground": c.bgDark,
    "titleBar.activeForeground": c.fg,
    "titleBar.inactiveBackground": c.bgDark,
    "titleBar.inactiveForeground": c.comment,
    // activity bar
    "activityBar.background": c.bgDark,
    "activityBar.foreground": c.fg,
    "activityBar.inactiveForeground": c.comment,
    "activityBar.activeBorder": c.accent,
    "activityBarBadge.background": c.accent,
    "activityBarBadge.foreground": c.bg,
    // side bar
    "sideBar.background": c.bgDark,
    "sideBar.foreground": c.fg,
    "sideBarSectionHeader.background": c.bgDark,
    "sideBarTitle.foreground": c.fg,
    // lists
    "list.activeSelectionBackground": c.bgLight,
    "list.activeSelectionForeground": c.fg,
    "list.inactiveSelectionBackground": c.bgLight,
    "list.hoverBackground": A(c.bgLight, "aa"),
    "list.highlightForeground": c.accent,
    // status bar (signature: dark surface + accent top border)
    "statusBar.background": c.bgDark,
    "statusBar.foreground": c.comment,
    "statusBar.border": c.accent,
    "statusBar.noFolderBackground": c.bgDark,
    "statusBar.debuggingBackground": c.accent,
    "statusBar.debuggingForeground": c.bg,
    "statusBarItem.remoteBackground": c.accent,
    "statusBarItem.remoteForeground": c.bg,
    // inputs + dropdowns
    "input.background": c.bgLight,
    "input.foreground": c.fg,
    "input.border": c.bgLight,
    "input.placeholderForeground": c.comment,
    "inputOption.activeBorder": c.accent,
    "dropdown.background": c.bgLight,
    "dropdown.foreground": c.fg,
    // widgets
    "editorWidget.background": c.bgLight,
    "editorWidget.foreground": c.fg,
    "editorSuggestWidget.background": c.bgLight,
    "editorSuggestWidget.selectedBackground": c.bg,
    "editorSuggestWidget.highlightForeground": c.accent,
    "editorHoverWidget.background": c.bgLight,
    // peek view
    "peekView.border": c.accent,
    "peekViewEditor.background": c.bgDark,
    "peekViewResult.background": c.bgDark,
    "peekViewResult.selectionBackground": c.bgLight,
    "peekViewTitle.background": c.bgDark,
    "peekViewEditor.matchHighlightBackground": A(c.accent, "44"),
    // notifications + quick input / command palette
    "notifications.background": c.bgLight,
    "notificationCenterHeader.background": c.bgDark,
    "quickInput.background": c.bgDark,
    "quickInputList.focusBackground": c.bgLight,
    "pickerGroup.foreground": c.accent,
    "pickerGroup.border": c.bgLight,
    // scrollbar + badges + progress
    "scrollbarSlider.background": A(c.comment, "44"),
    "scrollbarSlider.hoverBackground": A(c.comment, "66"),
    "scrollbarSlider.activeBackground": A(c.comment, "88"),
    "badge.background": c.accent,
    "badge.foreground": c.bg,
    "progressBar.background": c.accent,
    // links
    "textLink.foreground": c.accent,
    "textLink.activeForeground": c.func,
    "textPreformat.foreground": c.string,
    // panel + terminal
    "panel.background": c.bgDark,
    "panel.border": c.bgLight,
    "panelTitle.activeForeground": c.fg,
    "panelTitle.activeBorder": c.accent,
    "terminal.background": c.bg,
    "terminal.foreground": c.fg,
    "terminalCursor.foreground": c.cursor,
    "terminal.ansiBlack": c.bgLight,
    "terminal.ansiBrightBlack": c.comment,
    "terminal.ansiRed": a.red,
    "terminal.ansiBrightRed": a.red,
    "terminal.ansiGreen": a.green,
    "terminal.ansiBrightGreen": a.green,
    "terminal.ansiYellow": a.yellow,
    "terminal.ansiBrightYellow": a.yellow,
    "terminal.ansiBlue": a.blue,
    "terminal.ansiBrightBlue": a.blue,
    "terminal.ansiMagenta": a.magenta,
    "terminal.ansiBrightMagenta": a.magenta,
    "terminal.ansiCyan": a.cyan,
    "terminal.ansiBrightCyan": a.cyan,
    "terminal.ansiWhite": c.fg,
    "terminal.ansiBrightWhite": "#ffffff",
    // breadcrumbs
    "breadcrumb.foreground": c.comment,
    "breadcrumb.focusForeground": c.fg,
    "breadcrumbPicker.background": c.bgDark,
  };
}

function tokens(c) {
  return [
    { name: "Comment", scope: ["comment", "punctuation.definition.comment"], settings: { foreground: c.comment, fontStyle: "italic" } },
    { name: "Keyword", scope: ["keyword", "keyword.control", "storage", "storage.type", "storage.modifier"], settings: { foreground: c.keyword } },
    { name: "Operator", scope: ["keyword.operator"], settings: { foreground: c.fg } },
    { name: "String", scope: ["string", "string.quoted", "string.template", "punctuation.definition.string"], settings: { foreground: c.string } },
    { name: "Function", scope: ["entity.name.function", "support.function", "meta.function-call", "entity.other.attribute-name"], settings: { foreground: c.func } },
    { name: "Class/Type", scope: ["entity.name.type", "entity.name.class", "support.type", "support.class", "entity.name.tag"], settings: { foreground: c.cls } },
    { name: "This/Property", scope: ["variable.language.this", "variable.other.property", "support.variable.property", "meta.object-literal.key", "support.type.property-name"], settings: { foreground: c.prop } },
    { name: "Number/Constant", scope: ["constant.numeric", "constant.language", "constant.other"], settings: { foreground: c.num } },
    { name: "Variable", scope: ["variable", "variable.other.readwrite", "variable.parameter"], settings: { foreground: c.fg } },
    { name: "Markup heading", scope: ["markup.heading", "entity.name.section"], settings: { foreground: c.keyword, fontStyle: "bold" } },
    { name: "Markup bold", scope: ["markup.bold"], settings: { fontStyle: "bold" } },
    { name: "Markup italic", scope: ["markup.italic"], settings: { fontStyle: "italic" } },
    { name: "Markup inline code", scope: ["markup.inline.raw", "markup.fenced_code"], settings: { foreground: c.string } },
    { name: "Markup link", scope: ["markup.underline.link", "string.other.link"], settings: { foreground: c.accent } },
    { name: "Invalid", scope: ["invalid", "invalid.illegal"], settings: { foreground: "#ff5c66" } },
  ];
}

function semantic(c) {
  return {
    namespace: c.cls,
    class: c.cls,
    type: c.cls,
    struct: c.cls,
    enum: c.cls,
    interface: c.cls,
    function: c.func,
    method: c.func,
    macro: c.func,
    variable: c.fg,
    parameter: c.fg,
    property: c.prop,
    enumMember: c.num,
    keyword: c.keyword,
    string: c.string,
    number: c.num,
    comment: { foreground: c.comment, fontStyle: "italic" },
  };
}
```

> **Status-bar note:** VS Code renders `statusBar.border` as a 1px top edge — the spec's "2px" accent is approximated by this themable 1px border. That is the only chrome key available; do not attempt a custom width.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/template.test.mjs`
Expected: PASS — 4 tests, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add test/template.test.mjs src/template.mjs
git commit -m "Add palette->theme generator with tests"
```

---

## Task 4: Build script + generate theme files (TDD)

**Files:**
- Test: `test/build.test.mjs`
- Create: `src/build.mjs`
- Generates: `themes/arasaka-corpo.json`, `themes/samurai.json`, `themes/arasaka-dim.json`, `themes/samurai-dim.json`, `themes/japantown.json`

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/build.test.mjs`
Expected: FAIL — cannot find module `../src/build.mjs`.

- [ ] **Step 3: Write the implementation**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/build.test.mjs`
Expected: PASS — 1 test, `# fail 0`.

- [ ] **Step 5: Generate the committed theme files**

Run: `npm run build`
Expected: `Wrote 5 themes to .../themes`

- [ ] **Step 6: Verify all five files exist and are valid JSON**

Run: `ls themes && node -e "for (const f of require('fs').readdirSync('themes')) JSON.parse(require('fs').readFileSync('themes/'+f)); console.log('all valid')"`
Expected: the five `*.json` files listed, then `all valid`.

- [ ] **Step 7: Commit**

```bash
git add test/build.test.mjs src/build.mjs themes/
git commit -m "Add build script and generate the five theme files"
```

---

## Task 5: Manifest consistency test (TDD)

**Files:**
- Test: `test/manifest.test.mjs`

- [ ] **Step 1: Write the test (it should pass immediately — package.json and themes already exist)**

```js
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
```

- [ ] **Step 2: Run the full suite to verify everything passes together**

Run: `npm test`
Expected: all four test files run, `# fail 0`.

- [ ] **Step 3: Commit**

```bash
git add test/manifest.test.mjs
git commit -m "Add manifest/palette/theme-file consistency test"
```

---

## Task 6: Docs, license & packaging ignore list

**Files:**
- Create: `README.md`, `CHANGELOG.md`, `LICENSE`, `.vscodeignore`

- [ ] **Step 1: Create `.vscodeignore`**

```
.git/
.gitignore
.superpowers/
docs/
src/
test/
scripts/
examples/
assets/icon.svg
node_modules/
*.vsix
```

- [ ] **Step 2: Create `LICENSE` (MIT + disclaimer)**

```
MIT License

Copyright (c) 2026 Ashmit Biswas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

Unofficial fan-made theme. Not affiliated with, endorsed by, or associated with
CD Projekt RED. "Cyberpunk" is used as a genre descriptor. Uses no game assets.
```

- [ ] **Step 3: Create `CHANGELOG.md`**

```markdown
# Changelog

## 0.1.0
- Initial release: five dark themes — Arasaka Corpo, Samurai, Arasaka Dim, Samurai Dim, Japantown.
```

- [ ] **Step 4: Create `README.md`**

```markdown
# Cyberpunk Night City

Five dark VS Code themes inspired by Night City — built on the comfort of One Dark, with neon accents kept to the chrome so they're easy on the eyes for long sessions.

> Unofficial fan-made theme. Not affiliated with, endorsed by, or associated with CD Projekt RED. Uses no game assets.

## Themes

- **Arasaka Corpo** — clinical, high-contrast: blood-red + crisp white + steel cyan on blue-black.
- **Samurai** — the electric-yellow look: yellow + glitch cyan/red on olive-black.
- **Arasaka Dim** — lower-contrast late-night cut of Arasaka.
- **Samurai Dim** — lower-contrast late-night cut of Samurai.
- **Japantown** — cozy Westbrook neon: lavender-magenta + sakura + teal on ink-purple.

## Install

- **Marketplace:** search "Cyberpunk Night City" in the Extensions view.
- **From file:** `code --install-extension cyberpunk-night-city-<version>.vsix`

Then: `Ctrl/Cmd+K Ctrl/Cmd+T` → pick a "Cyberpunk Night City" theme.

## Recommended settings

```json
{
  "editor.semanticHighlighting.enabled": true,
  "editor.bracketPairColorization.enabled": true
}
```

## Screenshots

_Screenshots added after first release (see `docs/`)._

## Develop

```bash
npm install      # only needed for the icon (sharp) and packaging
npm test         # run the generator unit tests
npm run build    # regenerate themes/*.json from src/palettes.mjs
```

Colors live in `src/palettes.mjs`; the role→VS Code mapping lives in `src/template.mjs`. Never edit `themes/*.json` by hand — they are generated.

## License

MIT. See `LICENSE`.
```

- [ ] **Step 5: Commit**

```bash
git add README.md CHANGELOG.md LICENSE .vscodeignore
git commit -m "Add README, changelog, license, and vscodeignore"
```

---

## Task 7: Marketplace icon

**Files:**
- Create: `assets/icon.svg`, `scripts/render-icon.mjs`
- Generates: `assets/icon.png`
- Modify: `package.json` (add `"icon"` field)

> Packaging works without an icon, so this task is independent of Task 8's local-install milestone. If `sharp` fails to install in this environment, skip rasterization, leave the `icon` field out of `package.json`, and treat the icon as an Open Item.

- [ ] **Step 1: Create `assets/icon.svg`** (olive-black tile, chromatic-glitch `</>` in electric yellow with red/cyan offsets, marketing underline)

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="44" fill="#15120a"/>
  <g font-family="monospace" font-weight="bold" font-size="92" text-anchor="middle">
    <text x="125" y="150" fill="#00d7f2">&lt;/&gt;</text>
    <text x="131" y="150" fill="#ff3864">&lt;/&gt;</text>
    <text x="128" y="150" fill="#fcee0a">&lt;/&gt;</text>
  </g>
  <rect x="56" y="186" width="144" height="10" rx="2" fill="#fcee0a"/>
</svg>
```

- [ ] **Step 2: Add `sharp` as a dev dependency**

Run: `npm install --save-dev sharp`
Expected: `sharp` appears under `devDependencies` in `package.json`; `node_modules/` populated (gitignored).

- [ ] **Step 3: Create `scripts/render-icon.mjs`**

```js
// scripts/render-icon.mjs
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "assets/icon.svg"));
await sharp(svg).resize(256, 256).png().toFile(join(root, "assets/icon.png"));
console.log("Wrote assets/icon.png");
```

- [ ] **Step 4: Render the PNG**

Run: `node scripts/render-icon.mjs`
Expected: `Wrote assets/icon.png`, and `assets/icon.png` exists (256×256).

- [ ] **Step 5: Add the `icon` field to `package.json`**

Add this top-level key (after `"galleryBanner"`):

```json
  "icon": "assets/icon.png",
```

- [ ] **Step 6: Add an `icon` build script to `package.json` scripts**

Change the `scripts` block to:

```json
  "scripts": {
    "build": "node src/build.mjs",
    "icon": "node scripts/render-icon.mjs",
    "test": "node --test"
  },
```

- [ ] **Step 7: Verify package.json still parses**

Run: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('ok')"`
Expected: `ok`

- [ ] **Step 8: Commit**

```bash
git add assets/icon.svg assets/icon.png scripts/render-icon.mjs package.json package-lock.json
git commit -m "Add Marketplace icon and renderer"
```

---

## Task 8: Package & local-install verification (manual)

**Files:**
- Create: `examples/sample.ts`, `examples/sample.py`, `examples/sample.md` (QA fixtures; gitignored from the `.vsix` via `.vscodeignore`)

- [ ] **Step 1: Create QA fixture `examples/sample.ts`**

```ts
// Night City grid bootstrap
import { Grid } from "night-city";

class District {
  readonly name: string;
  power = 0xfcee0a;
  constructor(name: string) {
    this.name = name;
  }
  glow(level = 5): string {
    return `${this.name}: ${level > 0 ? "online" : "offline"}`;
  }
}

const tygers = new District("japantown");
console.log(tygers.glow());
```

- [ ] **Step 2: Create QA fixture `examples/sample.py`**

```python
from dataclasses import dataclass

@dataclass
class District:
    name: str
    power: int = 0xFCEE0A

    def glow(self, level: int = 5) -> str:
        # jack into the grid
        return f"{self.name}: {'online' if level > 0 else 'offline'}"

tygers = District("japantown")
print(tygers.glow())
```

- [ ] **Step 3: Create QA fixture `examples/sample.md`**

```markdown
# Night City

Districts: **Arasaka**, _Samurai_, `Japantown`.

- [link](https://example.com)
- `inline code`

> Wake the f*** up, samurai.
```

- [ ] **Step 4: Package the extension**

Run: `npx --yes @vscode/vsce package`
Expected: a `cyberpunk-night-city-0.1.0.vsix` is created. (A warning about the placeholder `publisher` is fine for local install.)

- [ ] **Step 5: Install the VSIX**

Run: `code --install-extension cyberpunk-night-city-0.1.0.vsix --force`
Expected: `Extension 'cyberpunk-night-city-0.1.0.vsix' was successfully installed.`

- [ ] **Step 6: Manual QA — work through this checklist for ALL FIVE themes**

For each theme (`Ctrl/Cmd+K Ctrl/Cmd+T` → select), open the three `examples/` fixtures and confirm:

- [ ] Comments are italic; keyword / function / string / class / this+property / number are each visually distinct.
- [ ] No large unstyled (default-grey) regions — spot-check with **Developer: Inspect Editor Tokens and Scopes**.
- [ ] Status bar reads as a dark surface with the accent-colored top edge (not a bright fill).
- [ ] Cursor is electric yellow (`#fcee0a`); confirm it's legible on Arasaka — if it disappears, note it (spec QA exception allows switching Arasaka's cursor to its red accent).
- [ ] Terminal: run `ls`/`git status` and confirm ANSI colors are readable on the tinted background.
- [ ] Make an edit in a git repo file → diff gutter (added/modified/deleted) colors show; open a diff and confirm insert/remove tints.
- [ ] Bracket pairs colorize; find-match + selection highlights are visible.
- [ ] Body text contrast is comfortable (Arasaka high-contrast by design; Japantown/Dims gentle).

- [ ] **Step 7: Fix any issues found**

If QA surfaces a color problem, edit the value in `src/palettes.mjs` (or a mapping in `src/template.mjs`), then:

Run: `npm test && npm run build`
Expected: `# fail 0`, then `Wrote 5 themes...`. Repackage (Step 4) and re-verify the affected theme.

- [ ] **Step 8: Commit fixtures and any fixes**

```bash
git add examples/ src/ themes/
git commit -m "Add QA fixtures and verification fixes"
```

> Add `examples/` to `.gitignore`? No — keep fixtures in the repo for future QA; they're already excluded from the `.vsix` by `.vscodeignore`.

---

## Task 9: Publish (BLOCKED on Open Items — do not run until ready)

**Prerequisites (user provides):** a Marketplace publisher ID + an Azure DevOps Personal Access Token. Until then, the local `.vsix` from Task 8 is the deliverable.

- [ ] **Step 1: Set the real publisher**

Replace `"publisher": "REPLACE_WITH_PUBLISHER_ID"` in `package.json` with the real publisher ID. Commit.

- [ ] **Step 2: Log in**

Run: `npx --yes @vscode/vsce login <publisher-id>`
Expected: prompts for the PAT; confirms login.

- [ ] **Step 3: Publish**

Run: `npx --yes @vscode/vsce publish`
Expected: upload succeeds; the extension appears on the Marketplace within a few minutes.

- [ ] **Step 4: (Optional) Mirror to Open VSX**

Run: `npx --yes ovsx publish cyberpunk-night-city-0.1.0.vsix -p <openvsx-token>`
Expected: published to Open VSX.

---

## Self-Review (completed by plan author)

- **Spec coverage:** 5 themes (Tasks 2,4) · One Dark roles + scope map (Task 3 `tokens`/`semantic`) · calm chrome / accent status border (Task 3 `workbench`, with the 2px→1px note) · electric-yellow cursor + Arasaka QA exception (Task 3 + Task 8 Step 6) · identity-tinted backgrounds (palette `bg`/`bgDark`/`bgLight`, Task 2) · generator architecture (Tasks 3–4) · full workbench/terminal/git/diff/bracket/peek coverage (Task 3) · package/publish flow (Tasks 8–9) · trademark posture (Task 6 README/LICENSE) · verification criteria (Task 8). All covered.
- **Out-of-scope respected:** no light themes, no extra dim cuts, no user-configurable colors, color themes only.
- **Type/name consistency:** palette role keys (`bg,bgDark,bgLight,fg,comment,keyword,string,func,cls,prop,num,accent,selection,cursor` + `ansi.{red,green,yellow,blue,magenta,cyan}`) are identical across `palettes.mjs`, `template.mjs`, and all tests. `buildTheme`/`buildAll` signatures match their call sites. Slugs in `palettes.mjs` match the `themes/*.json` filenames and `package.json` `contributes.themes` paths.
- **Placeholders:** none — every code/command step is concrete. The only intentional placeholder is `publisher`, flagged as a user-provided Open Item.
