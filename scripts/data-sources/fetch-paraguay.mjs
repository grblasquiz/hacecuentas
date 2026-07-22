#!/usr/bin/env node
/**
 * Pull USD/PYG (tipo de cambio de mercado) from open.er-api.com.
 * Output: src/data/live/paraguay.json
 * Run: node scripts/data-sources/fetch-paraguay.mjs
 *
 * open.er-api.com es free, sin API key, CORS-open (sirve para refresh client-side).
 * Es un tipo de cambio de mercado, cercano al referencial diario del BCP.
 *
 * Cross-rates útiles para PY (comercio de frontera: Ciudad del Este, Encarnación):
 *   - brlpyg: guaraníes por 1 real brasileño
 *   - arspyg1000: guaraníes por 1.000 pesos argentinos
 * Se computan de la misma respuesta (base USD); no se refrescan client-side
 * (la landing solo refresca el card USD), el cron diario las mantiene al día.
 */
import fs from "node:fs/promises";
import path from "node:path";

const OUT = "src/data/live/paraguay.json";
const URL = "https://open.er-api.com/v6/latest/USD";

async function main() {
  const res = await fetch(URL, { headers: { "User-Agent": "hacecuentas-data-refresh/1.0" } });
  if (!res.ok) throw new Error(`open.er-api ${res.status}`);
  const d = await res.json();
  const pyg = d?.rates?.PYG;
  if (!pyg) throw new Error("respuesta sin PYG");
  const brl = d?.rates?.BRL;
  const ars = d?.rates?.ARS;
  const r2 = (n) => Math.round(n * 100) / 100;

  const out = {
    _meta: {
      source: "open.er-api.com (tipo de cambio de mercado USD/PYG)",
      sourceUrl: URL,
      fetchedAt: new Date().toISOString(),
      lastUpdateApi: d.time_last_update_utc || null,
    },
    usdpyg: { valor: r2(pyg), fecha: d.time_last_update_utc || null },
    // Cross-rates desde la misma base USD
    brlpyg: brl ? { valor: r2(pyg / brl) } : { valor: null },
    arspyg1000: ars ? { valor: r2((pyg / ars) * 1000) } : { valor: null },
  };


  // IPC (BCP, base Dic.2017=100): NO hay endpoint JSON público.
  // TODO(ipc-py): www.bcp.gov.py devuelve 403 a clientes no-browser (bot-block)
  // y la serie solo vive en el xlsx del Anexo Estadístico del Informe Económico
  // (URL dateada por mes). Hasta encontrar endpoint estable, el bloque `ipc`
  // del json se actualiza a mano y acá se preserva.
  try {
    const prev = JSON.parse(await fs.readFile(OUT, "utf8"));
    if (prev?.ipc) out.ipc = prev.ipc;
  } catch { /* primer run */ }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`[paraguay] wrote ${OUT} — usdpyg=${out.usdpyg.valor} brlpyg=${out.brlpyg.valor} arspyg1000=${out.arspyg1000.valor}`);
}

main().catch((e) => {
  console.error("[paraguay] error:", e.message);
  process.exit(1);
});
