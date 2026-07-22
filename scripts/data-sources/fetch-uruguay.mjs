#!/usr/bin/env node
/**
 * Pull USD/UYU (tipo de cambio de mercado) from open.er-api.com.
 * Output: src/data/live/uruguay.json
 * Run: node scripts/data-sources/fetch-uruguay.mjs
 *
 * open.er-api.com es free, sin API key, CORS-open (sirve para refresh client-side).
 * Es un tipo de cambio de mercado/interbancario, muy cercano al que publica el BCU
 * al cierre de cada día hábil. La pizarra del BROU (compra/venta) difiere ±3%.
 *
 * Cross-rates (euro y real → UYU) se computan de la misma respuesta (base USD):
 * no se refrescan client-side (la landing solo refresca el card USD), pero el
 * cron diario las mantiene al día.
 *
 * Unidad Indexada (UI): la publica el INE/BCU. La API del BCU es SOAP
 * (awsbcucotizaciones) — engorrosa y sin CORS. La UI queda en el snapshot fiscal
 * src/lib/data/uruguay-2026.ts (unidadIndexada.valor) con actualización manual.
 */
import fs from "node:fs/promises";
import path from "node:path";

const OUT = "src/data/live/uruguay.json";
const URL = "https://open.er-api.com/v6/latest/USD";

async function main() {
  const res = await fetch(URL, { headers: { "User-Agent": "hacecuentas-data-refresh/1.0" } });
  if (!res.ok) throw new Error(`open.er-api ${res.status}`);
  const d = await res.json();
  const uyu = d?.rates?.UYU;
  if (!uyu) throw new Error("respuesta sin UYU");
  const eur = d?.rates?.EUR;
  const brl = d?.rates?.BRL;
  const r4 = (n) => Math.round(n * 10000) / 10000;

  const out = {
    _meta: {
      source: "open.er-api.com (tipo de cambio de mercado USD/UYU)",
      sourceUrl: URL,
      fetchedAt: new Date().toISOString(),
      lastUpdateApi: d.time_last_update_utc || null,
    },
    usduyu: { valor: r4(uyu), fecha: d.time_last_update_utc || null },
    // Cross-rates desde la misma base USD (UYU por 1 EUR / 1 BRL)
    eurouyu: eur ? { valor: r4(uyu / eur) } : { valor: null },
    brluyu: brl ? { valor: r4(uyu / brl) } : { valor: null },
  };

  // IPC (INE, base Oct.2022=100): NO hay endpoint estructurado público.
  // TODO(ipc-uy): el INE publica la serie solo en xls con URL que cambia por mes
  // (www5.ine.gub.uy) y el BCU expone SOAP sin CORS; catalogodatos.gub.uy no
  // tiene el dataset IPC. Hasta encontrar endpoint estable, el bloque `ipc` del
  // json se actualiza a mano (ver src/data/live/uruguay.json) y acá se preserva.
  try {
    const prev = JSON.parse(await fs.readFile(OUT, "utf8"));
    if (prev?.ipc) out.ipc = prev.ipc;
  } catch { /* primer run */ }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`[uruguay] wrote ${OUT} — usduyu=${out.usduyu.valor} eurouyu=${out.eurouyu.valor} brluyu=${out.brluyu.valor}`);
}

main().catch((e) => {
  console.error("[uruguay] error:", e.message);
  process.exit(1);
});
