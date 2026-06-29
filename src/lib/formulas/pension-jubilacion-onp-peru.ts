/** Pensión de jubilación ONP (SNP) Perú — factor 35% a los 20 años de aporte,
 *  +2 puntos por año adicional con tope de 80% sobre la remuneración de referencia
 *  (promedio de las 36 mejores remuneraciones). Pensión mínima y máxima REFERENCIALES. */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  remuneracionRef: number;   // promedio de las 36 mejores remuneraciones
  aniosAporte: number;       // años de aporte al SNP
  conyuge?: string;          // 'si' (informativo: genera derecho a sobrevivencia)
  pensionMinima?: number;    // S/ — REFERENCIAL editable (default 600)
  pensionMaxima?: number;    // S/ — REFERENCIAL editable (default 1000)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const remRef = Number(i.remuneracionRef) || 0;
  const anios = Number(i.aniosAporte) || 0;
  const pMin = Number(i.pensionMinima) || 600;   // REFERENCIAL (DS 330-2025-EF, fuente secundaria)
  const pMax = Number(i.pensionMaxima) || 1000;  // REFERENCIAL
  if (remRef <= 0) throw new Error('Ingresá tu remuneración de referencia (promedio 36 mejores)');
  if (anios <= 0) throw new Error('Ingresá tus años de aporte');

  // Requisito mínimo: 20 años de aporte para tener derecho a pensión en el SNP.
  if (anios < 20) {
    const _insight = {
      title: 'Aún no calificás para pensión ONP',
      text: `Con **${anios} años** de aporte no alcanzás el **mínimo de 20 años** que exige el Sistema Nacional de Pensiones (ONP) para acceder a una pensión de jubilación. Te faltan **${20 - anios} años** de aportes.`,
      tone: 'warn',
      icon: '⛔',
    };
    return {
      factor: '0%',
      pensionBase: fmtPEN(0),
      pensionFinal: fmtPEN(0),
      detalle: `Con ${anios} años de aporte no se cumple el mínimo de 20 años exigido por la ONP. Sin derecho a pensión de jubilación.`,
      _insight,
    };
  }

  const factor = Math.min(0.35 + 0.02 * (anios - 20), 0.80);
  const pensionBase = remRef * factor;
  const pensionFinal = Math.min(Math.max(pensionBase, pMin), pMax);

  let topeNota = '';
  if (pensionBase < pMin) topeNota = `Tu pensión calculada (${fmtPEN(pensionBase)}) quedó por debajo del mínimo referencial, así que se eleva a ${fmtPEN(pMin)}.`;
  else if (pensionBase > pMax) topeNota = `Tu pensión calculada (${fmtPEN(pensionBase)}) supera el máximo referencial, así que se topea en ${fmtPEN(pMax)}.`;
  else topeNota = `Tu pensión queda entre el mínimo (${fmtPEN(pMin)}) y el máximo (${fmtPEN(pMax)}) referenciales.`;

  const _insight = {
    title: 'Tu pensión estimada de la ONP',
    text: `Con **${anios} años** de aporte tu factor es **${(factor * 100).toFixed(0)}%** (35% a los 20 años + 2 puntos por cada año extra, tope 80%). Sobre una remuneración de referencia de **${fmtPEN(remRef)}**, tu pensión es **${fmtPEN(pensionFinal)}**. ${topeNota} Los topes mínimo/máximo son **referenciales y editables**: verificá los montos vigentes con la ONP.`,
    tone: 'good',
    icon: '👵',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Pensión mensual', value: Math.round(pensionFinal) },
      { label: 'Resto remun. ref.', value: Math.round(Math.max(remRef - pensionFinal, 0)) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(pensionFinal),
    centerLabel: 'Pensión mensual',
    ariaLabel: `Pensión ONP estimada de ${fmtPEN(pensionFinal)} mensuales.`,
  };

  return {
    factor: `${(factor * 100).toFixed(0)}%`,
    pensionBase: fmtPEN(pensionBase),
    pensionFinal: fmtPEN(pensionFinal),
    detalle: `Factor ${(factor * 100).toFixed(0)}% × ${fmtPEN(remRef)} = ${fmtPEN(pensionBase)} → pensión final ${fmtPEN(pensionFinal)} (mín ${fmtPEN(pMin)} / máx ${fmtPEN(pMax)} referenciales).`,
    _insight,
    _chart,
  };
}
