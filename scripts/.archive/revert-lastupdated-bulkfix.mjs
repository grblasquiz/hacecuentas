#!/usr/bin/env node
/**
 * Revert lastUpdated artifact del bulk fix 5a8bb8d1.
 *
 * Contexto: el commit 5a8bb8d1 (2026-05-22) seteó dataUpdate.lastUpdated="2026-05-22"
 * en 2344 calcs, pero la mayoría fueron metadata-bumps (cambio de audience, source,
 * frequency never→yearly) sin refresh real de data. Eso contaminó el sitemap:
 * 2093 URLs con misma fecha en sitemap-fresh.xml + 1000 URLs spam en sitemap-news.xml.
 *
 * Heurística de revert:
 *   - Para cada calc tocado por 5a8bb8d1: leer lastUpdated antes/después.
 *   - Si después === "2026-05-22" y antes era distinto: revertir al "antes".
 *   - Si frequency es daily/weekly: mantener como está (refresh real plausible).
 *   - Si lastUpdated no cambió en ese commit: ignorar.
 *
 * Output:
 *   - Reescribe los JSONs con lastUpdated revertido.
 *   - Loguea cuántos revirtió y deja el resto intacto.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const COMMIT = '5a8bb8d1';
const POISONED = '2026-05-22';

const files = execSync(
  `git show ${COMMIT} --name-only --pretty=format: -- 'src/content/calcs/*.json'`,
  { encoding: 'utf8' }
)
  .split('\n')
  .filter((f) => f.endsWith('.json'));

let reverted = 0;
let kept = 0;
let skipped = 0;
let errors = 0;

for (const file of files) {
  let beforeJSON, afterJSON;
  try {
    const beforeStr = execSync(`git show ${COMMIT}^:${file}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    beforeJSON = JSON.parse(beforeStr);
  } catch {
    skipped++;
    continue;
  }
  try {
    afterJSON = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    errors++;
    continue;
  }

  const beforeLast = beforeJSON?.dataUpdate?.lastUpdated;
  const afterLast = afterJSON?.dataUpdate?.lastUpdated;
  const freq = afterJSON?.dataUpdate?.frequency;

  if (afterLast !== POISONED) { kept++; continue; }
  if (beforeLast === POISONED) { kept++; continue; }
  if (freq === 'daily' || freq === 'weekly') { kept++; continue; }

  if (beforeLast && /^\d{4}-\d{2}-\d{2}$/.test(beforeLast)) {
    afterJSON.dataUpdate.lastUpdated = beforeLast;
  } else {
    delete afterJSON.dataUpdate.lastUpdated;
  }
  writeFileSync(file, JSON.stringify(afterJSON, null, 2) + '\n', 'utf8');
  reverted++;
}

console.log(`Reverted lastUpdated:  ${reverted}`);
console.log(`Kept (daily/weekly/already-correct): ${kept}`);
console.log(`Skipped (file gone or unparseable): ${skipped}`);
console.log(`Errors: ${errors}`);
