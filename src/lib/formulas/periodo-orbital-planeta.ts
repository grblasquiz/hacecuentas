/** Calculadora Período Orbital — T² = 4π²a³/(GM) */
export interface Inputs { semiejeMayor: number; masaCentral: number; }
export interface Outputs { periodoS: string; periodoDias: number; periodoAnos: number; formula: string; }

export function periodoOrbitalPlaneta(i: Inputs): Outputs {
  const a = Number(i.semiejeMayor);
  const M = Number(i.masaCentral);
  if (a <= 0) throw new Error('El semieje mayor debe ser mayor a 0');
  if (M <= 0) throw new Error('La masa central debe ser mayor a 0');

  const G = 6.674e-11;
  const T = 2 * Math.PI * Math.sqrt(a * a * a / (G * M));
  const dias = T / 86400;
  const anos = T / (365.25 * 86400);

  let periodoStr: string;
  if (T < 86400) periodoStr = `${(T / 3600).toFixed(2)} horas`;
  else if (T < 365.25 * 86400) periodoStr = `${dias.toFixed(2)} días`;
  else periodoStr = `${anos.toFixed(4)} años (${dias.toFixed(0)} días)`;

  return {
    periodoS: periodoStr,
    periodoDias: Number(dias.toFixed(4)),
    periodoAnos: Number(anos.toFixed(6)),
    formula: `T = 2π√(${a.toExponential(3)}³ / (${G.toExponential(3)} × ${M.toExponential(3)})) = ${T.toFixed(0)} s`,
  };
}
