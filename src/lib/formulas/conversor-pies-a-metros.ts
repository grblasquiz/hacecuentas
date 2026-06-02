/** Conversor: pie ↔ metro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorPiesAMetros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.3048;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'pies'; toLabel = 'metros';
  } else {
    r = v / factor;
    fromLabel = 'metros'; toLabel = 'pies';
  }
  const fmt = (n: number) => n.toFixed(4).replace(/\.?0+$/, '');
  // Referencia tangible: lo expresamos siempre en metros para anclar la intuición.
  const metros = d === 'ida' ? r : v;
  const pisos = metros / 3;
  let refTxt: string;
  if (metros < 1) refTxt = 'menos que **el alto de una mesa**';
  else if (metros < 2) refTxt = 'aproximadamente **la altura de una persona**';
  else if (metros < 3) refTxt = 'algo más que **el alto de una habitación**';
  else refTxt = 'cerca de **' + fmt(pisos) + ' pisos** de un edificio (≈3 m cada uno)';
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'm'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + fmt(r) + ' ' + toLabel + '.',
    _insight: {
      title: 'En la práctica',
      text: 'Tu medida equivale a **' + fmt(metros) + ' m**, ' + refTxt + '. El factor exacto es **1 pie = 0,3048 m** (definición internacional).',
      tone: 'neutral',
      icon: '📏'
    }
  };
}
