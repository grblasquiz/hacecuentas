export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function masaGrasaVsMasaMagraComposicion(i: Inputs): Outputs {
  const p=Number(i.pesoKg)||0; const g=Number(i.porcentajeGrasa)||0;
  const mg=p*g/100; const mm=p-mg;
  let clas='';
  if(g<10) clas='Muy bajo (atlético o riesgo)';
  else if(g<20) clas='Bajo/Óptimo hombre';
  else if(g<25) clas='Normal';
  else if(g<30) clas='Sobrepeso graso';
  else clas='Obesidad';
  return { masaGrasa:`${mg.toFixed(1)} kg`, masaMagra:`${mm.toFixed(1)} kg`, clasificacion:clas };
}
