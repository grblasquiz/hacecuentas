/** Conversor: onza líquida ↔ mililitro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorOnzasLiquidasAMililitros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 29.5735;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'onzas líquidas'; toLabel = 'mililitros';
  } else {
    r = v / factor;
    fromLabel = 'mililitros'; toLabel = 'onzas líquidas';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  // Volumen expresado siempre en ml para dar una referencia de cocina/bar
  const ml = d === 'ida' ? r : v;
  let ref: string;
  if (ml <= 60) {
    ref = `Es tamaño de medida de bar: un trago/shot ronda los 30–45 ml.`;
  } else if (ml <= 270) {
    ref = `Cerca de una taza de cocina (240 ml) o un vaso chico.`;
  } else if (ml <= 600) {
    ref = `Equivale más o menos a una lata o botella individual de bebida.`;
  } else {
    ref = `Conviene pensarlo en litros: 1 oz líquida (EE.UU.) son 29,57 ml.`;
  }
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'mL'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'Para tu receta',
      text: `**${v} ${fromLabel}** equivalen a **${rTxt} ${toLabel}** (usando la onza líquida de EE.UU.; la británica son 28,41 ml). ${ref}`,
      tone: 'neutral',
      icon: '🥤'
    }
  };
}
