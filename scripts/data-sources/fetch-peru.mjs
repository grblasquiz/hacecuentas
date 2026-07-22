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

/**
 * IPC Lima Metropolitana (índice Dic.2021=100) vía API pública del BCRP.
 * Serie PN38705PM — JSON, sin API key. Publica el dato del mes ~primeros días
 * del mes siguiente (fuente primaria: INEI).
 */
const IPC_SERIE = "PN38705PM";
const MESES = { Ene: "01", Feb: "02", Mar: "03", Abr: "04", May: "05", Jun: "06", Jul: "07", Ago: "08", Sep: "09", Oct: "10", Nov: "11", Dic: "12" };

async function fetchIpc() {
  const now = new Date();
  const from = `${now.getFullYear() - 2}-${now.getMonth() + 1}`;
  const to = `${now.getFullYear()}-${now.getMonth() + 1}`;
  const url = `https://estadisticas.bcrp.gob.pe/estadisticas/series/api/${IPC_SERIE}/json/${from}/${to}`;
  const res = await fetch(url, { headers: { "User-Agent": "hacecuentas-data-refresh/1.0" } });
  if (!res.ok) throw new Error(`BCRP ${res.status}`);
  const d = await res.json();
  const serie = {};
  for (const p of d?.periods || []) {
    const [mesTxt, anio] = p.name.split(".");
    const mes = MESES[mesTxt];
    const v = Number(p.values?.[0]);
    // Bound de sanidad: índice Dic.2021=100, rango plausible próximo lustro
    if (!mes || !Number.isFinite(v) || v < 100 || v > 200) continue;
    serie[`${anio}-${mes}`] = Math.round(v * 10000) / 10000;
  }
  const keys = Object.keys(serie).sort();
  if (keys.length < 13) throw new Error(`BCRP: serie IPC corta (${keys.length} meses)`);
  const last = keys[keys.length - 1];
  const prev = keys[keys.length - 2];
  const yoyKey = `${Number(last.slice(0, 4)) - 1}${last.slice(4)}`;
  const r2 = (n) => Math.round(n * 100) / 100;
  const mensual = r2((serie[last] / serie[prev] - 1) * 100);
  const interanual = serie[yoyKey] ? r2((serie[last] / serie[yoyKey] - 1) * 100) : null;
  // Bounds de sanidad para variaciones (Perú, inflación baja/moderada)
  if (mensual < -3 || mensual > 5) throw new Error(`BCRP: var mensual fuera de rango (${mensual}%)`);
  if (interanual !== null && (interanual < -2 || interanual > 20)) throw new Error(`BCRP: var interanual fuera de rango (${interanual}%)`);
  // Serie recortada a los últimos 24 meses
  const serie24 = Object.fromEntries(keys.slice(-24).map((k) => [k, serie[k]]));
  return {
    fuente: "BCRP (API estadísticas, serie PN38705PM) — IPC Lima Metropolitana, INEI",
    sourceUrl: `https://estadisticas.bcrp.gob.pe/estadisticas/series/api/${IPC_SERIE}/json`,
    base: "Dic.2021 = 100",
    periodo: last,
    indice: serie[last],
    variacionMensual: mensual,
    variacionInteranual: interanual,
    serie: serie24,
  };
}

async function main() {
  const res = await fetch(URL, { headers: { "User-Agent": "hacecuentas-data-refresh/1.0" } });
  if (!res.ok) throw new Error(`open.er-api ${res.status}`);
  const d = await res.json();
  const pen = d?.rates?.PEN;
  if (!pen) throw new Error("respuesta sin PEN");
  const ipc = await fetchIpc();

  const out = {
    _meta: {
      source: "open.er-api.com (tipo de cambio de mercado USD/PEN)",
      sourceUrl: URL,
      fetchedAt: new Date().toISOString(),
      lastUpdateApi: d.time_last_update_utc || null,
    },
    usdpen: { valor: Math.round(pen * 10000) / 10000, fecha: d.time_last_update_utc || null },
    ipc,
  };

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`[peru] wrote ${OUT} — usdpen=${out.usdpen.valor} ipc=${ipc.periodo}:${ipc.indice} (i.a. ${ipc.variacionInteranual}%)`);
}

main().catch((e) => {
  console.error("[peru] error:", e.message);
  process.exit(1);
});
