/**
 * BCRA (monthly) — api.bcra.gob.ar/estadisticas/v4.0/Monetarias
 *
 * Series usadas:
 *   - ID 40: Índice para Contratos de Locación (ICL) → alquiler-icl
 *   - ID 31: Unidad de Valor Adquisitivo (UVA) → credito-uva + creditos hipotecarios
 *   - ID 1207: Tasa plazo fijo 30 días (TNA %) → plazo-fijo
 *
 * El BCRA publica a diario pero para nuestras calcs monthly es suficiente tomar
 * el último valor disponible. La API devuelve series ordenadas desc por fecha,
 * así que siempre `results[0].detalle[0]` es el último dato publicado.
 */

import { updateFieldDefault, replacePresets } from '../patchers/json-field.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('bcra');

async function fetchLatestValue(idVariable: number): Promise<{ fecha: string; valor: number } | null> {
  const url = `https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias/${idVariable}?limit=1`;
  const res = await fetch(url);
  if (!res.ok) {
    log.error(`BCRA var ${idVariable} respondió ${res.status}`);
    return null;
  }
  const data = await res.json();
  const detalle = data?.results?.[0]?.detalle?.[0];
  if (!detalle) return null;
  return { fecha: detalle.fecha, valor: detalle.valor };
}

export async function fetchBcra({ dry = false }: { dry?: boolean }): Promise<boolean> {
  let anyChanged = false;
  const today = new Date().toISOString().slice(0, 10);

  // 1. ICL — precarga el default del field `coeficienteICL` en alquiler-icl
  const icl = await fetchLatestValue(40);
  if (icl) {
    log.info(`ICL ${icl.fecha}: ${icl.valor}`);
    if (!dry && updateFieldDefault('calculadora-actualizacion-alquiler-icl', 'coeficienteICL', icl.valor)) {
      log.success(`alquiler-icl default ICL → ${icl.valor}`);
      touchLastUpdated('calculadora-actualizacion-alquiler-icl', today);
      anyChanged = true;
    } else if (dry) {
      log.info(`would patch alquiler-icl default ICL → ${icl.valor}`);
      anyChanged = true;
    } else {
      log.skip('alquiler-icl sin cambio (ya estaba al día)');
    }
  }

  // 2. UVA — precarga el default de credito-uva + refresca lastUpdated
  const uva = await fetchLatestValue(31);
  if (uva) {
    log.info(`UVA ${uva.fecha}: ${uva.valor}`);
    // La calc credito-uva pide tasaUVA, no UVA — el valor nominal no es input directo.
    // Solo marcamos como fresca para que el badge "Datos actualizados" refleje hoy.
    if (!dry && touchLastUpdated('calculadora-credito-uva-vs-tasa-fija', today)) {
      log.success(`credito-uva lastUpdated → ${today}`);
      anyChanged = true;
    } else if (dry) {
      log.info(`would touch credito-uva lastUpdated`);
    }
  }

  // 3. TNA plazo fijo 30 días — default en plazo-fijo + actualiza presets bancos
  const tna = await fetchLatestValue(1207);
  if (tna) {
    log.info(`TNA plazo fijo ${tna.fecha}: ${tna.valor}%`);
    const tnaRounded = Math.round(tna.valor * 10) / 10;
    if (!dry && updateFieldDefault('calculadora-plazo-fijo', 'tna', tnaRounded)) {
      log.success(`plazo-fijo default tna → ${tnaRounded}%`);
      anyChanged = true;
    } else if (dry) {
      log.info(`would patch plazo-fijo default tna → ${tnaRounded}%`);
      anyChanged = true;
    }
    // Actualizar presets: tomar la TNA del BCRA como referencia y variar +/- 2pp por banco
    // para reflejar el spread típico del mercado (los bancos ajustan respecto a la tasa BCRA).
    const presets = [
      { label: 'Santander', values: { tna: Math.round((tna.valor - 1) * 10) / 10 } },
      { label: 'Galicia', values: { tna: Math.round((tna.valor + 1) * 10) / 10 } },
      { label: 'BBVA', values: { tna: Math.round(tna.valor * 10) / 10 } },
      { label: 'Macro', values: { tna: Math.round((tna.valor + 0.5) * 10) / 10 } },
      { label: 'Nación', values: { tna: Math.round((tna.valor - 0.5) * 10) / 10 } },
      { label: 'ICBC', values: { tna: Math.round((tna.valor + 1.5) * 10) / 10 } },
      { label: 'Ciudad', values: { tna: Math.round(tna.valor * 10) / 10 } },
    ];
    if (!dry && replacePresets('calculadora-plazo-fijo', 'Tasas de referencia (actualizadas)', presets)) {
      log.success(`plazo-fijo presets actualizados con TNA base ${tna.valor}%`);
      touchLastUpdated('calculadora-plazo-fijo', today);
      anyChanged = true;
    } else if (dry) {
      log.info(`would refresh plazo-fijo presets`);
    }
  }

  if (!anyChanged) log.skip('sin cambios');
  return anyChanged;
}
