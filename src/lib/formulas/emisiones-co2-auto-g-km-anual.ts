export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function emisionesCo2AutoGKmAnual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      arboles: 'árboles',
      resumen: (km: number, co2: number, trees: number) => `${km}km/año emite ${co2.toFixed(0)} kg CO2 (~${trees.toFixed(0)} árboles/año para absorber).`,
      insightTitle: 'Tu huella anual al volante',
      insightText: (co2: number, ton: string, trees: number) => `Esos kilómetros generan **${co2.toFixed(0)} kg de CO2** al año (**${ton} toneladas**): harían falta unos **${trees.toFixed(0)} árboles** trabajando todo un año para absorberlo.`,
    },
    en: {
      arboles: 'trees',
      resumen: (km: number, co2: number, trees: number) => `${km}km/yr emits ${co2.toFixed(0)} kg CO2 (~${trees.toFixed(0)} trees/yr to absorb it).`,
      insightTitle: 'Your yearly driving footprint',
      insightText: (co2: number, ton: string, trees: number) => `Those kilometers release **${co2.toFixed(0)} kg of CO2** a year (**${ton} tonnes**): it would take about **${trees.toFixed(0)} trees** a full year to absorb it.`,
    },
  } as const)[__lang];
  const km=Number(i.km)||0; const r=Number(i.rend)||12;
  const l=km/r; const co2=l*2.31;
  const trees=co2/22;
  const _insight = {
    title: T.insightTitle,
    text: T.insightText(co2, (co2 / 1000).toFixed(2), trees),
    tone: 'warn' as const,
    icon: '🌍',
  };
  return { litros:`${l.toFixed(0)} L`, co2:`${co2.toFixed(0)} kg CO2`, arboles:`${trees.toFixed(0)} ${T.arboles}`, resumen:T.resumen(km, co2, trees), _insight };
}
