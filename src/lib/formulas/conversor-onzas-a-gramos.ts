/** Conversor: onza ↔ gramo */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorOnzasAGramos(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 28.349523125;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'onzas'; toLabel = 'gramos';
  } else {
    r = v / factor;
    fromLabel = 'gramos'; toLabel = 'onzas';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  // Masa expresada siempre en onzas para dar una referencia de cocina
  const oz = d === 'ida' ? v : r;
  let ref: string;
  if (oz <= 1.2) {
    ref = `Es la medida clásica de una porción individual (1 oz ≈ 28 g).`;
  } else if (oz <= 8.5) {
    ref = `En recetas, ronda lo que pesa una taza de muchos ingredientes secos.`;
  } else if (oz <= 16.5) {
    ref = `Cerca de una libra (16 oz = 453,6 g), unidad habitual de carnes y harinas.`;
  } else {
    ref = `Conviene pasarlo a libras o kilos: 1 onza son 28,35 g exactos.`;
  }
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'g'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'Para tu receta',
      text: `**${v} ${fromLabel}** equivalen a **${rTxt} ${toLabel}**. Se trata de la onza de peso (avoirdupois), no la onza líquida. ${ref}`,
      tone: 'neutral',
      icon: '⚖️'
    }
  };
}
