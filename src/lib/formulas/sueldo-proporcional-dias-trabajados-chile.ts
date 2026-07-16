// Sueldo proporcional por días trabajados (Chile) — para ingresos/egresos a mitad de mes, licencias sin goce, etc.
// Base legal: mes comercial de 30 días (sueldo diario = sueldo mensual / 30). Gratificación legal Art. 50 CT opcional.
import { CHILE_2026, fmtCLP } from '../data/chile-2026.ts';

export interface Inputs {
  sueldoMensual: number;     // sueldo base mensual (CLP)
  diasTrabajados: number;    // días efectivamente trabajados en el mes
  diasBase: number;          // divisor del mes (30 por defecto)
  incluirGratificacion: string; // 'si' | 'no' — gratificación legal proporcional (25%, tope 4,75 IMM/año)
}
export interface Outputs {
  sueldoDiario: number;
  sueldoProporcional: number;
  gratificacionProporcional: number;
  totalRecibir: number;
  descuento: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const sueldo = Math.max(0, Number(i.sueldoMensual) || 0);
  const base = Math.max(1, Math.round(Number(i.diasBase) || 30));
  const dias = Math.max(0, Math.min(base, Number(i.diasTrabajados) || 0));
  const conGrat = String(i.incluirGratificacion || 'no') === 'si';

  const sueldoDiario = sueldo / base;
  const sueldoProporcional = Math.round(sueldoDiario * dias);

  // Gratificación legal Art. 50 CT: 25% de lo devengado, con tope de 4,75 IMM al año → tope mensual = 4,75·IMM/12.
  let gratificacionProporcional = 0;
  if (conGrat) {
    const topeMensualGrat = (CHILE_2026.gratificacionArt50.topeImmAnual * CHILE_2026.imm) / 12;
    const gratPlena = Math.min(sueldoProporcional * CHILE_2026.gratificacionArt50.porcentaje, topeMensualGrat * (dias / base));
    gratificacionProporcional = Math.round(Math.max(0, gratPlena));
  }

  const totalRecibir = sueldoProporcional + gratificacionProporcional;
  const descuento = Math.max(0, Math.round(sueldo - sueldoProporcional));
  const diasNoTrabajados = base - dias;

  const _insight = {
    title: `Sueldo proporcional: ${fmtCLP(sueldoProporcional)}`,
    text: `Con un sueldo de **${fmtCLP(sueldo)}** y ${dias} de ${base} días trabajados, tu sueldo diario es **${fmtCLP(sueldoDiario)}** y te corresponden **${fmtCLP(sueldoProporcional)}**${conGrat ? ` más **${fmtCLP(gratificacionProporcional)}** de gratificación proporcional` : ''}. Por los ${diasNoTrabajados} día${diasNoTrabajados !== 1 ? 's' : ''} no trabajado${diasNoTrabajados !== 1 ? 's' : ''} se descuentan **${fmtCLP(descuento)}**.`,
    tone: 'neutral',
    icon: '📆',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'A pagar (días trabajados)', value: sueldoProporcional },
      { label: 'Descuento (días no trabajados)', value: descuento },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtCLP(sueldoProporcional),
    centerLabel: 'Proporcional',
    ariaLabel: `De un sueldo de ${fmtCLP(sueldo)} se pagan ${fmtCLP(sueldoProporcional)} y se descuentan ${fmtCLP(descuento)}.`,
  };

  return {
    sueldoDiario: Math.round(sueldoDiario),
    sueldoProporcional,
    gratificacionProporcional,
    totalRecibir,
    descuento,
    detalle: `${dias}/${base} días → ${fmtCLP(sueldoProporcional)}${conGrat ? ` + gratificación ${fmtCLP(gratificacionProporcional)}` : ''} = ${fmtCLP(totalRecibir)}.`,
    _insight,
    _chart,
  };
}
