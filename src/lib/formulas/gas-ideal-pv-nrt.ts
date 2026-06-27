/** Ideal Gas Law PV = nRT. Solve for moles: n = (P × V) / (R × T). */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | undefined; }

// Universal gas constant in SI units (NIST CODATA 2018).
const R = 8.314462618;

export function gasIdealPvNrt(i: Inputs): Outputs {
  const p = Number(i.p) || 0; // pressure in Pa
  const v = Number(i.v) || 0; // volume in m³
  const t = Number(i.t) || 0; // temperature in K

  if (t <= 0) throw new Error('Temperature must be greater than 0 K (absolute scale).');

  const moles = (p * v) / (R * t);
  const n = Number(moles.toFixed(4));

  const resumen = `At P = ${p.toLocaleString('en-US')} Pa, V = ${v} m³ and T = ${t} K, the container holds n = (P × V) / (R × T) = ${n} mol of ideal gas (R = 8.314 J·mol⁻¹·K⁻¹).`;

  return { n, resumen };
}
