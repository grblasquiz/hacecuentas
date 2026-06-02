/** Conversor: cucharadita ↔ mililitro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorCucharaditasAMililitros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 4.929;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'cucharaditas'; toLabel = 'mililitros';
  } else {
    r = v / factor;
    fromLabel = 'mililitros'; toLabel = 'cucharaditas';
  }

  const cdtas = d === 'ida' ? v : r;
  const ml = d === 'ida' ? r : v;
  const insight = {
    title: 'Dosis y recetas',
    text: '**' + cdtas.toFixed(2).replace(/\.?0+$/, '') + ' cucharaditas** son **' + ml.toFixed(1).replace(/\.0$/, '') + ' mL**. Cada cucharadita de té equivale a unos **5 mL** (un tercio de una cucharada sopera), la medida estándar para jarabes y condimentos.',
    tone: 'neutral',
    icon: '🥄'
  };

  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'mL'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: insight
  };
}
