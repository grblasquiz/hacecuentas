/** Calculadora de Energía Cinética — Ek = ½mv² */
export interface Inputs {
  masa: number;
  velocidad: number;
}
export interface Outputs {
  energiaJ: number;
  energiaKJ: number;
  energiaCal: number;
  formula: string;
}

export function energiaCineticaJoules(i: Inputs): Outputs {
  const m = Number(i.masa);
  const v = Number(i.velocidad);
  if (!m || m <= 0) throw new Error('La masa debe ser mayor a 0');
  if (v < 0) throw new Error('La velocidad no puede ser negativa');

  const ek = 0.5 * m * v * v;
  const ekKJ = ek / 1000;
  const ekCal = ek / 4.184;

  return {
    energiaJ: Number(ek.toFixed(2)),
    energiaKJ: Number(ekKJ.toFixed(4)),
    energiaCal: Number(ekCal.toFixed(2)),
    formula: `Ek = ½ × ${m} × ${v}² = ½ × ${m} × ${(v * v).toFixed(2)} = ${ek.toFixed(2)} J`,
  };
}
