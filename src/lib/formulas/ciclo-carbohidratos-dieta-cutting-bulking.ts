export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cicloCarbohidratosDietaCuttingBulking(i: Inputs): Outputs {
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/10;
  return {
    resultado:r.toFixed(1),
    resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(1)}.`,
    _insight: {
      title: 'Tu resultado',
      text: `Con los valores **${v1}** y **${v2}** el resultado es **${r.toFixed(1)}**.`,
      tone: 'neutral',
      icon: '🍚',
    },
  };
}
