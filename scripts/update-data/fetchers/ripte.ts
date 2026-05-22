/**
 * RIPTE — Remuneración Imponible Promedio de los Trabajadores Estables.
 *
 * Serie oficial INDEC/Ministerio de Capital Humano vía API datos.gob.ar.
 * Publicada con ~3-5 meses de retraso. Usada para:
 *   - Comparar sueldo del usuario vs sueldo promedio AR (sueldo-vs-promedio-argentino)
 *   - Actualización jubilatoria por movilidad (jubilacion-haber-minimo-movilidad)
 *   - Ajustes por RIPTE en cálculos de prestaciones ANSES
 *
 * Persistimos serie histórica completa en `db/ripte.json` para gráficos y
 * snapshots offline. El patcher toca lastUpdated en las calcs conectadas.
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createLogger } from '../utils/logger.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';

const log = createLogger('ripte');
const DB_DIR = join(process.cwd(), 'db');
const SERIES_ID = '158.1_REPTE_0_0_5';
const API_URL = `https://apis.datos.gob.ar/series/api/series/?ids=${SERIES_ID}&format=json&limit=60&sort=desc`;

interface SeriePoint {
  fecha: string; // YYYY-MM-DD
  valor: number;
}

interface RipteFile {
  serieId: string;
  nombre: string;
  descripcion: string;
  unidad: string;
  fuente: string;
  fuenteUrl: string;
  ultimoValor: number | null;
  ultimaFecha: string | null;
  variacionInteranual: number | null; // % YoY del último mes vs mismo mes año pasado
  variacionMensual: number | null;    // % vs mes previo
  serie: SeriePoint[]; // últimos 60 meses, desc
  fetchedAt: string;
}

export async function fetchRipte({ dry = false }: { dry?: boolean } = {}): Promise<boolean> {
  log.info('Fetching RIPTE series from API datos.gob.ar...');
  let response: Response;
  try {
    response = await fetch(API_URL, {
      headers: { 'user-agent': 'hacecuentas-data-update/1.0' },
      signal: AbortSignal.timeout(15_000),
    });
  } catch (e: any) {
    log.error(`Fetch RIPTE falló: ${e.message}`);
    return false;
  }
  if (!response.ok) {
    log.error(`RIPTE API status ${response.status}`);
    return false;
  }
  const json: any = await response.json();
  const rows: Array<[string, number]> = json?.data || [];
  if (!rows.length) {
    log.warn('RIPTE: 0 rows from API, abort');
    return false;
  }

  // rows = [["YYYY-MM-DD", valor], ...] desc por fecha
  const serie: SeriePoint[] = rows
    .map(([fecha, valor]) => ({ fecha, valor: Number(valor) }))
    .filter((p) => Number.isFinite(p.valor));

  if (!serie.length) return false;

  const ultimo = serie[0];
  const previo = serie[1];
  const yoyMatch = serie.find((p) => {
    const d = new Date(p.fecha);
    const u = new Date(ultimo.fecha);
    return d.getFullYear() === u.getFullYear() - 1 && d.getMonth() === u.getMonth();
  });

  const variacionMensual = previo ? ((ultimo.valor - previo.valor) / previo.valor) * 100 : null;
  const variacionInteranual = yoyMatch ? ((ultimo.valor - yoyMatch.valor) / yoyMatch.valor) * 100 : null;

  const out: RipteFile = {
    serieId: SERIES_ID,
    nombre: 'ripte',
    descripcion: 'Remuneración imponible promedio de los trabajadores estables (RIPTE)',
    unidad: 'Pesos corrientes',
    fuente: 'Secretaría de Trabajo — Ministerio de Capital Humano (vía datos.gob.ar)',
    fuenteUrl: 'https://datos.gob.ar/dataset/sspm-remuneracion-imponible-promedio-trabajadores-estables-ripte',
    ultimoValor: ultimo.valor,
    ultimaFecha: ultimo.fecha,
    variacionInteranual: variacionInteranual !== null ? Number(variacionInteranual.toFixed(2)) : null,
    variacionMensual: variacionMensual !== null ? Number(variacionMensual.toFixed(2)) : null,
    serie,
    fetchedAt: new Date().toISOString(),
  };

  if (dry) {
    log.info(`DRY: ultimo=${ultimo.valor} (${ultimo.fecha}) YoY=${variacionInteranual?.toFixed(1)}% MoM=${variacionMensual?.toFixed(1)}%`);
    return true;
  }

  mkdirSync(DB_DIR, { recursive: true });
  const filePath = join(DB_DIR, 'ripte.json');
  writeFileSync(filePath, JSON.stringify(out, null, 2) + '\n', 'utf8');
  log.info(`Wrote db/ripte.json — último ${ultimo.fecha}: $${ultimo.valor.toLocaleString('es-AR')} (YoY ${variacionInteranual?.toFixed(1)}%)`);

  // Touch lastUpdated en slugs conectados
  const connected = [
    'sueldo-vs-promedio-argentino',
    'calculadora-jubilacion-haber-movilidad-trimestral',
    'calculadora-ripte-actualizacion-jubilatoria-sueldo',
  ];
  const today = new Date().toISOString().slice(0, 10);
  for (const slug of connected) {
    const ok = touchLastUpdated(slug, today);
    if (ok) log.info(`  ↳ touched lastUpdated en ${slug}`);
  }

  return true;
}
