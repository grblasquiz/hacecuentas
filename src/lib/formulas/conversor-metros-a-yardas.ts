/** Conversor: metro ↔ yarda */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMetrosAYardas(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 1.09361;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'metros'; toLabel = 'yardas';
  } else {
    r = v / factor;
    fromLabel = 'yardas'; toLabel = 'metros';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const yardas = d === 'ida' ? r : v;
  const pies = yardas * 3;
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'yd'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'La yarda, casi un metro',
      text: '**' + v + ' ' + fromLabel + '** = **' + rTxt + ' ' + toLabel + '** (' + pies.toFixed(1).replace(/\.0$/, '') + ' pies, ya que **1 yarda = 3 pies**). La yarda es apenas **9 cm más larga que el metro**, así que para estimar rápido sirve la regla "1 metro ≈ 1 yarda larga".',
      tone: 'neutral',
      icon: '🏈'
    }
  };
}
