export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function canastaBasicaHogarInecGastoMensual(i: Inputs): Outputs {
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const _insight = {
    title: 'Cómo leer este número',
    text: `Con **${v1}** y **${v2}** el resultado es **${r.toFixed(2)}**. La canasta básica del hogar la define el INEC según la cantidad de integrantes y sus edades, así que usá este valor como referencia y compáralo con la última publicación oficial para ver si tu gasto está por encima o por debajo.`,
    tone: 'neutral',
    icon: '🛒',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo con ${v1} y ${v2}: resultado ${r.toFixed(2)}.`, _insight };
}
