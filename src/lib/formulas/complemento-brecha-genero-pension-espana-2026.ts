/**
 * Complemento para la reducción de la brecha de género en la pensión (España) 2026.
 * Importe fijo por hijo/a: 36,90 €/mes (14 pagas = 516,60 €/año), máximo 4 hijos.
 * Se suma a la pensión de jubilación, incapacidad permanente o viudedad. Desde 2025 lo pueden
 * pedir hombres y mujeres (STJUE de 15-05-2025). Datos en src/lib/data/espana-2026.ts. Euros (es-ES).
 */
import { BRECHA_GENERO_2026 as BG } from '../data/espana-2026.ts';

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100) + ' €';

export interface Inputs {
  numeroHijos: number | string;
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const solicitados = Math.round(Number(i.numeroHijos) || 0);
  if (solicitados <= 0) throw new Error('Introduce el número de hijos o hijas (mínimo 1)');

  const hijos = Math.min(solicitados, BG.maxHijos);
  const mensual = BG.importeMensualPorHijo * hijos;
  const anual = BG.importeAnualPorHijo * hijos;
  const topado = solicitados > BG.maxHijos;

  const _insight = {
    title: 'Tu complemento de brecha de género',
    text: `Con **${hijos} hijo(s)** computables, el complemento suma **${fmtEur(mensual)}/mes** a tu pensión (${fmtEur(anual)}/año en 14 pagas), a razón de ${fmtEur(BG.importeMensualPorHijo)} por hijo. ${topado ? `El complemento tiene un **tope de 4 hijos**, así que aunque tengas ${solicitados} se computan 4.` : 'Se suma a la pensión de jubilación, incapacidad permanente o viudedad.'}`,
    tone: 'good',
    icon: '👶',
  };

  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Al mes', value: Math.round(mensual * 100) / 100 },
      { label: 'Al año (14 pagas)', value: Math.round(anual * 100) / 100 },
    ],
    ariaLabel: `Complemento de ${fmtEur(mensual)} al mes y ${fmtEur(anual)} al año.`,
  };

  return {
    importeMensual: fmtEur(mensual),
    importeAnual: fmtEur(anual),
    hijosComputados: String(hijos),
    detalle: `${fmtEur(BG.importeMensualPorHijo)} × ${hijos} hijo(s) = ${fmtEur(mensual)}/mes. × 14 pagas = ${fmtEur(anual)}/año.${topado ? ` (Solicitados ${solicitados}, tope 4.)` : ''}`,
    _insight,
    _chart,
  };
}
