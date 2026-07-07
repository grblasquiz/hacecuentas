export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function aireAcondicionadoBtuSplit(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.m2) || 0;
  const factores: Record<string, number> = { templado: 600, calido: 700, 'muy-calido': 850 };
  const f = factores[String(i.clima)] || 700;
  const btu = m * f;
  const frigorias = btu * 0.252;
  const splits = [2200, 2500, 3000, 4500, 6000, 9000];
  const next = splits.find(x => x >= frigorias) || frigorias;
  const resumen = __lang === 'en'
    ? `${btu.toFixed(0)} BTU (${frigorias.toFixed(0)} frigorías) for ${m} m². Commercial split: ${next}F.`
    : `${btu.toFixed(0)} BTU (${frigorias.toFixed(0)} frigorías) para ${m} m². Split comercial: ${next}F.`;
  const _insight = __lang === 'en'
    ? {
        title: 'Recommended split size',
        text: `For **${m} m²** in this climate you need about **${btu.toFixed(0)} BTU** (${frigorias.toFixed(0)} frigorías). The closest commercial unit is a **${next}F** split. Undersizing it will run non-stop and never cool the room; oversizing wastes energy.`,
        tone: 'neutral',
        icon: '❄️',
      }
    : {
        title: 'Split recomendado',
        text: `Para **${m} m²** en este clima necesitás unos **${btu.toFixed(0)} BTU** (${frigorias.toFixed(0)} frigorías). El equipo comercial más cercano es un split de **${next}F**. Si lo elegís más chico nunca enfría y trabaja al mango; más grande gasta de más.`,
        tone: 'neutral',
        icon: '❄️',
      };
  return { btu: btu.toFixed(0), frigorias: frigorias.toFixed(0), comercialSplit: next.toString() + 'F',
    resumen, _insight };
}
