export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function envejecerMascotaHumanoTablaRazaTamano(i: Inputs): Outputs {
  const t=String(i.tipo||'perro_mediano'); const e=Number(i.edadMascota)||0;
  let h=0;
  if(t==='gato'){ if(e<1) h=e*15; else if(e<2) h=15+(e-1)*9; else h=24+(e-2)*4; }
  else {
    const multByTamano={'perro_chico':4,'perro_mediano':5,'perro_grande':6,'perro_gigante':7}[t];
    if(e<1) h=e*15; else if(e<2) h=15+(e-1)*9; else h=24+(e-2)*multByTamano;
  }
  let etapa='';
  if(h<12) etapa='Cachorro/Junior';
  else if(h<30) etapa='Adulto joven';
  else if(h<55) etapa='Adulto';
  else if(h<70) etapa='Senior';
  else etapa='Geriatría';
  return { edadHumana:`~${Math.round(h)} años`, etapa:etapa, observacion:`${e} año${e>1?'s':''} mascota ≈ ${Math.round(h)} humanos (${etapa}).` };
}
