/** Conversor: minuto ↔ segundo */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMinutosASegundos(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 60.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'minutos'; toLabel = 'segundos';
  } else {
    r = v / factor;
    fromLabel = 'segundos'; toLabel = 'minutos';
  }
  const rFmt = r.toFixed(6).replace(/\.?0+$/, '');
  const min = (d === 'ida' ? v : r);
  const minFmt = min.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const _insight = {
    title: 'Minutos en segundos',
    text: `**${v} ${fromLabel}** equivalen a **${rFmt} ${toLabel}**, porque cada minuto tiene 60 segundos. Esos **${minFmt} min** son ${min >= 60 ? `**${(min / 60).toLocaleString('es-AR', { maximumFractionDigits: 2 })} h**` : `algo más de ${minFmt} minutos`} — útil para ajustar timers, intervalos o tiempos de cocción al segundo.`,
    tone: 'neutral',
    icon: '⏲️',
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 's'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
