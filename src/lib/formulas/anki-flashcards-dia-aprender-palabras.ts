export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ankiFlashcardsDiaAprenderPalabras(i: Inputs): Outputs {
  const o=Number(i.objetivo)||1000; const m=Number(i.meses)||6;
  const dias=m*30; const nuevas=o/dias;
  const min=nuevas*1.5;
  return { nuevas:`${nuevas.toFixed(0)}/día`, tiempo:`${min.toFixed(0)}min/día aprox`, resumen:`${o} palabras en ${m}m: ${nuevas.toFixed(0)} cards nuevas/día.` };
}
