export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function percentilPesoBebeOmsEdadMeses(i: Inputs): Outputs {
  const m=Number(i.mes)||0; const s=String(i.sexo||'m'); const peso=Number(i.peso)||0;
  const p50M=[3.3,4.5,5.6,6.4,7,7.5,7.9,8.3,8.6,8.9,9.2,9.4,9.6,10.2,10.8,11.3,11.8,12.2,12.7,13.1];
  const p50F=[3.2,4.2,5.1,5.8,6.4,6.9,7.3,7.6,7.9,8.2,8.5,8.7,8.9,9.5,10.1,10.6,11.1,11.5,12,12.4];
  const tab=s==='m'?p50M:p50F;
  const idx=Math.min(Math.floor(m/3),tab.length-1);
  const med=tab[idx];
  const ev=peso<med*0.8?'Bajo':peso>med*1.2?'Alto':'Normal';
  return { mediana:`${med} kg`, rango:`~${(med*0.8).toFixed(1)} a ${(med*1.2).toFixed(1)} kg`, evaluacion:ev, resumen:`A los ${m} meses, P50 ${med}kg. Tu bebé (${peso}kg): ${ev}.` };
}
