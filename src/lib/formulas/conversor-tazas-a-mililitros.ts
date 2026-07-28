/** Conversor: taza ↔ mililitro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorTazasAMililitros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 236.588;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'tazas'; toLabel = 'mililitros';
  } else {
    r = v / factor;
    fromLabel = 'mililitros'; toLabel = 'tazas';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const vTxt = String(v);
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 'mL' : "tazas"),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'Equivalencia en taza estándar',
      text: 'Usamos la **taza estadounidense de 236,588 mL** (la de las recetas en inglés). Así, **' + vTxt + ' ' + fromLabel + '** equivalen a **' + rTxt + ' ' + toLabel + '**. Ojo: la "taza" de cocina latina suele ser de 250 mL, así que verificá qué medida pide tu receta.',
      tone: 'neutral',
      icon: '☕'
    }
  };
}
