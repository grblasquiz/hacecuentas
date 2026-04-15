/** Divisor de tensión resistivo: Vout = Vin × R2 / (R1 + R2) */
export interface Inputs { voltajeEntrada: number; r1Ohm: number; r2Ohm: number; }
export interface Outputs { voltajeSalida: number; factorDivision: number; corrienteCircuito: number; detalle: string; }

export function divisorTensionResistivo(i: Inputs): Outputs {
  const vin = Number(i.voltajeEntrada);
  const r1 = Number(i.r1Ohm);
  const r2 = Number(i.r2Ohm);

  if (!vin || vin <= 0) throw new Error('Ingresá el voltaje de entrada');
  if (!r1 || r1 <= 0) throw new Error('Ingresá la resistencia R1');
  if (!r2 || r2 <= 0) throw new Error('Ingresá la resistencia R2');

  const factor = r2 / (r1 + r2);
  const vout = vin * factor;
  const corrienteA = vin / (r1 + r2);
  const corrienteMa = corrienteA * 1000;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const fmtR = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    voltajeSalida: Number(vout.toFixed(3)),
    factorDivision: Number(factor.toFixed(4)),
    corrienteCircuito: Number(corrienteMa.toFixed(3)),
    detalle: `Vout = ${fmt.format(vin)}V × ${fmtR.format(r2)}Ω / (${fmtR.format(r1)}Ω + ${fmtR.format(r2)}Ω) = ${fmt.format(vout)}V. Factor: ${fmt.format(factor)}. Corriente: ${fmt.format(corrienteMa)} mA.`,
  };
}
