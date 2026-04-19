export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function dniExtranjeroResidenciaCostoMigraciones(i: Inputs): Outputs {
  const t=String(i.tipo||'temp-merc');
  const m: Record<string,[number,number]> = { 'temp-merc':[35000,12000], 'temp-no':[90000,12000], perm:[50000,12000] };
  const [mig,dni]=m[t]||m['temp-merc'];
  const total=mig+dni;
  return { migraciones:'$'+mig.toLocaleString('es-AR'), dni:'$'+dni.toLocaleString('es-AR'), total:'$'+total.toLocaleString('es-AR'), resumen:`${t}: Migraciones $${mig.toLocaleString('es-AR')} + DNI $${dni.toLocaleString('es-AR')} = $${total.toLocaleString('es-AR')}.` };
}
