/**
 * Interlinkea los clusters de fin de semana poblando `relatedSlugs` (Fase 12).
 * Fuente: src/lib/weekend-clusters.ts. Idempotente: re-correrlo no cambia nada si
 * los links ya están. Reemplazo QUIRÚRGICO del array (preserva el formato del JSON).
 *
 *   node --experimental-strip-types scripts/apply-weekend-links.ts [--dry]
 *
 * Reglas de grafo:
 *   - master ← todos sus members (cap 12) → inbound para las huérfanas
 *   - member ← master + hermanos + existentes-válidos (cap 8)
 * Tras correrlo, regenerar related-auto.json con `npm run related`.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { WEEKEND_CLUSTERS } from '../src/lib/weekend-clusters.ts';

const DIR = join(process.cwd(), 'src/content/calcs');
const DRY = process.argv.includes('--dry');
const CAP_MASTER = 12, CAP_MEMBER = 8;

const files = readdirSync(DIR).filter((f) => f.endsWith('.json'));
const live = new Set<string>();
const slugToFile = new Map<string, string>();
for (const f of files) {
  try { const c = JSON.parse(readFileSync(join(DIR, f), 'utf8')); if (c.slug) { live.add(c.slug); slugToFile.set(c.slug, f); } } catch { /* skip */ }
}

const isMaster = new Set(WEEKEND_CLUSTERS.map((c) => c.master));
const desired = new Map<string, string[]>();
function push(slug: string, target: string) {
  if (slug === target || !live.has(target)) return;
  if (!desired.has(slug)) desired.set(slug, []);
  const arr = desired.get(slug)!;
  if (!arr.includes(target)) arr.push(target);
}
for (const cl of WEEKEND_CLUSTERS) {
  for (const m of cl.members) push(cl.master, m);
  for (const m of cl.members) { push(m, cl.master); for (const sib of cl.members) push(m, sib); }
}

const ARR_RE = /(\n([ \t]*)"relatedSlugs"\s*:\s*)(\[[^\]]*\])/;
function replaceArray(raw: string, next: string[]): string | null {
  const m = raw.match(ARR_RE);
  if (!m) return null;
  const keyIndent = m[2];
  const rebuilt = next.length === 0 ? '[]'
    : '[\n' + next.map((s) => `${keyIndent}  ${JSON.stringify(s)}`).join(',\n') + `\n${keyIndent}]`;
  return raw.replace(ARR_RE, `$1${rebuilt}`);
}

let changed = 0, linksAdded = 0;
for (const [slug, clusterLinks] of desired) {
  const f = slugToFile.get(slug);
  if (!f) continue;
  const full = join(DIR, f);
  const orig = readFileSync(full, 'utf8');
  let c: { relatedSlugs?: string[] };
  try { c = JSON.parse(orig); } catch { continue; }

  const existing = (c.relatedSlugs || []).filter((s) => live.has(s) && s !== slug);
  const cap = isMaster.has(slug) ? CAP_MASTER : CAP_MEMBER;
  const merged: string[] = [];
  for (const s of [...clusterLinks, ...existing]) {
    if (s !== slug && !merged.includes(s)) merged.push(s);
    if (merged.length >= cap) break;
  }
  if (JSON.stringify(merged) === JSON.stringify(c.relatedSlugs || [])) continue;

  const newRaw = replaceArray(orig, merged);
  if (newRaw == null || newRaw === orig) continue;
  try { if (JSON.stringify(JSON.parse(newRaw).relatedSlugs) !== JSON.stringify(merged)) continue; } catch { continue; }

  linksAdded += merged.filter((s) => !(c.relatedSlugs || []).includes(s)).length;
  changed++;
  if (!DRY) writeFileSync(full, newRaw);
}

console.log(`${DRY ? '[DRY] ' : ''}[weekend-links] calcs interlinkeadas: ${changed} | enlaces nuevos: ${linksAdded}`);
