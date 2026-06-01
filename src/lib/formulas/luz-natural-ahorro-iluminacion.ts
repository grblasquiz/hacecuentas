export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function luzNaturalAhorroIluminacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const h = Number(i.horas) || 0; const w = Number(i.watts) || 0;
  const kWhMes = (h * w * 30) / 1000;
  const pesos = kWhMes * 80;
  const resumen = __lang === 'en'
    ? `You save ${kWhMes.toFixed(1)} kWh/month ($${pesos.toFixed(0)}) by using natural light.`
    : `Ahorrás ${kWhMes.toFixed(1)} kWh/mes ($${pesos.toFixed(0)}) usando luz natural.`;
  return { kwhMes: kWhMes.toFixed(2) + ' kWh', pesosMes: '$' + pesos.toFixed(0), resumen };
}
