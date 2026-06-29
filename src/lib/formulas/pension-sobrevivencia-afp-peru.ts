/**
 * Pensión de sobrevivencia / viudez AFP Perú — estimación REFERENCIAL.
 * Los porcentajes (cónyuge 42%/35%, hijo 14%, padres 14%) provienen de la
 * normativa del Sistema Privado de Pensiones (SPP) pero pueden variar según el
 * caso, la AFP y la SBS. NO es un cálculo definitivo: verificá con tu AFP/SBS.
 */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  remuneracionRef: number;     // remuneración de referencia (base del cálculo)
  conyuge?: string;            // 'si' | 'no'
  numHijos?: number;           // hijos con derecho
  padresDependientes?: string; // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const remRef = Number(i.remuneracionRef) || 0;
  const conConyuge = String(i.conyuge || 'no') === 'si';
  const numHijos = Math.max(0, Math.floor(Number(i.numHijos) || 0));
  const conPadres = String(i.padresDependientes || 'no') === 'si';
  if (remRef <= 0) throw new Error('Ingresá la remuneración de referencia');

  // Porcentajes REFERENCIALES del SPP:
  //  - Cónyuge: 42% sin hijos con derecho, 35% si hay hijos.
  //  - Cada hijo con derecho: 14%.
  //  - Padres dependientes: 14%.
  const pctConyuge = conConyuge ? (numHijos > 0 ? 0.35 : 0.42) : 0;
  const pctHijos = numHijos * 0.14;
  const pctPadres = conPadres ? 0.14 : 0;
  const pctTotal = Math.min(pctConyuge + pctHijos + pctPadres, 1.0);
  const pensionTotal = remRef * pctTotal;

  const partes: string[] = [];
  if (conConyuge) partes.push(`cónyuge ${(pctConyuge * 100).toFixed(0)}%`);
  if (numHijos > 0) partes.push(`${numHijos} hijo(s) × 14% = ${(pctHijos * 100).toFixed(0)}%`);
  if (conPadres) partes.push(`padres 14%`);
  const desglose = partes.length ? partes.join(' + ') : 'sin beneficiarios cargados';

  const _insight = {
    title: 'Estimación referencial de sobrevivencia',
    text: `Sobre una remuneración de referencia de **${fmtPEN(remRef)}**, los beneficiarios (${desglose}) suman un **${(pctTotal * 100).toFixed(0)}%**, lo que da una pensión total estimada de **${fmtPEN(pensionTotal)}** al mes. ⚠️ Estos porcentajes son **referenciales** del Sistema Privado de Pensiones y pueden variar según tu caso, tu AFP y la SBS. **Verificá el monto definitivo con tu AFP o la SBS** antes de tomar decisiones.`,
    tone: 'warn',
    icon: '⚠️',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cónyuge', value: Math.round(remRef * pctConyuge) },
      { label: 'Hijos', value: Math.round(remRef * pctHijos) },
      { label: 'Padres', value: Math.round(remRef * pctPadres) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(pensionTotal),
    centerLabel: 'Pensión total (estimada)',
    ariaLabel: `Pensión de sobrevivencia estimada ${fmtPEN(pensionTotal)} (${(pctTotal * 100).toFixed(0)}% de la remuneración de referencia).`,
  };

  return {
    pctTotal: (pctTotal * 100).toFixed(0) + ' %',
    pensionTotal: fmtPEN(pensionTotal),
    detalle: `${desglose} → ${(pctTotal * 100).toFixed(0)}% de ${fmtPEN(remRef)} = ${fmtPEN(pensionTotal)} (estimación referencial — verificá con tu AFP/SBS).`,
    _insight,
    _chart,
  };
}
