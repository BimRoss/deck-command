#!/usr/bin/env node
// render.mjs — turn a deck.json into a hosted HTML page.
// Usage: node engine/render.mjs <path-to-deck.json>
// Writes decks/<slug>/index.html in the repo root.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const escape = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

function renderSlide(slide, idx) {
  const num = String(idx + 1).padStart(2, '0');
  const bullets = (slide.bullets || []).map(b => `      <li>${escape(b)}</li>`).join('\n');
  const quote = slide.quote
    ? `\n    <blockquote>${escape(slide.quote.text)}<cite>${escape(slide.quote.author || '')}</cite></blockquote>`
    : '';
  return `  <section class="slide">
    <div class="num">${num}</div>
    <div>
      <h2>${escape(slide.title)}</h2>
      <ul>
${bullets}
      </ul>${quote}
    </div>
  </section>`;
}

function render(deck) {
  const tpl = readFileSync(join(ROOT, 'template', 'deck.html'), 'utf8');
  const slides = (deck.slides || []).map(renderSlide).join('\n');
  return tpl
    .replaceAll('{{TITLE}}', escape(deck.title))
    .replaceAll('{{SUBTITLE}}', escape(deck.subtitle || ''))
    .replaceAll('{{TONE}}', escape((deck.tone || 'pitch').toUpperCase()))
    .replaceAll('{{DATE}}', escape(deck.date || new Date().toISOString().slice(0, 10)))
    .replaceAll('{{SLUG}}', escape(deck.slug))
    .replaceAll('{{SLIDES}}', slides);
}

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('usage: node engine/render.mjs <deck.json>');
  process.exit(1);
}
const deck = JSON.parse(readFileSync(inputPath, 'utf8'));
if (!deck.slug) {
  console.error('deck.json missing required "slug" field');
  process.exit(1);
}
const outDir = join(ROOT, 'decks', deck.slug);
mkdirSync(outDir, { recursive: true });
const html = render(deck);
writeFileSync(join(outDir, 'index.html'), html);
console.log(`wrote decks/${deck.slug}/index.html`);
