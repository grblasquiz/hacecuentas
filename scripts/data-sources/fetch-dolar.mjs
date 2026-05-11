#!/usr/bin/env node
/**
 * Pull dolar quotes from DolarAPI.
 * Output: src/data/live/dolar.json
 * Run: node scripts/data-sources/fetch-dolar.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";

const OUT = "src/data/live/dolar.json";
const URL = "https://dolarapi.com/v1/dolares";

async function main() {
  const res = await fetch(URL, { headers: { "User-Agent": "hacecuentas-data-refresh/1.0" } });
  if (!res.ok) throw new Error(`DolarAPI ${res.status}`);
  const data = await res.json();

  const map = {};
  for (const d of data) {
    map[d.casa] = {
      compra: d.compra,
      venta: d.venta,
      nombre: d.nombre,
      fechaActualizacion: d.fechaActualizacion,
    };
  }

  const out = {
    _meta: {
      source: "DolarAPI",
      sourceUrl: URL,
      fetchedAt: new Date().toISOString(),
    },
    quotes: map,
  };

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`[dolar] wrote ${OUT} — ${Object.keys(map).length} quotes`);
  for (const [k, v] of Object.entries(map)) {
    console.log(`  ${k.padEnd(20)} compra=${v.compra}  venta=${v.venta}`);
  }
}

main().catch((e) => {
  console.error("[dolar] error:", e.message);
  process.exit(1);
});
