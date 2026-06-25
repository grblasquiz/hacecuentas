#!/usr/bin/env node
/**
 * Actualiza el histórico del ICL (Índice para Contratos de Locación) del BCRA.
 *
 * Fuente: api.bcra.gob.ar/estadisticas/v4.0/Monetarias/40 (base 30/6/20 = 1).
 * Appendea los días nuevos a src/lib/formulas/_bcra-icl.ts (arrays paralelos
 * ICL_FECHAS / ICL_VALORES) y bumpea ICL_LAST_UPDATED + el encabezado.
 *
 * Uso: npm run bcra:update-icl   (o: node scripts/update-icl.mjs)
 *
 * Es idempotente: sólo agrega fechas estrictamente posteriores al último dato.
 * Si la API no responde, sale con código ≠ 0 y NO toca el archivo.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

// El endpoint del BCRA usa una cadena de certificados que Node no valida en
// algunos entornos (igual que `curl -k`). Es un GET a un endpoint público de
// datos del Banco Central, sin credenciales — aceptable para un script de build.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const FILE = path.join(process.cwd(), 'src/lib/formulas/_bcra-icl.ts');
const SERIE = 40; // ICL
const BASE = 'https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias';

function fmtNum(v) {
  // Replica el formato del archivo: float con ceros finales recortados (32.40 → 32.4).
  return Number(Number(v).toFixed(2)).toString();
}

const src = await fs.readFile(FILE, 'utf8');

const lastMatch = src.match(/ICL_LAST_UPDATED\s*=\s*'(\d{4}-\d{2}-\d{2})'/);
if (!lastMatch) throw new Error('No encontré ICL_LAST_UPDATED en el archivo.');
const lastDate = lastMatch[1];

const today = new Date().toISOString().slice(0, 10);
const url = `${BASE}/${SERIE}?desde=${lastDate}&hasta=${today}`;
console.log(`[icl] último en archivo: ${lastDate} — pidiendo BCRA hasta ${today}…`);

const res = await fetch(url);
if (!res.ok) throw new Error(`BCRA respondió ${res.status}`);
const json = await res.json();
const detalle = json?.results?.[0]?.detalle;
if (!Array.isArray(detalle) || detalle.length === 0) throw new Error('Respuesta BCRA sin datos.');

// Ascendente y sólo lo nuevo.
const nuevos = detalle
  .map((d) => ({ fecha: d.fecha, valor: d.valor }))
  .filter((d) => d.fecha > lastDate)
  .sort((a, b) => a.fecha.localeCompare(b.fecha));

if (nuevos.length === 0) {
  console.log('[icl] ya está al día, nada para agregar.');
  process.exit(0);
}

const fechasStr = nuevos.map((d) => `  '${d.fecha}',`).join('\n');
const valoresStr = nuevos.map((d) => `  ${fmtNum(d.valor)},`).join('\n');

let out = src;
// Insertar antes del cierre `];` de cada array (el primer `];` cierra FECHAS,
// el segundo cierra VALORES). Hacemos los reemplazos en orden.
out = out.replace(
  /(export const ICL_FECHAS: ReadonlyArray<string> = \[[\s\S]*?)(\n\];)/,
  (_m, body, close) => `${body}\n${fechasStr}${close}`
);
out = out.replace(
  /(export const ICL_VALORES: ReadonlyArray<number> = \[[\s\S]*?)(\n\];)/,
  (_m, body, close) => `${body}\n${valoresStr}${close}`
);

const ultimo = nuevos[nuevos.length - 1];
const totalDias = (out.match(/export const ICL_FECHAS[\s\S]*?\n\];/)[0].match(/'\d{4}-\d{2}-\d{2}'/g) || []).length;

out = out.replace(/ICL_LAST_UPDATED\s*=\s*'\d{4}-\d{2}-\d{2}'/, `ICL_LAST_UPDATED = '${ultimo.fecha}'`);
out = out.replace(/\/\/ Última fecha: \d{4}-\d{2}-\d{2}, valor: [\d.]+/, `// Última fecha: ${ultimo.fecha}, valor: ${fmtNum(ultimo.valor)}`);
out = out.replace(/\/\/ Total: \d+ días/, `// Total: ${totalDias} días`);

await fs.writeFile(FILE, out);
console.log(`[icl] +${nuevos.length} días (hasta ${ultimo.fecha} = ${fmtNum(ultimo.valor)}). Total: ${totalDias}.`);

// Regenerar las tablas de referencia data-driven del calc (info-gain crawlable:
// "ICL hoy", "coeficiente ICL {mes}") a partir de la serie recién actualizada.
// Aislado en try: si falla, el update del índice igual quedó persistido.
try {
  await import('./gen-icl-tables.mjs');
} catch (e) {
  console.warn('[icl] aviso: no se pudieron regenerar las tablas del calc:', e.message);
}
