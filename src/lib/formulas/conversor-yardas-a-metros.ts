/** Conversor: yarda ↔ metro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorYardasAMetros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.9144;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'yardas'; toLabel = 'metros';
  } else {
    r = v / factor;
    fromLabel = 'metros'; toLabel = 'yardas';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const vTxt = String(v);
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'm'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'Una yarda ≈ un metro (casi)',
      text: 'La conversión es exacta: **1 yarda = 0,9144 m**. Por eso **' + vTxt + ' ' + fromLabel + '** dan **' + rTxt + ' ' + toLabel + '**. La yarda queda un **8,5 % corta** frente al metro, útil de recordar al comprar tela o medir un campo de fútbol americano (100 yd = 91,44 m).',
      tone: 'neutral',
      icon: '📏'
    }
  };
}
