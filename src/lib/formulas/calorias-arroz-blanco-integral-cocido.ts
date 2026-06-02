export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function caloriasArrozBlancoIntegralCocido(i: Inputs): Outputs {
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const _insight = {
    title: 'Tu resultado',
    text: v1 > 0
      ? `Con los valores **${v1}** y **${v2}** el cálculo da **${r.toFixed(2)}**. Como referencia, el arroz blanco cocido aporta ~130 kcal por 100 g y el integral ~110 kcal, así que ajustá según la porción real.`
      : `Ingresá los valores para obtener el resultado.`,
    tone: 'neutral',
    icon: '🍚',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`, _insight };
}
