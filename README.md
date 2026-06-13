# deck-command

MaC `/deck` engine. Turn a Slack thread into a hosted deck.

## What it does
Operator types `/deck pitch` or `/deck doc` in a Slack thread. The engine reads the thread, generates a structured deck JSON, renders it through `template/deck.html`, and publishes to `decks.makeacompany.ai/<slug>/`.

## Repo layout
- `template/deck.html` — the deck template (dark, Inter, no footer branding)
- `engine/render.mjs` — takes `deck.json` → writes `decks/<slug>/index.html`
- `engine/prompt.md` — the LLM prompt for thread → deck.json
- `engine/schema.json` — JSON schema the LLM output must match
- `decks/<slug>/` — generated deck instances (JSON source + rendered HTML)
- `index.html` — landing page at `decks.makeacompany.ai/`

## Render a deck locally
```
node engine/render.mjs decks/<slug>/deck.json
```

## v1 status
- ✅ Template
- ✅ Renderer
- ✅ Hosting (GitHub Pages → `decks.makeacompany.ai`)
- ⏳ LLM engine (thread → deck.json wrapper around Claude)
- ⏳ PDF generator (headless Chromium pass over rendered HTML)
- ⏳ Slack slash-command wiring (lives in `claude-code-ross`)

## Spec
See [`specs/deck-command.md`](https://github.com/BimRoss/deck-command/blob/main/specs/deck-command.md) in the calling workspace.
