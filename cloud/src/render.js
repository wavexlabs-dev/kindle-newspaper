import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { DateTime } from 'luxon';

const regular = fileURLToPath(new URL('../fonts/NotoSerif-Regular.ttf', import.meta.url));
const bold = fileURLToPath(new URL('../fonts/NotoSerif-Bold.ttf', import.meta.url));
const fonts = [regular, bold].map(p => opentype.parse(Uint8Array.from(fs.readFileSync(p)).buffer));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));

export function lines(text, size, width = 536, heavy = false) {
  const font = fonts[heavy ? 1 : 0];
  const result = [];
  for (const paragraph of String(text).split('\n')) {
    let line = '';
    for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
      const candidate = line ? line + ' ' + word : word;
      if (font.getAdvanceWidth(candidate, size) <= width) { line = candidate; continue; }
      if (line) result.push(line);
      line = '';
      for (const char of word) {
        if (line && font.getAdvanceWidth(line + char, size) > width) { result.push(line); line = ''; }
        line += char;
      }
    }
    if (line) result.push(line);
  }
  return result;
}

export async function renderEdition(edition) {
  const pages = [];
  const date = DateTime.fromISO(edition.day).setLocale('es-MX').toFormat("cccc d 'de' LLLL");
  let parts, y;
  function newPage(section) {
    if (parts) pages.push(parts);
    parts = [`<rect width="600" height="800" fill="white"/>`,
      `<text x="32" y="44" font-size="19" font-weight="bold">LA SEÑAL</text>`,
      `<text x="568" y="44" text-anchor="end" font-size="13">${esc(section)}</text>`,
      '<path d="M32 57H568" stroke="black"/>'];
    y = 92;
  }
  function paragraph(text, size = 20, heavy = false, gap = 12) {
    for (const line of lines(text, size, 536, heavy)) {
      if (y + size * 0.35 > 745) newPage('CONTINÚA');
      parts.push(`<text x="32" y="${y}" font-size="${size}" font-weight="${heavy ? 'bold' : 'normal'}">${esc(line)}</text>`);
      y += Math.ceil(size * 1.4);
    }
    y += gap;
  }
  newPage(date.toUpperCase());
  paragraph('Tu periódico de IA y tecnología', 16, false, 20);
  paragraph(edition.editorial.headline, 34, true, 16);
  paragraph(edition.editorial.introduction, 20, false, 14);
  paragraph('EN ESTA EDICIÓN', 15, true);
  edition.editorial.articles.forEach((a, i) => paragraph(`${i + 1}. ${a.title}`, 18, true, 6));
  newPage('TU DÍA');
  paragraph('Hoy, en tu calendario', 30, true, 16);
  if (!edition.agenda.length) paragraph('No hay eventos en tu calendario para hoy.');
  for (const event of edition.agenda) {
    paragraph(event.time, 16, true, 0);
    paragraph(event.title, 22, true, 8);
    if (event.location) paragraph(event.location, 17, false, 12);
  }
  edition.editorial.articles.forEach((article, i) => {
    newPage(`NOTICIA ${i + 1}`);
    paragraph(article.title, 30, true, 18);
    paragraph(article.summary, 21, false, 20);
    paragraph('POR QUÉ IMPORTA', 15, true, 6);
    paragraph(article.why, 20, false, 18);
    paragraph('Fuentes', 15, true, 4);
    for (const source of article.sources) paragraph(new URL(source).hostname.replace(/^www\./, ''), 16, false, 2);
  });
  pages.push(parts);
  if (pages.length > 20) throw new Error('Edition exceeds page limit');
  const output = [];
  for (const [i, page] of pages.entries()) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><g font-family="Noto Serif" fill="black">${page.join('')}<path d="M32 764H568" stroke="black"/><text x="32" y="785" font-size="12">${esc(date)}</text><text x="568" y="785" text-anchor="end" font-size="12">${i + 1} / ${pages.length}</text></g></svg>`;
    const raster = new Resvg(svg, { font: { fontFiles: [regular, bold], loadSystemFonts: false } }).render().asPng();
    output.push(await sharp(raster).flatten({ background: 'white' }).greyscale().png().toBuffer());
  }
  return output;
}
