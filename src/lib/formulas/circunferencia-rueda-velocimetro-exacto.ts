export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function circunferenciaRuedaVelocimetroExacto(i: Inputs): Outputs {
  const w=Number(i.ancho)||0; const a=Number(i.aspect)||0; const r=Number(i.rin)||0;
  const d=r*25.4+w*a/100*2;
  const c=d*Math.PI/1000;
  return { circ:`${c.toFixed(3)} m`, ms:`${c.toFixed(3)} m`, calibracion:`${c.toFixed(3)} m/rev`, resumen:`${w}/${a}R${r}: circunferencia ${c.toFixed(2)}m.` };
}
