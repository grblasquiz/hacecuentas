export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function fertilidadAmhReservaOvaricaEdad(i: Inputs): Outputs {
  const a=Number(i.amhNgMl)||0; const e=Number(i.edadMujer)||0;
  let rangoBajo=0.8, rangoAlto=3.0;
  if(e<30){rangoBajo=2.0;rangoAlto=5.0} else if(e<35){rangoBajo=1.5;rangoAlto=4.0} else if(e<40){rangoBajo=0.9;rangoAlto=3.0} else {rangoBajo=0.5;rangoAlto=2.0}
  let clas='', fert='', rec='';
  if(a<rangoBajo){clas='Disminuida';fert='Menor';rec='Consulta con especialista en fertilidad'}
  else if(a<=rangoAlto){clas='Normal para la edad';fert='Adecuada';rec='Mantén controles regulares'}
  else {clas='Alta (posible SOP)';fert='Variable';rec='Evaluar por endocrino/ginecólogo'}
  return { clasificacion:clas, fertilidad:fert, recomendacion:rec };
}
