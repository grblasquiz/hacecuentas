export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function luzNaturalAhorroIluminacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const h = Number(i.horas) || 0; const w = Number(i.watts) || 0;
  const kWhMes = (h * w * 30) / 1000;
  // EN: U.S. average residential rate $0.16/kWh (EIA 2025); ES: AR tariff ~$80/kWh (ENRE 2025)
  const tarifa = __lang === 'en' ? 0.16 : 80;
  const costo = kWhMes * tarifa;
  const anual = costo * 12;
  const resumen = __lang === 'en'
    ? `Using natural light for ${h} h/day saves ${kWhMes.toFixed(1)} kWh/month (~$${costo.toFixed(2)}/month at $0.16/kWh).`
    : `Ahorrás ${kWhMes.toFixed(1)} kWh/mes (~$${costo.toFixed(0)}/mes a $80/kWh) usando luz natural.`;
  const insight = __lang === 'en'
    ? {
        title: 'What natural light saves you',
        text: `Skipping ${h} h/day of a ${w} W fixture cuts **${kWhMes.toFixed(1)} kWh/month** — about **$${costo.toFixed(2)}/month** ($${anual.toFixed(2)}/year) at the U.S. avg rate of $0.16/kWh. Swapping to LED first shrinks the fixture watts and multiplies the payback.`,
        tone: 'good',
        icon: '💡',
      }
    : {
        title: 'Cuánto te ahorra la luz natural',
        text: `Evitar ${h} h/día de un foco de ${w} W recorta **${kWhMes.toFixed(1)} kWh/mes** — unos **$${costo.toFixed(0)}/mes** ($${anual.toFixed(0)}/año) a la tarifa residencial AR. Si encima lo cambiás por LED, el ahorro es todavía mayor.`,
        tone: 'good',
        icon: '💡',
      };
  const costLabel = __lang === 'en' ? `$${costo.toFixed(2)}` : `$${costo.toFixed(0)}`;
  return { kwhMes: kWhMes.toFixed(2) + ' kWh', pesosMes: costLabel, resumen, _insight: insight };
}
