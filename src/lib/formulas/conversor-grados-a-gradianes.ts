/** Conversor: grado ↔ gradián */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; }

export function conversorGradosAGradianes(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 1.11111;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'grados'; toLabel = 'gradianes';
  } else {
    r = v / factor;
    fromLabel = 'gradianes'; toLabel = 'grados';
  }
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'gon'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.'
  };
}
