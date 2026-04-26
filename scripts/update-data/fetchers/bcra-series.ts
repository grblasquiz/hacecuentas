/**
 * BCRA series — persiste series históricas en `db/<nombre>.json`.
 *
 * A diferencia de `bcra.ts`, que parchea defaults de calcs específicas, este
 * fetcher **persiste la serie histórica completa** + último valor en archivos
 * `db/*.json` para uso por otras calcs / componentes futuros (graficos, APIs
 * internas, snapshots offline en Cloudflare KV, etc.).
 *
 * Cubre las 5 series core que pidieron las calcs ARS:
 *   - ICL (id 40)        — Índice de Contratos de Locación, diario
 *   - UVA (id 31)        — Unidad de Valor Adquisitivo, diario
 *   - CER (id 30)        — Coeficiente de Estabilización de Referencia, diario
 *   - TM20 (id 8)        — Tasa pasiva grandes depósitos bancos privados, diario
 *   - Plazo fijo 30d     — TNA depósitos 30 días promedio sistema (id 1207), diario
 *     (también conocido como "plazo fijo BCRA promedio mensual": agregamos el promedio
 *     mensual calculado de los últimos 12 meses para uso directo).
 *
 * Filosofía:
 *   - Fallback graceful: si la API se cae, dejamos el JSON existente intacto.
 *   - Rate-limit suave: 1 req cada ~1.2s entre series (5 series ⇒ ~7s total).
 *   - Mantenemos hasta 365 puntos de serie histórica diaria por archivo
 *     (suficiente para gráficos sin inflar el bundle / repo).
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createLogger } from '../utils/logger.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';

const log = createLogger('bcra-series');

const DB_DIR = join(process.cwd(), 'db');
const MAX_SERIES_POINTS = 365; // ~1 año de data diaria
const RATE_LIMIT_MS = 1200; // ~1 req / 1.2s para no estresar la API

interface BcraDetalle {
  fecha: string;
  valor: number;
}

interface SeriesFile {
  idVariable: number;
  nombre: string;
  descripcion: string;
  unidad: string;
  fuente: string;
  fuenteUrl: string;
  ultimoValor: number | null;
  ultimaFecha: string | null;
  promedio30dias: number | null;
  promedioMensualUltimos12: { mes: string; valor: number }[];
  serie: BcraDetalle[]; // ordenada desc por fecha (más reciente primero)
  fetchedAt: string;
}

interface SeriesConfig {
  idVariable: number;
  nombre: string; // file slug -> db/<nombre>.json
  descripcion: string;
  unidad: string;
  // Calcs que dependen de esta serie y deben tener `lastUpdated` refrescado
  // cuando la serie se actualiza con éxito.
  refreshSlugs?: string[];
}

const SERIES: SeriesConfig[] = [
  {
    idVariable: 40,
    nombre: 'icl',
    descripcion: 'Índice para Contratos de Locación (BCRA, base 30/06/2020 = 1)',
    unidad: 'índice',
    refreshSlugs: ['calculadora-actualizacion-alquiler-icl'],
  },
  {
    idVariable: 31,
    nombre: 'uva',
    descripcion: 'Unidad de Valor Adquisitivo (BCRA, base 31/03/2016 = 14.05 ARS)',
    unidad: 'ARS',
    refreshSlugs: ['calculadora-credito-uva-vs-tasa-fija'],
  },
  {
    idVariable: 30,
    nombre: 'cer',
    descripcion: 'Coeficiente de Estabilización de Referencia (BCRA, base 02/02/2002 = 1)',
    unidad: 'índice',
  },
  {
    idVariable: 8,
    nombre: 'tm20',
    descripcion: 'Tasa TM20 — depósitos a plazo ≥ $20M en bancos privados (TNA %)',
    unidad: 'TNA %',
  },
  {
    idVariable: 1207,
    nombre: 'plazo-fijo-bcra-30d',
    descripcion: 'TNA plazo fijo 30 días promedio sistema (BCRA, depósitos pesos)',
    unidad: 'TNA %',
    refreshSlugs: ['calculadora-plazo-fijo'],
  },
];

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

async function fetchSerie(idVariable: number, days = 400): Promise<BcraDetalle[] | null> {
  const today = new Date();
  const desde = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const url = `https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias/${idVariable}?desde=${fmt(desde)}&hasta=${fmt(today)}&limit=1000`;
  try {
    const res = await fetch(url, {
      // BCRA exige TLS 1.2+; en Node 22 fetch lo maneja por default
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      log.error(`BCRA var ${idVariable} respondió ${res.status}`);
      return null;
    }
    const data = await res.json();
    const detalle = data?.results?.[0]?.detalle;
    if (!Array.isArray(detalle) || detalle.length === 0) {
      log.warn(`BCRA var ${idVariable}: respuesta sin detalle`);
      return null;
    }
    // Asegurar orden desc (más reciente primero) para consumo cómodo del front
    return [...detalle].sort((a, b) => b.fecha.localeCompare(a.fecha));
  } catch (err) {
    log.error(`BCRA var ${idVariable}: ${(err as Error).message}`);
    return null;
  }
}

function computePromedio30dias(serie: BcraDetalle[]): number | null {
  const last30 = serie.slice(0, 30);
  if (last30.length === 0) return null;
  const sum = last30.reduce((acc, p) => acc + p.valor, 0);
  return Math.round((sum / last30.length) * 10000) / 10000;
}

function computePromedioMensual12(serie: BcraDetalle[]): { mes: string; valor: number }[] {
  // Agrupar por YYYY-MM y promediar
  const groups = new Map<string, number[]>();
  for (const p of serie) {
    const mes = p.fecha.slice(0, 7); // YYYY-MM
    const arr = groups.get(mes) ?? [];
    arr.push(p.valor);
    groups.set(mes, arr);
  }
  const out: { mes: string; valor: number }[] = [];
  for (const [mes, vals] of groups) {
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    out.push({ mes, valor: Math.round(avg * 10000) / 10000 });
  }
  // Ordenar desc, tomar últimos 12 meses
  return out.sort((a, b) => b.mes.localeCompare(a.mes)).slice(0, 12);
}

function loadExisting(file: string): SeriesFile | null {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

async function updateOne(cfg: SeriesConfig, dry: boolean): Promise<boolean> {
  const file = join(DB_DIR, `${cfg.nombre}.json`);
  log.info(`fetching BCRA ${cfg.idVariable} (${cfg.nombre})`);

  const detalle = await fetchSerie(cfg.idVariable);
  if (!detalle) {
    // Fallback graceful: dejamos el JSON existente intacto si lo hay
    log.warn(`${cfg.nombre}: API falló, se mantiene db/${cfg.nombre}.json existente`);
    return false;
  }

  const trimmed = detalle.slice(0, MAX_SERIES_POINTS);
  const ultimo = trimmed[0];
  const newFile: SeriesFile = {
    idVariable: cfg.idVariable,
    nombre: cfg.nombre,
    descripcion: cfg.descripcion,
    unidad: cfg.unidad,
    fuente: 'BCRA — api.bcra.gob.ar/estadisticas/v4.0/Monetarias',
    fuenteUrl: `https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias/${cfg.idVariable}`,
    ultimoValor: ultimo?.valor ?? null,
    ultimaFecha: ultimo?.fecha ?? null,
    promedio30dias: computePromedio30dias(trimmed),
    promedioMensualUltimos12: computePromedioMensual12(trimmed),
    serie: trimmed,
    fetchedAt: new Date().toISOString(),
  };

  // Detectar cambio real (último valor o última fecha distintos)
  const prev = loadExisting(file);
  const sameValue =
    prev && prev.ultimoValor === newFile.ultimoValor && prev.ultimaFecha === newFile.ultimaFecha;

  if (sameValue) {
    log.skip(`${cfg.nombre}: sin cambios (último: ${ultimo.fecha} = ${ultimo.valor})`);
    // Igual reescribimos `fetchedAt` y serie por si el rango cambió, salvo dry
    if (!dry) writeFileSync(file, JSON.stringify(newFile, null, 2) + '\n');
    return false;
  }

  if (dry) {
    log.info(`would write db/${cfg.nombre}.json (último: ${ultimo.fecha} = ${ultimo.valor})`);
    return true;
  }

  mkdirSync(DB_DIR, { recursive: true });
  writeFileSync(file, JSON.stringify(newFile, null, 2) + '\n');
  log.success(`db/${cfg.nombre}.json (${trimmed.length} puntos · último ${ultimo.fecha} = ${ultimo.valor})`);

  // Refrescar lastUpdated de calcs que dependen de esta serie
  if (cfg.refreshSlugs) {
    const today = new Date().toISOString().slice(0, 10);
    for (const slug of cfg.refreshSlugs) {
      try {
        if (touchLastUpdated(slug, today)) {
          log.info(`lastUpdated → ${today} en ${slug}`);
        }
      } catch (err) {
        log.warn(`no se pudo tocar lastUpdated en ${slug}: ${(err as Error).message}`);
      }
    }
  }

  return true;
}

export async function fetchBcraSeries({ dry = false }: { dry?: boolean }): Promise<boolean> {
  let anyChanged = false;
  for (let i = 0; i < SERIES.length; i++) {
    const cfg = SERIES[i]!;
    try {
      const changed = await updateOne(cfg, dry);
      if (changed) anyChanged = true;
    } catch (err) {
      log.error(`${cfg.nombre}: ${(err as Error).message}`);
      // No abortar: seguir con las demás series
    }
    // Rate limit entre requests (no en la última)
    if (i < SERIES.length - 1) await sleep(RATE_LIMIT_MS);
  }
  if (!anyChanged) log.skip('sin cambios en ninguna serie');
  return anyChanged;
}
