/** Conversor: milla ↔ kilómetro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMillasAKilometros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 1.609344;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'millas'; toLabel = 'kilómetros';
  } else {
    r = v / factor;
    fromLabel = 'kilómetros'; toLabel = 'millas';
  }
  const rFmt = r.toFixed(6).replace(/\.?0+$/, '');
  const km = (d === 'ida' ? r : v);
  const kmFmt = km.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const _insight = {
    title: 'Ojo con la distancia real',
    text: `**${v} ${fromLabel}** son **${rFmt} ${toLabel}**: cada milla equivale a 1,609 km, así que en millas la distancia "parece" más corta de lo que es. Para referencia, **${kmFmt} km** es ${km >= 42.195 ? `más que un maratón (42 km)` : `el equivalente de un trayecto de ${kmFmt} km en ruta`}.`,
    tone: 'neutral',
    icon: '🚗',
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'km'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
