/**
 * Reducción de jornada a 42 horas Colombia — Ley 2101/2021, último escalón el 15-jul-2026.
 * La jornada máxima baja de 44 a 42 h/semana SIN reducción de salario: el divisor del
 * valor hora pasa de 220 a 210, así cada hora ordinaria sube ~4,76%.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  salarioMensual: number;
  jornadaActual?: string;  // '44' (legal hoy) | '46' | '47' | '48'
  distribucion?: string;   // '5' | '6' días por semana
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function num(v: unknown): number {
  if (v === '' || v === null || v === undefined) return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export function compute(i: Inputs): Outputs {
  const salario = num(i.salarioMensual);
  if (!(salario > 0)) throw new Error('Ingresá tu salario mensual en pesos');

  const J = COLOMBIA_2026.jornada;
  const jorRaw = String(i.jornadaActual ?? '').trim();
  const jornadaActual = ['44', '46', '47', '48'].includes(jorRaw) ? Number(jorRaw) : J.horasSemanaHasta14Jul2026;
  const dias = String(i.distribucion ?? '5') === '6' ? 6 : 5;

  // Divisor mensual: 220 para la jornada legal de 44 h; para jornadas viejas (46/47/48) = horas × 5.
  const divisorActual = jornadaActual === J.horasSemanaHasta14Jul2026
    ? J.divisorMensualHasta14Jul2026
    : jornadaActual * 5;
  const jornadaNueva = J.horasSemanaDesde15Jul2026; // 42 h
  const divisorNuevo = J.divisorMensualDesde15Jul2026; // 210

  const horaActual = salario / divisorActual;
  const horaNueva = salario / divisorNuevo;
  const difHora = horaNueva - horaActual;
  const pctAumento = (horaNueva / horaActual - 1) * 100;

  const menosSemana = jornadaActual - jornadaNueva;
  const menosMes = menosSemana * 52 / 12;
  const menosAnio = menosSemana * 52;
  const horasPorDia = jornadaNueva / dias; // 8,4 (5 días) o 7 (6 días)

  const fmt1 = (n: number) => n.toLocaleString('es-CO', { maximumFractionDigits: 1 });
  const fmt2 = (n: number) => n.toLocaleString('es-CO', { maximumFractionDigits: 2 });

  const _insight = {
    title: 'Tu salario no baja: tu hora vale más',
    text: `Desde el **15 de julio de 2026** la jornada máxima pasa de ${jornadaActual} a **42 horas semanales** (Ley 2101 de 2021) con el mismo salario de **${fmtCOP(salario)}**. Tu hora ordinaria sube de **${fmtCOP(horaActual)}** a **${fmtCOP(horaNueva)}** (+${fmt2(pctAumento)}%), y trabajás **${fmt1(menosSemana)} h menos por semana** (~${fmt1(menosMes)} h al mes, ${fmt1(menosAnio)} h al año). En ${dias} días de trabajo, la jornada diaria queda en **${fmt1(horasPorDia)} horas**.`,
    tone: 'good' as const,
    icon: '⏰',
  };

  const _chart = {
    type: 'bar',
    data: {
      labels: [`Hoy (${jornadaActual} h/sem)`, 'Desde 15-jul-2026 (42 h/sem)'],
      datasets: [{ label: 'Valor de la hora ordinaria (COP)', data: [Math.round(horaActual), Math.round(horaNueva)] }],
    },
    ariaLabel: `Valor hora ordinaria: ${fmtCOP(horaActual)} con jornada de ${jornadaActual} horas y ${fmtCOP(horaNueva)} con jornada de 42 horas`,
  };

  return {
    hora_nueva: fmtCOP(horaNueva),
    hora_actual: fmtCOP(horaActual),
    aumento_hora: `+${fmt2(pctAumento)}% (+${fmtCOP(difHora)} por hora)`,
    jornada_nueva: `42 h/semana — ${fmt1(horasPorDia)} h/día en ${dias} días`,
    tiempo_liberado: `${fmt1(menosSemana)} h menos por semana (~${fmt1(menosMes)} h/mes, ${fmt1(menosAnio)} h/año)`,
    detalle: `Valor hora = salario ÷ divisor: ${fmtCOP(salario)} ÷ ${divisorActual} = ${fmtCOP(horaActual)} hoy; ${fmtCOP(salario)} ÷ ${divisorNuevo} = ${fmtCOP(horaNueva)} desde el 15-jul-2026. El salario mensual no cambia.`,
    _insight,
    _chart,
  };
}
