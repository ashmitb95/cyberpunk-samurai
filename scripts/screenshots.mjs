// Generate VS Code window screenshots for every theme.
// Pipeline: Shiki tokenizes examples/showcase.ts with each theme file ->
// build a VS Code-style window as an SVG using the theme's workbench colors ->
// sharp rasterizes the SVG to assets/screenshots/<theme>.png (@2x).
//
// Usage:  node scripts/screenshots.mjs [themeBasenameFilter]
//   e.g.  node scripts/screenshots.mjs samurai

import { createHighlighter } from "shiki";
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "assets", "screenshots");
const SAMPLE = path.join(ROOT, "examples", "showcase.ts");
const SAVE_SVG = process.env.SAVE_SVG === "1";

const THEME_FILES = [
  "arasaka-corpo.json",
  "samurai.json",
  "arasaka-dim.json",
  "samurai-dim.json",
  "tyger-claw.json",
  "trauma-team.json",
  "trauma-team-holo.json",
  "maelstrom.json",
  "maelstrom-chrome.json",
];

// ---- layout (logical px; rasterized @2x) ----
const PAD = 28;
const WIN_W = 1180;
const TITLE_H = 36;
const TABS_H = 36;
const STATUS_H = 26;
const ACT_W = 48;
const SIDE_W = 250;
const LINE_H = 21;
const CODE_FS = 13.5;
const CODE_TOP_PAD = 14;
const ACTIVE_LINE = 22; // 0-based -> the "export async function breach" line
const FONT_CODE = "Menlo, monospace";
const FONT_UI = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const ICONS = [
  `<path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M13 3v5h5"/>`,
  `<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>`,
  `<circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="9" r="2.4"/><path d="M6 8.4v7.2M8.4 7C13 7 15.6 8 15.6 11"/>`,
  `<polygon points="7 4 20 12 7 20 7 4"/>`,
  `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 17.5h7M17.5 14v7"/>`,
];

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const code = (await readFile(SAMPLE, "utf8")).replace(/\s+$/, "");
  const lineCount = code.split("\n").length;

  const filter = process.argv[2];
  const wanted = THEME_FILES.filter((f) => !filter || f.includes(filter));
  const themes = await Promise.all(
    wanted.map(async (f) => JSON.parse(await readFile(path.join(ROOT, "themes", f), "utf8")))
  );

  const highlighter = await createHighlighter({ themes, langs: ["typescript"] });

  for (let i = 0; i < wanted.length; i++) {
    const base = wanted[i].replace(/\.json$/, "");
    const theme = themes[i];
    const { tokens } = highlighter.codeToTokens(code, { lang: "typescript", theme: theme.name });
    const svg = buildSvg(theme, tokens, lineCount);
    if (SAVE_SVG) await writeFile(path.join(OUT_DIR, `${base}.svg`), svg);
    await sharp(Buffer.from(svg)).png().toFile(path.join(OUT_DIR, `${base}.png`));
    console.log(`✓ ${base}.png  (${theme.name})`);
  }
  console.log(`\nDone -> ${path.relative(ROOT, OUT_DIR)}/`);
}

function buildSvg(theme, tokens, lineCount) {
  const co = theme.colors || {};
  const c = (...keys) => {
    const lit = keys.pop();
    for (const k of keys) if (co[k]) return co[k];
    return lit;
  };
  const fg = c("editor.foreground", "foreground", "#cdd6f4");
  const editorBg = c("editor.background", "#0a0e16");
  const accent = c("focusBorder", "activityBarBadge.background", "button.background", "#7dd3fc");
  const titleBg = c("titleBar.activeBackground", "editorGroupHeader.tabsBackground", editorBg);
  const titleFg = c("titleBar.activeForeground", "foreground", fg);
  const actBg = c("activityBar.background", editorBg);
  const actFg = c("activityBar.foreground", "foreground", fg);
  const actDim = c("activityBar.inactiveForeground", actFg);
  const sideBg = c("sideBar.background", editorBg);
  const sideFg = c("sideBar.foreground", "foreground", fg);
  const headFg = c("sideBarSectionHeader.foreground", sideFg);
  const selBg = c("list.activeSelectionBackground", "list.inactiveSelectionBackground", accent);
  const selFg = c("list.activeSelectionForeground", sideFg);
  const tabsBg = c("editorGroupHeader.tabsBackground", actBg);
  const tabAcBg = c("tab.activeBackground", editorBg);
  const tabAcFg = c("tab.activeForeground", "foreground", fg);
  const tabInBg = c("tab.inactiveBackground", tabsBg);
  const tabInFg = c("tab.inactiveForeground", actDim);
  const tabTop = c("tab.activeBorderTop", "tab.activeBorder", accent);
  const lnFg = c("editorLineNumber.foreground", "#5b667a");
  const lnAcFg = c("editorLineNumber.activeForeground", fg);
  const lineHi = c("editor.lineHighlightBackground", "rgba(255,255,255,0.04)");
  const stBg = c("statusBar.background", actBg);
  const stFg = c("statusBar.foreground", "foreground", fg);

  const editorContentH = lineCount * LINE_H + 24;
  const bodyH = TABS_H + editorContentH;
  const WIN_H = TITLE_H + bodyH + STATUS_H;
  const W = WIN_W + PAD * 2;
  const H = WIN_H + PAD * 2;

  const x0 = PAD, y0 = PAD;
  const bodyTop = y0 + TITLE_H;
  const sideX = x0 + ACT_W;
  const edX = x0 + ACT_W + SIDE_W;
  const edColW = WIN_W - ACT_W - SIDE_W;
  const codeTop = bodyTop + TABS_H + CODE_TOP_PAD;
  const gutterR = edX + 50;
  const codeX = edX + 64;
  const statusY = bodyTop + bodyH;

  const parts = [];

  // backdrop + soft shadow
  parts.push(`<rect width="${W}" height="${H}" fill="${darken(editorBg)}"/>`);
  parts.push(`<rect x="${x0}" y="${y0 + 12}" width="${WIN_W}" height="${WIN_H}" rx="14" fill="#000" opacity="0.38"/>`);

  parts.push(`<g clip-path="url(#win)">`);
  // base
  parts.push(`<rect x="${x0}" y="${y0}" width="${WIN_W}" height="${WIN_H}" fill="${editorBg}"/>`);
  // title bar
  parts.push(`<rect x="${x0}" y="${y0}" width="${WIN_W}" height="${TITLE_H}" fill="${titleBg}"/>`);
  const lights = ["#ff5f57", "#febc2e", "#28c840"];
  lights.forEach((col, i) =>
    parts.push(`<circle cx="${x0 + 18 + i * 18}" cy="${y0 + 18}" r="6" fill="${col}"/>`)
  );
  parts.push(
    `<text x="${x0 + WIN_W / 2}" y="${y0 + 23}" text-anchor="middle" font-family="${FONT_UI}" font-size="12.5" fill="${titleFg}" opacity="0.85">showcase.ts — cyberpunk-samurai</text>`
  );
  // activity bar
  parts.push(`<rect x="${x0}" y="${bodyTop}" width="${ACT_W}" height="${bodyH}" fill="${actBg}"/>`);
  ICONS.forEach((d, i) => {
    const iy = bodyTop + 16 + i * 34;
    const col = i === 0 ? actFg : actDim;
    if (i === 0)
      parts.push(`<rect x="${x0}" y="${iy - 3}" width="2" height="28" fill="${accent}"/>`);
    parts.push(
      `<g transform="translate(${x0 + 13},${iy}) scale(0.92)" stroke="${col}" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round">${i === 3 ? d.replace('fill="none"', "") : d}</g>`
    );
  });
  // sidebar
  parts.push(`<rect x="${sideX}" y="${bodyTop}" width="${SIDE_W}" height="${bodyH}" fill="${sideBg}"/>`);
  parts.push(
    `<text x="${sideX + 16}" y="${bodyTop + 24}" font-family="${FONT_UI}" font-size="11" letter-spacing="0.8" fill="${headFg}" opacity="0.75">EXPLORER</text>`
  );
  const tree = [
    ["CYBERPUNK-SAMURAI", 0, "caret", null],
    ["examples", 1, "caret", null],
    ["showcase.ts", 2, "active", "#3178c6"],
    ["sample.py", 2, "file", "#ffd866"],
    ["themes", 1, "caret", null],
    ["samurai.json", 2, "file", "#f7768e"],
    ["arasaka-corpo.json", 2, "file", "#f7768e"],
    ["package.json", 1, "file", "#a6e22e"],
    ["README.md", 1, "file", accent],
  ];
  const treeTop = bodyTop + 42;
  tree.forEach(([label, depth, kind, dot], r) => {
    const ry = treeTop + r * 22;
    const tx = sideX + 12 + depth * 14;
    if (kind === "active")
      parts.push(`<rect x="${sideX}" y="${ry - 15}" width="${SIDE_W}" height="22" fill="${selBg}"/>`);
    const tcol = kind === "active" ? selFg : sideFg;
    if (kind === "caret")
      parts.push(`<text x="${tx}" y="${ry}" font-family="${FONT_UI}" font-size="9" fill="${tcol}" opacity="0.7">▾</text>`);
    if (dot)
      parts.push(`<rect x="${tx + 2}" y="${ry - 9}" width="9" height="9" rx="2" fill="${dot}"/>`);
    const labelX = kind === "caret" ? tx + 14 : tx + 16;
    parts.push(`<text x="${labelX}" y="${ry}" font-family="${FONT_UI}" font-size="12.5" fill="${tcol}">${esc(label)}</text>`);
  });
  // tabs
  parts.push(`<rect x="${edX}" y="${bodyTop}" width="${edColW}" height="${TABS_H}" fill="${tabsBg}"/>`);
  const tabW = 150;
  parts.push(`<rect x="${edX}" y="${bodyTop}" width="${tabW}" height="${TABS_H}" fill="${tabAcBg}"/>`);
  parts.push(`<rect x="${edX}" y="${bodyTop}" width="${tabW}" height="2" fill="${tabTop}"/>`);
  parts.push(`<rect x="${edX + 16}" y="${bodyTop + 12}" width="12" height="12" rx="3" fill="#3178c6"/>`);
  parts.push(`<text x="${edX + 22}" y="${bodyTop + 22}" text-anchor="middle" font-family="${FONT_UI}" font-size="7.5" font-weight="700" fill="#fff">TS</text>`);
  parts.push(`<text x="${edX + 36}" y="${bodyTop + 23}" font-family="${FONT_UI}" font-size="12.5" fill="${tabAcFg}">showcase.ts</text>`);
  parts.push(`<text x="${edX + tabW + 18}" y="${bodyTop + 23}" font-family="${FONT_UI}" font-size="12.5" fill="${tabInFg}">sample.py</text>`);
  // editor active-line highlight
  parts.push(`<rect x="${edX}" y="${codeTop + ACTIVE_LINE * LINE_H - 1}" width="${edColW}" height="${LINE_H}" fill="${lineHi}"/>`);
  // code: line numbers + tokens
  for (let i = 0; i < tokens.length; i++) {
    const baseY = codeTop + i * LINE_H + 15;
    const numCol = i === ACTIVE_LINE ? lnAcFg : lnFg;
    parts.push(
      `<text x="${gutterR}" y="${baseY}" text-anchor="end" font-family="${FONT_CODE}" font-size="${CODE_FS}" fill="${numCol}" opacity="0.85">${i + 1}</text>`
    );
    const spans = tokens[i]
      .map((t) => {
        const style = [];
        if (t.fontStyle & 1) style.push(`font-style="italic"`);
        if (t.fontStyle & 2) style.push(`font-weight="bold"`);
        return `<tspan fill="${t.color || fg}" ${style.join(" ")}>${esc(t.content)}</tspan>`;
      })
      .join("");
    if (tokens[i].length)
      parts.push(
        `<text x="${codeX}" y="${baseY}" xml:space="preserve" font-family="${FONT_CODE}" font-size="${CODE_FS}">${spans}</text>`
      );
  }
  // status bar
  parts.push(`<rect x="${x0}" y="${statusY}" width="${WIN_W}" height="${STATUS_H}" fill="${stBg}"/>`);
  parts.push(
    `<text x="${x0 + 14}" y="${statusY + 17}" font-family="${FONT_UI}" font-size="11.5" fill="${stFg}">⚡ main      ● 0   ▲ 0</text>`
  );
  parts.push(
    `<text x="${x0 + WIN_W - 14}" y="${statusY + 17}" text-anchor="end" font-family="${FONT_UI}" font-size="11.5" fill="${stFg}">Ln 23, Col 21      Spaces: 2      UTF-8      TypeScript</text>`
  );
  parts.push(`</g>`);
  // subtle window border
  parts.push(`<rect x="${x0 + 0.5}" y="${y0 + 0.5}" width="${WIN_W - 1}" height="${WIN_H - 1}" rx="11" fill="none" stroke="#ffffff" stroke-opacity="0.05"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}">
  <defs><clipPath id="win"><rect x="${x0}" y="${y0}" width="${WIN_W}" height="${WIN_H}" rx="11"/></clipPath></defs>
  ${parts.join("\n  ")}
</svg>`;
}

function darken(hex) {
  const m = /^#([0-9a-f]{6})/i.exec(hex);
  if (!m) return "#05070b";
  const n = parseInt(m[1], 16);
  const d = (v, k) => Math.max(0, ((n >> k) & 255) - 6);
  return `rgb(${d(0, 16)},${d(0, 8)},${d(0, 0)})`;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
