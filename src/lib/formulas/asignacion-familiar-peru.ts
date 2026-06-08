/** Asignación familiar Perú — S/ 113 (10% de la RMV) para trabajadores con hijos menores. */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldo: number;            // sueldo mensual (la asignación es un monto fijo, no porcentual)
  numHijos?: number;         // cantidad de hijos menores (informativo: el monto es único)
  tieneHijos?: string;       // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldo) || 0;
  const hijos = Math.max(0, Number(i.numHijos) || 0);
  // Si declara hijos, corresponde; si usa el select, respetarlo.
  const declaraSelect = String(i.tieneHijos || '') === 'si';
  const corresponde = declaraSelect || hijos > 0;
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');

  // Monto único S/ 113 (10% de la RMV), sin importar la cantidad de hijos.
  const monto = corresponde ? PERU_2026.asignacionFamiliar : 0;
  const sueldoConAsig = sueldo + monto;
  const montoAnual = monto * 12; // pagada cada mes mientras dure el vínculo

  const _insight = {
    title: corresponde ? 'Te corresponde asignación familiar' : 'No te corresponde asignación familiar',
    text: corresponde
      ? `La asignación familiar es un monto **fijo de ${fmtPEN(monto)}** (10% de la RMV de ${fmtPEN(PERU_2026.rmv)}), **igual tengas 1 o varios hijos**. Se suma a tu sueldo: ${fmtPEN(sueldo)} + ${fmtPEN(monto)} = **${fmtPEN(sueldoConAsig)}** al mes (${fmtPEN(montoAnual)} al año por este concepto).`
      : `La asignación familiar (${fmtPEN(PERU_2026.asignacionFamiliar)}) solo corresponde a trabajadores con **hijos menores de 18 años** (o hasta 24 si cursan estudios superiores). Si no tenés hijos menores a cargo, no aplica.`,
    tone: 'good',
    icon: '👨‍👩‍👧',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Sueldo', value: Math.round(sueldo) },
      { label: 'Asignación familiar', value: Math.round(monto) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(sueldoConAsig),
    centerLabel: 'Sueldo + asignación',
    ariaLabel: `Asignación familiar de ${fmtPEN(monto)} sumada a un sueldo de ${fmtPEN(sueldo)}.`,
  };

  return {
    monto: fmtPEN(monto),
    sueldoConAsignacion: fmtPEN(sueldoConAsig),
    montoAnual: fmtPEN(montoAnual),
    detalle: corresponde
      ? `Monto fijo ${fmtPEN(monto)}/mes (10% RMV) · ${fmtPEN(montoAnual)}/año · no depende del número de hijos.`
      : `No corresponde: se requiere al menos un hijo menor de edad a cargo.`,
    _insight,
    _chart,
  };
}
