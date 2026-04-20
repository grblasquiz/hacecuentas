export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function asignacionFamiliarHijoAnsesTramo(i: Inputs): Outputs {
  const ig=Number(i.ingresoGrupoFamiliar)||0; const h=Number(i.cantidadHijos)||0; const hd=Number(i.hijoDiscapacitado)||0;
  let porHijo=0, tramo='';
  if (ig<1000000){ porHijo=55000; tramo='A (mayor asignación)'; }
  else if (ig<1500000){ porHijo=37000; tramo='B'; }
  else if (ig<2000000){ porHijo=22000; tramo='C'; }
  else { porHijo=0; tramo='D (sin derecho a asignación general)'; }
  const porDisc=120000;
  const total=h*porHijo+hd*porDisc;
  return { asignacionPorHijo:`$${porHijo.toLocaleString('es-AR')}`, totalMensual:`$${total.toLocaleString('es-AR')}`, tramo:tramo };
}
