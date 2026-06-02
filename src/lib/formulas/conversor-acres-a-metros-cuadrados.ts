/** Conversor: acre ↔ metro cuadrado */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorAcresAMetrosCuadrados(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 4046.86;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'acres'; toLabel = 'metros cuadrados';
  } else {
    r = v / factor;
    fromLabel = 'metros cuadrados'; toLabel = 'acres';
  }
  // Anchor: superficie en m² y equivalente en departamentos tipo de 50 m²
  const m2 = d === 'ida' ? r : v;
  const deptos = m2 / 50;
  const deptosFmt = deptos.toLocaleString('es-AR', { maximumFractionDigits: deptos < 10 ? 1 : 0 });
  const m2Fmt = m2.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'm²'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: {
      title: 'Cuánta superficie es',
      text: 'Son **' + m2Fmt + ' m²**, equivalentes a unos **' + deptosFmt + ' departamentos** de 50 m². 1 acre = 4.046,86 m².',
      tone: 'neutral',
      icon: '📐'
    }
  };
}
