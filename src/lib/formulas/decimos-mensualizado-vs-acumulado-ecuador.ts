/**
 * Décimos en Ecuador 2026: mensualizado vs acumulado.
 * Décimo tercero (13°) = una remuneración (sueldo) / 12 si mensualizado, o el proporcional
 *   de lo ganado entre 1-dic y 30-nov si acumulado.
 * Décimo cuarto (14°) = 1 SBU (USD 482 en 2026), igual para todos; mensualizado SBU/12,
 *   acumulado el proporcional del período.
 * Fuente: Código del Trabajo arts. 111 y 113; Ministerio del Trabajo (trabajo.gob.ec).
 * El proporcional se aproxima con mesesTrabajados/12.
 */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  sueldo: number;
  mesesTrabajados?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; _table?: any; }

export function compute(i: Inputs): Outputs {
  const SBU = ECUADOR_2026.sbu; // 14° = 1 SBU = 482
  const sueldo = Number(i.sueldo) || 0;
  let meses = Number(i.mesesTrabajados);
  if (!Number.isFinite(meses) || meses <= 0) meses = 12;
  meses = Math.min(meses, 12);
  const frac = meses / 12;

  // Mensualizado: se paga 1/12 cada mes junto al sueldo (todo el año).
  const d13Mensual = sueldo / 12;
  const d14Mensual = SBU / 12;
  // Acumulado: se cobra todo junto (13° en diciembre, 14° en marzo/agosto según región),
  // proporcional al tiempo trabajado en el período.
  const d13Acumulado = sueldo * frac;
  const d14Acumulado = SBU * frac;

  const totalMensual = d13Mensual + d14Mensual; // extra que sumás a tu sueldo cada mes
  const totalAcumulado = d13Acumulado + d14Acumulado;

  const _insight = {
    title: 'Mensualizado vs acumulado',
    text: `Si **mensualizás**, sumás **${fmtUSDec(totalMensual)}** a tu sueldo cada mes (13° ${fmtUSDec(d13Mensual)} + 14° ${fmtUSDec(d14Mensual)}). Si **acumulás**, no cobrás nada extra mes a mes pero recibís **${fmtUSDec(d13Acumulado)}** de 13° (diciembre) y **${fmtUSDec(d14Acumulado)}** de 14° (marzo/agosto). Es el mismo dinero anual; cambia cuándo lo recibís. La modalidad se elige solo en enero.`,
    tone: 'neutral',
    icon: '🎁',
  };

  const _chart = {
    type: 'bars',
    bars: [
      { label: '13° + 14° mensual', value: Math.round(totalMensual * 100) / 100 },
      { label: '13° acumulado', value: Math.round(d13Acumulado * 100) / 100 },
      { label: '14° acumulado', value: Math.round(d14Acumulado * 100) / 100 },
    ],
    ariaLabel: `Mensualizado ${fmtUSDec(totalMensual)}/mes; acumulado 13° ${fmtUSDec(d13Acumulado)} y 14° ${fmtUSDec(d14Acumulado)}.`,
  };

  const _table = {
    title: 'Comparación décimos: mensualizado vs acumulado',
    headers: ['Beneficio', 'Mensualizado (por mes)', 'Acumulado (todo junto)'],
    align: ['left', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: [
      ['Décimo tercer sueldo (13°)', fmtUSDec(d13Mensual), fmtUSDec(d13Acumulado)],
      ['Décimo cuarto sueldo (14° = 1 SBU)', fmtUSDec(d14Mensual), fmtUSDec(d14Acumulado)],
      ['Total', fmtUSDec(totalMensual), fmtUSDec(totalAcumulado)],
    ],
    note: `14° = 1 SBU (${fmtUSDec(SBU)}) igual para todos. El acumulado mostrado es proporcional a ${meses} ${meses === 1 ? 'mes' : 'meses'} trabajados. Solo se puede cambiar de modalidad en enero (Código del Trabajo arts. 111 y 113).`,
  };

  return {
    d13Mensual: fmtUSDec(d13Mensual),
    d13Acumulado: fmtUSDec(d13Acumulado),
    d14Mensual: fmtUSDec(d14Mensual),
    d14Acumulado: fmtUSDec(d14Acumulado),
    totalMensual: fmtUSDec(totalMensual),
    detalle: `Mensual: 13° ${fmtUSDec(d13Mensual)} + 14° ${fmtUSDec(d14Mensual)} = ${fmtUSDec(totalMensual)}/mes. Acumulado: 13° ${fmtUSDec(d13Acumulado)} + 14° ${fmtUSDec(d14Acumulado)} (proporcional a ${meses} meses).`,
    _insight,
    _chart,
    _table,
  };
}
