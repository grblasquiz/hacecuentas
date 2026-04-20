export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoAnualMascotaPerroGatoArCompleto(i: Inputs): Outputs {
  const t=String(i.tipo||'perro_mediano'); const m=String(i.marcaComida||'media');
  const kgMes={'perro_chico':8,'perro_mediano':20,'perro_grande':40,'gato':3}[t];
  const precioKg={'economica':3500,'media':6000,'premium':10000}[m];
  const comida=kgMes*precioKg;
  const vet=t==='gato'?120000:180000; // anual
  const acc=t==='gato'?60000:120000; // anual
  const pelu=t==='perro_grande'?240000:t==='perro_mediano'?120000:0;
  const anual=comida*12+vet+acc+pelu;
  return { comidaMensual:`$${Math.round(comida).toLocaleString('es-AR')}`, costoAnual:`$${Math.round(anual).toLocaleString('es-AR')}`, desglose:`Comida $${Math.round(comida*12/1000)}k + Vet $${vet/1000}k + Accs $${acc/1000}k${pelu>0?` + Peluquería $${pelu/1000}k`:''}` };
}
