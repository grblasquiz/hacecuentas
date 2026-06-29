/** Ingreso anual total con décimos y fondos de reserva (Ecuador) 2026.
 *  Suma los sueldos netos (tras aporte personal IESS 9,45%), décimo tercero,
 *  décimo cuarto (1 SBU) y fondos de reserva (8,33%, opcional desde el 2º año). */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  sueldo: number;
  tieneFondosReserva?: string;
  mesesTrabajados?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldo) || 0;
  const meses = Number(i.mesesTrabajados) || 12;
  const conFondos = String(i.tieneFondosReserva ?? 'si') === 'si';
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual bruto');

  const SBU = ECUADOR_2026.sbu;                          // 482
  const aportePersonal = ECUADOR_2026.iessPersonal;      // 9,45%
  const fondosPct = ECUADOR_2026.fondosReserva;          // 8,33%

  const sueldoNetoMes = sueldo * (1 - aportePersonal);
  const sueldosNetos = sueldoNetoMes * meses;
  const decimoTercero = sueldo * (meses / 12);
  const decimoCuarto = SBU * (meses / 12);
  const fondosReserva = conFondos ? sueldo * fondosPct * meses : 0;
  const ingresoAnualTotal = sueldosNetos + decimoTercero + decimoCuarto + fondosReserva;

  const _insight = {
    title: 'Tu ingreso anual real',
    text: `Con un sueldo bruto de **${fmtUSDec(sueldo)}** durante **${meses} meses**, tu ingreso anual total —sueldos netos, décimo tercero, décimo cuarto${conFondos ? ' y fondos de reserva' : ''}— es **${fmtUSDec(ingresoAnualTotal)}**. Eso equivale a **${fmtUSDec(ingresoAnualTotal / 12)}** por mes en promedio.`,
    tone: 'positive',
    icon: '💰',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Sueldos netos', value: Math.round(sueldosNetos * 100) / 100 },
      { label: 'Décimo tercero', value: Math.round(decimoTercero * 100) / 100 },
      { label: 'Décimo cuarto', value: Math.round(decimoCuarto * 100) / 100 },
      { label: 'Fondos de reserva', value: Math.round(fondosReserva * 100) / 100 },
    ],
    ariaLabel: `Ingreso anual total ${fmtUSDec(ingresoAnualTotal)}.`,
  };

  return {
    sueldosNetos: fmtUSDec(sueldosNetos),
    decimoTercero: fmtUSDec(decimoTercero),
    decimoCuarto: fmtUSDec(decimoCuarto),
    fondosReserva: fmtUSDec(fondosReserva),
    ingresoAnualTotal: fmtUSDec(ingresoAnualTotal),
    detalle: `Netos ${fmtUSDec(sueldosNetos)} + 13° ${fmtUSDec(decimoTercero)} + 14° ${fmtUSDec(decimoCuarto)} + fondos ${fmtUSDec(fondosReserva)} = ${fmtUSDec(ingresoAnualTotal)}.`,
    _insight,
    _chart,
  };
}
