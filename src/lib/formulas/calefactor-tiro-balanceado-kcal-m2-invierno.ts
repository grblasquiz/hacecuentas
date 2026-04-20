export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function calefactorTiroBalanceadoKcalM2Invierno(i: Inputs): Outputs {
  const m=Number(i.m2)||0; const h=Number(i.alturaTecho)||2.5; const a=String(i.aislacion||'regular');
  const factor={'buena':40,'regular':50,'mala':60}[a];
  const kcal=m*h*factor;
  const modelos=[2500,3000,4000,5500,7500]; const sug=modelos.find(x=>x>=kcal)||7500;
  return { kcalHora:`${Math.round(kcal).toLocaleString('es-AR')} kcal/h`, modeloSugerido:`${sug} kcal/h (tiro balanceado)`, observacion:a==='mala'?'Mala aislación: considerá aislar techo/ventanas':'Dimensionado correcto' };
}
