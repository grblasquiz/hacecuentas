export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function spfProteccionSolarMinutosPiel(i: Inputs): Outputs {
  const p=String(i.tipoPiel||'III'); const spf=Number(i.spf)||30;
  const baseMin={'I':7,'II':10,'III':15,'IV':20,'V':30,'VI':60}[p];
  const min=baseMin*spf;
  return { minutosProteccion:`${min} min teóricos (${Math.round(min/60)} h)`, reaplicar:'Cada 2 horas (independiente SPF)', advertencia:'Tiempo teórico. Real es menor por sudor, agua, fricción.' };
}
