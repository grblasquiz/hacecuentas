export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function compostTiempoMaduracion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v = String(i.volteo); const c = String(i.clima);
  const base: Record<string, number> = { semanal: 2, mensual: 4, ninguno: 8 };
  const mult: Record<string, number> = { calido: 1, templado: 1.3, frio: 2 };
  const m = base[v] * mult[c];
  const resumen = __lang === 'en'
    ? `${m.toFixed(0)} months until compost is ready (turning: ${v}, climate: ${c}).`
    : `${m.toFixed(0)} meses para compost listo (volteo ${v}, clima ${c}).`;
  const fast = m <= 3;
  const _insight = __lang === 'en'
    ? {
        title: fast ? 'Fast maturation' : m <= 6 ? 'Average maturation' : 'Slow maturation',
        text: `With **${v}** turning in a **${c}** climate, your compost will be ready in about **${m.toFixed(0)} months**.${!fast ? ' Turning more often would speed it up.' : ''}`,
        tone: fast ? 'good' : m <= 6 ? 'neutral' : 'warn',
        icon: '🍂',
      }
    : {
        title: fast ? 'Maduración rápida' : m <= 6 ? 'Maduración media' : 'Maduración lenta',
        text: `Con volteo **${v}** y clima **${c}**, tu compost estará listo en unos **${m.toFixed(0)} meses**.${!fast ? ' Voltear más seguido lo aceleraría.' : ''}`,
        tone: fast ? 'good' : m <= 6 ? 'neutral' : 'warn',
        icon: '🍂',
      };
  return { meses: m.toFixed(1), resumen, _insight };
}
