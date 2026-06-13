#!/usr/bin/env node
/**
 * Pull USD/PEN (tipo de cambio de mercado) from open.er-api.com.
 * Output: src/data/live/peru.json
 * Run: node scripts/data-sources/fetch-peru.mjs
 *
 * open.er-api.com es free, sin API key, CORS-open (sirve para refresh client-side).
 * Es un tipo de cambio de mercado/interbancario. El tipo de cambio oficial SUNAT
 * (apis.net.pe) NO es CORS-open, así que no se puede refrescar client-side; lo
 * mencionamos en el copy como referencia.
 */
import fs from "node:fs/promises";
import path from "node:path";

const OUT = "src/data/live/peru.json";
const URL = "https://open.er-api.com/v6/latest/USD";

async function main() {
  const res = await fetch(URL, { headers: { "User-Agent": "hacecuentas-data-refresh/1.0" } });
  if (!res.ok) throw new Error(`open.er-api ${res.status}`);
  const d = await res.json();
  const pen = d?.rates?.PEN;
  if (!pen) throw new Error("respuesta sin PEN");

  const out = {
    _meta: {
      source: "open.er-api.com (tipo de cambio de mercado USD/PEN)",
      sourceUrl: URL,
      fetchedAt: new Date().toISOString(),
      lastUpdateApi: d.time_last_update_utc || null,
    },
    usdpen: { valor: Math.round(pen * 10000) / 10000, fecha: d.time_last_update_utc || null },
  };

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`[peru] wrote ${OUT} — usdpen=${out.usdpen.valor}`);
}

main().catch((e) => {
  console.error("[peru] error:", e.message);
  process.exit(1);
});
