/** Conversor de salario por hora / día / semana / mes / año — México 2026.
 *  Matemática pura, sin riesgo fiscal. Referencia: salario mínimo general
 *  $315.04/día (CONASAMI 2026) ≈ $39.38/hora con jornada de 8 h.
 */
import { MEXICO_2026 } from '../data/mexico-2026';

export interface Inputs {
  monto: number;
  periodo: string; // hora | dia | semana | mes | anio
  horasSemana?: number;
  diasSemana?: number;
  __lang?: string;
}

export interface Outputs {
  porHora: number;
  porDia: number;
  porSemana: number;
  porMes: number;
  porAnio: number;
  formula: string;
  explicacion: string;
  _chart?: any;
  _insight?: any;
}

export function salarioPorHoraMensualDiarioMexico(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const periodo = String(i.periodo || 'mes');
  const horasSemana = Math.max(1, Number(i.horasSemana) || 48);
  const diasSemana = Math.max(1, Number(i.diasSemana) || 6);

  if (monto <= 0) throw new Error('Ingresá el monto del salario');

  const horasMes = (horasSemana * 52) / 12;
  const factor: Record<string, number> = {
    hora: 1,
    dia: horasSemana / diasSemana,
    semana: horasSemana,
    mes: horasMes,
    anio: horasMes * 12,
  };
  const div = factor[periodo] ?? horasMes;

  const porHora = monto / div;
  const porDia = porHora * (horasSemana / diasSemana);
  const porSemana = porHora * horasSemana;
  const porMes = porHora * horasMes;
  const porAnio = porMes * 12;

  const periodoLabel: Record<string, string> = {
    hora: 'por hora', dia: 'por día', semana: 'por semana', mes: 'mensual', anio: 'anual',
  };

  const salarioMinHora = MEXICO_2026.salarioMinimo.generalDiario / 8;

  const formula = `Base por hora = $${monto.toLocaleString('es-MX')} ${periodoLabel[periodo] || ''} ÷ ${div.toFixed(2)} = $${porHora.toFixed(2)}/h; con ${horasSemana} h/sem y ${diasSemana} días/sem`;
  const explicacion = `Con un salario de $${monto.toLocaleString('es-MX')} ${periodoLabel[periodo] || ''}, jornada de ${horasSemana} horas en ${diasSemana} días por semana (${horasMes.toFixed(1)} h/mes promedio): equivale a $${porHora.toFixed(2)}/hora, $${Math.round(porDia).toLocaleString('es-MX')}/día, $${Math.round(porSemana).toLocaleString('es-MX')}/semana, $${Math.round(porMes).toLocaleString('es-MX')}/mes y $${Math.round(porAnio).toLocaleString('es-MX')}/año. El salario mínimo general 2026 es ≈ $${salarioMinHora.toFixed(2)}/hora.`;

  const chart = {
    type: 'bar' as const,
    bars: [
      { label: 'Hora', value: Math.round(porHora) },
      { label: 'Día', value: Math.round(porDia) },
      { label: 'Semana', value: Math.round(porSemana) },
      { label: 'Mes', value: Math.round(porMes) },
    ],
    prefix: '$',
    ariaLabel: `Equivalencias: hora ${Math.round(porHora)}, día ${Math.round(porDia)}, semana ${Math.round(porSemana)}, mes ${Math.round(porMes)}.`,
  };

  const insight = {
    title: 'Tu salario por hora',
    text: `Tu ingreso equivale a **$${porHora.toFixed(2)}/hora** y **$${Math.round(porMes).toLocaleString('es-MX')}/mes**. El mínimo general 2026 ronda $${salarioMinHora.toFixed(2)}/hora.`,
    tone: porHora >= salarioMinHora ? ('good' as const) : ('warn' as const),
    icon: '⏱️',
  };

  return {
    porHora: Math.round(porHora * 100) / 100,
    porDia: Math.round(porDia),
    porSemana: Math.round(porSemana),
    porMes: Math.round(porMes),
    porAnio: Math.round(porAnio),
    formula,
    explicacion,
    _chart: chart,
    _insight: insight,
  };
}
