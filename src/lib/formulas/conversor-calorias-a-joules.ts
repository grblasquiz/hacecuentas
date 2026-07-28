/** Conversor: caloría ↔ joule */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorCaloriasAJoules(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 4.184;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'calorías'; toLabel = 'joules';
  } else {
    r = v / factor;
    fromLabel = 'joules'; toLabel = 'calorías';
  }
  const rFmt = r.toFixed(4).replace(/\.?0+$/, '');
  const _insight = {
    title: 'Caloría de física vs Caloría de comida',
    text: `**${v} ${fromLabel}** equivalen a **${rFmt} ${toLabel}** (1 cal = 4,184 J). Cuidado con las etiquetas de alimentos: la "Caloría" con mayúscula es en realidad una **kilocaloría** (1 kcal = 1000 cal), así que un alimento de 200 Cal aporta unos 836.800 J.`,
    tone: 'neutral',
    icon: '🍎',
  };

  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 'J' : "cal"),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
