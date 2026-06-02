export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | undefined | Record<string, any>; _insight?: any; }
export function litrosNaftaPorSalarioPoderCompra(i: Inputs): Outputs {
  const s=Number(i.sueldo)||0; const p=Number(i.precio)||1;
  const l=s/p;
  const tanques = l / 50;
  const insight = {
    title: 'Tu salario en nafta',
    text: `Con tu sueldo podés comprar **${l.toFixed(0)} litros** de nafta, lo que rinde unos **${(l*10).toFixed(0)} km** o llena **${tanques.toFixed(1)} tanques** de 50 L. Es un termómetro directo de tu poder de compra frente al combustible.`,
    tone: 'neutral',
    icon: '⛽',
  };
  return { litros:`${l.toFixed(0)} L`, km:`${(l*10).toFixed(0)} km`, resumen:`$${s} / $${p} = ${l.toFixed(0)} litros.`, _insight: insight };
}
