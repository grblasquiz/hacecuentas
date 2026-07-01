#!/usr/bin/env node
/**
 * Snapshot para /plazo-fijo-vs-billeteras: TNA de plazo fijo por banco +
 * rendimientos de billeteras virtuales (FCI money market y cuentas remuneradas).
 * Fuente: api.argentinadatos.com (CORS abierto — el mismo feed se refresca client-side).
 * Output: src/data/live/tasas-billeteras.json
 * Run: node scripts/data-sources/fetch-tasas-billeteras.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";

const OUT = "src/data/live/tasas-billeteras.json";
const API = "https://api.argentinadatos.com/v1/finanzas";
const UA = { headers: { "User-Agent": "hacecuentas-data-refresh/1.0" } };

// Billeteras cuyo rendimiento sale del FCI money market donde invierten el saldo.
// TNA derivada de la variación del VCP (valor cuotaparte) entre los dos últimos
// datos publicados por CAFCI: tasa diaria = (vcp_u/vcp_p)^(1/días) − 1.
const FCI_MAP = [
  { id: "mercadopago", nombre: "Mercado Pago", fondo: "Mercado Fondo - Clase A" },
  { id: "personalpay", nombre: "Personal Pay", fondo: "Delta Pesos - Clase X" },
  { id: "cocos", nombre: "Cocos", fondo: "Cocos Ahorro - Clase A" },
];

// Billeteras con rendimiento ARS publicado directo en /finanzas/rendimientos.
const REND_MAP = [
  { id: "letsbit", entidad: "letsbit", nombre: "Let'sBit" },
  { id: "fiwind", entidad: "fiwind", nombre: "Fiwind" },
];

// Cuentas remuneradas con tasa promocional que NO figura en APIs públicas.
// Valores verificados en prensa (Infobae/iProfesional/Cronista, jun-jul 2026).
// Si cambian, actualizar acá y correr este script: la fecha queda visible en la página.
const ESTATICAS = [
  { id: "uala", nombre: "Ualá", tna: 26.0, tipo: "remunerada", detalle: "Cuenta remunerada, con tope de saldo (el excedente no rinde)", fecha: "2026-07-01" },
  { id: "naranjax", nombre: "Naranja X", tna: 18.0, tipo: "remunerada", detalle: "Cuenta remunerada, con tope de saldo", fecha: "2026-07-01" },
  { id: "prex", nombre: "Prex", tna: 18.5, tipo: "fci", detalle: "FCI money market (Allaria)", fecha: "2026-07-01" },
];

async function getJSON(url) {
  const res = await fetch(url, UA);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

function fciTna(ultimo, penultimo, fondo) {
  const u = ultimo.find((f) => f.fondo === fondo);
  const p = penultimo.find((f) => f.fondo === fondo);
  if (!u?.vcp || !p?.vcp || !u.fecha || !p.fecha) return null;
  const days = Math.round((new Date(u.fecha) - new Date(p.fecha)) / 86400000);
  if (days < 1 || days > 45) return null;
  const daily = Math.pow(u.vcp / p.vcp, 1 / days) - 1;
  const tna = daily * 365 * 100;
  if (!isFinite(tna) || tna < 3 || tna > 120) return null; // sanity: descarta VCP sin movimiento o outliers
  return { tna: +tna.toFixed(2), fecha: u.fecha };
}

async function main() {
  const [pf, rend, fciU, fciP] = await Promise.all([
    getJSON(`${API}/tasas/plazoFijo`),
    getJSON(`${API}/rendimientos`),
    getJSON(`${API}/fci/mercadoDinero/ultimo`),
    getJSON(`${API}/fci/mercadoDinero/penultimo`),
  ]);

  const bancos = (pf || [])
    .filter((x) => x && x.entidad && x.tnaClientes > 0)
    .map((x) => ({ entidad: x.entidad, tna: +(x.tnaClientes * 100).toFixed(2) }));

  const billeteras = [];

  for (const m of FCI_MAP) {
    const r = fciTna(fciU, fciP, m.fondo);
    if (r) billeteras.push({ id: m.id, nombre: m.nombre, tna: r.tna, tipo: "fci", detalle: `FCI money market (${m.fondo})`, fecha: r.fecha, fondo: m.fondo });
  }

  for (const m of REND_MAP) {
    const e = (rend || []).find((x) => x.entidad === m.entidad);
    const ars = e?.rendimientos?.find((r) => r.moneda === "ARS" && r.apy > 0);
    if (ars) billeteras.push({ id: m.id, nombre: m.nombre, tna: +ars.apy.toFixed(2), tipo: "rendimientos", detalle: "Rendimiento sobre saldo en pesos", fecha: ars.fecha, entidad: m.entidad });
  }

  for (const s of ESTATICAS) if (!billeteras.some((b) => b.id === s.id)) billeteras.push(s);

  billeteras.sort((a, b) => b.tna - a.tna);

  const out = {
    _meta: {
      source: "argentinadatos.com (BCRA + CAFCI) + prensa para cuentas remuneradas",
      sourceUrl: `${API}/tasas/plazoFijo`,
      fetchedAt: new Date().toISOString(),
    },
    bancos,
    billeteras,
  };

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`[tasas-billeteras] wrote ${OUT} — ${bancos.length} bancos, ${billeteras.length} billeteras`);
  for (const b of billeteras) console.log(`  ${b.nombre.padEnd(14)} TNA=${b.tna}% (${b.tipo}, ${b.fecha})`);
}

main().catch((e) => {
  console.error("[tasas-billeteras] error:", e.message);
  process.exit(1);
});
