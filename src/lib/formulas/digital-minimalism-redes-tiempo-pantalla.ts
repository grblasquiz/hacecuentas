export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function digitalMinimalismRedesTiempoPantalla(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  return {
    resultado:r.toFixed(2),
    resumen:`Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`,
    _insight: { title: 'Tu resultado', text: `Con **${v1}** y **${v2}** el resultado es **${r.toFixed(2)}**.`, tone: 'neutral', icon: '📵' },
  };
}
