export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function costoAnualMascotaPerroGatoArCompleto(i: Inputs): Outputs {
  const t=String(i.tipo||'perro_mediano'); const m=String(i.marcaComida||'media');
  const kgMes={'perro_chico':8,'perro_mediano':20,'perro_grande':40,'gato':3}[t];
  const precioKg={'economica':3500,'media':6000,'premium':10000}[m];
  const comida=kgMes*precioKg;
  const vet=t==='gato'?120000:180000; // anual
  const acc=t==='gato'?60000:120000; // anual
  const pelu=t==='perro_grande'?240000:t==='perro_mediano'?120000:0;
  const comidaAnual=comida*12;
  const anual=comidaAnual+vet+acc+pelu;

  const fmt=(n:number)=>Math.round(n).toLocaleString('es-AR');
  const pctComida=anual>0?Math.round((comidaAnual/anual)*100):0;
  const _insight={
    title:'Cuánto sale tener tu mascota al año',
    text:`Cuidar a tu mascota cuesta unos **$${fmt(anual)}/año** (~$${fmt(anual/12)}/mes). `+
      `La **comida** es el rubro más pesado: se lleva el **${pctComida}%** del total con $${fmt(comidaAnual)} al año.`,
    tone:'neutral' as const,
    icon:t==='gato'?'🐱':'🐶',
  };
  const _chart={
    type:'doughnut',
    slices:[
      {label:'Comida (anual)',value:Math.round(comidaAnual)},
      {label:'Veterinario',value:vet},
      {label:'Accesorios e higiene',value:acc},
      ...(pelu>0?[{label:'Peluquería',value:pelu}]:[]),
    ],
    prefix:'$',
    centerValue:`$${fmt(anual)}`,
    centerLabel:'Costo anual',
    ariaLabel:`Reparto del costo anual de la mascota de $${fmt(anual)} entre comida, veterinario, accesorios${pelu>0?' y peluquería':''}`,
  };

  return { comidaMensual:`$${Math.round(comida).toLocaleString('es-AR')}`, costoAnual:`$${Math.round(anual).toLocaleString('es-AR')}`, desglose:`Comida $${Math.round(comida*12/1000)}k + Vet $${vet/1000}k + Accs $${acc/1000}k${pelu>0?` + Peluquería $${pelu/1000}k`:''}`, _insight, _chart };
}
