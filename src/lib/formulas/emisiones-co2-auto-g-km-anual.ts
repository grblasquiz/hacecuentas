export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function emisionesCo2AutoGKmAnual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { arboles: 'árboles', resumen: (km: number, co2: number, trees: number) => `${km}km/año emite ${co2.toFixed(0)} kg CO2 (~${trees.toFixed(0)} árboles/año para absorber).` },
    en: { arboles: 'trees',   resumen: (km: number, co2: number, trees: number) => `${km}km/yr emits ${co2.toFixed(0)} kg CO2 (~${trees.toFixed(0)} trees/yr to absorb it).` },
  } as const)[__lang];
  const km=Number(i.km)||0; const r=Number(i.rend)||12;
  const l=km/r; const co2=l*2.31;
  const trees=co2/22;
  return { litros:`${l.toFixed(0)} L`, co2:`${co2.toFixed(0)} kg CO2`, arboles:`${trees.toFixed(0)} ${T.arboles}`, resumen:T.resumen(km, co2, trees) };
}
