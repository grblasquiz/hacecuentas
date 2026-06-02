/** Conversor: radián ↔ grado */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorRadianesAGrados(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 57.2958;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'radianes'; toLabel = 'grados';
  } else {
    r = v / factor;
    fromLabel = 'grados'; toLabel = 'radianes';
  }
  const rStr = r.toFixed(4).replace(/\.?0+$/, '');
  const vStr = String(v);
  const degForVuelta = d === 'ida' ? r : v;
  const turns = degForVuelta / 360;
  const turnsStr = turns.toFixed(2).replace(/\.?0+$/, '');
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + '°'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rStr + ' ' + toLabel + '.',
    _insight: {
      title: 'En vueltas de círculo',
      text: '**' + vStr + ' ' + fromLabel + '** equivalen a **' + rStr + ' ' + toLabel + '**, es decir **' + turnsStr + '** vueltas completas. La clave: **π rad = 180°**, así que un radián son unos 57,3°.',
      tone: 'neutral',
      icon: '📐'
    }
  };
}
