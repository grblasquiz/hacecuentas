#!/usr/bin/env node
/**
 * Dedup de tablas duplicadas por página: muchas calcs tienen la MISMA tabla
 * dos veces — una como markdown dentro de `explanation` y otra estructurada
 * en `referenceTables`. En la página renderizan las dos (verificado live
 * 2026-07-08, p.ej. SOAP Chile). Señal "low value / no curado" para AdSense.
 *
 * Regla: si ≥60% de las filas del referenceTable ya están en una tabla
 * markdown del explanation →
 *   - si la markdown tiene bastantes más filas (>1.5×), se borra el
 *     referenceTable (la markdown es la versión rica);
 *   - si no, se borra el bloque de tabla markdown (el referenceTable es
 *     estructurado, con título/fuente) junto con su heading inmediato si
 *     quedó sin contenido.
 *
 * Uso: node scripts/dedup-reference-tables.mjs [--apply]  (default: dry-run)
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'src', 'content');
const APPLY = process.argv.includes('--apply');

const norm = (s) => String(s).replace(/\s+/g, ' ').trim();

function tableBlocks(md) {
  // bloques contiguos de líneas |...|, con índice de línea inicial/final
  const lines = md.split('\n');
  const blocks = [];
  let start = -1;
  for (let i = 0; i <= lines.length; i++) {
    const isRow = i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i]);
    if (isRow && start === -1) start = i;
    if (!isRow && start !== -1) {
      blocks.push({ start, end: i - 1, lines: lines.slice(start, i) });
      start = -1;
    }
  }
  return { lines, blocks };
}

function rowCells(row) {
  return Array.isArray(row) ? row.map(norm) : Object.values(row).map(norm);
}

let filesChanged = 0;
let mdRemoved = 0;
let rtRemoved = 0;

const dirs = readdirSync(ROOT).filter((d) => d.startsWith('calcs'));
for (const dir of dirs) {
  for (const name of readdirSync(join(ROOT, dir))) {
    if (!name.endsWith('.json')) continue;
    const path = join(ROOT, dir, name);
    let data;
    try {
      data = JSON.parse(readFileSync(path, 'utf8'));
    } catch {
      continue;
    }
    const exp = data.explanation;
    const rts = data.referenceTables;
    if (typeof exp !== 'string' || !Array.isArray(rts) || rts.length === 0) continue;

    const { lines, blocks } = tableBlocks(exp);
    if (blocks.length === 0) continue;

    let changed = false;
    const keepRts = [];
    const removeLineRanges = [];

    for (const rt of rts) {
      const rows = rt.rows || [];
      if (rows.length < 3) {
        keepRts.push(rt);
        continue;
      }
      let matchedBlock = null;
      for (const b of blocks) {
        const blockText = b.lines.map(norm).join('\n');
        let matches = 0;
        for (const row of rows) {
          const cells = rowCells(row).filter((c) => c.length > 2);
          if (cells.length && cells.every((c) => blockText.includes(c))) matches++;
        }
        if (matches / rows.length >= 0.6) {
          matchedBlock = b;
          break;
        }
      }
      if (!matchedBlock) {
        keepRts.push(rt);
        continue;
      }
      const mdDataRows = matchedBlock.lines.filter((l) => !/^\s*\|[\s:|-]+\|\s*$/.test(l)).length - 1;
      if (mdDataRows > rows.length * 1.5) {
        // markdown es la versión rica → borrar el referenceTable
        rtRemoved++;
        changed = true;
      } else {
        removeLineRanges.push(matchedBlock);
        keepRts.push(rt);
        mdRemoved++;
        changed = true;
      }
    }

    if (!changed) continue;

    if (removeLineRanges.length) {
      const toRemove = new Set();
      for (const b of removeLineRanges) {
        for (let i = b.start; i <= b.end; i++) toRemove.add(i);
        // heading inmediato anterior si queda huérfano (solo líneas vacías entre medio
        // y nada de contenido hasta el próximo heading después de la tabla)
        let h = b.start - 1;
        while (h >= 0 && lines[h].trim() === '') h--;
        if (h >= 0 && /^#{2,4}\s/.test(lines[h])) {
          let after = b.end + 1;
          while (after < lines.length && lines[after].trim() === '') after++;
          if (after >= lines.length || /^#{2,4}\s/.test(lines[after])) {
            toRemove.add(h);
            // separador '---' pegado al heading
            let sep = h - 1;
            while (sep >= 0 && lines[sep].trim() === '') sep--;
            if (sep >= 0 && /^-{3,}$/.test(lines[sep].trim())) toRemove.add(sep);
          }
        }
        // línea de fuente pegada debajo de la tabla si el rt ya declara source
        let f = b.end + 1;
        while (f < lines.length && lines[f].trim() === '') f++;
        if (f < lines.length && /^\*?_?(Fuente|Source|Fonte)[:\s]/i.test(lines[f].trim())) {
          toRemove.add(f);
        }
      }
      const newLines = lines.filter((_, i) => !toRemove.has(i));
      data.explanation = newLines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
    }
    data.referenceTables = keepRts;
    if (keepRts.length === 0) delete data.referenceTables;

    filesChanged++;
    if (APPLY) {
      writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
    } else if (filesChanged <= 3) {
      console.log(`[dry-run] ${dir}/${name}`);
    }
  }
}

console.log(
  `${APPLY ? 'APLICADO' : 'DRY-RUN'}: ${filesChanged} archivos, ${mdRemoved} tablas markdown removidas, ${rtRemoved} referenceTables removidos`,
);
