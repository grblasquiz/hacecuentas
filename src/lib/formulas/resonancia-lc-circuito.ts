export interface ResonanciaLcCircuitoInputs { l: number; unidadL: string; c: number; unidadC: string; r?: number; }
export interface ResonanciaLcCircuitoOutputs { fResonancia: string; angFrec: string; xL: string; xC: string; q: string; resumen: string; }

const ML: Record<string, number> = { nH: 1e-9, uH: 1e-6, mH: 1e-3, H: 1 };
const MC: Record<string, number> = { pF: 1e-12, nF: 1e-9, uF: 1e-6 };

function fmtHz(f: number): string { if (f >= 1e6) return (f/1e6).toFixed(3)+' MHz'; if (f >= 1e3) return (f/1e3).toFixed(2)+' kHz'; return f.toFixed(1)+' Hz'; }
function fmtOhm(o: number): string { if (o >= 1e3) return (o/1e3).toFixed(2)+' kΩ'; return o.toFixed(2)+' Ω'; }

export function resonanciaLcCircuito(i: ResonanciaLcCircuitoInputs): ResonanciaLcCircuitoOutputs {
  const l = Number(i.l) * (ML[i.unidadL] ?? 1e-6);
  const c = Number(i.c) * (MC[i.unidadC] ?? 1e-9);
  if (!l || l <= 0 || !c || c <= 0) throw new Error('Ingresá L y C');
  const fr = 1 / (2 * Math.PI * Math.sqrt(l * c));
  const omega = 2 * Math.PI * fr;
  const xL = omega * l; const xC = 1 / (omega * c);
  const r = Number(i.r ?? 0);
  const q = r > 0 ? Math.sqrt(l / c) / r : 0;
  return {
    fResonancia: fmtHz(fr), angFrec: (omega / 1e6).toFixed(3) + ' Mrad/s',
    xL: fmtOhm(xL), xC: fmtOhm(xC),
    q: r > 0 ? q.toFixed(1) : 'Ingresá R para calcular Q',
    resumen: `Resonancia a ${fmtHz(fr)}. XL = XC = ${fmtOhm(xL)} en el punto resonante.${r > 0 ? ' Factor Q = ' + q.toFixed(1) + '.' : ''}`
  };
}
