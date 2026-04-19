export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function proteinaDiariaFisicoculturismoGanarMusculo(i: Inputs): Outputs {
  const p=Number(i.peso)||0; const pg=(Number(i.pctGrasa)||20)/100; const ob=String(i.objetivo||'gn');
  const magra=p*(1-pg);
  const mult: Record<string,number> = { gn:2.0, cn:2.5, mantener:1.6 };
  const prot=magra*mult[ob];
  return { proteinaDia:prot.toFixed(0)+'g', porComida:(prot/4).toFixed(0)+'g (x4 comidas)', resumen:`${p}kg (${pg*100}% grasa) ${ob}: ${prot.toFixed(0)}g proteína/día.` };
}
