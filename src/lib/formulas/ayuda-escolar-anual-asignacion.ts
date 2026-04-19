export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ayudaEscolarAnualAsignacion(i: Inputs): Outputs {
  const h=Number(i.hijos)||0;
  const perHijo=65000;
  const total=h*perHijo;
  return { monto:'$'+total.toLocaleString('es-AR'), porHijo:'$'+perHijo.toLocaleString('es-AR'), resumen:`${h} hijos × $${perHijo.toLocaleString('es-AR')} = $${total.toLocaleString('es-AR')} único anual.` };
}
