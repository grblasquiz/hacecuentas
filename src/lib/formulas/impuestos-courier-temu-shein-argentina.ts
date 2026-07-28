import {
  COURIER_2026,
  IVA_IMPORTACION_2026,
  TASA_ESTADISTICA_2026,
  DERECHO_IMPORTACION_TIPICO_2026,
  fmtARS,
} from '../data/argentina-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

const fmtUSD = (v: number) =>
  'US$' + v.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/**
 * Impuestos de una compra en Temu/Shein/Amazon — régimen vigente desde el Decreto 604/2026
 * (BO 17-jul-2026), que unificó courier y puerta a puerta:
 *  - Franquicia de US$400 FOB por envío, 5 envíos por año calendario, en AMBOS regímenes.
 *  - La franquicia exime derecho de importación y tasa de estadística. **NO exime el IVA (21%)**,
 *    que se paga siempre (ARCA: "alcanzados únicamente por el IVA e impuestos internos").
 *  - Sobre el excedente de US$400 se pagan además derecho de importación (según posición
 *    arancelaria, 0–35%; usamos 20% como referencia editable) y tasa de estadística (3%).
 *  - Se derogó el arancel único del 50% que regía para los envíos postales.
 */
export function compute(i: Inputs): Outputs {
  const valor = Math.max(0, Number(i.valorUSD) || 0);
  const regimen = String(i.regimen || 'courier');
  const tc = Math.max(1, Number(i.cotizacionDolar) || 1500);

  const derechoPctRaw = Number(i.derechoImportacionPct);
  const derechoPct = Number.isFinite(derechoPctRaw) && derechoPctRaw >= 0
    ? derechoPctRaw / 100
    : DERECHO_IMPORTACION_TIPICO_2026;

  // Desde el Dto. 604/2026 los dos regímenes comparten franquicia y cantidad de envíos.
  const franquicia = COURIER_2026.franquiciaUSD;
  const enviosAnio = COURIER_2026.enviosPorAnio;
  const excedente = Math.max(0, valor - franquicia);
  const dentroFranquicia = excedente === 0;

  // Derecho de importación y tasa de estadística: solo sobre el excedente.
  const derechosUSD = excedente * derechoPct;
  const tasaEstadisticaUSD = excedente * TASA_ESTADISTICA_2026;
  // IVA: sobre el valor total + derechos + tasa (base imponible de importación).
  const ivaUSD = (valor + derechosUSD + tasaEstadisticaUSD) * IVA_IMPORTACION_2026;

  const impuestosUSD = derechosUSD + tasaEstadisticaUSD + ivaUSD;
  const totalUSD = valor + impuestosUSD;

  const superaTope = valor > COURIER_2026.topeEnvioUSD;
  const esCourier = regimen === 'courier';

  const out: Outputs = {
    impuestoAduana: fmtUSD(Math.round(impuestosUSD * 100) / 100),
    ivaImportacion: fmtUSD(Math.round(ivaUSD * 100) / 100),
    derechosYTasa: dentroFranquicia
      ? 'US$0 (exento por franquicia)'
      : `${fmtUSD(Math.round((derechosUSD + tasaEstadisticaUSD) * 100) / 100)} (derechos ${(derechoPct * 100).toFixed(0)}% + tasa 3% sobre el excedente)`,
    costoTotalUSD: fmtUSD(Math.round(totalUSD * 100) / 100),
    costoTotalPesos: fmtARS(totalUSD * tc),
    excedenteGravado: fmtUSD(Math.round(excedente * 100) / 100),
    franquiciaRegimen: `US$${franquicia} por envío (${enviosAnio} envíos/año) — ${esCourier ? 'courier' : 'puerta a puerta'}, unificados por el Dto. 604/2026`,
  };

  let title: string; let text: string; let tone: 'good' | 'neutral' | 'warn';
  if (superaTope) {
    title = 'Supera el tope del régimen simplificado';
    text = `Un envío de **${fmtUSD(valor)}** supera el tope de **US$3.000** por envío: pasa al régimen general de importación, con despachante y tributos plenos. Esta calculadora no aplica a ese caso.`;
    tone = 'warn';
  } else if (dentroFranquicia) {
    title = `Pagás ${fmtUSD(Math.round(ivaUSD * 100) / 100)} de IVA (no pagás derechos)`;
    text = `Un envío de **${fmtUSD(valor)}** entra dentro de la franquicia de **US$${franquicia}**: **exento de derecho de importación y tasa de estadística**. Pero la franquicia **no exime el IVA**: pagás el **21%**, o sea **${fmtUSD(Math.round(ivaUSD * 100) / 100)}** (${fmtARS(ivaUSD * tc)} al dólar cargado). Total estimado: **${fmtARS(totalUSD * tc)}**. Recordá el límite de **${enviosAnio} envíos por año**.`;
    tone = 'good';
  } else {
    title = `El excedente de US$${franquicia} paga derechos, tasa e IVA`;
    text = `Tu envío supera la franquicia en **${fmtUSD(excedente)}**. Sobre ese excedente pagás derecho de importación (acá estimado al **${(derechoPct * 100).toFixed(0)}%**, pero depende de la posición arancelaria del producto) y la tasa de estadística del **3%**. Además, el **IVA del 21% se paga sobre todo el envío**, esté o no dentro de la franquicia: **${fmtUSD(Math.round(ivaUSD * 100) / 100)}**. Impuestos totales: **${fmtUSD(Math.round(impuestosUSD * 100) / 100)}** (${fmtARS(impuestosUSD * tc)}). Si podés dividir la compra en envíos de hasta US$${franquicia}, cada uno se ahorra los derechos y la tasa (máximo ${enviosAnio} por año).`;
    tone = 'warn';
  }

  out._insight = { title, text, tone, icon: '📦' };
  return out;
}
