/**
 * Sincroniza el conteo de calculadoras en los archivos ESTÁTICOS de public/
 * que no pueden importar src/lib/calc-counts.ts (llms.txt, ai.txt, openapi,
 * ai-plugin.json). Las páginas Astro ya usan calc-counts.ts directo.
 *
 * Misma convención que calc-counts.ts: total real redondeado HACIA ABAJO a la
 * centena ("3.295 → 3.200+") para no over-promise. Corre en prebuild, así el
 * número se mueve solo cuando agregamos/sacamos calcs — nunca más hardcode stale.
 *
 * Si un patrón deja de matchear (alguien reescribió la frase), falla el build
 * para que el drift no pase silencioso.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const CALC_DIRS = [
  'calcs', 'calcs-en', 'calcs-pt', 'calcs-pt-pt', 'calcs-mx', 'calcs-es',
  'calcs-co', 'calcs-cl', 'calcs-pe', 'calcs-ec', 'calcs-ve', 'calcs-py',
  'calcs-uy', 'calcs-do',
];

function countDir(dir: string): number {
  try {
    return readdirSync(`src/content/${dir}`).filter((f) => f.endsWith('.json')).length;
  } catch {
    return 0;
  }
}

const total = CALC_DIRS.reduce((sum, dir) => sum + countDir(dir), 0);
const ptTotal = countDir('calcs-pt');

const floorTo100 = (n: number) => Math.floor(n / 100) * 100;
const floored = floorTo100(total);
const display = floored.toLocaleString('es-AR'); // "3.200"
const ptDisplay = floorTo100(ptTotal).toLocaleString('es-AR');

type Target = { file: string; pattern: RegExp; replacement: string };

const TARGETS: Target[] = [
  {
    file: 'public/llms.txt',
    pattern: /\d[\d.,]*\+ calculadoras/,
    replacement: `${display}+ calculadoras`,
  },
  {
    // Sección Brasil de llms.txt: conteo PT-BR (distinto del total de línea 3,
    // que matchea el target de arriba por ser el PRIMER match del patrón).
    file: 'public/llms.txt',
    pattern: /## Brasil \(Português\) — \d[\d.,]*\+ calculadoras/,
    replacement: `## Brasil (Português) — ${ptDisplay}+ calculadoras`,
  },
  {
    file: 'public/ai.txt',
    pattern: /\d[\d.,]*\+ calcs/,
    replacement: `${display}+ calcs`,
  },
  {
    file: 'public/.well-known/ai-plugin.json',
    pattern: /Más de \d[\d.,]* calculadoras/,
    replacement: `Más de ${display} calculadoras`,
  },
  {
    file: 'public/openapi.json',
    pattern: /más de \d[\d.,]* calculadoras/,
    replacement: `más de ${display} calculadoras`,
  },
  {
    file: 'public/.well-known/openapi.yaml',
    pattern: /más de \d[\d.,]* calculadoras/,
    replacement: `más de ${display} calculadoras`,
  },
  {
    // humans.txt es un archivo en inglés: número sin separador de miles.
    file: 'public/humans.txt',
    pattern: /\d[\d.,]*\+ calculators/,
    replacement: `${floored}+ calculators`,
  },
  {
    file: 'README.md',
    pattern: /Calculadoras Online Gratuitas \(\d[\d.,]*\+\)/,
    replacement: `Calculadoras Online Gratuitas (${display}+)`,
  },
  {
    // Badge shields.io: sin separador de miles, "+" URL-encoded.
    file: 'README.md',
    pattern: /calculadoras-\d+%2B/,
    replacement: `calculadoras-${floored}%2B`,
  },
  {
    file: 'README.md',
    pattern: /\d[\d.,]*\+ calculadoras gratuitas/,
    replacement: `${display}+ calculadoras gratuitas`,
  },
  // OJO: nada de /g acá — el README también tiene conteos parciales
  // ("100+ calcs" de fútbol) que NO son el total. Patrones con contexto.
  {
    file: 'README.md',
    pattern: /\d[\d.,]*\+ calcs\*\* entre/,
    replacement: `${display}+ calcs** entre`,
  },
  {
    file: 'README.md',
    pattern: /\d[\d.,]*\+ calcs indexadas/,
    replacement: `${display}+ calcs indexadas`,
  },
  {
    file: 'README.md',
    pattern: /\*\*\d[\d.,]*\+? calcs PT-BR\*\*/,
    replacement: `**${ptDisplay}+ calcs PT-BR**`,
  },
  {
    file: 'README.md',
    pattern: /\[\+\d[\d.,]* calcs PT-BR\]/,
    replacement: `[+${ptDisplay} calcs PT-BR]`,
  },
];

let changed = 0;
const errors: string[] = [];

for (const t of TARGETS) {
  let content: string;
  try {
    content = readFileSync(t.file, 'utf8');
  } catch {
    errors.push(`${t.file}: no existe`);
    continue;
  }
  if (!t.pattern.test(content)) {
    errors.push(`${t.file}: el patrón ${t.pattern} no matchea — se reescribió la frase del conteo?`);
    continue;
  }
  const next = content.replace(t.pattern, t.replacement);
  if (next !== content) {
    writeFileSync(t.file, next);
    changed++;
    console.log(`[calc-counts] ${t.file} → "${t.replacement}"`);
  }
}

if (errors.length) {
  for (const e of errors) console.error(`[calc-counts] ✗ ${e}`);
  process.exit(1);
}

console.log(`[calc-counts] total=${total} display="${display}+" (${changed} archivo(s) actualizados)`);
