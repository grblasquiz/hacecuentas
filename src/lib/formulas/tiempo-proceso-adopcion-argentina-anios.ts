export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoProcesoAdopcionArgentinaAnios(i: Inputs): Outputs {
  const e=Number(i.edadBuscada)||0;
  let t:string; let p:string;
  if (e<=2) { t='3-5+ años'; p='Baja disponibilidad'; }
  else if (e<=5) { t='2-4 años'; p='Media'; }
  else if (e<=10) { t='1-3 años'; p='Alta'; }
  else { t='<1 año'; p='Muy alta'; }
  return { tiempoProm:t, probable:p, resumen:`Edad buscada ${e}: espera ${t}, disponibilidad ${p}.` };
}
