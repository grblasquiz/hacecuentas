/**
 * Dólar BCV y dólar paralelo HOY en bolívares (Venezuela) — página-ancla cambiaria.
 *
 * Muestra las DOS tasas de referencia (oficial del BCV y mercado paralelo /
 * Monitor Dólar), la brecha entre ambas y un convertidor bidireccional
 * (USD↔Bs.) a la tasa elegida.
 *
 * Datos: NO se hardcodean tasas — se leen de src/lib/data/venezuela-2026.ts
 *   (VENEZUELA_2026.fx.bcv / .paralelo, helpers usdToVes / vesToUsd).
 *   Fuentes: BCV (https://www.bcv.org.ve), Monitor Dólar Venezuela.
 *
 * Brecha = paralelo / bcv − 1.
 */
import { VENEZUELA_2026, usdToVes, vesToUsd, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  monto?: number;          // monto a convertir
  direccion?: string;      // 'usd-ves' (USD→Bs) | 'ves-usd' (Bs→USD)
  tasa?: string;           // 'bcv' | 'paralelo'
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

export function dolarBcvParaleloBolivaresHoy(i: Inputs): Outputs {
  const fx = VENEZUELA_2026.fx;
  const monto = Math.max(0, Number(i.monto) || 0);

  const direccionRaw = String(i.direccion || 'usd-ves');
  const direccion = direccionRaw === 'ves-usd' ? 'ves-usd' : 'usd-ves';

  const tasaRaw = String(i.tasa || 'paralelo');
  const tasa: 'bcv' | 'paralelo' = tasaRaw === 'bcv' ? 'bcv' : 'paralelo';

  const valorTasa = fx[tasa];
  const brecha = fx.paralelo / fx.bcv - 1; // fracción (ej. 0,319)
  const brechaPct = brecha * 100;
  const difBs = fx.paralelo - fx.bcv; // Bs. de diferencia por cada USD

  // Conversión según dirección y tasa elegida.
  let resultadoNum: number;
  let resultadoStr: string;
  let entradaStr: string;
  if (direccion === 'usd-ves') {
    resultadoNum = usdToVes(monto, tasa);
    resultadoStr = fmtVES(resultadoNum);
    entradaStr = fmtUSD(monto);
  } else {
    resultadoNum = vesToUsd(monto, tasa);
    resultadoStr = fmtUSD(resultadoNum);
    entradaStr = fmtVES(monto);
  }

  const nombreTasa = tasa === 'bcv' ? 'oficial (BCV)' : 'paralelo (Monitor Dólar)';

  // Narrativa hook.
  let narrativa: string;
  if (monto > 0) {
    if (direccion === 'usd-ves') {
      const alOtra = usdToVes(monto, tasa === 'bcv' ? 'paralelo' : 'bcv');
      const difConv = Math.abs(alOtra - resultadoNum);
      narrativa = `${entradaStr} equivalen a ${resultadoStr} a la tasa ${nombreTasa}. ` +
        `Si los cambiás a la otra tasa, la diferencia es de ${fmtVES(difConv)}. ` +
        `Hoy la brecha entre el dólar paralelo y el BCV es de ${fmtPct(brechaPct)}.`;
    } else {
      const alOtra = vesToUsd(monto, tasa === 'bcv' ? 'paralelo' : 'bcv');
      const difConv = Math.abs(alOtra - resultadoNum);
      narrativa = `${entradaStr} equivalen a ${resultadoStr} a la tasa ${nombreTasa}. ` +
        `A la otra tasa la diferencia sería de ${fmtUSD(difConv)}. ` +
        `La brecha actual entre paralelo y BCV es de ${fmtPct(brechaPct)}.`;
    }
  } else {
    narrativa = `Hoy el dólar BCV está en ${fmtVES(fx.bcv)} y el dólar paralelo en ${fmtVES(fx.paralelo)} por dólar. ` +
      `La brecha entre ambos es de ${fmtPct(brechaPct)} (${fmtVES(difBs)} de diferencia por cada dólar).`;
  }

  return {
    // Output principal (titular): las dos tasas resumidas.
    resumenTasas: `BCV ${fmtVES(fx.bcv)} · Paralelo ${fmtVES(fx.paralelo)}`,
    dolarBcv: fx.bcv,
    dolarParalelo: fx.paralelo,
    brecha: brechaPct,
    diferenciaBs: difBs,
    resultadoConversion: resultadoNum,
    detalleConversion: monto > 0
      ? `${entradaStr} = ${resultadoStr} (tasa ${nombreTasa})`
      : 'Ingresá un monto para convertir',
    fechaBcv: fx.fechaBcv,
    fechaParalelo: fx.fechaParalelo,
    _insight: {
      type: 'highlight',
      icon: '💵',
      text: narrativa,
    },
    _table: {
      title: 'Dólar en Venezuela hoy: BCV vs paralelo',
      headers: ['Tasa', 'Bs. por USD', 'Última actualización'],
      rows: [
        ['Dólar oficial (BCV)', fmtVES(fx.bcv), fx.fechaBcv],
        ['Dólar paralelo (Monitor Dólar)', fmtVES(fx.paralelo), fx.fechaParalelo],
        ['Brecha', fmtPct(brechaPct), `${fmtVES(difBs)} por dólar`],
      ],
      note: 'La tasa BCV es la oficial del Banco Central de Venezuela; el paralelo es el promedio del mercado libre (Monitor Dólar / P2P). Ambas cambian a diario. La brecha = paralelo ÷ BCV − 1.',
    },
  };
}
