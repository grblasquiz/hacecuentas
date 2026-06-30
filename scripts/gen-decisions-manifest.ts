/**
 * Genera src/lib/decisions/manifest.ts (metadata pura para sitemap + hub) a
 * partir de los módulos de salas, y de paso VERIFICA que cada sala importe y
 * compute(example) sin romper. Correr: npx tsx scripts/gen-decisions-manifest.ts
 *
 * Por qué un manifest aparte: el sitemap (tsx) no puede importar index.ts
 * (usa import.meta.glob, propio de Vite) ni arrastrar las fórmulas. El manifest
 * es data plana que tsx importa barato.
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '..', 'src', 'lib', 'decisions');
const SKIP = new Set(['types.ts', 'index.ts', 'manifest.ts']);

const files = readdirSync(DIR).filter((f) => f.endsWith('.ts') && !SKIP.has(f));

interface Meta {
  slug: string; title: string; h1: string; description: string; intro: string;
  icon: string; category: string; lastReviewed: string;
}

const metas: Meta[] = [];
const errors: string[] = [];

for (const f of files.sort()) {
  const url = pathToFileURL(join(DIR, f)).href;
  let room: any;
  try {
    const mod = await import(url);
    room = mod.room;
    if (!room || typeof room.slug !== 'string') {
      errors.push(`${f}: no exporta un \`room\` válido`);
      continue;
    }
  } catch (e) {
    errors.push(`${f}: IMPORT falló — ${(e as Error).message}`);
    continue;
  }
  // Verificar compute con el example y con {} (rama insufficient).
  try {
    const r = room.compute(room.example || {});
    if (!r || !r.verdict || !r.decisiveNumber) errors.push(`${room.slug}: compute(example) devolvió estructura inválida`);
  } catch (e) {
    errors.push(`${room.slug}: compute(example) THREW — ${(e as Error).message}`);
  }
  try {
    room.compute({});
  } catch (e) {
    errors.push(`${room.slug}: compute({}) THREW (debería devolver insufficient) — ${(e as Error).message}`);
  }
  // Chequeos de contrato mínimos
  if (!Array.isArray(room.faq) || room.faq.length < 7) errors.push(`${room.slug}: FAQ < 7 (${room.faq?.length ?? 0})`);
  if (!Array.isArray(room.fields) || room.fields.length === 0) errors.push(`${room.slug}: sin fields`);

  metas.push({
    slug: room.slug, title: room.title, h1: room.h1, description: room.description,
    intro: room.intro, icon: room.icon, category: room.category || 'finanzas',
    lastReviewed: room.lastReviewed || '2026-06-29',
  });
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

console.log(`✅ manifest.ts generado con ${metas.length} salas`);
if (errors.length) {
  console.log(`\n⚠️  ${errors.length} PROBLEMAS:`);
  for (const e of errors) console.log('  - ' + e);
  process.exitCode = 1;
} else {
  console.log('✅ las', metas.length, 'salas compute(example) y compute({}) OK, FAQ≥7, fields OK');
}
