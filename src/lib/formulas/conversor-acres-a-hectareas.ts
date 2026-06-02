/** Conversor: acre ↔ hectárea */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorAcresAHectareas(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.404686;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'acres'; toLabel = 'hectáreas';
  } else {
    r = v / factor;
    fromLabel = 'hectáreas'; toLabel = 'acres';
  }
  // Anchor de escala: superficie en hectáreas y equivalente en canchas de fútbol (~0,714 ha c/u)
  const ha = d === 'ida' ? r : v;
  const canchas = ha / 0.714;
  const canchasFmt = canchas.toLocaleString('es-AR', { maximumFractionDigits: canchas < 10 ? 1 : 0 });
  const haFmt = ha.toLocaleString('es-AR', { maximumFractionDigits: 4 });
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'ha'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: {
      title: 'Cuánto terreno es',
      text: 'Equivalen a **' + haFmt + ' ha**, es decir unas **' + canchasFmt + ' canchas de fútbol** (cada cancha ronda 0,71 ha). 1 acre = 0,4047 ha.',
      tone: 'neutral',
      icon: '🌾'
    }
  };
}
