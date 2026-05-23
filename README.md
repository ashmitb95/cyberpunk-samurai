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
