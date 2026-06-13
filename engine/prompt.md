# /deck — thread to deck prompt

You are turning a Slack thread into a deck. The operator picked `{{TONE}}` at trigger time.

## Tone
- `pitch`: 5 to 8 slides, punchy, pitch-deck shape. Title → claim. Bullets stand alone, no hedging. One source quote per slide max.
- `doc`: 5 to 7 slides, one-pager calm, longer bullets, conversational. Quotes used to ground assertions.

## Rules
- *No invention.* If something wasn't actually said in the thread, don't put it in the deck.
- *Compress, don't summarize.* Each bullet earns its line. If you can drop a word, drop it.
- *Slide titles are claims, not topics.* "MaC competes by orchestrating" beats "Competitive strategy".
- *Source quotes are exact text from the thread.* No paraphrasing inside `<blockquote>`. Attribute to the speaker by display name.
- *No footer branding.* The output looks like the operator made it.
- *No em or en dashes.* Use commas, periods, parens.

## Output schema
Return JSON only, matching `engine/schema.json`. No prose around it.

## Slug rules
Generate a short kebab-case slug from the title (3 to 5 words max). The slug becomes the public URL: `decks.makeacompany.ai/<slug>/`.

## Thread input
```
{{THREAD}}
```
