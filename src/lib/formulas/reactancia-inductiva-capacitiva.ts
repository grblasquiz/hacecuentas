export interface ReactanciaInductivaCapacitivaInputs { modo: string; f: number; l?: number; c?: number; }
export interface ReactanciaInductivaCapacitivaOutputs { xL: string; xC: string; ratio: string; resumen: string; }

function fmtOhm(o: number): string { if (o >= 1e6) return (o/1e6).toFixed(2)+' MΩ'; if (o >= 1e3) return (o/1e3).toFixed(2)+' kΩ'; return o.toFixed(2)+' Ω'; }

export function reactanciaInductivaCapacitiva(i: ReactanciaInductivaCapacitivaInputs): ReactanciaInductivaCapacitivaOutputs {
  const f = Number(i.f); if (!f || f <= 0) throw new Error('Ingresá frecuencia');
  const l = Number(i.l ?? 0) * 1e-3; // mH → H
  const c = Number(i.c ?? 0) * 1e-6; // µF → F
  const xL = l > 0 ? 2 * Math.PI * f * l : 0;
  const xC = c > 0 ? 1 / (2 * Math.PI * f * c) : 0;
  const ratio = (xL > 0 && xC > 0) ? (xL / xC).toFixed(3) : 'N/A';
  let resumen = `A ${f} Hz:`;
  if (l > 0) resumen += ` XL = ${fmtOhm(xL)}.`;
  if (c > 0) resumen += ` XC = ${fmtOhm(xC)}.`;
  if (l > 0 && c > 0) {
    if (xL > xC) resumen += ' Circuito domina inductivamente.';
    else if (xC > xL) resumen += ' Circuito domina capacitivamente.';
    else resumen += ' Circuito en resonancia.';
  }
  return {
    xL: l > 0 ? fmtOhm(xL) : 'Ingresá L',
    xC: c > 0 ? fmtOhm(xC) : 'Ingresá C',
    ratio, resumen
  };
}
