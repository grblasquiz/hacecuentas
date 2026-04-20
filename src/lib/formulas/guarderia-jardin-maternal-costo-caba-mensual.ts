export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function guarderiaJardinMaternalCostoCabaMensual(i: Inputs): Outputs {
  const t=String(i.tipo||'privado_tradicional'); const h=String(i.horario||'jornada_completa');
  const base={'publico':0,'privado_comunitario':120000,'privado_tradicional':500000,'bilingüe':1000000}[t];
  const mult=h==='jornada_completa'?1:0.65;
  const costo=base*mult;
  const inc=h==='jornada_completa'?'Desayuno + almuerzo + merienda. Actividades.':'Desayuno o merienda. Actividades.';
  return { costoMensual:t==='publico'?'Gratis':`$${Math.round(costo).toLocaleString('es-AR')}`, incluye:inc, observacion:t==='publico'?'Gratuito pero lista de espera':'Privado: verificar inscripción anticipada' };
}
