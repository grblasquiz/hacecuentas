#!/usr/bin/env node
/**
 * Pull Chilean indicators (UF, dólar observado, UTM) from mindicador.cl.
 * Output: src/data/live/chile.json
 * Run: node scripts/data-sources/fetch-chile.mjs
 *
 * mindicador.cl es free, sin API key. Fuente: Banco Central de Chile / SII.
 */
import fs from "node:fs/promises";
import path from "node:path";

const OUT = "src/data/live/chile.json";
const URL = "https://mindicador.cl/api";

async function main() {
  const res = await fetch(URL, { headers: { "User-Agent": "hacecuentas-data-refresh/1.0" } });
  if (!res.ok) throw new Error(`mindicador.cl ${res.status}`);
  const d = await res.json();

  const pick = (k) => ({ valor: d[k]?.valor ?? null, fecha: d[k]?.fecha ?? null });
  const out = {
    _meta: {
      source: "mindicador.cl (Banco Central de Chile / SII)",
      sourceUrl: URL,
      fetchedAt: new Date().toISOString(),
    },
    uf: pick("uf"),
    dolar: pick("dolar"),
    utm: pick("utm"),
    euro: pick("euro"),
  };

  // UTA = 12 × UTM (convención SII)
  out.uta = { valor: out.utm.valor ? Math.round(out.utm.valor * 12 * 100) / 100 : null, fecha: out.utm.fecha };

  if (!out.uf.valor || !out.dolar.valor) throw new Error("respuesta sin uf/dolar");

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`[chile] wrote ${OUT} — uf=${out.uf.valor} dolar=${out.dolar.valor} utm=${out.utm.valor} uta=${out.uta.valor}`);
}

main().catch((e) => {
  console.error("[chile] error:", e.message);
  process.exit(1);
});
