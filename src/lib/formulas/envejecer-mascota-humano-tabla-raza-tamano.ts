export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function envejecerMascotaHumanoTablaRazaTamano(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      cachorro: 'Cachorro/Junior',
      adultoJoven: 'Adulto joven',
      adulto: 'Adulto',
      senior: 'Senior',
      geriatria: 'Geriatría',
      anios: 'años',
    },
    en: {
      cachorro: 'Puppy/Junior',
      adultoJoven: 'Young adult',
      adulto: 'Adult',
      senior: 'Senior',
      geriatria: 'Geriatric',
      anios: 'years',
    },
  } as const)[__lang];
  const t=String(i.tipo||'perro_mediano'); const e=Number(i.edadMascota)||0;
  let h=0;
  if(t==='gato'){ if(e<1) h=e*15; else if(e<2) h=15+(e-1)*9; else h=24+(e-2)*4; }
  else {
    const multByTamano={'perro_chico':4,'perro_mediano':5,'perro_grande':6,'perro_gigante':7}[t];
    if(e<1) h=e*15; else if(e<2) h=15+(e-1)*9; else h=24+(e-2)*multByTamano;
  }
  let etapa='';
  if(h<12) etapa=T.cachorro;
  else if(h<30) etapa=T.adultoJoven;
  else if(h<55) etapa=T.adulto;
  else if(h<70) etapa=T.senior;
  else etapa=T.geriatria;
  const edadHumana = __lang === 'en'
    ? `~${Math.round(h)} years`
    : `~${Math.round(h)} años`;
  const observacion = __lang === 'en'
    ? `${e} pet year${e>1?'s':''} ≈ ${Math.round(h)} human years (${etapa}).`
    : `${e} año${e>1?'s':''} mascota ≈ ${Math.round(h)} humanos (${etapa}).`;
  return { edadHumana, etapa, observacion };
}
