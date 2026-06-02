/** Conversor: megabit por segundo ↔ megabyte por segundo */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMbpsAMbS(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.125;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'megabits por segundo'; toLabel = 'megabytes por segundo';
  } else {
    r = v / factor;
    fromLabel = 'megabytes por segundo'; toLabel = 'megabits por segundo';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const mbps = d === 'ida' ? v : r;
  const mbPerSec = mbps * 0.125;
  const segGB = mbPerSec > 0 ? 1024 / mbPerSec : 0;
  const minGB = segGB / 60;
  const tiempoGB = minGB >= 1 ? minGB.toFixed(1).replace(/\.0$/, '') + ' min' : Math.round(segGB) + ' s';
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'MB/s'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'Tu velocidad real de bajada',
      text: 'Una conexión de **' + mbps + ' Mbps** baja en realidad a **' + mbPerSec.toFixed(2).replace(/\.?0+$/, '') + ' MB/s** (hay 8 bits en cada byte). A ese ritmo, **1 GB** tarda unos **' + tiempoGB + '** — por eso el número del plan parece más grande de lo que "se siente" al descargar.',
      tone: 'neutral',
      icon: '📶'
    }
  };
}
