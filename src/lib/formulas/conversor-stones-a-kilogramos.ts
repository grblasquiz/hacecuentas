/** Conversor: stone ↔ kilogramo */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorStonesAKilogramos(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 6.35029318;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'stones'; toLabel = 'kilogramos';
  } else {
    r = v / factor;
    fromLabel = 'kilogramos'; toLabel = 'stones';
  }
  const rStr = r.toFixed(4).replace(/\.?0+$/, '');
  const vStr = String(v);
  const stones = d === 'ida' ? v : r;
  const lb = stones * 14;
  const lbStr = lb.toFixed(1).replace(/\.?0+$/, '');
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'kg'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rStr + ' ' + toLabel + '.',
    _insight: {
      title: 'La unidad de la balanza británica',
      text: '**' + vStr + ' ' + fromLabel + '** son **' + rStr + ' ' + toLabel + '**. El stone, usado para pesar personas en Reino Unido, equivale a **14 libras** (acá serían **' + lbStr + ' lb**) o unos 6,35 kg.',
      tone: 'neutral',
      icon: '⚖️'
    }
  };
}
