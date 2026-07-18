/**
 * Cuota de compensación militar (libreta militar) — Colombia 2026.
 * La cuota es un % del SMLMV según la situación socioeconómica del ciudadano que no prestó servicio:
 * 5% (sin ingresos), 15% (ingresos hasta 2 SMLMV), 25% (2–4 SMLMV), 50% (más de 4 SMLMV).
 * Exentos: víctimas del conflicto (RUV), Sisbén en pobreza extrema y personas con discapacidad permanente.
 * Porcentajes y SMLMV importados de la data país (NO hardcodear).
 */
import { COLOMBIA_2026, LIBRETA_MILITAR_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  situacion: 'sin_ingresos' | 'hasta_2_smlmv' | 'de_2_a_4_smlmv' | 'mas_4_smlmv';
  exencion: 'ninguna' | 'victima_ruv' | 'sisben_pobreza_extrema' | 'discapacidad';
}
export interface Outputs { [k: string]: any; _insight?: any; }

const LABELS: Record<string, string> = {
  sin_ingresos: 'sin ingresos económicos',
  hasta_2_smlmv: 'ingresos de hasta 2 SMLMV',
  de_2_a_4_smlmv: 'ingresos entre 2 y 4 SMLMV',
  mas_4_smlmv: 'ingresos superiores a 4 SMLMV',
};

export function compute(i: Inputs): Outputs {
  const smlmv = COLOMBIA_2026.smlmv;
  const L = LIBRETA_MILITAR_2026;

  const exento = i.exencion && i.exencion !== 'ninguna';
  const pct = i.situacion === 'sin_ingresos' ? L.sinIngresos
    : i.situacion === 'de_2_a_4_smlmv' ? L.de2a4Smlmv
    : i.situacion === 'mas_4_smlmv' ? L.mas4Smlmv
    : L.hasta2Smlmv;
  const cuota = exento ? 0 : Math.round(smlmv * pct);

  const motivoExencion = i.exencion === 'victima_ruv' ? 'víctima del conflicto armado registrada en el RUV'
    : i.exencion === 'sisben_pobreza_extrema' ? 'persona en pobreza extrema según Sisbén IV'
    : i.exencion === 'discapacidad' ? 'persona con discapacidad física o mental permanente certificada'
    : '';

  const _insight = exento
    ? {
        title: 'Estás exento de la cuota de compensación militar',
        text: `Como **${motivoExencion}**, la ley te exime de pagar la cuota de compensación militar: tramitas la libreta **gratis** (en algunos distritos militares solo cobran la elaboración física del carné). Lleva el soporte de tu condición al distrito militar.`,
        tone: 'good',
        icon: '🪖',
      }
    : {
        title: `Tu cuota de compensación: ${fmtCOP(cuota)}`,
        text: `Con **${LABELS[i.situacion] ?? LABELS.hasta_2_smlmv}**, la cuota de compensación militar 2026 es el **${(pct * 100).toLocaleString('es-CO')}% del SMLMV** (${fmtCOP(smlmv)}): **${fmtCOP(cuota)}**. La liquidación oficial la hace el distrito militar con la declaración de tu situación socioeconómica; a la cuota se le suma la elaboración del carné.`,
        tone: 'neutral',
        icon: '🪖',
      };

  return {
    cuota_compensacion: fmtCOP(cuota) + (exento ? ' (exento)' : ''),
    porcentaje_aplicado: exento ? '0% (exención legal)' : `${(pct * 100).toLocaleString('es-CO')}% del SMLMV`,
    base_smlmv: fmtCOP(smlmv),
    detalle: exento
      ? `Exención por ${motivoExencion}: cuota $0. Solo podrías pagar la elaboración física del carné.`
      : `${(pct * 100).toLocaleString('es-CO')}% × SMLMV 2026 (${fmtCOP(smlmv)}) = ${fmtCOP(cuota)}.`,
    _insight,
  };
}
