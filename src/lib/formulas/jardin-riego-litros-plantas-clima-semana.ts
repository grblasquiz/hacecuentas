export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function jardinRiegoLitrosPlantasClimaSemana(i: Inputs): Outputs {
  const m=Number(i.m2Jardin)||0; const c=String(i.climaZona||'templado'); const t=String(i.tipoPlantas||'cesped');
  const basePorM2=({'cesped':25,'hortaliza':40,'flores':20,'arboles':35} as Record<string,number>)[t] ?? 25;
  const multClima=({'seco':1.4,'templado':1,'humedo':0.7} as Record<string,number>)[c] ?? 1;
  const lit=m*basePorM2*multClima;
  const freq=t==='arboles'?'2-3 veces/semana':'3-4 veces/semana';
  const litRound=Math.round(lit);
  const litGoteo=Math.round(lit*0.4); // ahorro ~60% con goteo
  const claboth:Record<string,string>={'seco':'el clima seco eleva el consumo (+40%)','templado':'el clima templado es la referencia base','humedo':'el clima húmedo reduce el consumo (-30%)'};
  const insight = {
    title:'Riego semanal estimado',
    text:`Para **${m} m²** de ${t} necesitás unos **${litRound.toLocaleString('es-AR')} L por semana**, repartidos en ${freq}. Tené en cuenta que ${claboth[c] ?? 'el clima templado es la referencia base'}. Con riego por goteo bajarías a ~**${litGoteo.toLocaleString('es-AR')} L**.`,
    tone:(c==='seco'?'warn':'neutral') as 'warn'|'neutral',
    icon:'💧',
  };
  return { litrosSemana:`${litRound.toLocaleString('es-AR')} L`, frecuencia:freq, tip:'Goteo ahorra 50-70% vs aspersión.', _insight: insight };
}
