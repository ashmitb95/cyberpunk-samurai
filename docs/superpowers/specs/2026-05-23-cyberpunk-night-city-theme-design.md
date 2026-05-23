# Cyberpunk — Night City: VS Code Theme Family — Design

**Date:** 2026-05-23
**Status:** Approved
**Repo:** `~/projects/cyberpunk-night-city`

## Summary

A single VS Code extension contributing **five dark color themes** inspired by Cyberpunk 2077 / Night City, built on the comfort structure of One Dark Pro Darker (the user's favorite). The themes share one token-role system and one "calm chrome" language; they differ only in a ~15-color palette each. Published to the VS Code Marketplace.

The five themes:

| Theme | Role | Personality |
|-------|------|-------------|
| **Arasaka Corpo** | Flagship | Clinical, high-contrast: blood-red + crisp white + steel cyan/blue on blue-black |
| **Samurai** | Flagship | Iconic CP2077 marketing look: electric yellow + glitch cyan/red on olive-black |
| **Arasaka Dim** | Soft cut | Lower-contrast late-night version of Arasaka |
| **Samurai Dim** | Soft cut | Lower-contrast late-night version of Samurai |
| **Japantown** | Alt-universe | Cozy Westbrook neon: lavender-magenta + sakura + teal on ink-purple |

## Design Principles

1. **One Dark token roles.** Keep the role structure the user is comfortable with — keyword, function, string, class/type, this+property, number — and only swap hues per theme.
2. **Neon as accent, not flood.** Code body stays comfortable (pastel-ish saturation, except Arasaka/Samurai which run intentionally crisp). Bold neon lives in the chrome as a thin accent: a **2px accent top-border on the status bar** over a dark surface — never a bright fill (the bright magenta/yellow status bar was rejected as "hitting the eye").
3. **Electric-yellow cursor** (`#FCEE0A`) as the unifying CP signature across all themes. (QA exception: if it reads off against Arasaka's red, fall back to the red accent for that theme.)
4. **Cohesive family.** All five feel like one product: same chrome, same role map, district-named variants.
5. **Identity-tinted backgrounds.** Each theme's black is tinted toward its identity hue — Arasaka blue-black, Samurai olive/yellow-black, Japantown purple-black — so no theme reads as plain dark grey. Dim cuts lift the background a step for lower contrast.

## Palettes (canonical hex)

Roles: `bg` editor background · `bgDark` panels/sidebar/activity bar · `bgLight` widgets/hovers · `fg` default text · `comment` (italic) · `keyword` · `string` · `func` (functions/methods) · `class` (types/classes) · `prop` (`this` + properties) · `num` (numbers/constants) · `accent` (status edge, badges, links).

### Arasaka Corpo (flagship)
```
bg      #090d14   fg       #e3eaf2   keyword  #f63a4c
bgDark  #06090f   comment  #4a5568   string   #56b6c2
bgLight #10151e   func     #6f9fd8   class    #88c0d0
prop    #f63a4c   num      #cdb88a   accent   #f63a4c
selection #21323f (≈ rgba steel)     cursor   #fcee0a
```

### Arasaka Dim (soft cut of flagship)
```
bg      #0c1018   fg       #c2ccd6   keyword  #d86575
bgDark  #080c13   comment  #4a5568   string   #5aa6b0
bgLight #141a24   func     #6e96c4   class    #82b3c0
prop    #d86575   num      #c0ac84   accent   #d86575
cursor  #fcee0a
```

### Samurai (flagship, electric yellow)
```
bg      #15120a   fg       #e8e4cb   keyword  #fcee0a
bgDark  #100d07   comment  #736f50   string   #c8e64b
bgLight #1d1910   func     #00d7f2   class    #ff5cae
prop    #ff3864   num      #ff3864   accent   #fcee0a
selection ≈ rgba(255,56,100,0.18)    cursor   #fcee0a
```

### Samurai Dim (soft cut of flagship)
```
bg      #17140c   fg       #cfccb4   keyword  #d6c93a
bgDark  #120f08   comment  #635f47   string   #a8c050
bgLight #1f1b12   func     #4eaebd   class    #d97aa6
prop    #d95f7a   num      #d95f7a   accent   #d6c93a
cursor  #fcee0a
```

### Japantown (alt-universe)
```
bg      #120e1a   fg       #b9b4cc   keyword  #b98ad9
bgDark  #0d0a14   comment  #5a5470   string   #5cc2b0
bgLight #1a1524   func     #5bb8d6   class    #e69ec4
prop    #d98aa8   num      #d6b066   accent   #d98aa8
cursor  #fcee0a
```

## Architecture

### Components
- **`package.json`** — extension manifest: `categories: ["Themes"]`, `contributes.themes` (5 entries → `themes/*.json`), `publisher`, `icon`, `galleryBanner`, `keywords`, `repository`, `engines.vscode`.
- **`src/palettes.mjs`** — exports an array of palette objects (theme meta + the ~15 role colors + a 16-color ANSI terminal map per theme).
- **`src/template.mjs`** — `buildTheme(palette)` → a complete VS Code theme object: `colors{}` (workbench), `tokenColors[]` (TextMate scopes), `semanticTokenColors{}`. This is the single place the role→key mapping lives.
- **`src/build.mjs`** — iterates palettes, writes `themes/<slug>.json`. Run via `npm run build`. Plain Node ESM — no TypeScript toolchain.
- **`themes/*.json`** — generated output VS Code loads (committed, so the extension works without a build step at install time).
- **`assets/icon.png`** — 128×128+ Marketplace icon (glitch wordmark / NC motif in yellow + red + cyan).
- **`README.md`**, **`CHANGELOG.md`**, **`LICENSE`**, **`.vscodeignore`** (excludes `src/`, `docs/`, `.superpowers/`).

### Why a generator (vs hand-authored JSON)
Five themes share ~90% identical structure. A generator guarantees consistency, makes a chrome tweak a one-line change across all five, and makes future variants trivial. Output JSON is committed so there's no install-time build dependency.

### Role → scope mapping (in `template.mjs`)
- **keyword** → `keyword`, `keyword.control`, `storage`, `storage.type`, `storage.modifier`
- **string** → `string`, `string.quoted`, `string.template`, `punctuation.definition.string`
- **func** → `entity.name.function`, `support.function`, `meta.function-call`, `entity.other.attribute-name` (HTML attrs)
- **class** → `entity.name.type`, `entity.name.class`, `support.type`, `support.class`, `entity.name.tag`
- **prop** → `variable.language.this`, `variable.other.property`, `support.variable.property`, `meta.object-literal.key`
- **num** → `constant.numeric`, `constant.language` (true/false/null), `constant.other`
- **comment** → `comment`, `punctuation.definition.comment` (italic)
- **fg/variable** → `variable`, `variable.other.readwrite`, punctuation
- **Semantic tokens** mirror the same roles (`namespace`, `class`, `function`, `variable`, `parameter`, `property`, `enumMember`).

### Workbench coverage (per theme)
Editor (bg/fg/cursor/selection/line-highlight/indent-guides/whitespace), gutter & line numbers, sidebar/activity bar/tabs/title bar, **status bar (dark surface + 2px accent top border + accent branch text)**, terminal **ANSI 16**, git decorations, diff editor (insert/remove), bracket-pair colors, find/match & selection highlights, peek view, breadcrumbs, notifications, command palette, scrollbar, badges, links, input/dropdown widgets.

## Build, Package & Publish

1. `npm run build` → emits `themes/*.json`.
2. `npx @vscode/vsce package` → `cyberpunk-night-city-<version>.vsix`.
3. Install locally: `code --install-extension <file>.vsix` → verify.
4. Publish: `npx @vscode/vsce publish` — requires a **Marketplace publisher** + an **Azure DevOps Personal Access Token** (user creates these). Optional mirror to Open VSX via `ovsx`.

## Marketplace Identity & Trademark

- **displayName:** "Cyberpunk Night City" (working title). "Cyberpunk" used as a **genre word**.
- **Avoid:** "Cyberpunk 2077", CD Projekt RED logos/marks, and any game art/assets.
- **Disclaimer** (README + LICENSE): "Unofficial fan-made theme. Not affiliated with, endorsed by, or associated with CD Projekt RED. Uses no game assets." Code under MIT.
- Risk: even genre-word use carries some Marketplace-policy risk; the disclaimer + no-assets posture is the mitigation. User accepted this tradeoff.
- **Variant display names:** `Cyberpunk Night City: Arasaka Corpo`, `… Arasaka Dim`, `… Samurai`, `… Samurai Dim`, `… Japantown`.

## Verification (success criteria)

Install the `.vsix` and, for **each** of the five themes:
- Render sample files across **JS/TS, Python, JSON, Markdown, HTML/CSS, shell** — every token role visually distinct and readable.
- Use **Developer: Inspect Editor Tokens and Scopes** to confirm scope coverage (no large unstyled regions).
- Check chrome surfaces: **terminal ANSI**, **diff editor**, **git gutter**, **bracket-pair colors**, find-match, selection, peek view, notifications.
- Contrast: body text ≥ ~4.5:1 against `bg`; accents legible. Arasaka runs high-contrast by design; Japantown/Arasaka-Dim run gentle.

## Out of Scope (v1)
- Light themes.
- Per-theme dim cuts beyond Arasaka Dim and Samurai Dim (no Japantown dim).
- Configurable/customizable colors via settings.
- Icon themes / product icon themes (color themes only).

## Open Items
1. **Publisher name + PAT** — user to create before publishing.
2. **Icon art** — needs design; placeholder until then.
3. **Final displayName** — confirm exact string.
4. **GitHub repo** — optional for v1 (needed for `repository` link / README screenshots hosting).
