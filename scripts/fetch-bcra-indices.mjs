// ────────────────────────────────────────────────────────────────────────────
// fetch-bcra-indices.mjs
// Trae BADLAR / TAMAR / CER (BCRA API v4.0) + riesgo país (argentinadatos) y
// escribe src/lib/bcra-indices.json, que /valores-bcra importa y server-renderea.
//
// POR QUÉ UN SCRIPT Y NO FETCH EN LA PÁGINA: api.bcra.gob.ar tiene un WAF que
// BLOQUEA el fetch desde el SSR de Astro/Vite ("internal error; reference=…"),
// tanto en dev como en build. Pero desde Node plano (este script) responde 200.
// Corre en prebuild fase 1, antes de astro build. Si una fuente falla, conserva
// el último valor bueno del JSON existente (no pierde el dato por un transitorio).
// ────────────────────────────────────────────────────────────────────────────
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'lib', 'bcra-indices.json');

async function bcraVar(id) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(`https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias/${id}?limit=1`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok) continue;
      const d = await r.json();
      const det = d?.results?.[0]?.detalle?.[0];
      if (det && typeof det.valor === 'number') return { valor: det.valor, fecha: det.fecha };
    } catch { /* retry */ }
  }
  return null;
}

async function lastFromSeries(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!r.ok) continue;
      const d = await r.json();
      const p = Array.isArray(d) ? d[d.length - 1] : null;
      if (p && typeof p.valor === 'number') return { valor: p.valor, fecha: p.fecha };
    } catch { /* retry */ }
  }
  return null;
}

// ── Historia corta (últimos N puntos) para sparklines + delta de cada tarjeta.
// Devuelve { valor, fecha, prev, spark } donde spark es number[] ascendente.
// Node plano no lo bloquea el WAF del BCRA (mismo motivo que arriba).
const SPARK_N = 30;
function round4(n) { return Math.round(n * 1e4) / 1e4; }

async function bcraVarSerie(id) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(`https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias/${id}?limit=${SPARK_N}`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok) continue;
      const d = await r.json();
      // Aplanar todos los detalles de todos los results, dedupe por fecha, asc.
      const flat = [];
      for (const res of d?.results || []) {
        for (const det of res?.detalle || []) {
          if (det && typeof det.valor === 'number' && det.fecha) flat.push(det);
        }
      }
      if (!flat.length) continue;
      const byFecha = new Map();
      for (const p of flat) byFecha.set(p.fecha, p.valor);
      const pairs = [...byFecha.entries()].sort((a, b) => a[0].localeCompare(b[0]));
      const spark = pairs.map((p) => round4(p[1]));
      const last = pairs[pairs.length - 1];
      return {
        valor: last[1],
        fecha: last[0],
        prev: pairs.length >= 2 ? pairs[pairs.length - 2][1] : null,
        spark,
      };
    } catch { /* retry */ }
  }
  return null;
}

async function riesgoSerie() {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch('https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais', {
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok) continue;
      const d = await r.json();
      if (!Array.isArray(d) || !d.length) continue;
      const tail = d.slice(-SPARK_N).filter((p) => typeof p.valor === 'number');
      const last = tail[tail.length - 1];
      return {
        valor: last.valor,
        fecha: last.fecha,
        prev: tail.length >= 2 ? tail[tail.length - 2].valor : null,
        spark: tail.map((p) => round4(p.valor)),
      };
    } catch { /* retry */ }
  }
  return null;
}

// Historia del dólar (argentinadatos, por casa) para sparkline + delta.
async function dolarSerie(casa) {
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(`https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok) continue;
      const d = await r.json();
      if (!Array.isArray(d) || !d.length) continue;
      const tail = d.slice(-SPARK_N).filter((p) => typeof p.venta === 'number');
      const last = tail[tail.length - 1];
      return {
        venta: last.venta,
        fecha: last.fecha,
        prev: tail.length >= 2 ? tail[tail.length - 2].venta : null,
        spark: tail.map((p) => round4(p.venta)),
      };
    } catch { /* retry */ }
  }
  return null;
}

const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf-8')) : {};

const [badlar, tamar, cer, riesgoPais] = await Promise.all([
  bcraVarSerie(7),   // BADLAR bancos privados
  bcraVarSerie(44),  // TAMAR bancos privados
  bcraVarSerie(30),  // CER (Coef. Estabilización de Referencia)
  riesgoSerie(),
]);

// Dólar: casas cuyo sparkline mostramos en las tarjetas.
const DOLAR_CASAS = ['oficial', 'blue', 'bolsa', 'contadoconliqui', 'tarjeta', 'cripto'];
const dolarPairs = await Promise.all(DOLAR_CASAS.map(async (c) => [c, await dolarSerie(c)]));
const dolarPrev = prev.dolar || {};
const dolar = {};
for (const [c, s] of dolarPairs) dolar[c] = s || dolarPrev[c] || null;

// Conservar último valor bueno si una fuente falló en este build.
const out = {
  badlar: badlar || prev.badlar || null,
  tamar: tamar || prev.tamar || null,
  cer: cer || prev.cer || null,
  riesgoPais: riesgoPais || prev.riesgoPais || null,
  dolar,
};

const fresh = ['badlar', 'tamar', 'cer', 'riesgoPais'].filter((k) => (k === 'riesgoPais' ? riesgoPais : { badlar, tamar, cer }[k]));
const dolarFresh = dolarPairs.filter((p) => p[1]).map((p) => p[0]);
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf-8');
console.log(`[bcra-indices] frescos: ${fresh.join(', ') || 'ninguno (usando cache)'} · dólar: ${dolarFresh.join(', ') || 'ninguno'} → src/lib/bcra-indices.json`);
