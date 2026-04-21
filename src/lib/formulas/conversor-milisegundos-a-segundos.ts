/** Conversor: milisegundo ↔ segundo */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; }

export function conversorMilisegundosASegundos(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.001;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'milisegundos'; toLabel = 'segundos';
  } else {
    r = v / factor;
    fromLabel = 'segundos'; toLabel = 'milisegundos';
  }
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 's'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.'
  };
}
