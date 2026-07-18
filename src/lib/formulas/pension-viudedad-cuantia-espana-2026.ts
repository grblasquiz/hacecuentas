/**
 * Pensión de viudedad (España) 2026 — cuantía según la base reguladora.
 * Cuantía = base reguladora × porcentaje (52% general · 60% ≥65 sin rentas · 70% con cargas familiares),
 * con garantía de pensión mínima 2026 y tope de pensión máxima.
 * Datos oficiales en src/lib/data/espana-2026.ts. Euros (es-ES), 14 pagas.
 */
import { PENSIONES_2026 } from '../data/espana-2026.ts';

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100) + ' €';

export interface Inputs {
  baseReguladora: number | string; // €/mes
  situacion?: string;              // 'cargas' | 'mayor65' | 'entre60y64' | 'menor60'
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const br = Number(i.baseReguladora) || 0;
  const situacion = ['cargas', 'mayor65', 'entre60y64', 'menor60'].includes(String(i.situacion)) ? String(i.situacion) : 'general';
  if (br <= 0) throw new Error('Introduce la base reguladora mensual del fallecido');

  const V = PENSIONES_2026.viudedad;
  const M = PENSIONES_2026.viudedadMinima2026;

  let pct = V.general;
  let minima = M.titularMenor60;
  let etiqueta = 'General (52%)';
  if (situacion === 'cargas') { pct = V.cargasFamiliares; minima = M.conCargas; etiqueta = 'Con cargas familiares (70%)'; }
  else if (situacion === 'mayor65') { pct = V.mayor65SinRentas; minima = M.titular65; etiqueta = '≥65 años, sin otras rentas (60%)'; }
  else if (situacion === 'entre60y64') { pct = V.general; minima = M.titular60a64; etiqueta = 'Entre 60 y 64 años (52%)'; }
  else if (situacion === 'menor60') { pct = V.general; minima = M.titularMenor60; etiqueta = 'Menor de 60 años (52%)'; }

  const calculada = br * (pct / 100);
  let mensual = calculada;
  let aplicaMinima = false;
  if (mensual < minima) { mensual = minima; aplicaMinima = true; }
  let aplicaMaxima = false;
  if (mensual > PENSIONES_2026.maximaMensual) { mensual = PENSIONES_2026.maximaMensual; aplicaMaxima = true; }

  const anual = mensual * 14;

  const _insight = {
    title: 'Tu pensión de viudedad',
    text: `Sobre una base reguladora de **${fmtEur(br)}/mes** y aplicando el **${pct}%** (${etiqueta}), la pensión sale a **${fmtEur(calculada)}**. ${aplicaMinima ? `Como queda por debajo de la mínima 2026 (${fmtEur(minima)}), se eleva a la **mínima garantizada de ${fmtEur(minima)}/mes**.` : aplicaMaxima ? `Se aplica el **tope de pensión máxima** (${fmtEur(PENSIONES_2026.maximaMensual)}/mes).` : `Cobrarías **${fmtEur(mensual)}/mes** en 14 pagas (${fmtEur(anual)}/año).`}`,
    tone: 'neutral',
    icon: '🕯️',
  };

  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Base reguladora', value: Math.round(br) },
      { label: `Pensión (${pct}%)`, value: Math.round(mensual) },
    ],
    ariaLabel: `Base reguladora ${fmtEur(br)} y pensión de viudedad ${fmtEur(mensual)} al mes.`,
  };

  return {
    cuantiaMensual: fmtEur(mensual),
    porcentajeAplicado: pct + '%',
    cuantiaAnual: fmtEur(anual),
    minimaGarantizada: fmtEur(minima),
    detalle: `${fmtEur(br)} × ${pct}% = ${fmtEur(calculada)}. ${aplicaMinima ? `Elevada a la mínima 2026 (${fmtEur(minima)}). ` : ''}${aplicaMaxima ? `Limitada a la máxima (${fmtEur(PENSIONES_2026.maximaMensual)}). ` : ''}Cuantía: ${fmtEur(mensual)}/mes × 14 = ${fmtEur(anual)}/año.`,
    _insight,
    _chart,
  };
}
