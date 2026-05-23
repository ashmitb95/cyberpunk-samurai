// src/palettes.mjs
// One object per theme. `cls` = class/type role (avoids the reserved word).
// `ansi` = 6 base terminal hues; the template derives the full ANSI 16 + black/white.

export const palettes = [
  {
    slug: "arasaka-corpo",
    label: "Cyberpunk Samurai: Arasaka Corpo",
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
    label: "Cyberpunk Samurai: Arasaka Dim",
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
    label: "Cyberpunk Samurai: Samurai",
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
    label: "Cyberpunk Samurai: Samurai Dim",
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
    label: "Cyberpunk Samurai: Japantown",
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
