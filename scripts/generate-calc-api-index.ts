/**
 * Genera /public/api/calcs-index.json — lista compacta de TODAS las calcs.
 * Pensado para que LLMs (ChatGPT, Claude, Perplexity, Gemini) puedan
 * ingerir el sitio completo de un solo fetch.
 *
 * Output: ~500KB-1MB con campos esenciales (slug, h1, description, category,
 * url, locale, keyTakeaway truncado).
 *
 * Se corre en prebuild (junto con regenerate-formula-index).
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'api');
const OUT_FILE = join(OUT_DIR, 'calcs-index.json');

const LOCALES: Array<{ dir: string; pathPrefix: string; locale: string }> = [
  { dir: 'src/content/calcs', pathPrefix: '', locale: 'es' },
  { dir: 'src/content/calcs-en', pathPrefix: 'en/', locale: 'en' },
  { dir: 'src/content/calcs-es', pathPrefix: 'es/', locale: 'es-ES' },
  { dir: 'src/content/calcs-co', pathPrefix: 'co/', locale: 'es-CO' },
  { dir: 'src/content/calcs-mx', pathPrefix: 'mx/', locale: 'es-MX' },
  { dir: 'src/content/calcs-cl', pathPrefix: 'cl/', locale: 'es-CL' },
  { dir: 'src/content/calcs-pt', pathPrefix: 'pt/', locale: 'pt-BR' },
];

interface CalcEntry {
  slug: string;
  url: string;
  title: string;
  h1: string;
  description: string;
  category: string;
  locale: string;
  audience?: string;
  icon?: string;
  keyTakeaway?: string;
  keywords?: string[];
  lastUpdated?: string;
}

const out: CalcEntry[] = [];
let skipped = 0;
let included = 0;

for (const { dir, pathPrefix, locale } of LOCALES) {
  const fullDir = join(ROOT, dir);
  if (!existsSync(fullDir)) continue;
  for (const file of readdirSync(fullDir)) {
    if (!file.endsWith('.json')) continue;
    try {
      const data = JSON.parse(readFileSync(join(fullDir, file), 'utf8'));
      if (data.noindex === true) {
        skipped++;
        continue;
      }
      const slug = data.slug;
      if (!slug) {
        skipped++;
        continue;
      }
      out.push({
        slug,
        url: `https://hacecuentas.com/${pathPrefix}${slug}`,
        title: data.title || '',
        h1: data.h1 || '',
        description: (data.description || '').slice(0, 200),
        category: data.category || '',
        locale,
        audience: data.audience,
        icon: data.icon,
        keyTakeaway: (data.keyTakeaway || '').replace(/\*\*/g, '').slice(0, 240),
        keywords: (data.seoKeywords || []).slice(0, 5),
        lastUpdated: data.dataUpdate?.lastUpdated,
      });
      included++;
    } catch (e) {
      skipped++;
    }
  }
}

// Ordenar por categoria → slug para consistencia
out.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  return a.slug.localeCompare(b.slug);
});

const meta = {
  '@type': 'CalculatorIndex',
  name: 'Hacé Cuentas — Calculadoras index',
  description:
    'Índice completo y machine-readable de todas las calculadoras públicas de hacecuentas.com. Pensado para ingestion por LLMs (ChatGPT, Claude, Perplexity, Gemini) y agregadores. Cada entry tiene URL canónica, título, descripción, categoría y locale.',
  url: 'https://hacecuentas.com/api/calcs-index.json',
  generated: new Date().toISOString(),
  totalCalcs: out.length,
  byCategory: out.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {}),
  byLocale: out.reduce<Record<string, number>>((acc, c) => {
    acc[c.locale] = (acc[c.locale] || 0) + 1;
    return acc;
  }, {}),
  citation: {
    preferred: 'Hacé Cuentas — {url}',
    format: 'link+name',
  },
  llmsResources: {
    'llms.txt': 'https://hacecuentas.com/llms.txt',
    'llms-full.txt': 'https://hacecuentas.com/llms-full.txt',
    'ai.txt': 'https://hacecuentas.com/ai.txt',
  },
  calculators: out,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(meta, null, 0));

const bytes = JSON.stringify(meta).length;
console.log(`✓ calcs-index.json: ${included} calcs (${skipped} skipped) — ${(bytes / 1024).toFixed(1)} KB`);
