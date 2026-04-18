export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function zonaUsdaClima(i: Inputs): Outputs {
  const t = Number(i.tMin);
  let z: string;
  if (t <= -40) z = '1-2'; else if (t <= -30) z = '3'; else if (t <= -20) z = '4-5';
  else if (t <= -10) z = '6'; else if (t <= -5) z = '7'; else if (t <= 0) z = '8';
  else if (t <= 5) z = '9'; else if (t <= 10) z = '10'; else z = '11+';
  return { zona: 'Zona ' + z, resumen: `Con mínima ${t}°C estás en zona USDA ${z}.` };
}
