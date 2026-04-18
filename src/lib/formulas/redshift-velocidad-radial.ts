export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function redshiftVelocidadRadial(i: Inputs): Outputs {
  const z = Number(i.z);
  if (z === undefined) throw new Error('Ingresá z');
  const c = 299792;
  let v: number;
  if (Math.abs(z) < 0.1) v = z * c;
  else v = c * ((Math.pow(1+z, 2) - 1) / (Math.pow(1+z, 2) + 1));
  return { vKms: v.toFixed(0) + ' km/s', resumen: `v = ${v.toFixed(0)} km/s (${z < 0.1 ? 'Doppler clásico' : 'relativista'}).` };
}
