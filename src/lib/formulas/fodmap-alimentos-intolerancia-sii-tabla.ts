export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function fodmapAlimentosIntoleranciaSiiTabla(i: Inputs): Outputs {
  const a=String(i.alimento||'cebolla');
  const data={'cebolla':{n:'Alto',p:'Evitar (fructanos)',alt:'Puerro (parte verde)'},'ajo':{n:'Alto',p:'Evitar',alt:'Aceite infusionado con ajo'},'manzana':{n:'Alto',p:'20g',alt:'Mandarina, naranja'},'pera':{n:'Alto',p:'Evitar',alt:'Kiwi'},'banana':{n:'Bajo si madura',p:'1 mediana',alt:'—'},'zanahoria':{n:'Bajo',p:'Libre',alt:'—'},'arroz':{n:'Bajo',p:'Libre',alt:'—'},'avena':{n:'Bajo',p:'52g',alt:'—'},'leche':{n:'Alto (lactosa)',p:'Evitar',alt:'Leche sin lactosa'},'yogur_sin_lactosa':{n:'Bajo',p:'170g',alt:'—'}};
  const d=data[a];
  const nombre=a.replace(/_/g,' ');
  const esAlto=d.n.toLowerCase().startsWith('alto');
  const _insight = esAlto
    ? { title:'Alimento a controlar', text:`La **${nombre}** es **FODMAP ${d.n}**: en fase de eliminación conviene **${d.p.toLowerCase()}**. Reemplazo bien tolerado: **${d.alt}**.`, tone:'warn', icon:'🥦' }
    : { title:'Alimento seguro', text:`La **${nombre}** es **FODMAP ${d.n}**${d.p==='Libre'?' y podés consumirla **sin restricción**':`, con porción segura de **${d.p}**`}. Buena base para tu dieta baja en FODMAP.`, tone:'good', icon:'✅' };
  return { nivelFodmap:d.n, porcionSegura:d.p, alternativa:d.alt, _insight };
}
