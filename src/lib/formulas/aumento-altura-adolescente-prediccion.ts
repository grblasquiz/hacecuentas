export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function aumentoAlturaAdolescentePrediccion(i: Inputs): Outputs {
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const _insight = {
    title: 'Resultado estimado',
    text: `Con los valores ingresados (**${v1}** y **${v2}**) el cálculo arroja **${r.toFixed(2)}**. Tomalo como una referencia orientativa: la talla adulta depende de muchos factores y solo un pediatra puede dar un pronóstico fiable.`,
    tone: 'neutral',
    icon: '📏',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo con ${v1} y ${v2}: resultado ${r.toFixed(2)}.`, _insight };
}
