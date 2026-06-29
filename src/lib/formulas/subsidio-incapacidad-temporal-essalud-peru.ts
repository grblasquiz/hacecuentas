/** Subsidio por incapacidad temporal (descanso médico) EsSalud Perú — Ley 26790:
 *  los primeros 20 días los paga el EMPLEADOR; desde el día 21 los paga EsSalud,
 *  con tope acumulado de 340 días (luego 11 meses 10 días adicionales por excepción). */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldo: number;        // remuneración mensual base del subsidio
  diasDescanso: number;  // días de descanso médico
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldo) || 0;
  const diasDescanso = Number(i.diasDescanso) || 0;
  if (sueldo <= 0) throw new Error('Ingresá tu remuneración mensual');
  if (diasDescanso <= 0) throw new Error('Ingresá los días de descanso médico');

  const diario = sueldo / 30;
  const diasEmpleador = Math.min(diasDescanso, 20);                       // primeros 20 días
  const diasEssalud = Math.min(Math.max(diasDescanso - 20, 0), 340);      // día 21 en adelante, tope 340
  const pagoEmpleador = diasEmpleador * diario;
  const pagoEssalud = diasEssalud * diario;
  const total = pagoEmpleador + pagoEssalud;

  const _insight = {
    title: 'Cómo se reparte tu subsidio',
    text: `Tu remuneración diaria es **${fmtPEN(diario)}** (sueldo ÷ 30). De los **${diasDescanso} días** de descanso, los primeros **${diasEmpleador}** los paga tu **empleador** (${fmtPEN(pagoEmpleador)})` +
      (diasEssalud > 0
        ? ` y los siguientes **${diasEssalud}** los cubre **EsSalud** (${fmtPEN(pagoEssalud)}).`
        : ` (EsSalud recién cubre a partir del día 21).`) +
      ` En total recibís **${fmtPEN(total)}**.`,
    tone: 'good',
    icon: '🩺',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Paga empleador (1-20)', value: Math.round(pagoEmpleador) },
      { label: 'Paga EsSalud (21+)', value: Math.round(pagoEssalud) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(total),
    centerLabel: 'Subsidio total',
    ariaLabel: `Subsidio total por incapacidad temporal de ${fmtPEN(total)}.`,
  };

  return {
    pagoEmpleador: fmtPEN(pagoEmpleador),
    pagoEssalud: fmtPEN(pagoEssalud),
    total: fmtPEN(total),
    detalle: `Diario ${fmtPEN(diario)} · empleador ${diasEmpleador} días = ${fmtPEN(pagoEmpleador)} · EsSalud ${diasEssalud} días = ${fmtPEN(pagoEssalud)} → total ${fmtPEN(total)}.`,
    _insight,
    _chart,
  };
}
