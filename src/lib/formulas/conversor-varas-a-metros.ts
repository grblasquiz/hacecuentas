/** Conversor: vara ↔ metro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorVarasAMetros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.8359;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'varas'; toLabel = 'metros';
  } else {
    r = v / factor;
    fromLabel = 'metros'; toLabel = 'varas';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const vTxt = String(v);
  const unitLabel = d === 'ida' ? 'm' : 'varas';
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + unitLabel,
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'La vara no es universal',
      text: 'Usamos la **vara de 0,8359 m** (la castellana, común en títulos de propiedad viejos). Así **' + vTxt + ' ' + fromLabel + '** equivalen a **' + rTxt + ' ' + toLabel + '**. Cuidado: cada región tenía su vara (la mexicana mide 0,838 m, otras varían), revisá la escritura antes de medir un terreno.',
      tone: 'warn',
      icon: '📏'
    }
  };
}
