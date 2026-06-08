/** Sueldo neto Perú — bruto menos aporte de pensión (ONP/AFP) y renta de 5ta mensual. */
import { PERU_2026, impuestoRenta5taAnual, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldoBruto: number;
  sistemaPension?: string;   // 'onp' | 'afp'
  tieneHijos?: string;       // 'si' suma asignación familiar (no afecta el aporte, sí el bruto)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const base = Number(i.sueldoBruto) || 0;
  const sistema = String(i.sistemaPension || 'onp') === 'afp' ? 'afp' : 'onp';
  const conHijos = String(i.tieneHijos || 'no') === 'si';
  if (base <= 0) throw new Error('Ingresá tu sueldo bruto mensual');

  const asig = conHijos ? PERU_2026.asignacionFamiliar : 0;
  const bruto = base + asig;

  // Aporte de pensión
  const tasaPension = sistema === 'afp' ? PERU_2026.afp.totalAprox : PERU_2026.onp;
  const pension = bruto * tasaPension;

  // Renta de 5ta categoría: anual sobre 14 sueldos (12 + 2 gratificaciones), dividido en 12.
  const ingresoAnual = bruto * 14;
  const renta5taAnual = impuestoRenta5taAnual(ingresoAnual);
  const renta5taMensual = renta5taAnual / 12;

  const neto = bruto - pension - renta5taMensual;

  const _insight = {
    title: 'Tu sueldo neto',
    text: `Sobre un bruto de **${fmtPEN(bruto)}** te descuentan **${fmtPEN(pension)}** de pensión (${sistema === 'afp' ? 'AFP ~12,5%' : 'ONP 13%'})${renta5taMensual > 0 ? ` y **${fmtPEN(renta5taMensual)}** de renta de 5ta` : ' (no pagás renta de 5ta porque tu ingreso anual no supera las 7 UIT exentas)'}. Tu neto en mano es **${fmtPEN(neto)}**.`,
    tone: 'good',
    icon: '💵',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Neto', value: Math.round(neto) },
      { label: 'Pensión', value: Math.round(pension) },
      { label: 'Renta 5ta', value: Math.round(renta5taMensual) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(neto),
    centerLabel: 'Sueldo neto',
    ariaLabel: `Sueldo neto de ${fmtPEN(neto)} tras descontar ${fmtPEN(pension)} de pensión y ${fmtPEN(renta5taMensual)} de renta de 5ta.`,
  };

  return {
    neto: fmtPEN(neto),
    pension: fmtPEN(pension),
    renta5ta: fmtPEN(renta5taMensual),
    detalle: `Bruto ${fmtPEN(bruto)} − pensión ${fmtPEN(pension)} (${sistema === 'afp' ? 'AFP' : 'ONP'})${renta5taMensual > 0 ? ` − renta 5ta ${fmtPEN(renta5taMensual)}` : ''} = ${fmtPEN(neto)}.`,
    _insight,
    _chart,
  };
}
