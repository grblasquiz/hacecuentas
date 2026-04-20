export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function jardinRiegoLitrosPlantasClimaSemana(i: Inputs): Outputs {
  const m=Number(i.m2Jardin)||0; const c=String(i.climaZona||'templado'); const t=String(i.tipoPlantas||'cesped');
  const basePorM2={'cesped':25,'hortaliza':40,'flores':20,'arboles':35}[t];
  const multClima={'seco':1.4,'templado':1,'humedo':0.7}[c];
  const lit=m*basePorM2*multClima;
  const freq=t==='arboles'?'2-3 veces/semana':'3-4 veces/semana';
  return { litrosSemana:`${Math.round(lit).toLocaleString('es-AR')} L`, frecuencia:freq, tip:'Goteo ahorra 50-70% vs aspersión.' };
}
