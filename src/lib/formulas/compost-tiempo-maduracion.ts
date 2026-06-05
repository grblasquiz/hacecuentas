export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function compostTiempoMaduracion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v = String(i.volteo); const c = String(i.clima);
  // Lookup table based on composting science (EPA, Cornell, INTA)
  // Rows: clima (calido, templado, frio) — Cols: volteo (semanal, mensual, ninguno)
  const table: Record<string, Record<string, number>> = {
    calido:   { semanal: 2,  mensual: 3,  ninguno: 5  },
    templado: { semanal: 3,  mensual: 5,  ninguno: 6  },
    frio:     { semanal: 6,  mensual: 9,  ninguno: 12 },
  };
  const m = (table[c] ?? table.templado)[v] ?? 6;
  const resumen = __lang === 'en'
    ? `${m} months until compost is ready (turning: ${v}, climate: ${c}).`
    : `${m} meses para compost listo (volteo ${v}, clima ${c}).`;
  const fast = m <= 3;
  const _insight = __lang === 'en'
    ? {
        title: fast ? 'Fast maturation' : m <= 6 ? 'Average maturation' : 'Slow maturation',
        text: `With **${v}** turning in a **${c}** climate, your compost will be ready in about **${m} months**.${!fast ? ' Turning more often would speed it up.' : ''}`,
        tone: fast ? 'good' : m <= 6 ? 'neutral' : 'warn',
        icon: '🍂',
      }
    : {
        title: fast ? 'Maduración rápida' : m <= 6 ? 'Maduración media' : 'Maduración lenta',
        text: `Con volteo **${v}** y clima **${c}**, tu compost estará listo en unos **${m} meses**.${!fast ? ' Voltear más seguido lo aceleraría.' : ''}`,
        tone: fast ? 'good' : m <= 6 ? 'neutral' : 'warn',
        icon: '🍂',
      };
  return { meses: String(m), resumen, _insight };
}
