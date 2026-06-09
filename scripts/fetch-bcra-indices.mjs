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

const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf-8')) : {};

const [badlar, tamar, cer, riesgoPais] = await Promise.all([
  bcraVar(7),   // BADLAR bancos privados
  bcraVar(44),  // TAMAR bancos privados
  bcraVar(30),  // CER (Coef. Estabilización de Referencia)
  lastFromSeries('https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais'),
]);

// Conservar último valor bueno si una fuente falló en este build.
const out = {
  badlar: badlar || prev.badlar || null,
  tamar: tamar || prev.tamar || null,
  cer: cer || prev.cer || null,
  riesgoPais: riesgoPais || prev.riesgoPais || null,
};

const fresh = ['badlar', 'tamar', 'cer', 'riesgoPais'].filter((k) => (k === 'riesgoPais' ? riesgoPais : { badlar, tamar, cer }[k]));
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf-8');
console.log(`[bcra-indices] frescos: ${fresh.join(', ') || 'ninguno (usando cache)'} → src/lib/bcra-indices.json`);
