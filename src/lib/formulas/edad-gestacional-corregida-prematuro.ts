export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function edadGestacionalCorregidaPrematuro(i: Inputs): Outputs {
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  return {
    resultado:r.toFixed(2),
    resumen:`Cálculo con ${v1} y ${v2}: resultado ${r.toFixed(2)}.`,
    _insight: {
      title: 'Tu resultado',
      text: `Con los valores **${v1}** y **${v2}** el resultado es **${r.toFixed(2)}**. La edad corregida ajusta la edad cronológica restando las semanas de prematurez, y se usa hasta los 2 años para valorar el desarrollo del bebé.`,
      tone: 'neutral',
      icon: '👶',
    },
  };
}
