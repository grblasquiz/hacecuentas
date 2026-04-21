/** Conversor: galón ↔ litro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; }

export function conversorGalonesALitros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 3.785411784;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'galones'; toLabel = 'litros';
  } else {
    r = v / factor;
    fromLabel = 'litros'; toLabel = 'galones';
  }
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'L'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.'
  };
}
