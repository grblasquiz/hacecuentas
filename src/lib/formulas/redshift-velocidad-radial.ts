export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function redshiftVelocidadRadial(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorZ: 'Ingresá z',
      classicDoppler: 'Doppler clásico',
      relativistic: 'relativista',
    },
    en: {
      errorZ: 'Enter z',
      classicDoppler: 'classical Doppler',
      relativistic: 'relativistic',
    },
  } as const)[__lang];
  const z = Number(i.z);
  if (z === undefined) throw new Error(T.errorZ);
  const c = 299792;
  let v: number;
  if (Math.abs(z) < 0.1) v = z * c;
  else v = c * ((Math.pow(1+z, 2) - 1) / (Math.pow(1+z, 2) + 1));
  return { vKms: v.toFixed(0) + ' km/s', resumen: `v = ${v.toFixed(0)} km/s (${z < 0.1 ? T.classicDoppler : T.relativistic}).` };
}
