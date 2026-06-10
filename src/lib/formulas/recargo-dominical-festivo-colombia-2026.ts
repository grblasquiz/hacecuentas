/**
 * Recargo dominical y festivo Colombia 2026 — Ley 2466/2025 + CST arts. 179-180.
 * 80% hasta 30-jun-2026, 90% desde 01-jul-2026, 100% desde 01-jul-2027.
 * Valor hora con divisor 220 (jornada 44 h) hasta 14-jul-2026 y 210 (42 h) desde 15-jul-2026 (Ley 2101/2021).
 * El recargo nocturno (35%, 19:00-06:00) se ACUMULA con el dominical/festivo.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  salarioMensual: number;
  horas: number;
  fecha?: string;     // 'YYYY-MM-DD'; vacío = hoy
  nocturno?: string;  // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function num(v: unknown): number {
  if (v === '' || v === null || v === undefined) return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function hoyISO(): string {
  const t = new Date();
  const p = (x: number) => String(x).padStart(2, '0');
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
}

export function compute(i: Inputs): Outputs {
  const salario = num(i.salarioMensual);
  if (!(salario > 0)) throw new Error('Ingresá tu salario mensual en pesos');
  const horas = num(i.horas);
  if (!(horas > 0)) throw new Error('Ingresá las horas trabajadas ese domingo o festivo');
  if (horas > 24) throw new Error('Las horas de un mismo día no pueden superar 24');

  let fecha = String(i.fecha ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) fecha = hoyISO();
  const nocturno = String(i.nocturno ?? 'no') === 'si';

  const R = COLOMBIA_2026.recargos;
  const J = COLOMBIA_2026.jornada;

  // Recargo dominical/festivo según la fecha (comparación lexicográfica de ISO dates = orden cronológico)
  const recargoDom = fecha >= '2027-07-01'
    ? R.dominicalFestivoDesde01Jul2027
    : fecha >= '2026-07-01'
      ? R.dominicalFestivoDesde01Jul2026
      : R.dominicalFestivoHasta30Jun2026;

  // Divisor del valor hora según la fecha (Ley 2101/2021: 220 → 210 el 15-jul-2026)
  const divisor = fecha >= '2026-07-15' ? J.divisorMensualDesde15Jul2026 : J.divisorMensualHasta14Jul2026;

  const recargoNoct = nocturno ? R.nocturno : 0;
  const horaOrdinaria = salario / divisor;
  const factor = 1 + recargoDom + recargoNoct;
  const horaFestiva = horaOrdinaria * factor;
  const pagoTotal = horas * horaFestiva;
  const soloRecargo = horas * horaOrdinaria * (recargoDom + recargoNoct);

  // Línea de tiempo del MISMO día en cada etapa (con el divisor vigente en cada una):
  const p80 = horas * (salario / J.divisorMensualHasta14Jul2026) * (1 + R.dominicalFestivoHasta30Jun2026 + recargoNoct);
  const p90 = horas * (salario / J.divisorMensualDesde15Jul2026) * (1 + R.dominicalFestivoDesde01Jul2026 + recargoNoct);
  const p100 = horas * (salario / J.divisorMensualDesde15Jul2026) * (1 + R.dominicalFestivoDesde01Jul2027 + recargoNoct);

  const pctRecargo = Math.round((recargoDom + recargoNoct) * 100);
  const etiquetaRecargo = `${pctRecargo}% (${Math.round(recargoDom * 100)}% dominical/festivo${nocturno ? ' + 35% nocturno' : ''})`;
  const fmtHs = horas.toLocaleString('es-CO', { maximumFractionDigits: 2 });

  let _insight: any;
  if (recargoDom === R.dominicalFestivoHasta30Jun2026) {
    _insight = {
      title: 'Todavía te aplica el recargo del 80%',
      text: `Por **${fmtHs} horas** en domingo/festivo te pagan **${fmtCOP(pagoTotal)}** (cada hora vale **${fmtCOP(horaFestiva)}**, la ordinaria de ${fmtCOP(horaOrdinaria)} con recargo del ${pctRecargo}%). Ojo: desde el **1 de julio de 2026** el recargo sube al **90%** (Ley 2466 de 2025) y desde el 15 de julio la hora ordinaria también sube (divisor 210): ese mismo día pasará a valer **${fmtCOP(p90)}** (+${fmtCOP(p90 - pagoTotal)}).`,
      tone: 'warn' as const,
      icon: '🗓️',
    };
  } else if (recargoDom === R.dominicalFestivoDesde01Jul2026) {
    _insight = {
      title: 'Ya te aplica el recargo del 90%',
      text: `Por **${fmtHs} horas** en domingo/festivo te pagan **${fmtCOP(pagoTotal)}** (hora de **${fmtCOP(horaFestiva)}**, recargo del ${pctRecargo}%). Es la etapa intermedia de la Ley 2466 de 2025: desde **julio de 2027** el recargo llega al **100%** y el mismo día pasará a **${fmtCOP(p100)}**.`,
      tone: 'good' as const,
      icon: '🗓️',
    };
  } else {
    _insight = {
      title: 'Recargo pleno del 100%',
      text: `Por **${fmtHs} horas** en domingo/festivo te pagan **${fmtCOP(pagoTotal)}**: cada hora vale el doble de la ordinaria${nocturno ? ' más el 35% nocturno' : ''} (**${fmtCOP(horaFestiva)}**). Desde julio de 2027 rige el recargo definitivo de la Ley 2466 de 2025.`,
      tone: 'good' as const,
      icon: '🗓️',
    };
  }

  const _chart = {
    type: 'bar',
    data: {
      labels: ['80% (hasta 30-jun-2026)', '90% (jul-2026 a jun-2027)', '100% (desde jul-2027)'],
      datasets: [{ label: 'Pago por esas horas (COP)', data: [Math.round(p80), Math.round(p90), Math.round(p100)] }],
    },
    ariaLabel: `Pago por ${fmtHs} horas en domingo o festivo: ${fmtCOP(p80)} con recargo del 80%, ${fmtCOP(p90)} con 90% y ${fmtCOP(p100)} con 100%`,
  };

  return {
    pago_total: fmtCOP(pagoTotal),
    valor_hora_festiva: fmtCOP(horaFestiva),
    recargo_aplicado: etiquetaRecargo,
    solo_recargo: fmtCOP(soloRecargo),
    comparativa: `Hasta 30-jun-2026 (80%): ${fmtCOP(p80)} · Jul-2026 a jun-2027 (90%): ${fmtCOP(p90)} · Desde jul-2027 (100%): ${fmtCOP(p100)}`,
    detalle: `Hora ordinaria ${fmtCOP(horaOrdinaria)} (salario ÷ ${divisor}) × ${factor.toLocaleString('es-CO', { maximumFractionDigits: 2 })} de factor × ${fmtHs} h = ${fmtCOP(pagoTotal)}.`,
    _insight,
    _chart,
  };
}
