/**
 * Incapacidad permanente (España) — cuánto se cobra según el grado.
 * % de la base reguladora: parcial (indemnización 24 mensualidades), total 55% (75% cualificada),
 * absoluta 100%, gran invalidez 100% + complemento (mínimo 45% de la base reguladora).
 * Datos en src/lib/data/espana-2026.ts. Euros (es-ES), pensión en 14 pagas.
 */
import { INCAPACIDAD_PERMANENTE_2026 as IP } from '../data/espana-2026.ts';

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100) + ' €';

export interface Inputs {
  baseReguladora: number | string; // €/mes
  grado?: string;                  // 'parcial' | 'total' | 'total-cualificada' | 'absoluta' | 'gran-invalidez'
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const br = Number(i.baseReguladora) || 0;
  const grado = ['parcial', 'total', 'total-cualificada', 'absoluta', 'gran-invalidez'].includes(String(i.grado)) ? String(i.grado) : 'total';
  if (br <= 0) throw new Error('Introduce la base reguladora mensual');

  // Caso especial: incapacidad permanente PARCIAL → indemnización a tanto alzado
  if (grado === 'parcial') {
    const indemnizacion = br * IP.parcial.indemnizacionMensualidades;
    return {
      tipoPrestacion: 'Indemnización (pago único)',
      cuantiaMensual: '— (no es pensión mensual)',
      indemnizacionUnica: fmtEur(indemnizacion),
      cuantiaAnual: '—',
      detalle: `Incapacidad permanente parcial: indemnización de ${IP.parcial.indemnizacionMensualidades} mensualidades de la base reguladora = ${fmtEur(br)} × 24 = ${fmtEur(indemnizacion)} en un solo pago.`,
      _insight: {
        title: 'Incapacidad permanente parcial',
        text: `La parcial no da una pensión mensual, sino una **indemnización única de ${fmtEur(indemnizacion)}** (24 mensualidades de la base reguladora de ${fmtEur(br)}). Es compatible con seguir trabajando en tu profesión.`,
        tone: 'neutral',
        icon: '🦾',
      },
    };
  }

  let pct = IP.total.pct;
  let etiqueta = 'Total (55%)';
  let complemento = 0;
  if (grado === 'total-cualificada') { pct = IP.total.pctCualificada; etiqueta = 'Total cualificada (75%)'; }
  else if (grado === 'absoluta') { pct = IP.absoluta.pct; etiqueta = 'Absoluta (100%)'; }
  else if (grado === 'gran-invalidez') {
    pct = IP.granInvalidez.pct;
    etiqueta = 'Gran invalidez (100% + complemento)';
    complemento = br * (IP.granInvalidez.complementoMinPctBR / 100); // estimación del mínimo legal
  }

  const pension = br * (pct / 100);
  const mensualTotal = pension + complemento;
  const anual = mensualTotal * 14;

  const esExenta = grado === 'absoluta' || grado === 'gran-invalidez';

  const _insight = {
    title: 'Tu pensión de incapacidad permanente',
    text: `Con una base reguladora de **${fmtEur(br)}** y grado **${etiqueta}**, cobrarías **${fmtEur(mensualTotal)}/mes** en 14 pagas (${fmtEur(anual)}/año)${complemento > 0 ? `, incluido un complemento de gran invalidez estimado en ${fmtEur(complemento)} (mínimo legal del 45% de la base reguladora)` : ''}. ${esExenta ? 'La absoluta y la gran invalidez están **exentas de IRPF**.' : 'La incapacidad permanente total **tributa en el IRPF** como rendimiento del trabajo.'}`,
    tone: 'neutral',
    icon: '🦽',
  };

  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Base reguladora', value: Math.round(br) },
      { label: `Pensión (${pct}%)`, value: Math.round(mensualTotal) },
    ],
    ariaLabel: `Base reguladora ${fmtEur(br)} y pensión ${fmtEur(mensualTotal)} al mes.`,
  };

  return {
    tipoPrestacion: 'Pensión mensual',
    cuantiaMensual: fmtEur(mensualTotal),
    porcentajeAplicado: pct + '%',
    cuantiaAnual: fmtEur(anual),
    detalle: `${fmtEur(br)} × ${pct}% = ${fmtEur(pension)}${complemento > 0 ? ` + complemento ${fmtEur(complemento)}` : ''} = ${fmtEur(mensualTotal)}/mes × 14 = ${fmtEur(anual)}/año.`,
    _insight,
    _chart,
  };
}
