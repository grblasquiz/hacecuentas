export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function horasDormirParejaDiscusionImpacto(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const insight = {
    title: 'Tu resultado',
    text: `Con **${v1}** y **${v2}** el índice da **${r.toFixed(2)}** (producto de ambos valores dividido por 10). Tomalo como una referencia orientativa: dormir poco tiende a acortar la mecha en las discusiones de pareja, así que cuidar el descanso suele bajar la tensión.`,
    tone: 'neutral',
    icon: '😴',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`, _insight: insight };
}
