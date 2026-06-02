export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function progresionAritmeticaSumaTermino(i: Inputs): Outputs {
  const a1=Number(i.a1)||0; const d=Number(i.d)||0; const n=Number(i.n)||1;
  const an=a1+(n-1)*d; const sn=n*(a1+an)/2;
  const fmt=(x:number)=>Number(x.toFixed(3)).toLocaleString('es-AR');
  const sentido = d>0 ? `crece **+${fmt(d)}** en cada paso, así que el término ${n} llega a **${fmt(an)}**` : d<0 ? `decrece **${fmt(d)}** en cada paso, así que el término ${n} cae a **${fmt(an)}**` : `es constante en **${fmt(a1)}** (la diferencia es 0)`;
  const _insight = {
    title: 'Cómo evoluciona la serie',
    text: `Arrancando en ${fmt(a1)}, la sucesión ${sentido}. La suma de los **${n}** primeros términos da **${fmt(sn)}**.`,
    tone: 'neutral',
    icon: '📈',
  };
  return { an:an.toFixed(3), sn:sn.toFixed(3), resumen:`a${n}=${an.toFixed(2)}, S${n}=${sn.toFixed(2)}.`, _insight };
}
