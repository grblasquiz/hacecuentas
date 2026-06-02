export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function gasolinaViajeCarreteraDistanciaAuto(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const _insight={
    title:'Resultado del cálculo',
    text:`Con los valores **${v1}** y **${v2}** el resultado es **${r.toFixed(2)}** (v1 × v2 ÷ 10). Cambiá cualquiera de los dos para ver cómo se mueve.`,
    tone:'neutral',
    icon:'🧮',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`, _insight };
}
