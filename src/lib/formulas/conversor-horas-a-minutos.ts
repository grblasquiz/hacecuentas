/** Conversor: hora ↔ minuto */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorHorasAMinutos(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 60.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'horas'; toLabel = 'minutos';
  } else {
    r = v / factor;
    fromLabel = 'minutos'; toLabel = 'horas';
  }
  const totalMin = d === 'ida' ? r : v;
  const absMin = Math.abs(totalMin);
  const hh = Math.floor(absMin / 60);
  const mm = Math.round(absMin - hh * 60);
  const desglose = hh > 0 ? (hh + ' h' + (mm > 0 ? ' ' + mm + ' min' : '')) : (mm + ' min');
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 'min' : "h"),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: {
      title: 'En horas y minutos',
      text: 'Esos **' + absMin.toLocaleString('es-AR', { maximumFractionDigits: 1 }) + ' minutos** son **' + desglose + '** en formato reloj. Recordá que cada hora tiene 60 minutos (no 100): por eso 1,5 h son 90 min y no 150.',
      tone: 'neutral',
      icon: '⏱️'
    }
  };
}
