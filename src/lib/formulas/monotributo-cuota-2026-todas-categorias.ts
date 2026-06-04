import { componentes, fmtARS, type Cat, type Actividad } from '../data/monotributo-2026';
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

// Cuota mensual del monotributo por categoría — escala ARCA vigente (ver fuente única
// src/lib/data/monotributo-2026.ts). En 2026 servicios llega hasta K con cuota distinta a bienes.
export function monotributoCuota2026TodasCategorias(i: Inputs): Outputs {
  const c = (String(i.categoria || 'A').toUpperCase()) as Cat;
  const act: Actividad = String(i.actividad || 'servicios') === 'bienes' ? 'bienes' : 'servicios';
  const actLabel = act === 'bienes' ? 'venta de bienes' : 'servicios';
  const { total: t, integrado: ig, sipa: sp, obraSocial: os } = componentes(c, act);

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Impuesto integrado', value: ig },
      { label: 'Aportes SIPA', value: sp },
      { label: 'Obra social', value: os },
    ],
    prefix: '$',
    centerValue: fmtARS(t),
    centerLabel: 'Cuota/mes',
    ariaLabel: 'Composición de la cuota mensual: impuesto integrado, aportes SIPA y obra social',
  };
  const _insight = {
    title: 'Cómo se compone tu cuota',
    text: `La cuota de la categoría **${c}** (${actLabel}) es de **${fmtARS(t)}/mes** (escala ARCA 2026) e incluye tres componentes: impuesto integrado, aportes jubilatorios (SIPA) y obra social.`,
    tone: 'neutral',
    icon: '🧾',
  };
  return {
    cuota: fmtARS(t),
    integrado: fmtARS(ig),
    sipa: fmtARS(sp),
    resumen: `Categoría ${c} (${actLabel}): cuota total ${fmtARS(t)}/mes.`,
    _chart,
    _insight,
  };
}
