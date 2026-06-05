/** Conversor: año luz ↔ kilómetro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorAnosLuzAKilometros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 9460730472580.8;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'años luz'; toLabel = 'kilómetros';
  } else {
    r = v / factor;
    fromLabel = 'kilómetros'; toLabel = 'años luz';
  }
  // Anchor: distancia en años luz y comparación con la estrella más cercana (Próxima Centauri, 4,24 al)
  const al = d === 'ida' ? v : r;
  const proxima = al / 4.24;
  const alFmt = al.toLocaleString('es-AR', { maximumFractionDigits: 4 });
  const proximaFmt = proxima.toLocaleString('es-AR', { maximumFractionDigits: proxima < 10 ? 2 : 0 });
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'km'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: {
      title: 'Qué tan lejos es',
      text: 'Esa distancia es lo que la luz recorre en **' + alFmt + ' años**, unas **' + proximaFmt + ' veces** el viaje hasta Próxima Centauri, la estrella más cercana (4,24 años luz). 1 año luz ≈ 9,461 billones de km.',
      tone: 'neutral',
      icon: '🌌'
    }
  };
}
