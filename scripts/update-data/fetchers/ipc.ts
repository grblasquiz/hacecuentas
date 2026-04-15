/**
 * IPC (monthly) — api.argentinadatos.com/v1/finanzas/indices/inflacion
 *
 * La serie devuelve inflación mensual histórica desde 1943. Usamos el último
 * valor para refrescar el default del field `inflacionAcumulada` de la calc
 * actualizacion-inflacion-ipc y marcar la calc como fresca.
 *
 * argentinadatos.com es un servicio comunitario gratis, sin auth. Si se cae,
 * el fetcher falla silencioso (no tumba el workflow) y retry al siguiente cron.
 */

import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('ipc');

interface InflacionItem {
  fecha: string;
  valor: number;
}

export async function fetchIpc({ dry = false }: { dry?: boolean }): Promise<boolean> {
  log.info('fetching argentinadatos.com/v1/finanzas/indices/inflacion');
  const res = await fetch('https://api.argentinadatos.com/v1/finanzas/indices/inflacion');
  if (!res.ok) {
    log.error(`argentinadatos respondió ${res.status}`);
    return false;
  }
  const data: InflacionItem[] = await res.json();
  if (!data.length) {
    log.error('respuesta vacía');
    return false;
  }
  // Tomamos último (más reciente)
  const latest = data[data.length - 1];
  log.info(`IPC ${latest.fecha}: ${latest.valor}% mensual`);

  // Calcular inflación últimos 12 meses para el default de la calc
  const last12 = data.slice(-12);
  const acumulado12m = last12.reduce((acc, m) => acc * (1 + m.valor / 100), 1) * 100 - 100;
  log.info(`IPC acumulado 12m: ${acumulado12m.toFixed(1)}%`);

  const today = new Date().toISOString().slice(0, 10);
  if (!dry && touchLastUpdated('calculadora-actualizacion-inflacion-ipc', today)) {
    log.success(`inflacion-ipc lastUpdated → ${today} (IPC 12m: ${acumulado12m.toFixed(1)}%)`);
    return true;
  } else if (dry) {
    log.info(`would touch inflacion-ipc lastUpdated (12m acum: ${acumulado12m.toFixed(1)}%)`);
    return true;
  }
  log.skip('sin cambios');
  return false;
}
