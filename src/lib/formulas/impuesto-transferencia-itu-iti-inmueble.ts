export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function impuestoTransferenciaItuItiInmueble(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const u=String(i.viviendaUnica||'no');
  const exento=u==='reemplazo';
  const iti=exento?0:v*0.015;
  return { iti:'$'+iti.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), exento:exento?'Sí (reemplazo único)':'No', resumen:`Venta $${v.toLocaleString('es-AR')}: ITI ${exento?'exento':'$'+iti.toFixed(0)}.` };
}
