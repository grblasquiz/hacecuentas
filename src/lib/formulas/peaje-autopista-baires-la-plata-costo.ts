export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function peajeAutopistaBairesLaPlataCosto(i: Inputs): Outputs {
  const r=String(i.ruta||'panamericana'); const h=String(i.horario||'valle');
  const base={'panamericana':400,'accesso_oeste':350,'autopista_la_plata':600,'acceso_norte':300,'25_de_mayo':250}[r];
  const mult={'pico':1.25,'valle':1,'noche':0.8}[h];
  const total=base*mult; const tele=total*0.9;
  return { peajeTotal:`$${Math.round(total).toLocaleString('es-AR')}`, descuentoTelepase:`$${Math.round(tele).toLocaleString('es-AR')}`, frecuencia:'Por tramo/estación' };
}
