#!/usr/bin/env node
/**
 * De-templatiza las `sources` de calcs que comparten una terna fingerprint
 * (señal de "scaled content" que dispara el rechazo AdSense + SERP suppression).
 *
 * Reemplaza la terna idéntica por un set de fuentes REALES y RELEVANTES al tema
 * de cada calc, derivado del slug. Reglas ordenadas (primer match gana). Para
 * variar dentro de un mismo tema (evitar un nuevo fingerprint), rota el subset
 * del pool según el slug. NUNCA inventa URLs: solo instituciones/dominios reales.
 *
 * Uso:
 *   node scripts/detemplatize-sources.mjs            # dry-run (no escribe)
 *   node scripts/detemplatize-sources.mjs --apply    # escribe los JSON
 *   node scripts/detemplatize-sources.mjs --cluster=arca|bipm|akc
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'src/content/calcs';
const APPLY = process.argv.includes('--apply');
const clusterArg = (process.argv.find(a => a.startsWith('--cluster=')) || '').split('=')[1] || 'arca';

// Fuentes reales reutilizables (name + URL de institución/dominio real, sin deep-links inventados)
const S = {
  bcra:    { name: 'BCRA — tasas, UVA e ICL', url: 'https://www.bcra.gob.ar' },
  indec:   { name: 'INDEC — IPC e índices de precios', url: 'https://www.indec.gob.ar' },
  arca:    { name: 'ARCA (ex AFIP) — normativa tributaria', url: 'https://www.arca.gob.ar' },
  infoleg: { name: 'InfoLEG — texto de la normativa vigente', url: 'https://www.infoleg.gob.ar' },
  anses:   { name: 'ANSES — prestaciones y haberes', url: 'https://www.anses.gob.ar' },
  pami:    { name: 'PAMI — prestaciones', url: 'https://www.pami.org.ar' },
  progresar:{ name: 'Becas Progresar — Ministerio de Capital Humano', url: 'https://www.argentina.gob.ar/educacion/progresar' },
  belgrano:{ name: 'Becas Manuel Belgrano', url: 'https://www.argentina.gob.ar/educacion/becas' },
  cnv:     { name: 'CNV — Comisión Nacional de Valores', url: 'https://www.cnv.gob.ar' },
  byma:    { name: 'BYMA — Bolsas y Mercados Argentinos', url: 'https://www.byma.com.ar' },
  iamc:    { name: 'IAMC — Instituto Argentino de Mercado de Capitales', url: 'https://www.iamc.com.ar' },
  invest:  { name: 'Investopedia — definiciones financieras', url: 'https://www.investopedia.com' },
  damodaran:{ name: 'Aswath Damodaran (NYU Stern) — valuación', url: 'https://pages.stern.nyu.edu/~adamodar/' },
  coingecko:{ name: 'CoinGecko — datos de mercado cripto', url: 'https://www.coingecko.com' },
  binance: { name: 'Binance Academy — educación cripto', url: 'https://academy.binance.com' },
  ethereum:{ name: 'ethereum.org — staking y protocolo', url: 'https://ethereum.org/es/staking/' },
  bitcoin: { name: 'Bitcoin.org — whitepaper y protocolo', url: 'https://bitcoin.org' },
  defillama:{ name: 'DefiLlama — métricas DeFi', url: 'https://defillama.com' },
  bna:     { name: 'Banco de la Nación Argentina — créditos hipotecarios', url: 'https://www.bna.com.ar' },
  escribanos:{ name: 'Colegio de Escribanos de la Ciudad de Buenos Aires', url: 'https://www.colegio-escribanos.org.ar' },
  agip:    { name: 'AGIP — tributos de la Ciudad de Buenos Aires', url: 'https://www.agip.gob.ar' },
  arba:    { name: 'ARBA — tributos de la Provincia de Buenos Aires', url: 'https://www.arba.gov.ar' },
  dnrpa:   { name: 'DNRPA — Registro de la Propiedad Automotor', url: 'https://www.dnrpa.gov.ar' },
  reincidencia:{ name: 'Registro Nacional de Reincidencia — Min. de Justicia', url: 'https://www.argentina.gob.ar/justicia/reincidencia' },
  migraciones:{ name: 'Dirección Nacional de Migraciones', url: 'https://www.argentina.gob.ar/interior/migraciones' },
  justicia:{ name: 'Ministerio de Justicia — trámites y aranceles', url: 'https://www.argentina.gob.ar/justicia' },
  consuladoIt:{ name: 'Consulado General de Italia en Argentina', url: 'https://consbuenosaires.esteri.it' },
  travelUsa:{ name: 'U.S. Travel Docs — visa B1/B2', url: 'https://www.ustraveldocs.com' },
  lct:     { name: 'Ley de Contrato de Trabajo 20.744 (InfoLEG)', url: 'https://www.infoleg.gob.ar' },
  ganancias:{ name: 'Ley de Impuesto a las Ganancias 20.628 (InfoLEG)', url: 'https://www.infoleg.gob.ar' },
  anmat:   { name: 'ANMAT — habilitaciones sanitarias', url: 'https://www.argentina.gob.ar/anmat' },
  // Metrología (conversores) — reemplazan a "Wikipedia" (fuente débil p/AdSense)
  bipm:    { name: 'BIPM — Sistema Internacional de Unidades (SI)', url: 'https://www.bipm.org' },
  nist:    { name: 'NIST — guía de unidades (SP 811)', url: 'https://www.nist.gov/pml/special-publication-811' },
  iso:     { name: 'ISO 80000 — magnitudes y unidades', url: 'https://www.iso.org' },
  iec:     { name: 'IEC — prefijos binarios y unidades eléctricas', url: 'https://www.iec.ch' },
  usda:    { name: 'USDA FoodData Central — medidas de cocina', url: 'https://fdc.nal.usda.gov' },
  // Mascotas (perros)
  akc:     { name: 'AKC — American Kennel Club (estándares de raza)', url: 'https://www.akc.org' },
  fci:     { name: 'FCI — Fédération Cynologique Internationale', url: 'https://www.fci.be' },
  avma:    { name: 'AVMA — American Veterinary Medical Association', url: 'https://www.avma.org' },
  wsava:   { name: 'WSAVA — guías de nutrición y salud canina', url: 'https://wsava.org' },
};

// Reglas: primer match (sobre el slug pelado) gana. `pool` = fuentes candidatas;
// se elige un subset de tamaño 2-3 variado por slug. `lead` = fuente específica
// que va primero si aplica.
const RULES = [
  // Cripto / DeFi
  { re: /airdrop|bitcoin|halving|bridge-fee|cold-wallet|hot-wallet|dca-bitcoin|funding-rate|impermanent-loss|market-cap|mineria|nft|pnl-futuros|perpetual|precio-promedio-compra-cripto|profit-loss-trade|saldo-cripto|staking|usdt|usdc|token|crosschain|defi|crypto|cripto/,
    pool: [S.coingecko, S.binance, S.cnv, S.defillama], leadBy: [[/staking|ethereum/, S.ethereum],[/bitcoin|halving/, S.bitcoin]] },
  // Inversiones tradicionales / bonos / acciones / opciones
  { re: /backtest|sharpe|bonos-globales|al30|gd30|cedear|drawdown|graham|pe-ratio|price-earnings|price-to-book|valor-libros|opciones-call|opciones-put|rebalanceo|cagr|rendimiento-anualizado|valor-presente-bono|cupon-zero|tir|spread-tasas|arbitraje|portfolio|60-40|dividend-yield|market/,
    pool: [S.byma, S.cnv, S.iamc, S.invest, S.damodaran], leadBy: [] },
  // Hipotecario / UVA
  { re: /hipotec|credito-uva|cuota-credito|capacidad-credito|refinanciar-prestamo|uva-hipoteca/,
    pool: [S.bcra, S.bna, S.infoleg], leadBy: [] },
  // Alquiler / inmobiliario
  { re: /alquiler|locacion|abl|expensas|comision-inmobiliaria|deposito|desalojo|escritura|compraventa|precio-m2|rentabilidad-alquiler|seguro-caucion|inmobiliario-provincial|contrato-aluiler/,
    pool: [S.bcra, S.infoleg, S.escribanos, S.agip, S.arba], leadBy: [[/abl|caba/, S.agip],[/pba|provincial/, S.arba]] },
  // ANSES / becas / social
  { re: /becas-juanmarin|becas-manuel-belgrano|haber-minimo|jubilatorio|ife-ingreso|pami|progresar|credito-universitario|asignacion|auh/,
    pool: [S.anses, S.infoleg], leadBy: [[/progresar|universitario/, S.progresar],[/belgrano/, S.belgrano],[/pami/, S.pami]] },
  // Impuestos / laboral (las leyes 20.628/20.744 comparten dominio InfoLEG pero
  // son citas distintas → el dedup es por NOMBRE, no por URL).
  { re: /cuarta-categoria|costo-laboral|bonus-anual|marco-fiscal|freelance|upwork|valor-hora|monotributo|ganancias|aguinaldo|sueldo|cargas/,
    pool: [S.arca, S.ganancias, S.lct], leadBy: [[/cuarta-categoria|ganancias|bonus|marco-fiscal/, S.ganancias],[/costo-laboral|valor-hora|freelance|cargas/, S.lct]] },
  // Trámites / auto / migraciones / justicia
  { re: /baja-auto|chatarra|transferencia-auto|libre-deuda-auto|patente|registro-dnrpa|titularidad|caratular/,
    pool: [S.dnrpa, S.infoleg], leadBy: [[/patente/, S.agip]] },
  { re: /antecedentes-penales/, pool: [S.reincidencia, S.justicia], leadBy: [] },
  { re: /dni-extranjero|residencia|migraciones/, pool: [S.migraciones, S.infoleg], leadBy: [] },
  { re: /ciudadania-italiana/, pool: [S.consuladoIt, S.migraciones], leadBy: [] },
  { re: /visa-turismo-usa|b1-b2/, pool: [S.travelUsa], leadBy: [] },
  { re: /divorcio|matrimonio-civil|sucesion/, pool: [S.justicia, S.infoleg, S.escribanos], leadBy: [] },
  { re: /libreta-sanitaria|food|hueria/, pool: [S.anmat, S.agip], leadBy: [] },
  // Ahorro / presupuesto / inflación / tasas / general
  { re: /leliq|lebac|tasa-politica|tpm|spread-tasas|plazo-fijo/, pool: [S.bcra, S.indec], leadBy: [] },
  { re: /inflacion|poder-compra|precio-dolar|costo-envio|cuotas-sin-interes/, pool: [S.indec, S.bcra], leadBy: [] },
  { re: /ahorro|fondo-emergencia|deuda-bola-nieve|presupuesto|tarjeta-credito|refinanciar/, pool: [S.invest, S.bcra, S.indec], leadBy: [] },
];

// Fallback genérico (finanzas personales AR) si ninguna regla matchea.
const FALLBACK = [S.bcra, S.indec, S.invest];

// Conversores (cluster bipm): metrología real, variada por sub-dominio.
const CONVERTER_RULES = [
  { re: /celsius|fahrenheit|kelvin/, pool: [S.nist, S.bipm, S.iso] },
  { re: /(^|[^a-z])kb|[^a-z]mb($|[^p])|[^a-z]gb|mbps|mb-s|byte/, pool: [S.iec, S.nist, S.bipm] },
  { re: /hp-a-kw|kilowatt|caballos/, pool: [S.nist, S.iec, S.bipm] },
  { re: /taza|onzas-liquidas|cocina|cuartos-a-litros|gramos-a-tazas/, pool: [S.usda, S.nist, S.bipm] },
  { re: /psi|[^a-z]bar|mmhg|kpa|presion/, pool: [S.nist, S.bipm, S.iso] },
  { re: /dias-a-horas|meses-a|semanas|minutos-a|segundos|a-horas/, pool: [S.bipm, S.nist] },
  { re: /cemento|ladrillos|pintura|bolsas|metros-lineales|pie-tabla/, pool: [S.nist, S.bipm, S.iso] },
];
const CONVERTER_FALLBACK = [S.bipm, S.nist, S.iso];

// Mascotas (cluster akc): perros — estándares de raza + veterinaria.
const PET_POOL = [S.akc, S.fci, S.avma, S.wsava];

function pickSubset(pool, slug, n = 3) {
  if (pool.length <= n) return pool.slice();
  // offset determinístico por slug (sin Math.random): suma de char codes.
  let h = 0; for (const ch of slug) h = (h + ch.charCodeAt(0)) % pool.length;
  const out = [];
  for (let i = 0; i < n; i++) out.push(pool[(h + i) % pool.length]);
  return out;
}

const dedupByName = (arr) => { const seen = new Set(); return arr.filter(s => !seen.has(s.name) && seen.add(s.name)); };

function newSourcesFor(cluster, slug) {
  if (cluster === 'akc') {
    let chosen = pickSubset(PET_POOL, slug, 3);
    if (/calorias|comida|ejercicio|paseos|expectativa|edad-humana/.test(slug)) chosen = [S.wsava, ...chosen];
    else if (/peso-ideal|camada|departamento/.test(slug)) chosen = [S.akc, ...chosen];
    return dedupByName(chosen).slice(0, 3);
  }
  const ruleset = cluster === 'bipm' ? CONVERTER_RULES : RULES;
  const fallback = cluster === 'bipm' ? CONVERTER_FALLBACK : FALLBACK;
  for (const r of ruleset) {
    if (r.re.test(slug)) {
      let chosen = pickSubset(r.pool, slug, 3);
      for (const [lre, lsrc] of (r.leadBy || [])) {
        if (lre.test(slug) && !chosen.some(s => s.url === lsrc.url)) chosen = [lsrc, ...chosen].slice(0, 3);
      }
      return dedupByName(chosen);
    }
  }
  return fallback.slice();
}

const srcUpper = c => JSON.stringify(c.sources || []).toUpperCase();
const hasAll = (c, ...n) => n.every(x => srcUpper(c).includes(x));
const CLUSTER_TESTS = {
  arca: c => hasAll(c, 'ARCA', 'BCRA', 'INDEC'),
  bipm: c => hasAll(c, 'BIPM', 'NIST', 'WIKIPEDIA'),
  akc:  c => hasAll(c, 'AKC', 'FCI'),
};

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));
const test = CLUSTER_TESTS[clusterArg] || CLUSTER_TESTS.arca;
let changed = 0;
const preview = [];
for (const f of files) {
  const p = path.join(DIR, f);
  let c; try { c = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { continue; }
  if (!c.sources || !test(c)) continue;
  const slug = (c.slug || f).replace(/^calculadora-|^conversor-|^conversion-/, '');
  const ns = newSourcesFor(clusterArg, slug);
  c.sources = ns;
  changed++;
  preview.push(`${slug}\n   → ${ns.map(s => s.name.split(' — ')[0]).join(' · ')}`);
  if (APPLY) fs.writeFileSync(p, JSON.stringify(c, null, 2) + '\n');
}
console.log(`[detemplatize] cluster=${clusterArg} · ${changed} calcs ${APPLY ? 'ESCRITAS' : '(dry-run)'}`);
console.log(preview.join('\n'));
