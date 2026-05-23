# Cyberpunk Samurai

Five dark VS Code themes inspired by Night City — built on the comfort of One Dark, with neon accents kept to the chrome so they're easy on the eyes for long sessions.

## Themes

- **Arasaka Corpo** — clinical, high-contrast: blood-red + crisp white + steel cyan on blue-black.
- **Samurai** — the electric-yellow look: yellow + glitch cyan/red on olive-black.
- **Arasaka Dim** — lower-contrast late-night cut of Arasaka.
- **Samurai Dim** — lower-contrast late-night cut of Samurai.
- **Japantown** — cozy Westbrook neon: lavender-magenta + sakura + teal on ink-purple.

## Install

- **Marketplace:** search "Cyberpunk Samurai" in the Extensions view.
- **From file:** `code --install-extension cyberpunk-samurai-<version>.vsix`

Then: `Ctrl/Cmd+K Ctrl/Cmd+T` → pick a "Cyberpunk Samurai" theme.

## Recommended settings

```json
{
  "editor.semanticHighlighting.enabled": true,
  "editor.bracketPairColorization.enabled": true
}
```

## Screenshots

All shots show the same TypeScript file ([`examples/showcase.ts`](examples/showcase.ts)) so you can compare the palettes directly.

### Arasaka Corpo
![Cyberpunk Samurai — Arasaka Corpo](https://raw.githubusercontent.com/ashmitb95/cyberpunk-samurai/master/assets/screenshots/arasaka-corpo.png)

### Samurai
![Cyberpunk Samurai — Samurai](https://raw.githubusercontent.com/ashmitb95/cyberpunk-samurai/master/assets/screenshots/samurai.png)

### Arasaka Dim
![Cyberpunk Samurai — Arasaka Dim](https://raw.githubusercontent.com/ashmitb95/cyberpunk-samurai/master/assets/screenshots/arasaka-dim.png)

### Samurai Dim
![Cyberpunk Samurai — Samurai Dim](https://raw.githubusercontent.com/ashmitb95/cyberpunk-samurai/master/assets/screenshots/samurai-dim.png)

### Japantown
![Cyberpunk Samurai — Japantown](https://raw.githubusercontent.com/ashmitb95/cyberpunk-samurai/master/assets/screenshots/japantown.png)

> Screenshots are generated from the theme files: `node scripts/screenshots.mjs`.

## Develop

```bash
npm install      # only needed for the icon (sharp) and packaging
npm test         # run the generator unit tests
npm run build    # regenerate themes/*.json from src/palettes.mjs
```

Colors live in `src/palettes.mjs`; the role→VS Code mapping lives in `src/template.mjs`. Never edit `themes/*.json` by hand — they are generated.

## License

MIT. See `LICENSE`.
