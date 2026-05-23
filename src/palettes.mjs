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
      fg: "#c2ccd6", comment: "#4a5568", muted: "#6b7787",
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
      cls: "#ff5cae", prop: "#fcee0a", num: "#fcee0a",
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
      cls: "#d97aa6", prop: "#c9aa48", num: "#c9aa48",
      accent: "#d6c93a", selection: "#d95f7a26", cursor: "#fcee0a",
    },
    ansi: { red: "#d95f7a", green: "#a8c050", yellow: "#d6c93a", blue: "#5a96cc", magenta: "#d97aa6", cyan: "#4eaebd" },
  },
  {
    slug: "tyger-claw",
    label: "Cyberpunk Samurai: Tyger Claw",
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
  {
    slug: "trauma-team",
    label: "Cyberpunk Samurai: Trauma Team",
    type: "dark",
    colors: {
      bg: "#082228", bgDark: "#05181d", bgLight: "#103138",
      fg: "#eaf2f3", comment: "#648b93",
      keyword: "#ef5346", string: "#74d6b4", func: "#5cc6e6",
      cls: "#aee9f0", prop: "#f47b6f", num: "#f2c879",
      accent: "#ef5346", selection: "#ef534633", cursor: "#ef5346",
    },
    ansi: { red: "#ef5346", green: "#74d6b4", yellow: "#f2c879", blue: "#5cc6e6", magenta: "#e88fa8", cyan: "#aee9f0" },
  },
  {
    slug: "trauma-team-holo",
    label: "Cyberpunk Samurai: Trauma Team Holo",
    type: "dark",
    colors: {
      bg: "#082228", bgDark: "#05181d", bgLight: "#103138",
      fg: "#eaf2f3", comment: "#648b93",
      keyword: "#ff4f6d", string: "#5fe3d0", func: "#6aa8ff",
      cls: "#c8b6ff", prop: "#ff9e7a", num: "#ffe08a",
      accent: "#ff4f6d", selection: "#ff4f6d33", cursor: "#ff4f6d",
    },
    ansi: { red: "#ff4f6d", green: "#6ee0b0", yellow: "#ffe08a", blue: "#6aa8ff", magenta: "#c8b6ff", cyan: "#5fe3d0" },
  },
  {
    slug: "maelstrom",
    label: "Cyberpunk Samurai: Maelstrom",
    type: "dark",
    colors: {
      bg: "#160c08", bgDark: "#0f0705", bgLight: "#231310",
      fg: "#efe2d0", comment: "#836a54",
      keyword: "#ef3c1a", string: "#9c8c50", func: "#e0784a",
      cls: "#ec9a3a", prop: "#e62214", num: "#f0602a",
      accent: "#ec3418", selection: "#ec341833", cursor: "#e62214",
    },
    ansi: { red: "#e62214", green: "#9aa84e", yellow: "#f0a838", blue: "#7d97a2", magenta: "#d97a5e", cyan: "#6fa89c" },
  },
  {
    slug: "maelstrom-chrome",
    label: "Cyberpunk Samurai: Maelstrom Chrome",
    type: "dark",
    colors: {
      bg: "#110d0a", bgDark: "#0b0805", bgLight: "#1c1511",
      fg: "#ddd2c0", comment: "#6e6151",
      keyword: "#ec441f", string: "#847e50", func: "#82a0ad",
      cls: "#c89a4e", prop: "#e22817", num: "#c25a38",
      accent: "#dd3c1c", selection: "#dd3c1c33", cursor: "#e22817",
    },
    ansi: { red: "#e22817", green: "#8a9a5a", yellow: "#c89a4e", blue: "#82a0ad", magenta: "#c47a64", cyan: "#6f968f" },
  },
];
