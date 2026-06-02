export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function impuestosFreelanceUsaArgentinaDoble(i: Inputs): Outputs {
  const f=Number(i.facturacionAnualUsd)||0;
  const arsFact=f*1200;
  let imp=0;
  if(arsFact<72000000){imp=arsFact*0.08} // monotributo
  else {imp=arsFact*0.3} // IVA + ganancias + IIBB aprox
  const tasa=arsFact>0?(imp/arsFact*100):0;

  const impUsd=Math.round(imp/1200);
  const netoUsd=Math.max(0,Math.round(f-imp/1200));
  const esMono=arsFact<72000000;
  const tone:'good'|'warn'|'neutral'=tasa>=30?'warn':tasa>=15?'neutral':'good';
  const insight={
    title:'Tu carga fiscal en Argentina',
    text:`Facturando **USD ${Math.round(f).toLocaleString('en-US')}/año** desde EE.UU., en Argentina tributás aprox. **USD ${impUsd.toLocaleString('en-US')}** (tasa efectiva **${tasa.toFixed(1)}%**) y te quedan **USD ${netoUsd.toLocaleString('en-US')}** netos. ${esMono?'Estás dentro del Monotributo, el régimen más liviano.':'Superás el tope de Monotributo: como Responsable Inscripto la presión sube fuerte.'}`,
    tone,
    icon:'🌎',
  };
  const chart=f>0?{
    type:'doughnut' as const,
    slices:[
      {label:'Neto para vos',value:netoUsd},
      {label:'Impuestos AR',value:impUsd},
    ].filter((s)=>s.value>0),
    prefix:'USD ',
    centerValue:`USD ${Math.round(f).toLocaleString('en-US')}`,
    centerLabel:'Facturado',
    ariaLabel:'Reparto de la facturación anual en dólares entre neto e impuestos argentinos',
  }:undefined;

  return { impuestoAr:`USD ${impUsd.toLocaleString('en-US')}`, tasaEfectiva:`${tasa.toFixed(1)}%`, observacion:arsFact<72000000?'Monotributo Categoría alta.':'Responsable Inscripto. Consultá contador.', _insight:insight, _chart:chart };
}
