/** Conversor: libra ↔ gramo */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorLibrasAGramos(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 453.592;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'libras'; toLabel = 'gramos';
  } else {
    r = v / factor;
    fromLabel = 'gramos'; toLabel = 'libras';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const _insight = {
    title: 'Equivalencia de peso',
    text: d === 'ida'
      ? '**' + v + ' lb** son **' + rTxt + ' g** (1 libra = 453,592 g). En recetas y etiquetas de EE.UU. esta es la libra estándar (avoirdupois).'
      : '**' + v + ' g** equivalen a **' + rTxt + ' lb**. Recordá que 1 libra son ~454 g, así que medio kilo es algo más de una libra.',
    tone: 'neutral',
    icon: '⚖️'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'g'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight
  };
}
