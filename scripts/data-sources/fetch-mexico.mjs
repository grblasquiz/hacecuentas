#!/usr/bin/env node
/**
 * Pull USD/MXN (tipo de cambio interbancario / mercado) from open.er-api.com.
 * Output: src/data/live/mexico.json
 * Run: node scripts/data-sources/fetch-mexico.mjs
 *
 * open.er-api.com es free, sin API key, CORS-open (sirve para refresh client-side).
 * Es un tipo de cambio de mercado/interbancario (no el FIX de Banxico, que requiere token).
 */
import fs from "node:fs/promises";
import path from "node:path";

const OUT = "src/data/live/mexico.json";
const URL = "https://open.er-api.com/v6/latest/USD";

async function main() {
  const res = await fetch(URL, { headers: { "User-Agent": "hacecuentas-data-refresh/1.0" } });
  if (!res.ok) throw new Error(`open.er-api ${res.status}`);
  const d = await res.json();
  const mxn = d?.rates?.MXN;
  if (!mxn) throw new Error("respuesta sin MXN");

  const out = {
    _meta: {
      source: "open.er-api.com (tipo de cambio de mercado USD/MXN)",
      sourceUrl: URL,
      fetchedAt: new Date().toISOString(),
      lastUpdateApi: d.time_last_update_utc || null,
    },
    usdmxn: { valor: Math.round(mxn * 10000) / 10000, fecha: d.time_last_update_utc || null },
  };

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`[mexico] wrote ${OUT} — usdmxn=${out.usdmxn.valor}`);
}

main().catch((e) => {
  console.error("[mexico] error:", e.message);
  process.exit(1);
});
