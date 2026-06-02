/** Conversor: año ↔ día */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorAnosADias(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 365.25;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'años'; toLabel = 'días';
  } else {
    r = v / factor;
    fromLabel = 'días'; toLabel = 'años';
  }
  // Anchor: total de días equivalente en semanas (usa 365,25 para promediar bisiestos)
  const dias = d === 'ida' ? r : v;
  const semanas = dias / 7;
  const diasFmt = dias.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const semanasFmt = semanas.toLocaleString('es-AR', { maximumFractionDigits: semanas < 10 ? 1 : 0 });
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'd'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: {
      title: 'Cuánto tiempo es',
      text: 'Son **' + diasFmt + ' días**, equivalentes a unas **' + semanasFmt + ' semanas**. Se usa 365,25 días por año para promediar los bisiestos.',
      tone: 'neutral',
      icon: '📅'
    }
  };
}
