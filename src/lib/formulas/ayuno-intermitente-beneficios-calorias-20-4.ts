export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ayunoIntermitenteBeneficiosCalorias204(i: Inputs): Outputs {
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  return {
    resultado:r.toFixed(2),
    resumen:`Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`,
    _insight: {
      title: 'Tu resultado',
      text: `Con tus valores ${v1} y ${v2}, la estimación da **${r.toFixed(2)}**. En el protocolo 20:4 toda la comida entra en una **ventana de 4 horas**, así que apuntá a comidas densas en nutrientes para cubrir tus requerimientos.`,
      tone: 'neutral',
      icon: '⏳',
    },
  };
}
