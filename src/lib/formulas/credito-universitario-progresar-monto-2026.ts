export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function creditoUniversitarioProgresarMonto2026(i: Inputs): Outputs {
  const n=String(i.nivel||'superior'); const l=String(i.lineaProgresar||'b');
  const base={'obligatorio':40000,'superior':80000,'trabajo':70000}[n];
  const mult={'a':1,'b':1,'c':1}[l];
  const monto=base*mult;
  return { montoMensual:`$${monto.toLocaleString('es-AR')} (10 meses/año)`, requisitos:'Ingresos familiares <3 SMVM, regularidad estudios, edad según línea.', tramite:'mi.ANSES + IVE (Informe Valoración Estudios).' };
}
