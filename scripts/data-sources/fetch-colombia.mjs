#!/usr/bin/env node
/**
 * Pull Colombian TRM (tasa de cambio representativa del mercado) from datos.gov.co.
 * Output: src/data/live/colombia.json
 * Run: node scripts/data-sources/fetch-colombia.mjs
 *
 * Fuente oficial: Superintendencia Financiera vía Datos Abiertos (Socrata), free.
 */
import fs from "node:fs/promises";
import path from "node:path";

const OUT = "src/data/live/colombia.json";
const URL = "https://www.datos.gov.co/resource/32sa-8pi3.json?$order=vigenciadesde%20DESC&$limit=1";

async function main() {
  const res = await fetch(URL, { headers: { "User-Agent": "hacecuentas-data-refresh/1.0" } });
  if (!res.ok) throw new Error(`datos.gov.co ${res.status}`);
  const rows = await res.json();
  const row = rows[0] || {};

  const out = {
    _meta: {
      source: "Superintendencia Financiera / datos.gov.co",
      sourceUrl: "https://www.datos.gov.co/d/32sa-8pi3",
      fetchedAt: new Date().toISOString(),
    },
    trm: {
      valor: Number(row.valor) || null,
      vigenciaDesde: row.vigenciadesde ?? null,
      vigenciaHasta: row.vigenciahasta ?? null,
    },
  };

  if (!out.trm.valor) throw new Error("respuesta sin TRM");

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`[colombia] wrote ${OUT} — trm=${out.trm.valor} (desde ${out.trm.vigenciaDesde?.slice(0, 10)})`);
}

main().catch((e) => {
  console.error("[colombia] error:", e.message);
  process.exit(1);
});
