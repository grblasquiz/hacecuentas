export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function gastoUniversidadHijoEstimacionAnual(i: Inputs): Outputs {
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const _insight = {
    title: 'Tu estimación',
    text: `Con los valores ingresados (${v1} y ${v2}) el resultado estimado es **${r.toFixed(2)}**.`,
    tone: 'neutral',
    icon: '🎓',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo con ${v1} y ${v2}: resultado ${r.toFixed(2)}.`, _insight };
}
