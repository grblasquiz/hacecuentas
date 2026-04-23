/**
 * Regenera src/lib/formulas/index.ts escaneando las fórmulas en el dir.
 *
 * Evita imports huérfanos cuando se borra una calc sin actualizar el index
 * manualmente. Corre en prebuild para mantener sincronía automática.
 *
 * Uso:
 *   node --experimental-strip-types scripts/regenerate-formula-index.ts
 *     → regenera el index si cambió.
 *   node --experimental-strip-types scripts/regenerate-formula-index.ts --check
 *     → falla con exit 1 si el index está desincronizado (útil para CI).
 *
 * Archivos con prefix `_` (p.ej. `_bcra-icl.ts`) se ignoran — son data utils,
 * no fórmulas.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FORMULAS_DIR = join(ROOT, 'src/lib/formulas');
const INDEX_PATH = join(FORMULAS_DIR, 'index.ts');

// Unicode-aware: algunos nombres tienen ñ (ej. caloriasSkiSnowboardMontaña).
const IDENT = String.raw`[\p{L}\p{N}_$]+`;
const EXPORT_FN_RE = new RegExp(String.raw`^export\s+function\s+(${IDENT})\s*\(`, 'mu');
// Soporta re-exports con rename: `export { foo as bar } from './other';`
// y sin rename: `export { bar } from './other';`. El nombre visible es el
// último (después de `as`, o el único si no hay `as`).
const EXPORT_RENAME_RE = new RegExp(
  String.raw`^export\s*\{\s*${IDENT}\s+as\s+(${IDENT})\s*\}`,
  'mu'
);
const EXPORT_RE = new RegExp(String.raw`^export\s*\{\s*(${IDENT})\s*\}`, 'mu');

function scanFormulas(): Array<{ slug: string; fn: string }> {
  // Ordenar por slug (sin extensión) para matchear el orden histórico del
  // index. Sortear por nombre de archivo con `.ts` cambia el resultado porque
  // `-` (45) < `.` (46) en ASCII, invirtiendo pares como `agua-diaria` vs
  // `agua-diaria-deportista`.
  const files = readdirSync(FORMULAS_DIR)
    .filter((f) => f.endsWith('.ts'))
    .filter((f) => f !== 'index.ts')
    .filter((f) => !f.startsWith('_'))
    .sort((a, b) => {
      const sa = a.replace(/\.ts$/, '');
      const sb = b.replace(/\.ts$/, '');
      return sa < sb ? -1 : sa > sb ? 1 : 0;
    });

  const out: Array<{ slug: string; fn: string }> = [];
  for (const file of files) {
    const slug = file.replace(/\.ts$/, '');
    const content = readFileSync(join(FORMULAS_DIR, file), 'utf8');
    const match =
      content.match(EXPORT_FN_RE) ||
      content.match(EXPORT_RENAME_RE) ||
      content.match(EXPORT_RE);
    if (!match) {
      throw new Error(`${file}: no se encontró export (function / rename / named)`);
    }
    out.push({ slug, fn: match[1] });
  }
  return out;
}

// Si dos archivos exportan el mismo símbolo (p.ej. ambos `huellaCarbono`),
// aliaseamos los N-1 primeros con sufijo `__<slug_con_underscores>` para que
// el último se quede con el nombre limpio. Coincide con el patrón histórico
// del index.
function assignAliases(
  formulas: Array<{ slug: string; fn: string }>
): Array<{ slug: string; fn: string; alias: string }> {
  const groups = new Map<string, string[]>();
  for (const f of formulas) {
    const list = groups.get(f.fn) ?? [];
    list.push(f.slug);
    groups.set(f.fn, list);
  }
  return formulas.map((f) => {
    const group = groups.get(f.fn)!;
    if (group.length === 1 || group[group.length - 1] === f.slug) {
      return { ...f, alias: f.fn };
    }
    return { ...f, alias: `${f.fn}__${f.slug.replace(/-/g, '_')}` };
  });
}

function buildIndex(formulas: Array<{ slug: string; fn: string }>): string {
  const today = new Date().toISOString().slice(0, 10);
  const withAlias = assignAliases(formulas);
  const imports = withAlias
    .map((f) =>
      f.alias === f.fn
        ? `import { ${f.fn} } from './${f.slug}';`
        : `import { ${f.fn} as ${f.alias} } from './${f.slug}';`
    )
    .join('\n');
  const entries = withAlias.map((f) => `  '${f.slug}': ${f.alias},`).join('\n');
  return `// Auto-generated formula index — do not edit manually
// Generated: ${today}

${imports}

export const formulas: Record<string, (inputs: any) => any> = {
${entries}
};
`;
}

// Normaliza el header de fecha para comparar contenido sin disparar un falso
// diff cuando solo cambió la fecha (el prebuild corre cada build).
function stripDate(s: string): string {
  return s.replace(/^\/\/ Generated: \d{4}-\d{2}-\d{2}$/m, '// Generated: <date>');
}

function main() {
  const check = process.argv.includes('--check');
  const formulas = scanFormulas();
  const generated = buildIndex(formulas);

  let current = '';
  try {
    current = readFileSync(INDEX_PATH, 'utf8');
  } catch {
    // no existe todavía
  }

  if (stripDate(current) === stripDate(generated)) {
    console.log(`[regenerate-formula-index] ✓ ${formulas.length} fórmulas, index sincronizado`);
    return;
  }

  if (check) {
    console.error(`[regenerate-formula-index] ✗ index desincronizado (${formulas.length} fórmulas detectadas). Corré el script sin --check para regenerar.`);
    process.exit(1);
  }

  writeFileSync(INDEX_PATH, generated);
  console.log(`[regenerate-formula-index] ✓ regenerado: ${formulas.length} fórmulas`);
}

main();
