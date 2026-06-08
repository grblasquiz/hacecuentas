/** Costo laboral total del empleador (Ecuador) — sueldo + aporte patronal + provisiones de beneficios. */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  sueldoMensual: number;
  segundoAnio?: boolean; // true => corresponde provisión de fondos de reserva (8,33%)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const segundoAnio = i.segundoAnio === true || String(i.segundoAnio) === 'true';
  if (sueldo <= 0) throw new Error('Ingresá el sueldo mensual');

  const aportePatronal = sueldo * ECUADOR_2026.iessPatronal;        // 11,15%
  const decimoTercero = sueldo * 0.0833;                            // provisión mensual del 13º (1/12)
  const decimoCuarto = ECUADOR_2026.decimoCuarto / 12;              // provisión mensual del 14º (SBU/12)
  const fondosReserva = segundoAnio ? sueldo * ECUADOR_2026.fondosReserva : 0; // 8,33% desde 2º año
  const vacaciones = sueldo * 0.0416;                               // provisión vacaciones (1/24 ≈ 4,16%)

  const costoMensual = sueldo + aportePatronal + decimoTercero + decimoCuarto + fondosReserva + vacaciones;
  const costoAnual = costoMensual * 12;
  const factor = sueldo > 0 ? costoMensual / sueldo : 0;

  const _insight = {
    title: 'Costo laboral total',
    text: `Un sueldo bruto de **${fmtUSDec(sueldo)}** le cuesta a la empresa **${fmtUSDec(costoMensual)}** al mes (**${fmtUSDec(costoAnual)}** al año), es decir **${factor.toFixed(2)}×** el sueldo. Incluye aporte patronal (11,15%), décimos, vacaciones${segundoAnio ? ' y fondos de reserva (8,33%)' : ' (los fondos de reserva aplican desde el 2º año)'}.`,
    tone: 'neutral',
    icon: '🏢',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Sueldo', value: Math.round(sueldo * 100) / 100 },
      { label: 'Aporte patronal 11,15%', value: Math.round(aportePatronal * 100) / 100 },
      { label: 'Décimo 13º (prov.)', value: Math.round(decimoTercero * 100) / 100 },
      { label: 'Décimo 14º (prov.)', value: Math.round(decimoCuarto * 100) / 100 },
      { label: 'Vacaciones (prov.)', value: Math.round(vacaciones * 100) / 100 },
      ...(fondosReserva > 0 ? [{ label: 'Fondos de reserva', value: Math.round(fondosReserva * 100) / 100 }] : []),
    ],
    label: fmtUSDec(costoMensual),
    ariaLabel: `Costo laboral mensual ${fmtUSDec(costoMensual)} sobre un sueldo de ${fmtUSDec(sueldo)}.`,
  };

  return {
    costoMensual: fmtUSDec(costoMensual),
    costoAnual: fmtUSDec(costoAnual),
    aportePatronal: fmtUSDec(aportePatronal),
    provisionDecimos: fmtUSDec(decimoTercero + decimoCuarto),
    provisionVacaciones: fmtUSDec(vacaciones),
    fondosReserva: fmtUSDec(fondosReserva),
    factorSobreSueldo: factor.toFixed(2) + '×',
    detalle: `Sueldo ${fmtUSDec(sueldo)} + patronal ${fmtUSDec(aportePatronal)} + 13º ${fmtUSDec(decimoTercero)} + 14º ${fmtUSDec(decimoCuarto)} + vacaciones ${fmtUSDec(vacaciones)}${fondosReserva > 0 ? ` + fondos ${fmtUSDec(fondosReserva)}` : ''} = ${fmtUSDec(costoMensual)}/mes.`,
    _insight,
    _chart,
  };
}
