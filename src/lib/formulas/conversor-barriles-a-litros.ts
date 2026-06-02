/** Conversor: barril ↔ litro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorBarrilesALitros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 158.987;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'barriles'; toLabel = 'litros';
  } else {
    r = v / factor;
    fromLabel = 'litros'; toLabel = 'barriles';
  }
  // Anchor: volumen en litros y equivalente en bidones de 20 L
  const litros = d === 'ida' ? r : v;
  const bidones = litros / 20;
  const litrosFmt = litros.toLocaleString('es-AR', { maximumFractionDigits: 3 });
  const bidonesFmt = bidones.toLocaleString('es-AR', { maximumFractionDigits: bidones < 10 ? 1 : 0 });
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'L'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: {
      title: 'Cuánto volumen es',
      text: 'Son **' + litrosFmt + ' litros**, equivalentes a unos **' + bidonesFmt + ' bidones** de 20 L. El barril de petróleo estándar son 158,987 L (42 galones).',
      tone: 'neutral',
      icon: '🛢️'
    }
  };
}
