export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function masaGrasaVsMasaMagraComposicion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      muyBajo: 'Muy bajo (atlético o riesgo)',
      bajo: 'Bajo/Óptimo hombre',
      normal: 'Normal',
      sobrepeso: 'Sobrepeso graso',
      obesidad: 'Obesidad',
    },
    en: {
      muyBajo: 'Very low (athletic or at risk)',
      bajo: 'Low/Optimal (male)',
      normal: 'Normal',
      sobrepeso: 'Overweight (high fat)',
      obesidad: 'Obesity',
    },
  } as const)[__lang];
  const p=Number(i.pesoKg)||0; const g=Number(i.porcentajeGrasa)||0;
  const mg=p*g/100; const mm=p-mg;
  let clas='';
  if(g<10) clas=T.muyBajo;
  else if(g<20) clas=T.bajo;
  else if(g<25) clas=T.normal;
  else if(g<30) clas=T.sobrepeso;
  else clas=T.obesidad;
  return { masaGrasa:`${mg.toFixed(1)} kg`, masaMagra:`${mm.toFixed(1)} kg`, clasificacion:clas };
}
