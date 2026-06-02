/** Conversor: quilate ↔ gramo */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorQuilatesAGramos(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.2;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'quilates'; toLabel = 'gramos';
  } else {
    r = v / factor;
    fromLabel = 'gramos'; toLabel = 'quilates';
  }
  const rStr = r.toFixed(4).replace(/\.?0+$/, '');
  const vStr = String(v);
  const mg = d === 'ida' ? (r * 1000) : null;
  const mgStr = mg !== null ? mg.toFixed(2).replace(/\.?0+$/, '') : '';
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'g'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rStr + ' ' + toLabel + '.',
    _insight: {
      title: 'Peso de gema, no pureza',
      text: '**' + vStr + ' ' + fromLabel + '** pesan **' + rStr + ' ' + toLabel + '**' + (mg !== null ? ' (**' + mgStr + ' mg**)' : '') + '. El quilate métrico es exactamente **0,2 g**; no lo confundas con el quilataje del oro (pureza en /24), que mide otra cosa.',
      tone: 'neutral',
      icon: '💎'
    }
  };
}
