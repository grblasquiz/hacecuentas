export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function visaTurismoPaisesCostoTiempo(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const insight = {
    title: `Resultado: ${r.toFixed(2)}`,
    text: `Multiplicar **${v1}** por **${v2}** y dividir por 10 da **${r.toFixed(2)}**. El costo y el tiempo reales de una visa de turismo dependen del país y del consulado: confirmá tasas y plazos en el sitio oficial antes de viajar.`,
    tone: 'neutral' as const,
    icon: '🛂',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`, _insight:insight };
}
