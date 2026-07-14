/**
 * Evita publicar notas que, en su fecha de publicación, describen como pasado
 * un vencimiento que todavía era futuro (ej.: publicada 21/6, "ya venció el 30/6").
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const BLOG = join(ROOT, 'src/content/blog');
const MONTHS: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9,
  noviembre: 10, diciembre: 11,
};
const PAST_CLAIM = /\b(?:ya\s+)?(?:venci[oó]|pas[oó]|finaliz[oó]|termin[oó])\s+(?:el\s+)?(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+de\s+(\d{4}))?/giu;

const errors: string[] = [];
for (const name of readdirSync(BLOG).filter((file) => file.endsWith('.json')).sort()) {
  let post: Record<string, any>;
  try { post = JSON.parse(readFileSync(join(BLOG, name), 'utf8')); } catch { continue; }
  const published = new Date(`${post.date || post.publishedAt || ''}T00:00:00Z`);
  if (Number.isNaN(published.getTime())) continue;
  const text = [post.title, post.description, post.content, JSON.stringify(post.faq || [])].join(' ');
  for (const match of text.matchAll(PAST_CLAIM)) {
    // "Si pasó el 20..." describe una condición futura, no un hecho consumado.
    const before = text.slice(Math.max(0, (match.index || 0) - 4), match.index).toLowerCase();
    if (/si\s+$/.test(before)) continue;
    const claimedDate = new Date(Date.UTC(
      Number(match[3] || published.getUTCFullYear()), MONTHS[match[2].toLowerCase()], Number(match[1]),
    ));
    if (claimedDate.getTime() > published.getTime()) {
      errors.push(`${name}: publicado ${post.date}; afirma como pasado "${match[0]}" (${claimedDate.toISOString().slice(0, 10)})`);
    }
  }
}

if (errors.length) {
  console.error('Temporal claims inválidos:\n' + errors.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}
console.log('Temporal claims OK');
