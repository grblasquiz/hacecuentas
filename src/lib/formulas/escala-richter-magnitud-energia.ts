export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function escalaRichterMagnitudEnergia(i: Inputs): Outputs {
  const m = Number(i.magnitud);
  if (!m) throw new Error('Ingresá magnitud');
  const E = Math.pow(10, 4.8 + 1.5 * m);
  const tntKg = E / 4.18e6;
  let eqTnt: string;
  if (tntKg >= 1e6) eqTnt = (tntKg / 1e6).toFixed(2) + ' Mt TNT';
  else if (tntKg >= 1e3) eqTnt = (tntKg / 1e3).toFixed(2) + ' kt TNT';
  else eqTnt = tntKg.toFixed(0) + ' kg TNT';
  return { energia: E.toExponential(2) + ' J', equivalente: eqTnt, resumen: `M${m}: ${E.toExponential(1)} J (${eqTnt}).` };
}
