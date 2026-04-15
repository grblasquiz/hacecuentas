/**
 * Dolar (daily) — dolarapi.com/v1/dolares
 *
 * La calc conversor-dolar-argentina fetchea las cotizaciones en runtime, pero
 * tiene un fallback hardcoded en src/lib/formulas/dolar-ar.ts por si el fetch
 * falla. Este updater refresca ese fallback con los valores del día.
 *
 * Así, si algún usuario entra offline o la API se cae, las cotizaciones que ve
 * son las más recientes que tuvimos (no las de hace 6 meses).
 */

import { join } from 'node:path';
import { replaceNumericKeyInObject } from '../patchers/ts-constant.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const DOLAR_TS = join(process.cwd(), 'src/lib/formulas/dolar-ar.ts');
const SLUG = 'conversor-dolar-argentina';
const SLUG_EURO = 'conversor-dolar-euro-pesos-argentinos';

const log = createLogger('dolar');

interface DolarApiItem {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export async function fetchDolar({ dry = false }: { dry?: boolean }): Promise<boolean> {
  log.info('fetching dolarapi.com/v1/dolares');
  const res = await fetch('https://dolarapi.com/v1/dolares');
  if (!res.ok) {
    log.error(`dolarapi respondió ${res.status}`);
    return false;
  }
  const data: DolarApiItem[] = await res.json();
  const map: Record<string, number> = {};
  for (const d of data) {
    map[d.casa] = d.venta;
  }

  // Las 6 casas que dolar-ar.ts espera en su fallback
  const needed = ['blue', 'bolsa', 'contadoconliqui', 'oficial', 'tarjeta', 'cripto'];
  const missing = needed.filter((k) => !map[k]);
  if (missing.length > 0) {
    log.warn(`faltan casas en la respuesta: ${missing.join(', ')}`);
  }

  let totalChanged = 0;
  const changes: string[] = [];
  for (const casa of needed) {
    const value = map[casa];
    if (value === undefined) continue;
    const intValue = Math.round(value);
    if (dry) {
      log.info(`would patch ${casa} → ${intValue}`);
      totalChanged++;
    } else {
      const { changed, oldValue } = replaceNumericKeyInObject(DOLAR_TS, casa, intValue);
      if (changed) {
        changes.push(`${casa}: ${oldValue} → ${intValue}`);
        totalChanged++;
      }
    }
  }

  if (totalChanged === 0) {
    log.skip('sin cambios (ya estaba al día)');
    return false;
  }

  log.success(`patch fallback dolar-ar.ts: ${changes.join(', ')}`);

  // Marcar ambas calcs (USD y USD/EUR) como actualizadas hoy
  if (!dry) {
    const today = new Date().toISOString().slice(0, 10);
    for (const slug of [SLUG, SLUG_EURO]) {
      if (touchLastUpdated(slug, today)) {
        log.info(`lastUpdated actualizado en ${slug}`);
      }
    }
  }

  return true;
}
