export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoPronunciacionNativaPracticaDiaria(i: Inputs): Outputs {
  const e=Number(i.edad)||25; const m=Number(i.minDia)||0;
  let p:string; let anios:number;
  if (e<12) { p='Alta'; anios=2; }
  else if (e<18) { p='Media'; anios=4; }
  else { p='Baja (acento remanente)'; anios=6; }
  if (m>=60) anios*=0.7;
  return { anios:`${anios.toFixed(0)} años`, probabilidad:p, resumen:`Inicio ${e}a con ${m}min/día: ~${anios.toFixed(0)} años para fluidez (acento: ${p}).` };
}
