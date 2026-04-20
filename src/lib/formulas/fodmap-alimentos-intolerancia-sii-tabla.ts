export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function fodmapAlimentosIntoleranciaSiiTabla(i: Inputs): Outputs {
  const a=String(i.alimento||'cebolla');
  const data={'cebolla':{n:'Alto',p:'Evitar (fructanos)',alt:'Puerro (parte verde)'},'ajo':{n:'Alto',p:'Evitar',alt:'Aceite infusionado con ajo'},'manzana':{n:'Alto',p:'20g',alt:'Mandarina, naranja'},'pera':{n:'Alto',p:'Evitar',alt:'Kiwi'},'banana':{n:'Bajo si madura',p:'1 mediana',alt:'—'},'zanahoria':{n:'Bajo',p:'Libre',alt:'—'},'arroz':{n:'Bajo',p:'Libre',alt:'—'},'avena':{n:'Bajo',p:'52g',alt:'—'},'leche':{n:'Alto (lactosa)',p:'Evitar',alt:'Leche sin lactosa'},'yogur_sin_lactosa':{n:'Bajo',p:'170g',alt:'—'}};
  const d=data[a];
  return { nivelFodmap:d.n, porcionSegura:d.p, alternativa:d.alt };
}
