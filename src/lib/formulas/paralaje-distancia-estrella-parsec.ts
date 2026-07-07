export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function paralajeDistanciaEstrellaParsec(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      errorParalaje: 'Ingresá paralaje positivo',
      unitAL: ' al',
      resumen: (pcVal: string, alVal: string) => `Distancia ${pcVal} pc (${alVal} años luz).`,
      insightTitle: 'Qué distancia es esta',
      insightText: (pcVal: string, alVal: string) => `La estrella está a **${pcVal} pc**, o sea **${alVal} años luz**: la luz que ves hoy salió de ahí hace ${alVal} años. Cuanto menor el paralaje, más lejos el astro.`,
    },
    en: {
      errorParalaje: 'Enter a positive parallax value',
      unitAL: ' ly',
      resumen: (pcVal: string, alVal: string) => `Distance ${pcVal} pc (${alVal} light-years).`,
      insightTitle: 'What this distance means',
      insightText: (pcVal: string, alVal: string) => `The star sits **${pcVal} pc** away, that is **${alVal} light-years**: the light you see today left it ${alVal} years ago. The smaller the parallax, the farther the star.`,
    },
    pt: {
      errorParalaje: 'Insira um paralaxe positivo',
      unitAL: ' al',
      resumen: (pcVal: string, alVal: string) => `Distância ${pcVal} pc (${alVal} anos-luz).`,
      insightTitle: 'O que essa distância significa',
      insightText: (pcVal: string, alVal: string) => `A estrela está a **${pcVal} pc**, ou seja **${alVal} anos-luz**: a luz que você vê hoje saiu de lá há ${alVal} anos. Quanto menor o paralaxe, mais distante o astro.`,
    },
  } as const)[__lang];
  const p = Number(i.paralaje);
  if (!p || p <= 0) throw new Error(T.errorParalaje);
  const pc = 1 / p;
  const al = pc * 3.26;
  const _insight = {
    title: T.insightTitle,
    text: T.insightText(pc.toFixed(1), al.toFixed(1)),
    tone: 'neutral',
    icon: '🌟',
  };
  return { distanciaPc: pc.toFixed(2) + ' pc', distanciaAL: al.toFixed(2) + T.unitAL, resumen: T.resumen(pc.toFixed(1), al.toFixed(1)), _insight };
}
