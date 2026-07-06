#!/usr/bin/env node
/**
 * Pull dólar BCV (oficial) y paralelo de Venezuela desde ve.dolarapi.com.
 * Output: src/data/live/venezuela.json
 * Run: node scripts/data-sources/fetch-venezuela.mjs
 *
 * Fuente: ve.dolarapi.com (agregador free) — BCV oficial + promedio paralelo.
 * El BCV cambia casi a diario; el paralelo (Monitor Dólar / Binance P2P) se mueve
 * de forma continua. Consumido por venezuela-2026.ts (fx, con fallback) y por la
 * landing /dolar-hoy-venezuela (que además refresca client-side).
 */
import fs from "node:fs/promises";
import path from "node:path";

const OUT = "src/data/live/venezuela.json";
const URL = "https://ve.dolarapi.com/v1/dolares";

async function main() {
  const res = await fetch(URL, { headers: { "User-Agent": "hacecuentas-data-refresh/1.0" } });
  if (!res.ok) throw new Error(`ve.dolarapi.com ${res.status}`);
  const rows = await res.json();

  const pick = (fuente) => (Array.isArray(rows) ? rows.find((r) => r?.fuente === fuente) : null);
  const oficial = pick("oficial");
  const paralelo = pick("paralelo");

  const bcvValor = Number(oficial?.promedio) || null;
  const parValor = Number(paralelo?.promedio) || null;

  const out = {
    _meta: {
      source: "BCV (oficial) + Monitor Dólar (paralelo) vía ve.dolarapi.com",
      sourceUrl: URL,
      fetchedAt: new Date().toISOString(),
    },
    bcv: {
      valor: bcvValor,
      fecha: oficial?.fechaActualizacion?.slice(0, 10) ?? null,
    },
    paralelo: {
      valor: parValor,
      fecha: paralelo?.fechaActualizacion?.slice(0, 10) ?? null,
    },
  };

  if (!out.bcv.valor) throw new Error("respuesta sin tasa BCV");

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`[venezuela] wrote ${OUT} — bcv=${out.bcv.valor} paralelo=${out.paralelo.valor}`);
}

main().catch((e) => {
  console.error("[venezuela] error:", e.message);
  process.exit(1);
});
