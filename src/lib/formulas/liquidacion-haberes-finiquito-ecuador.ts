/** Liquidación de haberes / finiquito (Ecuador) — décimos proporcionales,
 *  vacaciones no gozadas e indemnización por despido intempestivo. */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  sueldo: number;                 // remuneración mensual
  mesesTrabajadosAnio: number;    // meses trabajados en el año en curso (para décimos proporcionales)
  diasVacacionesPendientes?: number; // días de vacaciones no gozadas
  aniosTrabajados?: number;       // años completos (para indemnización si aplica)
  tipoSalida?: string;            // 'renuncia' | 'despido'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldo) || 0;
  const mesesAnio = Math.max(0, Math.min(12, Number(i.mesesTrabajadosAnio) || 0));
  const diasVac = Math.max(0, Number(i.diasVacacionesPendientes) || 0);
  const anios = Math.max(0, Number(i.aniosTrabajados) || 0);
  const tipo = String(i.tipoSalida || 'renuncia');
  if (sueldo <= 0) throw new Error('Ingresá tu remuneración mensual');

  // Décimo tercero proporcional: 1/12 del sueldo × meses trabajados en el año
  const decimoTerceroProp = (sueldo * mesesAnio) / 12;
  // Décimo cuarto proporcional: 1 SBU × meses ÷ 12
  const decimoCuartoProp = (ECUADOR_2026.decimoCuarto * mesesAnio) / 12;
  // Vacaciones no gozadas: valor del día = sueldo / 30
  const vacaciones = (sueldo / 30) * diasVac;

  // Indemnización por despido intempestivo (Código del Trabajo, art. 188):
  // hasta 3 años => 3 sueldos; más de 3 => 1 sueldo por año (mín 3, máx 25 sueldos).
  let indemnizacion = 0;
  if (tipo === 'despido') {
    if (anios <= 3) indemnizacion = 3 * sueldo;
    else indemnizacion = Math.min(25, anios) * sueldo;
  }

  const total = decimoTerceroProp + decimoCuartoProp + vacaciones + indemnizacion;

  const _insight = {
    title: tipo === 'despido' ? 'Tu finiquito con indemnización' : 'Tu liquidación de haberes',
    text: tipo === 'despido'
      ? `Por **despido intempestivo** con **${anios} años** trabajados, te corresponde una indemnización de **${fmtUSDec(indemnizacion)}** más los proporcionales (décimos y vacaciones). Tu finiquito estimado es **${fmtUSDec(total)}**.`
      : `Por **renuncia** con **${mesesAnio} meses** en el año en curso, tu liquidación suma los décimos proporcionales y las vacaciones no gozadas: **${fmtUSDec(total)}**. No corresponde indemnización por salida voluntaria.`,
    tone: 'neutral',
    icon: '📄',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Décimo 13º prop.', value: Math.round(decimoTerceroProp * 100) / 100 },
      { label: 'Décimo 14º prop.', value: Math.round(decimoCuartoProp * 100) / 100 },
      { label: 'Vacaciones', value: Math.round(vacaciones * 100) / 100 },
      ...(indemnizacion > 0 ? [{ label: 'Indemnización', value: Math.round(indemnizacion * 100) / 100 }] : []),
    ],
    label: fmtUSDec(total),
    ariaLabel: `Liquidación total ${fmtUSDec(total)}.`,
  };

  return {
    totalLiquidacion: fmtUSDec(total),
    decimoTerceroProporcional: fmtUSDec(decimoTerceroProp),
    decimoCuartoProporcional: fmtUSDec(decimoCuartoProp),
    vacacionesNoGozadas: fmtUSDec(vacaciones),
    indemnizacion: fmtUSDec(indemnizacion),
    detalle: `13º prop ${fmtUSDec(decimoTerceroProp)} + 14º prop ${fmtUSDec(decimoCuartoProp)} + vacaciones ${fmtUSDec(vacaciones)}${indemnizacion > 0 ? ` + indemnización ${fmtUSDec(indemnizacion)}` : ''} = ${fmtUSDec(total)}.`,
    _insight,
    _chart,
  };
}
