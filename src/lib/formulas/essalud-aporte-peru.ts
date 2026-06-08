/** Aporte a EsSalud Perú — 9% del sueldo, lo paga el EMPLEADOR (no se descuenta al trabajador). */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldoMensual: number;
  tieneHijos?: string;       // 'si' suma asignación familiar a la base asegurable
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const conHijos = String(i.tieneHijos || 'no') === 'si';
  if (sueldo <= 0) throw new Error('Ingresá el sueldo mensual');

  const asig = conHijos ? PERU_2026.asignacionFamiliar : 0;
  const baseAsegurable = sueldo + asig;

  // EsSalud aplica sobre una base mínima de 1 RMV: si el sueldo es menor, se calcula sobre la RMV.
  const baseEsSalud = Math.max(baseAsegurable, PERU_2026.rmv);
  const aporteMensual = baseEsSalud * PERU_2026.essalud;
  const aporteAnual = aporteMensual * 12;

  const _insight = {
    title: 'Aporte a EsSalud (lo paga la empresa)',
    text: `Sobre una base de **${fmtPEN(baseEsSalud)}**, el aporte a EsSalud es **${fmtPEN(aporteMensual)}** por mes (9%). **Lo paga el empleador, no se te descuenta de la boleta.** En el año la empresa aporta **${fmtPEN(aporteAnual)}** por tu cobertura de salud.`,
    tone: 'good',
    icon: '🏥',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Sueldo (no se descuenta)', value: Math.round(baseEsSalud) },
      { label: 'EsSalud 9% (empleador)', value: Math.round(aporteMensual) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(aporteMensual),
    centerLabel: 'EsSalud mensual',
    ariaLabel: `Aporte a EsSalud de ${fmtPEN(aporteMensual)} mensuales (9%) que paga el empleador.`,
  };

  return {
    aporteMensual: fmtPEN(aporteMensual),
    aporteAnual: fmtPEN(aporteAnual),
    base: fmtPEN(baseEsSalud),
    detalle: `9% de ${fmtPEN(baseEsSalud)} = ${fmtPEN(aporteMensual)}/mes · lo paga la empresa, no se descuenta al trabajador.`,
    _insight,
    _chart,
  };
}
