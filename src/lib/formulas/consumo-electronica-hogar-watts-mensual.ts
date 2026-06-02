export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function consumoElectronicaHogarWattsMensual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const w=Number(i.w)||0; const h=Number(i.hdia)||0; const t=Number(i.tarifa)||0.15;
  const k=w*h*30/1000; const c=k*t;
  const resumen = __lang === 'en'
    ? `${w}W × ${h}h/day = ${k.toFixed(1)} kWh/month ≈ $${c.toFixed(2)}.`
    : `${w}W × ${h}h/día = ${k.toFixed(1)} kWh/mes ≈ $${c.toFixed(2)}.`;
  const nivel = k >= 100 ? 'alto' : k >= 30 ? 'moderado' : 'bajo';
  const anual = (c*12).toFixed(2);
  const insight = __lang === 'en'
    ? {
        title: 'What this consumption means',
        text: nivel === 'alto'
          ? `**High** draw: **${k.toFixed(1)} kWh/month** (≈$${c.toFixed(2)}), about **$${anual}/year**. Cutting daily hours or unplugging it makes a real dent.`
          : nivel === 'moderado'
          ? `**Moderate** draw: **${k.toFixed(1)} kWh/month** (≈$${c.toFixed(2)}/mo, **$${anual}/year**). Fewer hours of use lower the cost directly.`
          : `**Low** draw: just **${k.toFixed(1)} kWh/month** (≈$${c.toFixed(2)}). Over a year that's **$${anual}**.`,
        tone: nivel === 'alto' ? 'warn' : nivel === 'bajo' ? 'good' : 'neutral',
        icon: '🔌',
      }
    : {
        title: 'Qué significa este consumo',
        text: nivel === 'alto'
          ? `Consumo **alto**: **${k.toFixed(1)} kWh/mes** (≈$${c.toFixed(2)}), unos **$${anual}/año**. Recortar horas o desenchufarlo se nota en la factura.`
          : nivel === 'moderado'
          ? `Consumo **moderado**: **${k.toFixed(1)} kWh/mes** (≈$${c.toFixed(2)}/mes, **$${anual}/año**). Menos horas de uso bajan el costo directo.`
          : `Consumo **bajo**: apenas **${k.toFixed(1)} kWh/mes** (≈$${c.toFixed(2)}). En el año son **$${anual}**.`,
        tone: nivel === 'alto' ? 'warn' : nivel === 'bajo' ? 'good' : 'neutral',
        icon: '🔌',
      };
  return { kwhMes:`${k.toFixed(1)} kWh`, costo:`$${c.toFixed(2)}`, anual:`$${anual}`, resumen, _insight: insight };
}
