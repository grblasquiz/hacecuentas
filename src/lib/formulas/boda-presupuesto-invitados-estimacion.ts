export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | object; _insight?: any; }
export function bodaPresupuestoInvitadosEstimacion(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  return {
    resultado:r.toFixed(2),
    resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`,
    _insight: {
      title: 'Resultado de la estimación',
      text: `Con los valores ingresados el resultado estimado es **${r.toFixed(2)}** (a partir de ${v1} × ${v2} / 10).`,
      tone: 'neutral',
      icon: '💍',
    },
  };
}
