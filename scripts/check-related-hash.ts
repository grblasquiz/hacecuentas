/**
 * Pre-commit check: verifica que src/lib/related-auto.hash este al dia con
 * los src/content/calcs/*.json staged. Si no, falla con instrucciones.
 *
 * Por que: compute-related.ts (npm run related) genera related-auto.json
 * para componentes/RelatedCalcs.astro. Si el hash no matchea, el cache MISS
 * en CI agrega ~150s a cada build. Mantenerlo en sync hace deploys ~25% mas
 * rapidos.
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { GONE_410_URLS } from '../src/lib/gone-410.ts';
import { PRUNING_REDIRECTS } from '../src/lib/pruning-redirects.ts';

const CALCS_DIR = join(process.cwd(), 'src/content/calcs');
const HASH_FILE = join(process.cwd(), 'src/lib/related-auto.hash');

if (!existsSync(HASH_FILE)) {
  console.error('[pre-commit] falta src/lib/related-auto.hash. Corre: npm run related && git add src/lib/related-auto.{json,hash}');
  process.exit(1);
}

// Este bloque espeja hashCalcsInputs() de compute-related.ts. La ALGO_VERSION
// se lee de ahí en runtime (los bumps v3→v4.x la dejaban hardcodeada acá y el
// pre-commit fallaba en todo commit que tocara calcs). Si hashCalcsInputs
// cambia de estructura, replicar el cambio acá.
const computeRelatedSrc = readFileSync(join(process.cwd(), 'scripts/compute-related.ts'), 'utf8');
const algoMatch = computeRelatedSrc.match(/const ALGO_VERSION = '([^']+)'/);
if (!algoMatch) {
  console.error('[pre-commit] no pude leer ALGO_VERSION de scripts/compute-related.ts — revisar check-related-hash.ts');
  process.exit(1);
}

const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
const hash = createHash('sha1');
hash.update(algoMatch[1]);
hash.update(`${GONE_410_URLS.size}:${Object.keys(PRUNING_REDIRECTS).length}`);
for (const f of files.sort()) {
  hash.update(f);
  hash.update(readFileSync(join(CALCS_DIR, f), 'utf8'));
}
const inputHash = hash.digest('hex');
const cachedHash = readFileSync(HASH_FILE, 'utf8').trim();

if (cachedHash !== inputHash) {
  console.error('');
  console.error('[pre-commit] related-auto.hash desactualizado.');
  console.error(`  esperado: ${inputHash.slice(0, 12)}...`);
  console.error(`  actual:   ${cachedHash.slice(0, 12)}...`);
  console.error('');
  console.error('Estas commiteando cambios en calcs sin regenerar related-auto.');
  console.error('Cada deploy CI gasta ~150s recalculando. Para arreglarlo:');
  console.error('');
  console.error('  npm run related && git add src/lib/related-auto.json src/lib/related-auto.hash');
  console.error('');
  console.error('Y volve a commitear. Si tenes apuro y queres saltearlo solo esta vez:');
  console.error('');
  console.error('  git commit --no-verify ...');
  console.error('');
  process.exit(1);
}

console.log('[pre-commit] related-auto.hash OK');
