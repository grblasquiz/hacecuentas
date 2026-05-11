#!/usr/bin/env node
/**
 * Pull tasas + UVA del BCRA API v4.0.
 * Output: src/data/live/tasas.json
 *
 * Variables BCRA usadas (verificadas Mayo 2026):
 *  - id=12: Tasa plazo fijo 30 días bancos
 *  - id=7:  BADLAR privados (depósitos >=1M)
 *  - id=14: Tasa préstamos personales
 *  - id=4:  Tipo de cambio minorista (referencia)
 *  - id=31: UVA
 */
import fs from "node:fs/promises";
import path from "node:path";

const OUT = "src/data/live/tasas.json";
const BASE = "https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias";

const VARS = {
  plazo_fijo_30d: { id: 12, label: "Tasa plazo fijo 30 días (TNA bancos)" },
  badlar: { id: 7, label: "BADLAR bancos privados (TNA)" },
  prestamos_personales: { id: 14, label: "Tasa préstamos personales (TNA)" },
  uva: { id: 31, label: "UVA (en pesos)" },
};

async function fetchVar(id) {
  // BCRA v4 response: results[0].detalle is array of {fecha, valor} sorted desc.
  const url = `${BASE}/${id}?limit=1`;
  const res = await fetch(url, { headers: { "User-Agent": "hacecuentas-data-refresh/1.0" } });
  if (!res.ok) throw new Error(`BCRA id=${id} status=${res.status}`);
  const data = await res.json();
  return data.results?.[0]?.detalle?.[0] ?? null;
}

async function main() {
  const out = {
    _meta: {
      source: "BCRA — Estadísticas Monetarias v4.0",
      sourceUrl: BASE,
      sourceOfficial: "https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp",
      fetchedAt: new Date().toISOString(),
    },
  };

  for (const [key, { id, label }] of Object.entries(VARS)) {
    try {
      const v = await fetchVar(id);
      if (v) {
        out[key] = { label, fecha: v.fecha, valor: v.valor, idBcra: id };
        console.log(`[bcra] ${key.padEnd(22)} ${v.fecha} → ${v.valor}`);
      } else {
        console.warn(`[bcra] ${key} → no data`);
      }
    } catch (e) {
      console.error(`[bcra] ${key} → ${e.message}`);
    }
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`[bcra] wrote ${OUT}`);
}

main().catch((e) => {
  console.error("[bcra] error:", e.message);
  process.exit(1);
});
