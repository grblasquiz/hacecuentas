/** Conversor: milisegundo ↔ segundo */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMilisegundosASegundos(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.001;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'milisegundos'; toLabel = 'segundos';
  } else {
    r = v / factor;
    fromLabel = 'segundos'; toLabel = 'milisegundos';
  }
  const rFmt = r.toFixed(6).replace(/\.?0+$/, '');
  const ms = (d === 'ida' ? v : r);
  const msFmt = ms.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const _insight = {
    title: 'En la escala del parpadeo',
    text: `**${v} ${fromLabel}** equivalen a **${rFmt} ${toLabel}** (1 s = 1.000 ms). Esos **${msFmt} ms** se sienten en lo cotidiano: un parpadeo dura ~100 ms y un ping de videojuego por debajo de 50 ms ya se considera bueno.`,
    tone: 'neutral',
    icon: '⏱️',
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 's' : "ms"),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
