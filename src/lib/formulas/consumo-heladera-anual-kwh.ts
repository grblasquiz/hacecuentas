export interface ConsumoHeladeraAnualKwhInputs { potenciaW: number; dutyCycle: number; tarifa?: number; __lang?: string; }
export interface ConsumoHeladeraAnualKwhOutputs { kwhAnual: string; kwhMensual: string; costoAnual: string; resumen: string; _insight?: any; }
export function consumoHeladeraAnualKwh(i: ConsumoHeladeraAnualKwhInputs): ConsumoHeladeraAnualKwhOutputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const p = Number(i.potenciaW); const dc = Number(i.dutyCycle) / 100; const tarifa = Number(i.tarifa ?? 80);
  if (!p || !dc) throw new Error(__lang === 'en' ? 'Enter power and duty cycle' : __lang === 'pt' ? 'Preencha potência e ciclo de trabalho' : 'Completá potencia y duty cycle');
  const kwhAnual = p * 24 * 365 * dc / 1000;
  const kwhMensual = kwhAnual / 12;
  const costoAnual = kwhAnual * tarifa;
  // Referencia: heladera eficiente moderna ~250-350 kWh/año; >500 kWh/año = vieja/ineficiente.
  const nivel = kwhAnual >= 500 ? 'alto' : kwhAnual <= 320 ? 'bajo' : 'medio';
  const tone = nivel === 'alto' ? 'warn' : nivel === 'bajo' ? 'good' : 'neutral';
  const insight = __lang === 'en'
    ? {
        title: 'How efficient is your fridge',
        text: nivel === 'alto'
          ? `**${kwhAnual.toFixed(0)} kWh/year** is **high** — typical of an old fridge. A modern efficient unit uses ~250–350 kWh/year, so you could save a big share of the **$${costoAnual.toFixed(0)}/year** by replacing it.`
          : nivel === 'bajo'
          ? `**${kwhAnual.toFixed(0)} kWh/year** is **efficient**, in line with a modern A/A+ fridge. It costs about **$${costoAnual.toFixed(0)}/year** to run.`
          : `**${kwhAnual.toFixed(0)} kWh/year** is **average** for a household fridge (~$${costoAnual.toFixed(0)}/year). A top-efficiency model would shave it toward 300 kWh/year.`,
        tone,
        icon: '🧊',
      }
    : __lang === 'pt'
    ? {
        title: 'Quão eficiente é sua geladeira',
        text: nivel === 'alto'
          ? `**${kwhAnual.toFixed(0)} kWh/ano** é **alto** — típico de geladeira antiga. Um modelo moderno eficiente usa ~250–350 kWh/ano, então dá para economizar boa parte dos **$${costoAnual.toFixed(0)}/ano** trocando.`
          : nivel === 'bajo'
          ? `**${kwhAnual.toFixed(0)} kWh/ano** é **eficiente**, na faixa de uma geladeira A/A+ moderna. Custa cerca de **$${costoAnual.toFixed(0)}/ano**.`
          : `**${kwhAnual.toFixed(0)} kWh/ano** é a **média** de uma geladeira residencial (~$${costoAnual.toFixed(0)}/ano). Um modelo top de eficiência baixaria para ~300 kWh/ano.`,
        tone,
        icon: '🧊',
      }
    : {
        title: 'Qué tan eficiente es tu heladera',
        text: nivel === 'alto'
          ? `**${kwhAnual.toFixed(0)} kWh/año** es **alto** — típico de una heladera vieja. Una moderna eficiente usa ~250–350 kWh/año, así que podrías ahorrar buena parte de los **$${costoAnual.toFixed(0)}/año** cambiándola.`
          : nivel === 'bajo'
          ? `**${kwhAnual.toFixed(0)} kWh/año** es **eficiente**, en línea con una heladera A/A+ moderna. Cuesta unos **$${costoAnual.toFixed(0)}/año** mantenerla andando.`
          : `**${kwhAnual.toFixed(0)} kWh/año** es lo **promedio** de una heladera de hogar (~$${costoAnual.toFixed(0)}/año). Un modelo de máxima eficiencia lo bajaría hacia 300 kWh/año.`,
        tone,
        icon: '🧊',
      };
  return { kwhAnual: kwhAnual.toFixed(0) + ' kWh', kwhMensual: kwhMensual.toFixed(1) + ' kWh', costoAnual: '$' + costoAnual.toFixed(0),
    resumen: __lang === 'en'
      ? `Annual consumption: ${kwhAnual.toFixed(0)} kWh (${kwhMensual.toFixed(1)}/month). Cost: $${costoAnual.toFixed(0)} at $${tarifa}/kWh.`
      : __lang === 'pt'
      ? `Consumo anual: ${kwhAnual.toFixed(0)} kWh (${kwhMensual.toFixed(1)}/mês). Custo: $${costoAnual.toFixed(0)} a $${tarifa}/kWh.`
      : `Consumo anual: ${kwhAnual.toFixed(0)} kWh (${kwhMensual.toFixed(1)}/mes). Costo: $${costoAnual.toFixed(0)} a $${tarifa}/kWh.`,
    _insight: insight };
}
