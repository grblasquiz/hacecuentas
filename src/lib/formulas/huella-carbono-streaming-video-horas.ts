export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function huellaCarbonoStreamingVideoHoras(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const h = Number(i.horasDia) || 0;
  const factor = i.calidad === '4K' ? 75 : i.calidad === 'SD' ? 10 : 36;
  const gDia = h * factor; const kgMes = (gDia * 30) / 1000;
  const kgAño = kgMes * 12;
  const resumen = __lang === 'en'
    ? `${h}h/day on ${i.calidad}: ${gDia.toFixed(0)} g CO₂/day = ${kgMes.toFixed(1)} kg/month.`
    : `${h}h/día en ${i.calidad}: ${gDia.toFixed(0)} g CO₂/día = ${kgMes.toFixed(1)} kg/mes.`;
  const tone = kgMes >= 5 ? 'warn' : kgMes >= 2 ? 'neutral' : 'good';
  const q = String(i.calidad || '');
  const _insight = __lang === 'en'
    ? {
        title: 'Streaming footprint',
        text: h <= 0
          ? 'Enter your daily streaming hours to estimate the **CO₂** of your video habit.'
          : `Watching **${h} h/day** in **${q}** adds up to **${kgMes.toFixed(1)} kg CO₂/month** (~**${kgAño.toFixed(0)} kg/year**).${q === '4K' ? ' Dropping from **4K to HD** roughly halves it.' : ''}`,
        tone,
        icon: '📺',
      }
    : {
        title: 'Tu huella de streaming',
        text: h <= 0
          ? 'Cargá tus horas diarias de streaming para estimar el **CO₂** de tu consumo de video.'
          : `Ver **${h} h/día** en **${q}** suma **${kgMes.toFixed(1)} kg de CO₂/mes** (~**${kgAño.toFixed(0)} kg/año**).${q === '4K' ? ' Bajar de **4K a HD** lo reduce casi a la mitad.' : ''}`,
        tone,
        icon: '📺',
      };
  return { gCo2Dia: gDia.toFixed(0) + ' g', kgCo2Mes: kgMes.toFixed(2) + ' kg', resumen, _insight };
}
