/** Costo laboral total del empleador Perú — sueldo + EsSalud + provisiones (CTS, grati, vacaciones). */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldoMensual: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  if (sueldo <= 0) throw new Error('Ingresá el sueldo mensual del trabajador');

  // EsSalud: 9% del sueldo, aporte del empleador (no se descuenta de la boleta).
  const essalud = sueldo * PERU_2026.essalud;

  // Provisión CTS: ~1 sueldo por año ⇒ 1/12 mensual ≈ 8,33%.
  const provCts = sueldo * (1 / 12);

  // Provisión gratificaciones: 2 sueldos por año (julio + diciembre) + bonificación
  // extraordinaria del 9% (lo que iría a EsSalud, Ley 30334). 2/12 = 16,66%, +9% sobre eso.
  const gratiAnual = sueldo * 2 * (1 + PERU_2026.gratificacion.bonificacionExtraordinaria);
  const provGratificacion = gratiAnual / 12;

  // Provisión vacaciones: 1 sueldo por año de descanso vacacional ⇒ 1/12 ≈ 8,33%.
  const provVacaciones = sueldo * (1 / 12);

  const costoMensual = sueldo + essalud + provCts + provGratificacion + provVacaciones;
  const costoAnual = costoMensual * 12;
  const sobrecosto = costoMensual - sueldo;
  const factorSobrecosto = sueldo > 0 ? sobrecosto / sueldo : 0;

  const _insight = {
    title: 'Cuánto te cuesta realmente este trabajador',
    text: `Pagar un sueldo de **${fmtPEN(sueldo)}** te cuesta en realidad **${fmtPEN(costoMensual)}** al mes (un **${(factorSobrecosto * 100).toFixed(1)}%** más por las cargas) o **${fmtPEN(costoAnual)}** al año. El sobrecosto sale de EsSalud (9%), y de provisionar CTS, gratificaciones (con bonificación 9%) y vacaciones.`,
    tone: 'info',
    icon: '🏢',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Sueldo', value: Math.round(sueldo) },
      { label: 'EsSalud 9%', value: Math.round(essalud) },
      { label: 'Provisión CTS', value: Math.round(provCts) },
      { label: 'Provisión gratificación', value: Math.round(provGratificacion) },
      { label: 'Provisión vacaciones', value: Math.round(provVacaciones) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(costoMensual),
    centerLabel: 'Costo mensual',
    ariaLabel: `Costo laboral total mensual: ${fmtPEN(costoMensual)} para un sueldo de ${fmtPEN(sueldo)}.`,
  };

  return {
    costoMensual: fmtPEN(costoMensual),
    costoAnual: fmtPEN(costoAnual),
    essalud: fmtPEN(essalud),
    provisionCts: fmtPEN(provCts),
    provisionGratificacion: fmtPEN(provGratificacion),
    provisionVacaciones: fmtPEN(provVacaciones),
    detalle: `Sueldo ${fmtPEN(sueldo)} + EsSalud ${fmtPEN(essalud)} + CTS ${fmtPEN(provCts)} + grati ${fmtPEN(provGratificacion)} + vacaciones ${fmtPEN(provVacaciones)} = ${fmtPEN(costoMensual)}/mes.`,
    _insight,
    _chart,
  };
}
