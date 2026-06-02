export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function presupuestoMochileroBackpackerDiaPais(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  return {
    resultado:r.toFixed(2),
    resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`,
    _insight: {
      title: "Tu estimación de mochilero",
      text: `Con los datos cargados, la estimación de gasto da **${r.toFixed(2)}** por día. Viajar como mochilero implica priorizar hostels, transporte público y comida local: ahí está el margen para estirar el presupuesto.`,
      tone: "neutral",
      icon: "🎒",
    },
  };
}
