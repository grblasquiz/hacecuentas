export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function progresionGeometricaSumaTermino(i: Inputs): Outputs {
  const a1=Number(i.a1)||0; const r=Number(i.r)||1; const n=Number(i.n)||1;
  const an=a1*Math.pow(r,n-1);
  const sn=r===1?n*a1:a1*(Math.pow(r,n)-1)/(r-1);
  const ar=Math.abs(r);
  const fmt=(x:number)=>Number(x.toFixed(3)).toLocaleString('es-AR');
  const comp = ar>1 ? `cada término es **${fmt(ar)}×** el anterior, así que crece exponencialmente hasta **${fmt(an)}**`
    : ar<1 && ar>0 ? `cada término es **${fmt(ar)}×** el anterior, así que se achica hacia 0 (a${n} = **${fmt(an)}**)`
    : ar===1 ? `la razón es **1**, la sucesión queda constante en **${fmt(a1)}**`
    : `la razón es **0**, todos los términos tras el primero valen 0`;
  const tono = ar>1 ? 'warn' : 'neutral';
  const _insight = {
    title: 'Crecimiento de la serie',
    text: `Con razón ${fmt(r)}, ${comp}. La suma de los **${n}** primeros términos da **${fmt(sn)}**.`,
    tone: tono,
    icon: ar>1 ? '🚀' : '📉',
  };
  return { an:an.toFixed(3), sn:sn.toFixed(3), resumen:`a${n}=${an.toFixed(2)}, S${n}=${sn.toFixed(2)}.`, _insight };
}
