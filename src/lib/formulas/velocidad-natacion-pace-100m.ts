export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function velocidadNatacionPace100m(i: Inputs): Outputs {
  const m = Number(i.metros) || 100; const min = Number(i.minutos) || 0; const s = Number(i.segundos) || 0;
  const tSec = min * 60 + s;
  const paceSec = tSec / (m / 100);
  const mm = Math.floor(paceSec / 60); const ss = Math.round(paceSec % 60);
  return { paceMin100: `${mm}:${String(ss).padStart(2, '0')}`, resumen: `Pace ${mm}:${String(ss).padStart(2,'0')} por 100m.` };
}
