export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function lecturaVelocidadPalabrasMinutoTest(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  return {
    resultado:r.toFixed(2),
    resumen:`Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`,
    _insight: {
      title: 'Resultado',
      text: `Dividiendo **${v1}** entre **${v2}** obtenés **${r.toFixed(2)}**: el primer valor equivale a **${r.toFixed(2)} veces** el segundo.`,
      tone: 'neutral',
      icon: '📚',
    },
  };
}
