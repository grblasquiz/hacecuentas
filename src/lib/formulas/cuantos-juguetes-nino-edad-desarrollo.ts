export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function cuantosJuguetesNinoEdadDesarrollo(i: Inputs): Outputs {
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  return {
    resultado:r.toFixed(2),
    resumen:`Cálculo con ${v1} y ${v2}: resultado ${r.toFixed(2)}.`,
    _insight: {
      title: 'Resultado del cálculo',
      text: `Con los valores **${v1}** y **${v2}** el resultado es **${r.toFixed(2)}**. Cambiá los datos de entrada para ver cómo varía.`,
      tone: 'neutral',
      icon: '🧸'
    }
  };
}
