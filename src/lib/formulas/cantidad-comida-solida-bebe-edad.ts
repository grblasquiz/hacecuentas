export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cantidadComidaSolidaBebeEdad(i: Inputs): Outputs {
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const insight = { title: 'Orientativo, no prescriptivo', text: `El cálculo da **${r.toFixed(2)}** como referencia. La cantidad de sólidos arranca de a poco (2-3 cucharadas a los 6 meses) y sube gradual; tomá esto como guía y respetá las señales de hambre y saciedad del bebé.`, tone: 'neutral', icon: '🥄' };
  return { resultado:r.toFixed(2), resumen:`Cálculo con ${v1} y ${v2}: resultado ${r.toFixed(2)}.`, _insight: insight };
}
