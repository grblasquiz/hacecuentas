/**
 * Horas extras PARAGUAY (Código del Trabajo, Ley 213/93, art. 234).
 *
 * Valor de la hora ordinaria = salario mensual / 240 (30 días × 8 h).
 * Recargos:
 *   - Diurna (06:00–20:00):        +50%  → hora × 1,5
 *   - Nocturna (20:00–06:00):      +100% → hora × 2
 *   - Feriado / domingo (descanso): +100% → hora × 2
 *
 *   valorHora       = salarioMensual / 240
 *   valorHoraExtra  = valorHora × (1 + recargo)
 *   total           = valorHoraExtra × cantidadHoras
 *
 * Límite legal: 3 horas extra por día / 57 horas semanales (art. 198, 234).
 * Fuente: MTESS — Código del Trabajo (Ley 213/93), art. 234.
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026';

export interface Inputs {
  salarioMensual: number;                            // salario mensual en Gs.
  cantidadHoras: number;                             // cantidad de horas extra
  tipo?: 'diurna' | 'nocturna' | 'feriado-domingo';  // tipo de hora extra
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function calculadoraHorasExtrasParaguay(i: Inputs): Outputs {
  const l = PARAGUAY_2026.laboral;
  const salarioMensual = Number(i.salarioMensual) || 0;
  const cantidadHoras = Math.max(0, Number(i.cantidadHoras) || 0);
  const tipo = i.tipo === 'nocturna' || i.tipo === 'feriado-domingo' ? i.tipo : 'diurna';

  if (salarioMensual <= 0) throw new Error('Ingresá tu salario mensual');
  if (cantidadHoras <= 0) throw new Error('Ingresá la cantidad de horas extra');

  const recargoMap: Record<string, number> = {
    diurna: l.horaExtraDiurna,        // 0,50
    nocturna: l.horaExtraNocturna,    // 1,00
    'feriado-domingo': l.horaFeriadoDomingo, // 1,00
  };
  const labelMap: Record<string, string> = {
    diurna: 'diurna (+50%)',
    nocturna: 'nocturna (+100%)',
    'feriado-domingo': 'feriado / domingo (+100%)',
  };

  const recargo = recargoMap[tipo];
  const valorHora = salarioMensual / PARAGUAY_2026.horasMesEstandar; // /240
  const valorHoraExtra = valorHora * (1 + recargo);
  const total = valorHoraExtra * cantidadHoras;
  const recargoMonto = total - valorHora * cantidadHoras;

  const excedeLimiteDiario = cantidadHoras > 3;

  const _insight = {
    type: 'highlight',
    icon: '⏱️',
    text:
      `Tu hora ordinaria vale **${fmtPYG(valorHora)}** (salario ÷ 240). ` +
      `Con el recargo ${labelMap[tipo]}, cada hora extra se paga **${fmtPYG(valorHoraExtra)}**, ` +
      `así que ${cantidadHoras} hora(s) suman **${fmtPYG(total)}**.` +
      (excedeLimiteDiario
        ? ` ⚠️ La ley permite hasta **3 horas extra por día**; revisá si el excedente está habilitado.`
        : ''),
  };

  const _table = {
    title: 'Recargos de horas extra en Paraguay',
    headers: ['Tipo de hora', 'Recargo', 'Valor por hora'],
    rows: [
      ['Ordinaria (referencia)', '—', fmtPYG(valorHora)],
      ['Diurna (06–20 h)', '+50%', fmtPYG(valorHora * 1.5)],
      ['Nocturna (20–06 h)', '+100%', fmtPYG(valorHora * 2)],
      ['Feriado / domingo', '+100%', fmtPYG(valorHora * 2)],
    ],
    note: 'Código del Trabajo (Ley 213/93), art. 234. Valor hora = salario mensual ÷ 240 (30 días × 8 h). Tope: 3 horas extra por día.',
  };

  return {
    total: Math.round(total),
    valorHora: Math.round(valorHora),
    valorHoraExtra: Math.round(valorHoraExtra),
    recargoMonto: Math.round(recargoMonto),
    tipoLabel: labelMap[tipo],
    desglose: `${fmtPYG(valorHoraExtra)} × ${cantidadHoras} hora(s) ${labelMap[tipo]} = ${fmtPYG(total)}`,
    _insight,
    _table,
  };
}
