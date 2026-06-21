/**
 * Calculadora de brecha del dólar: BCV vs paralelo (Venezuela).
 *
 * Muestra la brecha porcentual entre el dólar paralelo y el oficial del BCV, y
 * traduce esa brecha a bolívares concretos: "cuánto cambia tu plata según en
 * cuál de las dos tasas la conviertas/cobres".
 *
 *   brecha%   = paralelo / bcv − 1
 *   diferencia (Bs) por monto = USD × (paralelo − bcv)
 *
 * Datos: tasas desde src/lib/data/venezuela-2026.ts (NO hardcode).
 *   Fuentes: BCV, Monitor Dólar Venezuela.
 */
import { VENEZUELA_2026, usdToVes, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  monto?: number;     // USD a evaluar
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const fmtUSD = (n: number): string =>
  '$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

const fmtPct = (n: number): string =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(n) + ' %';

export function calculadoraBrechaDolarBcvParalelo(i: Inputs): Outputs {
  const fx = VENEZUELA_2026.fx;
  const monto = Math.max(0, Number(i.monto) || 0);

  const brecha = fx.paralelo / fx.bcv - 1; // fracción
  const brechaPct = brecha * 100;
  const difPorDolar = fx.paralelo - fx.bcv; // Bs. por cada USD

  const enBcv = usdToVes(monto, 'bcv');
  const enParalelo = usdToVes(monto, 'paralelo');
  const diferencia = enParalelo - enBcv; // Bs. de más si cobrás al paralelo

  const narrativa = monto > 0
    ? `Por ${fmtUSD(monto)}: a la tasa BCV recibís ${fmtVES(enBcv)}, pero al paralelo recibís ${fmtVES(enParalelo)}. ` +
      `La diferencia es de ${fmtVES(diferencia)} — eso es lo que ganás o perdés según en cuál tasa te paguen. ` +
      `La brecha entre ambas es del ${fmtPct(brechaPct)}.`
    : `Hoy la brecha entre el dólar paralelo y el oficial del BCV es del ${fmtPct(brechaPct)}: ` +
      `el paralelo (${fmtVES(fx.paralelo)}) está ${fmtVES(difPorDolar)} por encima del BCV (${fmtVES(fx.bcv)}) por cada dólar. ` +
      `Ingresá un monto para ver cuántos bolívares cambia tu plata según en cuál tasa la conviertas.`;

  return {
    brecha: brechaPct,
    diferenciaPorDolar: difPorDolar,
    enBcv,
    enParalelo,
    diferencia,
    detalle: monto > 0
      ? `Diferencia para ${fmtUSD(monto)}: ${fmtVES(diferencia)} (BCV ${fmtVES(enBcv)} vs paralelo ${fmtVES(enParalelo)})`
      : `Brecha actual: ${fmtPct(brechaPct)}`,
    _insight: {
      type: 'highlight',
      icon: '⚖️',
      text: narrativa,
    },
    _table: {
      title: 'Brecha del dólar en Venezuela: BCV vs paralelo',
      headers: ['Concepto', 'Valor'],
      rows: [
        ['Dólar oficial (BCV)', `${fmtVES(fx.bcv)} (${fx.fechaBcv})`],
        ['Dólar paralelo (Monitor Dólar)', `${fmtVES(fx.paralelo)} (${fx.fechaParalelo})`],
        ['Diferencia por dólar', fmtVES(difPorDolar)],
        ['Brecha porcentual', fmtPct(brechaPct)],
        ...(monto > 0
          ? [
              [`Si cobrás ${fmtUSD(monto)} al BCV`, fmtVES(enBcv)],
              [`Si cobrás ${fmtUSD(monto)} al paralelo`, fmtVES(enParalelo)],
              ['Diferencia total', fmtVES(diferencia)],
            ]
          : []),
      ],
      note: 'La brecha = dólar paralelo ÷ dólar BCV − 1. Cobrar/convertir al paralelo da más bolívares por dólar; pagar impuestos o servicios tasados al BCV te conviene cuando la brecha es alta. Ambas tasas cambian a diario.',
    },
  };
}
