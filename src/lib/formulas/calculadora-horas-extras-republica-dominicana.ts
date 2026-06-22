/**
 * Horas extras y recargos — República Dominicana (Art. 203 y conexos, Código de Trabajo).
 *
 * El valor de la hora ordinaria es el salario mensual ÷ 191 (191 h/mes, divisor
 * universal de nómina). Sobre esa hora se aplican los recargos legales:
 *   - +35%  para las horas que exceden la jornada legal (44 h) hasta 68 h/semana.
 *   - +100% para las horas que exceden 68 h/semana.
 *   - +15%  por trabajo nocturno (9pm–7am). Es un recargo del salario ordinario y,
 *           cuando además es hora extra, se aplica ANTES del recargo extra (se
 *           acumulan: 1,15 × 1,35 ó 1,15 × 2).
 * Tope legal: 80 horas extra por trimestre.
 *
 * Datos y helpers desde la tabla maestra única.
 */
import {
  REPUBLICA_DOMINICANA_2026 as DO,
  valorHora,
  fmtDOP,
} from '../data/republica-dominicana-2026';

export interface Inputs {
  salarioMensual: number;
  cantidadHoras: number;
  /** Tipo de recargo. */
  tipo?: 'extra35' | 'extra100' | 'nocturno' | 'extra35nocturno' | 'extra100nocturno';
}

export interface Outputs {
  valorHora: number;
  recargoPct: number;
  valorHoraRecargada: number;
  totalHorasExtra: number;
  formula: string;
  explicacion: string;
  excedeTope: boolean;
  _insight?: any;
  _table?: any;
  _steps?: any;
}

const R = DO.laboral.recargos;

function factorPorTipo(tipo: string): { factor: number; pct: number; label: string } {
  switch (tipo) {
    case 'extra100':
      return { factor: 1 + R.extraMas68, pct: R.extraMas68 * 100, label: 'Hora extra sobre 68 h/semana (+100%)' };
    case 'nocturno':
      return { factor: 1 + R.nocturno, pct: R.nocturno * 100, label: 'Trabajo nocturno (+15%)' };
    case 'extra35nocturno':
      return { factor: (1 + R.nocturno) * (1 + R.extra44a68), pct: ((1 + R.nocturno) * (1 + R.extra44a68) - 1) * 100, label: 'Hora extra nocturna 44–68 h (+15% y +35%)' };
    case 'extra100nocturno':
      return { factor: (1 + R.nocturno) * (1 + R.extraMas68), pct: ((1 + R.nocturno) * (1 + R.extraMas68) - 1) * 100, label: 'Hora extra nocturna sobre 68 h (+15% y +100%)' };
    case 'extra35':
    default:
      return { factor: 1 + R.extra44a68, pct: R.extra44a68 * 100, label: 'Hora extra 44–68 h/semana (+35%)' };
  }
}

export function calculadoraHorasExtrasRepublicaDominicana(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual);
  const horas = Math.max(0, Number(i.cantidadHoras) || 0);
  const tipo = String(i.tipo || 'extra35');

  if (!salario || salario <= 0) throw new Error('Ingresá tu salario mensual en RD$');
  if (!horas || horas <= 0) throw new Error('Ingresá la cantidad de horas');

  const vh = valorHora(salario);
  const { factor, pct, label } = factorPorTipo(tipo);
  const valorHoraRecargada = vh * factor;
  const total = valorHoraRecargada * horas;
  const excedeTope = horas > R.maxExtraTrimestre;

  const formula = `Total = (salario ÷ 191) × ${factor.toFixed(2)} × ${horas} h = RD$${vh.toFixed(2)} × ${factor.toFixed(2)} × ${horas} = ${fmtDOP(total)}`;

  const explicacion = `${label}. La hora ordinaria vale RD$${vh.toFixed(2)} (salario mensual ÷ 191). Con el recargo, cada hora se paga RD$${valorHoraRecargada.toFixed(2)}. Por ${horas} hora${horas === 1 ? '' : 's'} cobrás ${fmtDOP(total)}.${excedeTope ? ' ⚠️ Superás el tope legal de 80 horas extra por trimestre (Art. 203).' : ''}`;

  const _steps = [
    { label: 'Valor hora ordinaria (mensual ÷ 191)', value: fmtDOP(vh) },
    { label: `Factor de recargo (+${Math.round(pct)}%)`, value: `× ${factor.toFixed(2)}` },
    { label: 'Valor hora con recargo', value: fmtDOP(valorHoraRecargada) },
    { label: `Total por ${horas} hora${horas === 1 ? '' : 's'}`, value: fmtDOP(total) },
  ];

  const _insight = {
    title: `Cada hora extra te paga ${fmtDOP(valorHoraRecargada)}`,
    text: `La hora ordinaria de RD$${vh.toFixed(2)} sube a **${fmtDOP(valorHoraRecargada)}** con el recargo de **+${Math.round(pct)}%**. Por **${horas} hora${horas === 1 ? '' : 's'}** el total es **${fmtDOP(total)}**.${excedeTope ? ' Ojo: el Código limita a 80 horas extra por trimestre.' : ''}`,
    tone: (excedeTope ? 'warn' : 'good') as 'warn' | 'good',
    icon: '⏱️',
  };

  const _table = {
    title: 'Recargos sobre la hora ordinaria (Art. 203)',
    headers: ['Tipo de hora', 'Recargo', 'Valor de la hora'],
    rows: [
      ['Ordinaria', '—', fmtDOP(vh)],
      ['Extra 44–68 h/semana', '+35%', fmtDOP(vh * (1 + R.extra44a68))],
      ['Extra sobre 68 h/semana', '+100%', fmtDOP(vh * (1 + R.extraMas68))],
      ['Nocturna (9pm–7am)', '+15%', fmtDOP(vh * (1 + R.nocturno))],
      ['Extra nocturna 44–68 h', '+15% y +35%', fmtDOP(vh * (1 + R.nocturno) * (1 + R.extra44a68))],
      ['Feriado trabajado', '+100%', fmtDOP(vh * (1 + R.diaFeriado))],
    ],
    note: 'Hora ordinaria = salario mensual ÷ 191. El recargo nocturno se acumula con el de hora extra. Tope: 80 horas extra por trimestre.',
  };

  return {
    valorHora: Math.round(vh * 100) / 100,
    recargoPct: Math.round(pct * 100) / 100,
    valorHoraRecargada: Math.round(valorHoraRecargada * 100) / 100,
    totalHorasExtra: Math.round(total * 100) / 100,
    formula,
    explicacion,
    excedeTope,
    _insight,
    _table,
    _steps,
  };
}
