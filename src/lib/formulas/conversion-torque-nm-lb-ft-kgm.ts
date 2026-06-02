export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function conversionTorqueNmLbFtKgm(i: Inputs): Outputs {
  const v=Number(i.v)||0; const d=String(i.de||'nm');
  let nm:number;
  if (d==='nm') nm=v; else if (d==='lbft') nm=v*1.356; else nm=v*9.807;
  const lbft=nm*0.738; const kgm=nm*0.102;
  const insight = {
    title: 'Torque equivalente',
    text: `**${nm.toFixed(1)} Nm** equivalen a **${lbft.toFixed(1)} lb·ft** y **${kgm.toFixed(2)} kg·m**. Respetá el valor de torque del fabricante: apretar de más estría el tornillo y de menos lo afloja.`,
    tone: 'neutral',
    icon: '🔧',
  };
  return { nm:`${nm.toFixed(2)} Nm`, lbft:`${lbft.toFixed(2)} lb·ft`, kgm:`${kgm.toFixed(2)} kg·m`, resumen:`${v} ${d} = ${nm.toFixed(1)} Nm.`, _insight: insight };
}
