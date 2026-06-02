export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function conversionOnzaGramoCocina(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 28.3495;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'oz' : 'g';
  const toU = u === 'a' ? 'g' : 'oz';
  const rStr = r.toFixed(4).replace(/\.?0+$/, '');
  return {
    resultado: rStr + ' ' + toU,
    resumen: `${v} ${fromU} = ${rStr} ${toU}.`,
    _insight: {
      title: 'Onza de cocina = onza de peso',
      text: `**${v} ${fromU}** equivalen a **${rStr} ${toU}**, con 1 oz = 28,35 g (onza avoirdupois). No la confundas con la **onza líquida (fl oz)**, que mide volumen (~29,57 ml) y no sirve para pesar ingredientes secos.`,
      tone: 'neutral',
      icon: '⚖️',
    },
  };
}
