export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function creatinaCargaMantenimientoPeso(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p=Number(i.pesoKg)||0; const f=String(i.fase||'mantenimiento');
  let d='', dur='', mom='';
  if(f==='carga'){
    d=`${(p*0.3).toFixed(1)} g/día`;
    dur=__lang==='en'?'5-7 days':'5-7 días';
    mom=__lang==='en'?'4 equal doses with food':'4 tomas iguales con comida';
  }
  else if(f==='mantenimiento'){
    d='3-5 g/día';
    dur=__lang==='en'?'Indefinite':'Indefinido';
    mom=__lang==='en'?'Any time, with or without food':'Cualquier momento, con o sin comida';
  }
  else {
    d='5 g/día';
    dur=__lang==='en'?'From day 1 (saturation 3-4 weeks)':'Desde día 1 (saturación 3-4 semanas)';
    mom=__lang==='en'?'Any time':'Cualquier momento';
  }
  return { dosis:d, duracion:dur, momento:mom };
}
