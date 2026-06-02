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
  const anual = pesos * 12;
  const insight = __lang === 'en'
    ? {
        title: 'What natural light saves you',
        text: `Skipping ${h} h/day of a ${w} W fixture cuts **${kWhMes.toFixed(1)} kWh/month** — about **$${pesos.toFixed(0)}/month** ($${anual.toFixed(0)}/year). Swapping it for an LED would shrink the bill even further.`,
        tone: 'good',
        icon: '💡',
      }
    : {
        title: 'Cuánto te ahorra la luz natural',
        text: `Evitar ${h} h/día de un foco de ${w} W recorta **${kWhMes.toFixed(1)} kWh/mes** — unos **$${pesos.toFixed(0)}/mes** ($${anual.toFixed(0)}/año). Si encima lo cambiás por LED, el ahorro es todavía mayor.`,
        tone: 'good',
        icon: '💡',
      };
  return { kwhMes: kWhMes.toFixed(2) + ' kWh', pesosMes: '$' + pesos.toFixed(0), resumen, _insight: insight };
}
