export interface ImpedanciaCircuitoRlcInputs { r: number; xL: number; xC: number; }
export interface ImpedanciaCircuitoRlcOutputs { z: string; fase: string; resumen: string; }
export function impedanciaCircuitoRlc(i: ImpedanciaCircuitoRlcInputs): ImpedanciaCircuitoRlcOutputs {
  const r = Number(i.r); const xL = Number(i.xL); const xC = Number(i.xC);
  const z = Math.sqrt(r*r + Math.pow(xL - xC, 2));
  const fase = Math.atan2(xL - xC, r) * 180 / Math.PI;
  return { z: z.toFixed(2) + ' Ω', fase: fase.toFixed(1) + '°',
    resumen: `Z = ${z.toFixed(2)} Ω, ángulo ${fase.toFixed(1)}°. ${fase > 5 ? 'Inductivo' : fase < -5 ? 'Capacitivo' : 'Cerca de resonancia'}.` };
}
