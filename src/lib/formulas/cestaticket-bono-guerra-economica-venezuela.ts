/**
 * Cestaticket y Bono de Guerra Económica hoy en bolívares (Venezuela 2026).
 *
 * Convierte los dos componentes en divisas del Ingreso Mínimo Integral a Bs.
 * a la tasa elegida (BCV por defecto, que es la que el Ejecutivo usa para
 * indexar el cestaticket):
 *   - Cestaticket socialista: USD 40.
 *   - Bono de Guerra Económica ("Ingreso Integral"): ~USD 200 (Sistema Patria).
 * Ninguno es salario en sentido legal (no generan prestaciones).
 *
 * Datos: NO se hardcodean — se leen de src/lib/data/venezuela-2026.ts.
 *   Fuentes: Sistema Patria, BCV, Banca y Negocios / Infobae.
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

export function cestaticketBonoGuerraEconomicaVenezuela(i: Inputs): Outputs {
  const ve = VENEZUELA_2026;
  const tasaRaw = String(i.tasa || 'bcv');
  const tasa: 'bcv' | 'paralelo' = tasaRaw === 'paralelo' ? 'paralelo' : 'bcv';
  const valorTasa = ve.fx[tasa];
  const nombreTasa = tasa === 'bcv' ? 'oficial (BCV)' : 'paralelo (Monitor Dólar)';

  const cestaticketUsd = ve.cestaticketUsd;        // USD 40
  const bonoGuerraUsd = ve.bonoGuerraEconomicaUsd; // USD 200
  const cestaticketVes = usdToVes(cestaticketUsd, tasa);
  const bonoGuerraVes = usdToVes(bonoGuerraUsd, tasa);
  const totalBonosVes = cestaticketVes + bonoGuerraVes;
  const totalBonosUsd = cestaticketUsd + bonoGuerraUsd;

  const narrativa =
    `A la tasa ${nombreTasa} (${fmtVES(valorTasa)} por dólar), el Cestaticket de ${fmtUSD(cestaticketUsd)} ` +
    `equivale a ${fmtVES(cestaticketVes)} y el Bono de Guerra Económica de ${fmtUSD(bonoGuerraUsd)} a ` +
    `${fmtVES(bonoGuerraVes)}. Juntos suman ${fmtVES(totalBonosVes)} (${fmtUSD(totalBonosUsd)}) al mes. ` +
    `Son bonos, no salario: se pagan en bolívares al equivalente en dólares según la tasa BCV del día, ` +
    `pero no generan prestaciones, vacaciones ni utilidades.`;

  return {
    // Titular: total de los dos bonos en Bs.
    totalBonos: `${fmtVES(totalBonosVes)} · ${fmtUSD(totalBonosUsd)} / mes`,
    cestaticketBs: `${fmtVES(cestaticketVes)} (${fmtUSD(cestaticketUsd)})`,
    bonoGuerraBs: `${fmtVES(bonoGuerraVes)} (${fmtUSD(bonoGuerraUsd)})`,
    totalBolivares: Number(totalBonosVes.toFixed(2)),
    totalDolares: Number(totalBonosUsd.toFixed(2)),
    tasaUsada: `${nombreTasa}: ${fmtVES(valorTasa)} por dólar`,
    _insight: {
      type: 'highlight',
      icon: '🎟️',
      text: narrativa,
    },
    _table: {
      title: 'Cestaticket y Bono de Guerra Económica hoy en bolívares',
      headers: ['Bono', 'En dólares', `En bolívares (${tasa === 'bcv' ? 'BCV' : 'paralelo'})`],
      rows: [
        ['Cestaticket socialista', fmtUSD(cestaticketUsd), fmtVES(cestaticketVes)],
        ['Bono de Guerra Económica', fmtUSD(bonoGuerraUsd), fmtVES(bonoGuerraVes)],
        ['Total bonos', fmtUSD(totalBonosUsd), fmtVES(totalBonosVes)],
      ],
      note: 'El Cestaticket (USD 40) y el Bono de Guerra Económica (~USD 200) se pagan vía Sistema Patria en bolívares, al equivalente en dólares según la tasa BCV del día. NO son salario: no inciden en prestaciones, utilidades ni vacaciones. Sumados al salario mínimo legal (Bs. 130) componen el Ingreso Mínimo Integral de ~USD 240.',
    },
  };
}
