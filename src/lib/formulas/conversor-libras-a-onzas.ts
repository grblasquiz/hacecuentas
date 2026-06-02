/** Conversor: libra ↔ onza */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorLibrasAOnzas(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 16.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'libras'; toLabel = 'onzas';
  } else {
    r = v / factor;
    fromLabel = 'onzas'; toLabel = 'libras';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const _insight = {
    title: 'Onzas de peso (no líquidas)',
    text: d === 'ida'
      ? '**' + v + ' lb** equivalen a **' + rTxt + ' oz** (1 libra = 16 onzas). Son onzas de peso (avoirdupois), no la onza líquida (fl oz) que mide volumen.'
      : '**' + v + ' oz** son **' + rTxt + ' lb** (16 onzas = 1 libra). Acá hablamos de onzas de peso, distintas de la onza líquida de las bebidas.',
    tone: 'neutral',
    icon: '⚖️'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'oz'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight
  };
}
