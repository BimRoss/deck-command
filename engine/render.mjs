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

const jsonEscape = (s) => String(s)
  .replace(/\\/g, '\\\\')
  .replace(/"/g, '\\"')
  .replace(/\n/g, '\\n')
  .replace(/\r/g, '\\r')
  .replace(/\t/g, '\\t');

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

// inline markdown: **bold**, *em*, [text](url), `code`
function inlineMd(s) {
  let out = escape(s);
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, t, u) => `<a href="${u}">${t}</a>`);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[\s(])\*([^*]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  return out;
}

function renderProseBlock(text, cls) {
  if (!text) return '';
  const paras = String(text).trim().split(/\n\s*\n/).map(p => `    <p>${inlineMd(p.trim())}</p>`).join('\n');
  return `  <section class="${cls}">\n${paras}\n  </section>`;
}

function renderOutroBlock(outro) {
  if (!outro) return '';
  if (typeof outro === 'string') return renderProseBlock(outro, 'outro');
  const heading = outro.heading ? `    <h2>${escape(outro.heading)}</h2>\n` : '';
  const body = (outro.body || '').trim().split(/\n\s*\n/).map(p => `    <p>${inlineMd(p.trim())}</p>`).join('\n');
  const cta = outro.cta && outro.cta.href
    ? `\n    <a class="cta" href="${escape(outro.cta.href)}">${escape(outro.cta.label || 'Learn more')}</a>`
    : '';
  return `  <section class="outro">\n${heading}${body}${cta}\n  </section>`;
}

function renderBylineBlock(byline) {
  if (!byline) return '';
  return `    <p class="byline">${inlineMd(byline)}</p>`;
}

function render(deck) {
  const tpl = readFileSync(join(ROOT, 'template', 'deck.html'), 'utf8');
  const slides = (deck.slides || []).map(renderSlide).join('\n');
  const seoDescription = deck.seo_description || deck.subtitle || '';
  const keywords = Array.isArray(deck.keywords) ? deck.keywords.join(', ') : (deck.keywords || '');
  const author = deck.author || 'Make a Company';
  const section = (deck.section || `Deck / ${deck.tone || 'pitch'}`).toUpperCase();
  const ogImage = deck.image || `https://decks.makeacompany.ai/${deck.slug}/og.png`;
  const date = deck.date || new Date().toISOString().slice(0, 10);

  return tpl
    .replaceAll('{{TITLE_JSON}}', jsonEscape(deck.title))
    .replaceAll('{{SEO_DESCRIPTION_JSON}}', jsonEscape(seoDescription))
    .replaceAll('{{AUTHOR_JSON}}', jsonEscape(author))
    .replaceAll('{{KEYWORDS_JSON}}', jsonEscape(keywords))
    .replaceAll('{{TITLE}}', escape(deck.title))
    .replaceAll('{{SUBTITLE}}', escape(deck.subtitle || ''))
    .replaceAll('{{SEO_DESCRIPTION}}', escape(seoDescription))
    .replaceAll('{{KEYWORDS}}', escape(keywords))
    .replaceAll('{{AUTHOR}}', escape(author))
    .replaceAll('{{SECTION}}', escape(section))
    .replaceAll('{{OG_IMAGE}}', escape(ogImage))
    .replaceAll('{{TONE}}', escape((deck.tone || 'pitch').toUpperCase()))
    .replaceAll('{{DATE}}', escape(date))
    .replaceAll('{{SLUG}}', escape(deck.slug))
    .replaceAll('{{BYLINE_BLOCK}}', renderBylineBlock(deck.byline))
    .replaceAll('{{LEDE_BLOCK}}', renderProseBlock(deck.lede, 'lede'))
    .replaceAll('{{OUTRO_BLOCK}}', renderOutroBlock(deck.outro))
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
const outDir = join(ROOT, deck.slug);
mkdirSync(outDir, { recursive: true });
const html = render(deck);
writeFileSync(join(outDir, 'index.html'), html);
console.log(`wrote ${deck.slug}/index.html`);
