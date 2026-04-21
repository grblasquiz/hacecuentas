/** Conversor: metro cuadrado ↔ ladrillo */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; }

export function conversorLadrillosPorMetroCuadrado(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 65.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'metros cuadrados'; toLabel = 'ladrillos';
  } else {
    r = v / factor;
    fromLabel = 'ladrillos'; toLabel = 'metros cuadrados';
  }
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'ladrillos'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.'
  };
}
