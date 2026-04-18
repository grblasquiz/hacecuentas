export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function edadOptimaAprenderIdiomaNinosAdultos(i: Inputs): Outputs {
  const e=Number(i.edad)||0;
  let v:string; let d:string;
  if (e<6) { v='Absorción natural, acento nativo'; d='Sin gramática consciente'; }
  else if (e<12) { v='Acento bueno, analítico'; d='Necesita inmersión'; }
  else if (e<20) { v='Gramática + buena pronunciación'; d='Motivación fluctúa'; }
  else { v='Disciplina, gramática fuerte'; d='Acento más difícil'; }
  return { ventajas:v, desventajas:d, resumen:`Edad ${e}: ${v}. ${d}.` };
}
