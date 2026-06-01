/** Calculadora Período Orbital — T² = 4π²a³/(GM) */
export interface Inputs { semiejeMayor: number; masaCentral: number; __lang?: string; }
export interface Outputs { periodoS: string; periodoDias: number; periodoAnos: number; formula: string; }

export function periodoOrbitalPlaneta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const a = Number(i.semiejeMayor);
  const M = Number(i.masaCentral);
  if (a <= 0) throw new Error(__lang === 'en' ? 'The semi-major axis must be greater than 0' : 'El semieje mayor debe ser mayor a 0');
  if (M <= 0) throw new Error(__lang === 'en' ? 'The central mass must be greater than 0' : 'La masa central debe ser mayor a 0');

  const G = 6.674e-11;
  const T = 2 * Math.PI * Math.sqrt(a * a * a / (G * M));
  const dias = T / 86400;
  const anos = T / (365.25 * 86400);

  let periodoStr: string;
  if (T < 86400) periodoStr = __lang === 'en' ? `${(T / 3600).toFixed(2)} hours` : `${(T / 3600).toFixed(2)} horas`;
  else if (T < 365.25 * 86400) periodoStr = __lang === 'en' ? `${dias.toFixed(2)} days` : `${dias.toFixed(2)} días`;
  else periodoStr = __lang === 'en' ? `${anos.toFixed(4)} years (${dias.toFixed(0)} days)` : `${anos.toFixed(4)} años (${dias.toFixed(0)} días)`;

  return {
    periodoS: periodoStr,
    periodoDias: Number(dias.toFixed(4)),
    periodoAnos: Number(anos.toFixed(6)),
    formula: `T = 2π√(${a.toExponential(3)}³ / (${G.toExponential(3)} × ${M.toExponential(3)})) = ${T.toFixed(0)} s`,
  };
}
