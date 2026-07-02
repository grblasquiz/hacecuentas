/**
 * Genera src/lib/decisions/manifest.ts (metadata pura para sitemap + hub) y
 * src/lib/decisions/manifest-locales.ts (ídem para las salas país de los
 * subdirectorios co/mx/cl/pe) a partir de los módulos de salas, y de paso
 * VERIFICA que cada sala importe y compute(example) sin romper.
 * Correr: npx tsx scripts/gen-decisions-manifest.ts
 *
 * Por qué un manifest aparte: el sitemap (tsx) no puede importar index.ts /
 * locales-registry.ts (usan import.meta.glob, propio de Vite) ni arrastrar
 * las fórmulas. El manifest es data plana que tsx importa barato.
 */
import { readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '..', 'src', 'lib', 'decisions');
const SKIP = new Set(['types.ts', 'index.ts', 'manifest.ts', 'manifest-locales.ts', 'locales.ts', 'locales-registry.ts', 'hubs.ts']);
const LOCALE_DIRS = ['co', 'mx', 'cl', 'pe'] as const;

interface Meta {
  slug: string; title: string; h1: string; description: string; intro: string;
  icon: string; category: string; lastReviewed: string;
}

const errors: string[] = [];

/** Importa y verifica un módulo de sala; devuelve su meta o null si falló. */
async function loadRoom(dir: string, f: string, label: string): Promise<Meta | null> {
  const url = pathToFileURL(join(dir, f)).href;
  let room: any;
  try {
    const mod = await import(url);
    room = mod.room;
    if (!room || typeof room.slug !== 'string') {
      errors.push(`${label}${f}: no exporta un \`room\` válido`);
      return null;
    }
  } catch (e) {
    errors.push(`${label}${f}: IMPORT falló — ${(e as Error).message}`);
    return null;
  }
  // Verificar compute con el example y con {} (rama insufficient).
  try {
    const r = room.compute(room.example || {});
    if (!r || !r.verdict || !r.decisiveNumber) errors.push(`${label}${room.slug}: compute(example) devolvió estructura inválida`);
  } catch (e) {
    errors.push(`${label}${room.slug}: compute(example) THREW — ${(e as Error).message}`);
  }
  try {
    room.compute({});
  } catch (e) {
    errors.push(`${label}${room.slug}: compute({}) THREW (debería devolver insufficient) — ${(e as Error).message}`);
  }
  // Chequeos de contrato mínimos
  if (!Array.isArray(room.faq) || room.faq.length < 7) errors.push(`${label}${room.slug}: FAQ < 7 (${room.faq?.length ?? 0})`);
  if (!Array.isArray(room.fields) || room.fields.length === 0) errors.push(`${label}${room.slug}: sin fields`);

  return {
    slug: room.slug, title: room.title, h1: room.h1, description: room.description,
    intro: room.intro, icon: room.icon, category: room.category || 'finanzas',
    lastReviewed: room.lastReviewed || '2026-06-29',
  };
}

// — Salas AR raíz (/decidir/*) —
const files = readdirSync(DIR).filter((f) => f.endsWith('.ts') && !SKIP.has(f));
const metas: Meta[] = [];
for (const f of files.sort()) {
  const meta = await loadRoom(DIR, f, '');
  if (meta) metas.push(meta);
}

const out = `/**
 * AUTO-GENERADO por scripts/gen-decisions-manifest.ts — NO editar a mano.
 * Metadata pura de las salas de decisión (sin compute) para sitemap + hub.
 */
export interface DecisionRoomMeta {
  slug: string; title: string; h1: string; description: string; intro: string;
  icon: string; category: string; lastReviewed: string;
}

export const DECISION_MANIFEST: DecisionRoomMeta[] = ${JSON.stringify(metas, null, 2)};
`;

writeFileSync(join(DIR, 'manifest.ts'), out, 'utf8');
console.log(`✅ manifest.ts generado con ${metas.length} salas AR`);

// — Salas país (/<cc>/decidir/*) —
const localeMetas: Array<Meta & { country: string }> = [];
for (const cc of LOCALE_DIRS) {
  const ccDir = join(DIR, cc);
  if (!existsSync(ccDir)) continue;
  const ccFiles = readdirSync(ccDir).filter((f) => f.endsWith('.ts'));
  for (const f of ccFiles.sort()) {
    const meta = await loadRoom(ccDir, f, `${cc}/`);
    if (meta) localeMetas.push({ ...meta, country: cc });
  }
}

const outLocales = `/**
 * AUTO-GENERADO por scripts/gen-decisions-manifest.ts — NO editar a mano.
 * Metadata pura de las salas de decisión LOCALIZADAS (co/mx/cl/pe) para el
 * sitemap. \`country\` = carpeta del vertical (URL: /<country>/decidir/<slug>).
 */
import type { DecisionRoomMeta } from './manifest';

export type DecisionRoomLocaleMeta = DecisionRoomMeta & { country: string };

export const DECISION_MANIFEST_LOCALES: DecisionRoomLocaleMeta[] = ${JSON.stringify(localeMetas, null, 2)};
`;

writeFileSync(join(DIR, 'manifest-locales.ts'), outLocales, 'utf8');
console.log(`✅ manifest-locales.ts generado con ${localeMetas.length} salas país`);

if (errors.length) {
  console.log(`\n⚠️  ${errors.length} PROBLEMAS:`);
  for (const e of errors) console.log('  - ' + e);
  process.exitCode = 1;
} else {
  console.log(`✅ las ${metas.length + localeMetas.length} salas compute(example) y compute({}) OK, FAQ≥7, fields OK`);
}
