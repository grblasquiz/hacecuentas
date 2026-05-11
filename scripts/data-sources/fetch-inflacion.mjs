#!/usr/bin/env node
/**
 * Pull inflación mensual histórica AR (IPC INDEC) from ArgentinaDatos.
 * Output: src/data/live/inflacion.json
 *  - last_12_months: array of {fecha, valor}
 *  - last_month: {fecha, valor}
 *  - acumulado_12m: total
 *  - acumulado_ytd: total YTD
 */
import fs from "node:fs/promises";
import path from "node:path";

const OUT = "src/data/live/inflacion.json";
const URL = "https://api.argentinadatos.com/v1/finanzas/indices/inflacion";

async function main() {
  const res = await fetch(URL, { headers: { "User-Agent": "hacecuentas-data-refresh/1.0" } });
  if (!res.ok) throw new Error(`ArgentinaDatos ${res.status}`);
  const data = await res.json();
  // data is array sorted asc, [{fecha:'YYYY-MM-DD', valor:N}]

  const last12 = data.slice(-12);
  const lastMonth = data[data.length - 1];

  // compound inflation last 12 months
  // (1+x1/100)*(1+x2/100)*... - 1
  const acumulado12m = (
    (last12.reduce((acc, x) => acc * (1 + x.valor / 100), 1) - 1) * 100
  ).toFixed(1);

  // YTD: from Jan of current year to last month
  const currentYear = new Date().getFullYear();
  const ytdPoints = data.filter((d) => d.fecha.startsWith(String(currentYear)));
  const acumuladoYtd = (
    (ytdPoints.reduce((acc, x) => acc * (1 + x.valor / 100), 1) - 1) * 100
  ).toFixed(1);

  const out = {
    _meta: {
      source: "INDEC (vía ArgentinaDatos)",
      sourceUrl: URL,
      sourceOfficial: "https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31",
      fetchedAt: new Date().toISOString(),
    },
    last_month: lastMonth,
    last_12_months: last12,
    acumulado_12m_pct: parseFloat(acumulado12m),
    acumulado_ytd_pct: parseFloat(acumuladoYtd),
  };

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`[inflacion] wrote ${OUT}`);
  console.log(`  Último mes: ${lastMonth.fecha} → ${lastMonth.valor}%`);
  console.log(`  Acumulado 12m: ${acumulado12m}%`);
  console.log(`  YTD ${currentYear}: ${acumuladoYtd}%`);
}

main().catch((e) => {
  console.error("[inflacion] error:", e.message);
  process.exit(1);
});
