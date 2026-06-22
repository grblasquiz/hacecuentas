/**
 * Salario mínimo en Venezuela 2026: muestra el salario mínimo legal LOTTT
 * (Bs. 130/mes, la ÚNICA base de pasivos laborales) más el cestaticket
 * socialista (USD 40, indexado a la tasa BCV). El cestaticket NO es salario
 * en sentido legal: no genera prestaciones, vacaciones ni utilidades.
 * El total se expresa en bolívares a la tasa elegida (BCV por defecto).
 *
 * Datos: NO se hardcodean — se leen de src/lib/data/venezuela-2026.ts.
 *   Fuentes: MinTrabajo (LOTTT), BCV, Banca y Negocios.
 */
import { VENEZUELA_2026, usdToVes, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  tasa?: string; // 'bcv' | 'paralelo'
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const fmtUSD = (n: number): string =>
  '$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export function cuantoEsSalarioMinimoVenezuela2026(i: Inputs): Outputs {
  const ve = VENEZUELA_2026;
  const tasaRaw = String(i.tasa || 'bcv');
  const tasa: 'bcv' | 'paralelo' = tasaRaw === 'paralelo' ? 'paralelo' : 'bcv';
  const valorTasa = ve.fx[tasa];
  const nombreTasa = tasa === 'bcv' ? 'oficial (BCV)' : 'paralelo (Monitor Dólar)';

  // Componentes.
  const salarioMinimoVes = ve.salarioMinimoVes;                 // Bs. 130
  const cestaticketUsd = ve.cestaticketUsd;                     // USD 40
  const cestaticketVes = usdToVes(cestaticketUsd, tasa);

  // Ingreso del trabajador (Bs.) = salario mínimo legal + cestaticket convertido.
  const totalVes = salarioMinimoVes + cestaticketVes;
  const totalUsd = totalVes / valorTasa;

  // Equivalente en USD del salario base legal (suele ser ínfimo).
  const salarioBaseUsd = salarioMinimoVes / valorTasa;

  const narrativa =
    `El salario mínimo LEGAL en Venezuela sigue en ${fmtVES(salarioMinimoVes)} al mes ` +
    `(unos ${fmtUSD(salarioBaseUsd)} a la tasa ${nombreTasa}), congelado desde marzo de 2022. ` +
    `Sumado al Cestaticket socialista (${fmtUSD(cestaticketUsd)}), el trabajador recibe en total ` +
    `${fmtVES(totalVes)} (${fmtUSD(totalUsd)}). Ojo: el cestaticket NO es salario, así que no cuenta ` +
    `para prestaciones, utilidades ni vacaciones — solo el salario legal de ${fmtVES(salarioMinimoVes)} genera pasivos laborales.`;

  return {
    // Output principal (titular): salario mínimo + cestaticket en Bs.
    ingresoIntegralTotal: `${fmtVES(totalVes)} · ${fmtUSD(totalUsd)} / mes`,
    salarioMinimoLegal: `${fmtVES(salarioMinimoVes)} (${fmtUSD(salarioBaseUsd)})`,
    cestaticket: `${fmtVES(cestaticketVes)} (${fmtUSD(cestaticketUsd)})`,
    totalBolivares: Number(totalVes.toFixed(2)),
    totalDolares: Number(totalUsd.toFixed(2)),
    tasaUsada: `${nombreTasa}: ${fmtVES(valorTasa)} por dólar`,
    _insight: {
      type: 'highlight',
      icon: '💵',
      text: narrativa,
    },
    _table: {
      title: 'Salario mínimo y cestaticket en Venezuela 2026',
      headers: ['Concepto', 'En dólares', `En bolívares (${tasa === 'bcv' ? 'BCV' : 'paralelo'})`, '¿Es salario?'],
      rows: [
        ['Salario mínimo legal (LOTTT)', fmtUSD(salarioBaseUsd), fmtVES(salarioMinimoVes), 'Sí — base de pasivos'],
        ['Cestaticket socialista', fmtUSD(cestaticketUsd), fmtVES(cestaticketVes), 'No — es un beneficio'],
        ['Total mensual', fmtUSD(totalUsd), fmtVES(totalVes), 'Mixto'],
      ],
      note: 'El salario mínimo legal es Bs. 130 desde mar-2022 y es lo único que genera prestaciones, vacaciones y utilidades. El Cestaticket (USD 40) se paga en bolívares al equivalente USD según la tasa BCV del día, pero NO es salario. Tasas de referencia: cambian a diario.',
    },
  };
}
