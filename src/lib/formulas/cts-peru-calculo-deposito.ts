/** CTS Perú — Compensación por Tiempo de Servicios (depósito semestral). */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldoMensual: number;
  mesesTrabajados: number;   // meses completos en el semestre (0-6)
  diasAdicionales?: number;  // días sueltos además de los meses (0-30)
  tieneHijos?: string;       // 'si' suma asignación familiar a la base
  incluirGratificacion?: string; // 'si' suma 1/6 de la última gratificación
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const meses = Math.max(0, Math.min(6, Number(i.mesesTrabajados) || 0));
  const dias = Math.max(0, Math.min(30, Number(i.diasAdicionales) || 0));
  const conHijos = String(i.tieneHijos || 'no') === 'si';
  const conGrati = String(i.incluirGratificacion || 'si') === 'si';
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');

  const asig = conHijos ? PERU_2026.asignacionFamiliar : 0;
  const sextoGrati = conGrati ? sueldo / 6 : 0; // 1/6 de la gratificación (≈ 1 sueldo)
  const remComputable = sueldo + asig + sextoGrati;

  // CTS = (rem/12 × meses) + (rem/360 × días)
  const porMeses = (remComputable / 12) * meses;
  const porDias = (remComputable / 360) * dias;
  const cts = porMeses + porDias;

  const _insight = {
    title: 'Tu CTS del semestre',
    text: `Con un sueldo de **${fmtPEN(sueldo)}**${conHijos ? ' + asignación familiar' : ''}, tu remuneración computable es **${fmtPEN(remComputable)}** (incluye 1/6 de gratificación). Por **${meses} meses${dias ? ` y ${dias} días` : ''}** te corresponde un depósito de **${fmtPEN(cts)}**. La CTS no tiene descuentos de AFP/ONP ni renta.`,
    tone: 'good',
    icon: '🏦',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Sueldo', value: Math.round(sueldo) },
      { label: 'Asignación familiar', value: Math.round(asig) },
      { label: '1/6 gratificación', value: Math.round(sextoGrati) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(cts),
    centerLabel: 'CTS a depositar',
    ariaLabel: `CTS del semestre: ${fmtPEN(cts)} sobre una remuneración computable de ${fmtPEN(remComputable)}.`,
  };

  return {
    cts: fmtPEN(cts),
    remComputable: fmtPEN(remComputable),
    detalle: `Remuneración computable ${fmtPEN(remComputable)} · ${meses} meses${dias ? ` + ${dias} días` : ''} · sin descuentos.`,
    _insight,
    _chart,
  };
}
