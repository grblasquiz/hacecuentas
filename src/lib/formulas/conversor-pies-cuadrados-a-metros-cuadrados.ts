/** Conversor: pie cuadrado ↔ metro cuadrado */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorPiesCuadradosAMetrosCuadrados(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.092903;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'pies cuadrados'; toLabel = 'metros cuadrados';
  } else {
    r = v / factor;
    fromLabel = 'metros cuadrados'; toLabel = 'pies cuadrados';
  }
  const fmt = (n: number) => n.toFixed(4).replace(/\.?0+$/, '');
  // Anclamos siempre en m² con referencias de superficie habitual.
  const m2 = d === 'ida' ? r : v;
  let refTxt: string;
  if (m2 < 12) refTxt = 'el tamaño de **una habitación chica**';
  else if (m2 < 50) refTxt = 'cerca de **un monoambiente**';
  else if (m2 < 120) refTxt = 'el orden de **un departamento familiar**';
  else refTxt = 'una superficie de **casa o lote** (' + fmt(m2 / 50) + '× un monoambiente)';
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'm²'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + fmt(r) + ' ' + toLabel + '.',
    _insight: {
      title: 'Tamaño en contexto',
      text: 'Son **' + fmt(m2) + ' m²**, aproximadamente ' + refTxt + '. Ojo: en superficie el factor va al cuadrado, **1 ft² = 0,0929 m²** (no 0,3048).',
      tone: 'neutral',
      icon: '🏠'
    }
  };
}
