export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function asignacionFamiliarEmpleadoRegistradoAnses(i: Inputs): Outputs {
  const i_=Number(i.ingresoGrupoFam)||0; const h=Number(i.hijos)||0;
  let porHijo=0; let rango='';
  if (i_<=1300000) { porHijo=85000; rango='Rango 1'; }
  else if (i_<=1900000) { porHijo=57000; rango='Rango 2'; }
  else if (i_<=2200000) { porHijo=34000; rango='Rango 3'; }
  else if (i_<=2600000) { porHijo=17000; rango='Rango 4'; }
  else { porHijo=0; rango='Fuera de tope'; }
  const total=porHijo*h;
  return { porHijo:'$'+porHijo.toLocaleString('es-AR'), total:'$'+total.toLocaleString('es-AR'), rango, resumen:`${h} hijos, ingreso grupo $${i_.toLocaleString('es-AR')}: $${total.toLocaleString('es-AR')}/mes (${rango}).` };
}
