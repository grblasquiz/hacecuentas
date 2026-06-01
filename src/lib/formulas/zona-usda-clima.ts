export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function zonaUsdaClima(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { zona: 'Zona ', resumen: (t: number, z: string) => `Con mínima ${t}°C estás en zona USDA ${z}.` },
    en: { zona: 'Zone ', resumen: (t: number, z: string) => `With a minimum of ${t}°C you are in USDA zone ${z}.` },
  } as const)[__lang];
  const t = Number(i.tMin);
  let z: string;
  if (t <= -40) z = '1-2'; else if (t <= -30) z = '3'; else if (t <= -20) z = '4-5';
  else if (t <= -10) z = '6'; else if (t <= -5) z = '7'; else if (t <= 0) z = '8';
  else if (t <= 5) z = '9'; else if (t <= 10) z = '10'; else z = '11+';
  return { zona: T.zona + z, resumen: T.resumen(t, z) };
}
