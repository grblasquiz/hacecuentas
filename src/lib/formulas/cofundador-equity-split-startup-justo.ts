export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cofundadorEquitySplitStartupJusto(i: Inputs): Outputs {
  const n=Number(i.cantidadFounders)||2; const t=Number(i.tiempoCompletoRelativo)||5; const io=String(i.ideaOriginal||'compartida');
  const equalPart=100/n;
  const bonusIdea=io==='si'?5:io==='no'?-5:0;
  const bonusDedic=(t-5)*2;
  const mio=Math.min(90,Math.max(10,equalPart+bonusIdea+bonusDedic));
  const rec=mio>equalPart*1.3?'Buscá consenso con co-founders antes de cerrar.':'Split razonable. Con vesting claro.';
  return { porcentajeSugerido:`${mio.toFixed(0)}%`, recomendacion:rec, consejo:'4 años vesting + 1 año cliff. Shareholder agreement. Revisar con abogado.' };
}
