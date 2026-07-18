import { COURIER_2026, PUERTA_A_PUERTA_2026, fmtARS } from '../data/argentina-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

const fmtUSD = (v: number) =>
  'US$' + v.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/**
 * Impuestos de una compra en Temu/Shein/Amazon según régimen (jul-2026, pre-reforma):
 * - Courier: FOB hasta US$400 exento de derecho de importación y tasa de estadística (5 envíos/año, tope US$3.000).
 *   Sobre el excedente de US$400 se pagan derechos según la posición arancelaria del producto (no se estima acá).
 * - Puerta a puerta (Correo Argentino): franquicia US$50 en los primeros 12 envíos; 50% sobre el excedente.
 */
export function compute(i: Inputs): Outputs {
  const valor = Math.max(0, Number(i.valorUSD) || 0);
  const regimen = String(i.regimen || 'courier');
  const tc = Math.max(1, Number(i.cotizacionDolar) || 1500);

  // Puerta a puerta (siempre se calcula para comparar)
  const excPap = Math.max(0, valor - PUERTA_A_PUERTA_2026.franquiciaUSD);
  const impPapUSD = excPap * PUERTA_A_PUERTA_2026.alicuotaExcedente;

  // Courier
  const excCourier = Math.max(0, valor - COURIER_2026.franquiciaUSD);
  const courierExento = excCourier === 0;

  const esCourier = regimen === 'courier';
  const superaTope = valor > COURIER_2026.topeEnvioUSD;

  let impuestoTxt: string;
  let totalUSD: number | null;
  if (esCourier) {
    impuestoTxt = courierExento ? 'US$0 (dentro de la franquicia de US$400)' : `derechos s/ ${fmtUSD(excCourier)} según producto`;
    totalUSD = courierExento ? valor : null;
  } else {
    impuestoTxt = impPapUSD > 0 ? fmtUSD(impPapUSD) : 'US$0 (dentro de la franquicia de US$50)';
    totalUSD = valor + impPapUSD;
  }

  const out: Outputs = {
    impuestoAduana: impuestoTxt,
    costoTotalUSD: totalUSD === null ? 'depende del arancel del producto' : fmtUSD(totalUSD),
    costoTotalPesos: totalUSD === null ? `mínimo ${fmtARS(valor * tc)} + derechos` : fmtARS(totalUSD * tc),
    excedenteGravado: esCourier
      ? (courierExento ? 'US$0' : fmtUSD(excCourier))
      : (excPap > 0 ? fmtUSD(excPap) : 'US$0'),
    franquiciaRegimen: esCourier
      ? `US$400 por envío (${COURIER_2026.enviosPorAnio} envíos/año)`
      : `US$50 por envío (primeros ${PUERTA_A_PUERTA_2026.enviosConFranquicia} envíos/año)`,
  };

  let title: string; let text: string; let tone: 'good' | 'neutral' | 'warn';
  if (superaTope) {
    title = 'Supera el tope del régimen simplificado';
    text = `Un envío de **${fmtUSD(valor)}** supera el tope de **US$3.000** por envío: pasa al régimen general de importación, con despachante y tributos plenos. Esta calculadora no aplica a ese caso.`;
    tone = 'warn';
  } else if (esCourier && courierExento) {
    title = 'No pagás tributos aduaneros por este envío';
    text = `Por courier, un envío de **${fmtUSD(valor)}** entra dentro de la franquicia de **US$400**: exento de derecho de importación y tasa de estadística. Por puerta a puerta el mismo envío pagaría **${fmtUSD(impPapUSD)}** (50% sobre lo que excede US$50). Recordá el límite de **5 envíos por año** con este beneficio.`;
    tone = 'good';
  } else if (esCourier) {
    title = `El excedente de US$400 paga derechos`;
    text = `Tu envío supera la franquicia courier en **${fmtUSD(excCourier)}**. Ese excedente paga derecho de importación según la posición arancelaria del producto (varía por tipo de mercadería), más IVA e impuestos internos si aplican. Si podés dividir la compra en envíos de hasta US$400, cada uno entra exento (máximo 5 por año).`;
    tone = 'warn';
  } else {
    title = impPapUSD > 0 ? `Pagás ${fmtUSD(impPapUSD)} de tributo aduanero` : 'Envío exento por franquicia';
    text = impPapUSD > 0
      ? `Por puerta a puerta pagás el **50%** de lo que excede US$50: **${fmtUSD(impPapUSD)}** (${fmtARS(impPapUSD * tc)} al dólar cargado). El mismo envío por courier ${valor <= 400 ? 'entraría **exento** (franquicia US$400)' : 'también supera su franquicia de US$400'}.`
      : `Un envío de **${fmtUSD(valor)}** entra dentro de la franquicia de **US$50** de Correo Argentino, válida para los primeros 12 envíos del año.`;
    tone = impPapUSD > 0 ? 'neutral' : 'good';
  }

  out._insight = { title, text, tone, icon: '📦' };
  return out;
}
