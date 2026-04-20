export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function aireAcondicionadoFrigoriasM2Ambiente(i: Inputs): Outputs {
  const m=Number(i.m2)||0; const o=String(i.orientacion||'norte_sur'); const p=String(i.piso||'intermedio');
  const base=o==='este_oeste'?150:100;
  const mult=p==='ultimo'?1.25:1;
  const fg=m*base*mult;
  const btu=fg*4;
  return { frigoriasRecomendadas:`${Math.round(fg).toLocaleString('es-AR')} fg`, btuEquivalente:`${Math.round(btu).toLocaleString('es-AR')} BTU`, observacion:p==='ultimo'?'Piso último: +25% por techo':'Ambiente estándar' };
}
