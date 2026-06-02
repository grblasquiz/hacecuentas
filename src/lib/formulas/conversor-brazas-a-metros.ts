/** Conversor: braza ↔ metro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorBrazasAMetros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 1.8288;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'brazas'; toLabel = 'metros';
  } else {
    r = v / factor;
    fromLabel = 'metros'; toLabel = 'brazas';
  }
  const rFmt = r.toFixed(4).replace(/\.?0+$/, '');
  const _insight = {
    title: 'De dónde sale la braza',
    text: `**${v} ${fromLabel}** equivalen a **${rFmt} ${toLabel}**, porque 1 braza son exactamente 1,8288 m (6 pies). Es la unidad clásica para medir profundidad del agua en náutica y pesca: si ves "10 brazas" en una carta marina, el fondo está a unos 18 metros.`,
    tone: 'neutral',
    icon: '⚓',
  };

  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'm'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
