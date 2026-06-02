/** Conversor: centímetro ↔ pulgada */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorCentimetrosAPulgadas(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.393701;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'centímetros'; toLabel = 'pulgadas';
  } else {
    r = v / factor;
    fromLabel = 'pulgadas'; toLabel = 'centímetros';
  }

  const cm = d === 'ida' ? v : r;
  const pulg = d === 'ida' ? r : v;
  const insight = {
    title: 'Equivalencia exacta',
    text: '**' + cm.toFixed(2).replace(/\.?0+$/, '') + ' cm** equivalen a **' + pulg.toFixed(3).replace(/\.?0+$/, '') + ' pulgadas**. La regla base es que **1 pulgada = 2,54 cm** exactos, así que para pasar de pulgadas a centímetros se multiplica por 2,54.',
    tone: 'neutral',
    icon: '📏'
  };

  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'in'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: insight
  };
}
