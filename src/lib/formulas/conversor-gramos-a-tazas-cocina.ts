/** Conversor: gramo ↔ taza */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorGramosATazasCocina(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v) || v < 0) return { resultado: '—', resumen: 'Ingresá un valor válido.' };
  const d = String(i.direccion || 'ida');
  const ing = String(i.ingrediente || 'harina');
  const densidades: Record<string, number> = {
    harina: 125, azucar: 200, 'azucar-morena': 220, manteca: 227,
    arroz: 185, cacao: 85, agua: 240
  };
  const g_per_cup = densidades[ing] || 125;
  let r: number;
  let unit: string;
  if (d === 'ida') {
    r = v / g_per_cup;
    unit = 'cups';
  } else {
    r = v * g_per_cup;
    unit = 'g';
  }
  const ingNombre: Record<string, string> = {
    harina: 'harina', azucar: 'azúcar', 'azucar-morena': 'azúcar morena', manteca: 'manteca',
    arroz: 'arroz', cacao: 'cacao', agua: 'agua'
  };
  const nombre = ingNombre[ing] || ing;
  const tazasEq = d === 'ida' ? r : v;
  return {
    resultado: r.toFixed(3) + ' ' + unit,
    resumen: v + (d === 'ida' ? ' g' : ' cups') + ' de ' + ing + ' ≈ ' + r.toFixed(2) + ' ' + unit + '.',
    _insight: {
      title: 'La taza depende del ingrediente',
      text: 'Para **' + nombre + '** se toma **1 taza ≈ ' + g_per_cup + ' g**, así que tu equivalencia es **' + tazasEq.toFixed(2) + ' taza' + (Math.abs(tazasEq - 1) < 0.005 ? '' : 's') + '**. Como la taza mide volumen y no peso, el mismo número de tazas pesa distinto según el ingrediente: pesar en gramos siempre es más preciso.',
      tone: 'neutral',
      icon: '🥄'
    }
  };
}
