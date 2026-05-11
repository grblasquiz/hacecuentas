#!/usr/bin/env node
/**
 * Genera datasets públicos descargables (CSV + JSON) con datos AR históricos.
 * Output: public/datasets/*.{csv,json}
 *
 * Datasets generados:
 *  - inflacion-argentina-historica-mensual.csv (desde 1943, IPC INDEC)
 *  - dolar-oficial-blue-historico.csv (últimos 5 años)
 *  - uva-historico.csv (BCRA)
 *  - tasas-bcra-historico.csv (plazo fijo, BADLAR, préstamos)
 *
 * Cada dataset incluye:
 *  - CSV con header en español
 *  - JSON con metadata + datos
 *  - Licencia CC-BY 4.0 (atribución requerida)
 *
 * Se ejecuta dentro del cron data-refresh-daily.yml.
 */
import fs from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "public/datasets";
const SITE = "https://hacecuentas.com";

await fs.mkdir(OUT_DIR, { recursive: true });

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

function toCSV(rows, header) {
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(row.map((c) => (typeof c === "string" && c.includes(",") ? `"${c}"` : c)).join(","));
  }
  return lines.join("\n") + "\n";
}

async function writeDataset(name, meta, rows, header) {
  const baseName = name;
  const csv = toCSV(rows, header);
  const json = {
    name: meta.name,
    description: meta.description,
    license: "https://creativecommons.org/licenses/by/4.0/",
    licenseName: "CC-BY-4.0",
    creator: "Hacé Cuentas",
    creatorUrl: SITE,
    source: meta.source,
    sourceUrl: meta.sourceUrl,
    generatedAt: new Date().toISOString(),
    fields: meta.fields,
    rowCount: rows.length,
    data: rows.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]]))),
  };
  await fs.writeFile(path.join(OUT_DIR, `${baseName}.csv`), csv);
  await fs.writeFile(path.join(OUT_DIR, `${baseName}.json`), JSON.stringify(json, null, 2));
  console.log(`  ${baseName}: ${rows.length} rows`);
}

// ────────────────────────────────────────────────────────────────────
// 1. Inflación mensual histórica AR (INDEC)
// ────────────────────────────────────────────────────────────────────

async function fetchInflacion() {
  const res = await fetch("https://api.argentinadatos.com/v1/finanzas/indices/inflacion");
  if (!res.ok) throw new Error(`inflacion ${res.status}`);
  return res.json();
}

// ────────────────────────────────────────────────────────────────────
// 2. Dólar histórico (DolarAPI: tiene endpoint históricos por casa)
// ────────────────────────────────────────────────────────────────────

async function fetchDolarHistorico(casa) {
  // ArgentinaDatos tiene histórico de cotizaciones
  const res = await fetch(`https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}`);
  if (!res.ok) return [];
  return res.json();
}

// ────────────────────────────────────────────────────────────────────
// 3. UVA histórico (BCRA id=31)
// ────────────────────────────────────────────────────────────────────

async function fetchBCRAHistory(id, limit = 3000) {
  // BCRA v4 API: limit max ~3000 por request
  const url = `https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias/${id}?limit=${limit}`;
  const res = await fetch(url, { headers: { "User-Agent": "hacecuentas-datasets/1.0" } });
  if (!res.ok) {
    console.warn(`  BCRA id=${id} status=${res.status}`);
    return [];
  }
  const data = await res.json();
  return data.results?.[0]?.detalle || [];
}

// ────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────

console.log("Generating datasets...");

try {
  // 1. Inflación AR mensual
  const inflacion = await fetchInflacion();
  await writeDataset(
    "inflacion-argentina-historica-mensual",
    {
      name: "Inflación mensual histórica de Argentina (IPC)",
      description:
        "Variación mensual del Índice de Precios al Consumidor (IPC) publicado por INDEC. Datos desde 1943. Útil para análisis económico, ajustes de contratos, indexación.",
      source: "INDEC (vía ArgentinaDatos)",
      sourceUrl: "https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31",
      fields: ["fecha (YYYY-MM-DD)", "valor (% mensual)"],
    },
    inflacion.map((x) => [x.fecha, x.valor]),
    ["fecha", "inflacion_mensual_pct"],
  );
} catch (e) {
  console.error("  inflacion: error", e.message);
}

try {
  // 2. Dólar histórico — oficial + blue (ArgentinaDatos no tiene MEP histórico)
  for (const casa of ["oficial", "blue"]) {
    const data = await fetchDolarHistorico(casa);
    if (!data.length) continue;
    await writeDataset(
      `dolar-${casa}-argentina-historico`,
      {
        name: `Cotización histórica del dólar ${casa} en Argentina`,
        description: `Histórico diario de la cotización del dólar ${casa} en Argentina. Útil para análisis cambiario, hedging, planificación financiera.`,
        source: "ArgentinaDatos (agrega BNA, MAE, Ámbito Financiero)",
        sourceUrl: `https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}`,
        fields: ["fecha", "compra (ARS)", "venta (ARS)"],
      },
      data.map((x) => [x.fecha, x.compra, x.venta]),
      ["fecha", "compra_ars", "venta_ars"],
    );
  }
} catch (e) {
  console.error("  dolar: error", e.message);
}

try {
  // 3. UVA histórico (BCRA id=31)
  const uvaData = await fetchBCRAHistory(31, 3000);
  if (uvaData.length) {
    await writeDataset(
      "uva-argentina-historico",
      {
        name: "UVA (Unidad de Valor Adquisitivo) — histórico BCRA",
        description:
          "Valor diario de la UVA, creada por el BCRA en 2016. Se ajusta por inflación (CER) y se usa en créditos hipotecarios, plazos fijos UVA, alquileres ICL.",
        source: "BCRA — Estadísticas Monetarias",
        sourceUrl: "https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp",
        fields: ["fecha", "valor (ARS)"],
      },
      uvaData.map((x) => [x.fecha, x.valor]),
      ["fecha", "valor_ars"],
    );
  }
} catch (e) {
  console.error("  uva: error", e.message);
}

try {
  // 4. Tasas plazo fijo histórico (BCRA id=12)
  const pfData = await fetchBCRAHistory(12, 3000);
  if (pfData.length) {
    await writeDataset(
      "tasa-plazo-fijo-30dias-argentina-historico",
      {
        name: "Tasa de plazo fijo a 30 días (TNA) — histórico BCRA",
        description:
          "Tasa Nominal Anual promedio publicada diariamente por el BCRA para depósitos a plazo fijo a 30 días en bancos privados. Útil para benchmark de rendimientos.",
        source: "BCRA — Estadísticas Monetarias",
        sourceUrl: "https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp",
        fields: ["fecha", "tasa_tna (%)"],
      },
      pfData.map((x) => [x.fecha, x.valor]),
      ["fecha", "tasa_tna_pct"],
    );
  }
} catch (e) {
  console.error("  tasa pf: error", e.message);
}

// ────────────────────────────────────────────────────────────────────
// Index
// ────────────────────────────────────────────────────────────────────

const files = (await fs.readdir(OUT_DIR)).filter((f) => f.endsWith(".csv") || f.endsWith(".json"));
const index = {
  name: "Hacé Cuentas — Datasets públicos AR",
  description:
    "Datasets descargables con datos económicos argentinos: inflación, dólar, UVA, tasas BCRA. Licencia CC-BY 4.0 (uso libre con atribución).",
  license: "https://creativecommons.org/licenses/by/4.0/",
  generatedAt: new Date().toISOString(),
  datasets: files
    .filter((f) => f.endsWith(".csv"))
    .map((f) => ({
      slug: f.replace(".csv", ""),
      csv: `${SITE}/datasets/${f}`,
      json: `${SITE}/datasets/${f.replace(".csv", ".json")}`,
    })),
};
await fs.writeFile(path.join(OUT_DIR, "index.json"), JSON.stringify(index, null, 2));
console.log(`\nGenerated ${index.datasets.length} datasets`);
