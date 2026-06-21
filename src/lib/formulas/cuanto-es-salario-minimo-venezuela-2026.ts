/**
 * Salario mínimo en Venezuela 2026: descompone el "Ingreso Mínimo Integral"
 * (lo que efectivamente cobra un trabajador) en sus tres componentes:
 *   - Salario mínimo legal LOTTT: Bs. 130/mes (la ÚNICA base de pasivos laborales).
 *   - Bono de Guerra Económica ("Ingreso Integral"): ~USD 200 (Sistema Patria).
 *   - Cestaticket socialista: USD 40, indexado a la tasa BCV.
 * Los bonos NO son salario en sentido legal: no generan prestaciones, vacaciones
 * ni utilidades. El total se expresa en bolívares a la tasa elegida (BCV por defecto).
 *
 * Datos: NO se hardcodean — se leen de src/lib/data/venezuela-2026.ts.
 *   Fuentes: MinTrabajo (LOTTT), Sistema Patria, Infobae/Banca y Negocios.
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
  const bonoGuerraUsd = ve.bonoGuerraEconomicaUsd;              // USD 200
  const cestaticketUsd = ve.cestaticketUsd;                    // USD 40
  const bonoGuerraVes = usdToVes(bonoGuerraUsd, tasa);
  const cestaticketVes = usdToVes(cestaticketUsd, tasa);

  // Ingreso Integral total (Bs.) = salario base + bono + cestaticket convertidos.
  const totalVes = salarioMinimoVes + bonoGuerraVes + cestaticketVes;
  const totalUsd = totalVes / valorTasa;

  // Equivalente en USD del salario base legal (suele ser ínfimo).
  const salarioBaseUsd = salarioMinimoVes / valorTasa;

  const narrativa =
    `El salario mínimo LEGAL en Venezuela sigue en ${fmtVES(salarioMinimoVes)} al mes ` +
    `(unos ${fmtUSD(salarioBaseUsd)} a la tasa ${nombreTasa}), congelado desde marzo de 2022. ` +
    `Pero el Ingreso Mínimo Integral que cobra el trabajador suma además el Bono de Guerra Económica ` +
    `(${fmtUSD(bonoGuerraUsd)}) y el Cestaticket (${fmtUSD(cestaticketUsd)}): en total, ` +
    `${fmtVES(totalVes)} (${fmtUSD(totalUsd)}). Ojo: los bonos NO son salario, así que no cuentan ` +
    `para prestaciones, utilidades ni vacaciones.`;

  return {
    // Output principal (titular): ingreso integral total en Bs.
    ingresoIntegralTotal: `${fmtVES(totalVes)} · ${fmtUSD(totalUsd)} / mes`,
    salarioMinimoLegal: `${fmtVES(salarioMinimoVes)} (${fmtUSD(salarioBaseUsd)})`,
    bonoGuerraEconomica: `${fmtVES(bonoGuerraVes)} (${fmtUSD(bonoGuerraUsd)})`,
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
      title: 'Salario mínimo e Ingreso Integral en Venezuela 2026',
      headers: ['Concepto', 'En dólares', `En bolívares (${tasa === 'bcv' ? 'BCV' : 'paralelo'})`, '¿Es salario?'],
      rows: [
        ['Salario mínimo legal (LOTTT)', fmtUSD(salarioBaseUsd), fmtVES(salarioMinimoVes), 'Sí — base de pasivos'],
        ['Bono de Guerra Económica', fmtUSD(bonoGuerraUsd), fmtVES(bonoGuerraVes), 'No — es un bono'],
        ['Cestaticket socialista', fmtUSD(cestaticketUsd), fmtVES(cestaticketVes), 'No — es un bono'],
        ['Ingreso Mínimo Integral', fmtUSD(totalUsd), fmtVES(totalVes), 'Mixto'],
      ],
      note: 'El salario mínimo legal es Bs. 130 desde mar-2022 y es lo único que genera prestaciones, vacaciones y utilidades. El Bono de Guerra (~USD 200) y el Cestaticket (USD 40) se pagan en bolívares al equivalente USD según la tasa BCV del día, pero NO son salario. Tasas de referencia: cambian a diario.',
    },
  };
}
