/**
 * Serie de inflación mensual INDEC (Argentina) — lectura desde el pipeline de datos.
 *
 * La fuente única es `src/data/live/inflacion.json`, que el cron de datos
 * refresca desde INDEC (vía ArgentinaDatos). Acá la normalizamos a un formato
 * cómodo (clave "YYYY-MM" + valor mensual %) y exponemos un helper para calcular
 * la inflación ACUMULADA desde un mes dado hasta el último dato disponible.
 *
 * Se usa en la calc de sueldo AR (modo "comparar con mi sueldo anterior") para
 * decir cuánto perdió/ganó el poder adquisitivo un sueldo frente a la inflación.
 *
 * IMPORTANTE: la serie viva es una ventana móvil de ~12 meses. Para meses más
 * viejos que el inicio de la serie no hay dato mensual: `inflacionAcumuladaDesde`
 * devuelve `exacto: false` y estima el tramo faltante con el promedio geométrico
 * mensual de la serie conocida. El copy de la calc lo aclara honestamente.
 */

import inflacionData from '../../data/live/inflacion.json';

export interface MesInflacion {
  /** Clave del mes en formato "YYYY-MM" (ej. "2026-05"). */
  key: string;
  /** Variación mensual del IPC de ese mes, en % (ej. 2.1). */
  valor: number;
}

interface RawMes {
  fecha: string;
  valor: number;
}

/** Serie mensual normalizada, ordenada ascendente por mes. */
export const INFLACION_SERIE_MENSUAL: MesInflacion[] = (
  ((inflacionData as any).last_12_months as RawMes[]) || []
)
  .map((m) => ({ key: String(m.fecha).slice(0, 7), valor: Number(m.valor) }))
  .filter((m) => m.key.length === 7 && Number.isFinite(m.valor))
  .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

/** Inflación interanual acumulada (últimos 12 meses), en %. */
export const INFLACION_INTERANUAL_PCT = Number((inflacionData as any).acumulado_12m_pct) || 0;

/** Mes más antiguo con dato mensual exacto (clave "YYYY-MM") o null si no hay serie. */
export const INFLACION_SERIE_DESDE: string | null =
  INFLACION_SERIE_MENSUAL.length ? INFLACION_SERIE_MENSUAL[0].key : null;

/** Último mes con dato mensual (clave "YYYY-MM") o null si no hay serie. */
export const INFLACION_SERIE_HASTA: string | null =
  INFLACION_SERIE_MENSUAL.length
    ? INFLACION_SERIE_MENSUAL[INFLACION_SERIE_MENSUAL.length - 1].key
    : null;

/** Fecha (ISO) a la que corresponde el último dato — para sello de frescura/copy. */
export const INFLACION_AS_OF: string =
  String((inflacionData as any).last_month?.fecha || INFLACION_SERIE_HASTA || '');

/** Cantidad de meses de distancia entre dos claves "YYYY-MM" (b - a). */
function mesesEntre(a: string, b: string): number {
  const [ay, am] = a.split('-').map(Number);
  const [by, bm] = b.split('-').map(Number);
  return (by - ay) * 12 + (bm - am);
}

export interface InflacionAcumuladaResult {
  /** Inflación acumulada desde el fin de `desdeKey` hasta el último dato, en %. */
  pct: number;
  /** true si todo el tramo tiene dato mensual real (sin estimación). */
  exacto: boolean;
  /** Cantidad de meses del período considerado. */
  meses: number;
  /** Último mes con dato usado (clave "YYYY-MM"). */
  hasta: string | null;
}

/**
 * Inflación acumulada desde el FIN del mes `desdeKey` ("YYYY-MM") hasta el último
 * dato mensual disponible. Compone los IPC mensuales POSTERIORES al mes elegido
 * (la inflación que corrió después de que cobraste ese sueldo).
 *
 * - `exacto: true`  → todo el período está cubierto por la serie mensual.
 * - `exacto: false` → `desdeKey` es anterior al inicio de la serie: se estima el
 *   tramo faltante con el promedio geométrico mensual de la serie conocida.
 */
export function inflacionAcumuladaDesde(desdeKey: string): InflacionAcumuladaResult {
  const hasta = INFLACION_SERIE_HASTA;
  if (!hasta || !INFLACION_SERIE_MENSUAL.length || !/^\d{4}-\d{2}$/.test(desdeKey)) {
    return { pct: 0, exacto: false, meses: 0, hasta };
  }

  // Meses de la serie estrictamente posteriores al mes elegido.
  const posteriores = INFLACION_SERIE_MENSUAL.filter((m) => m.key > desdeKey);
  const prodConocido = posteriores.reduce((p, m) => p * (1 + m.valor / 100), 1);

  // El período es exacto si no falta ningún mes entre `desdeKey` (excluido) y el
  // fin de la serie. Eso ocurre cuando `desdeKey` es >= (inicio de la serie − 1 mes):
  // en ese caso todos los meses del tramo están en la serie.
  const inicio = INFLACION_SERIE_DESDE!; // p.ej. "2025-06"
  const mesPrevioAlInicio = mesesEntre(inicio, desdeKey) >= -1; // desdeKey >= inicio-1mes
  const mesesPeriodo = Math.max(0, mesesEntre(desdeKey, hasta));

  if (mesPrevioAlInicio) {
    return {
      pct: (prodConocido - 1) * 100,
      exacto: true,
      meses: posteriores.length,
      hasta,
    };
  }

  // Tramo faltante (meses entre desdeKey y el inicio de la serie): estimarlo con
  // el promedio geométrico mensual de la serie conocida.
  const serieLen = INFLACION_SERIE_MENSUAL.length;
  const prodSerieCompleta = INFLACION_SERIE_MENSUAL.reduce((p, m) => p * (1 + m.valor / 100), 1);
  const gMensual = Math.pow(prodSerieCompleta, 1 / serieLen); // factor promedio mensual
  const mesesFaltantes = mesesPeriodo - serieLen;
  const factorFaltante = Math.pow(gMensual, Math.max(0, mesesFaltantes));
  const factorTotal = prodSerieCompleta * factorFaltante;

  return {
    pct: (factorTotal - 1) * 100,
    exacto: false,
    meses: mesesPeriodo,
    hasta,
  };
}
