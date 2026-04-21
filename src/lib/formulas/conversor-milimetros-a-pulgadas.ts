/** Conversor: milímetro ↔ pulgada */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; }

export function conversorMilimetrosAPulgadas(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.0393701;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'milímetros'; toLabel = 'pulgadas';
  } else {
    r = v / factor;
    fromLabel = 'pulgadas'; toLabel = 'milímetros';
  }
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'in'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.'
  };
}
