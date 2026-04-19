export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function asignacionDesempleoSeguroPrestacionAnses(i: Inputs): Outputs {
  const s=Number(i.ultimoSueldoBruto)||0; const m=Number(i.mesesCotizados)||0;
  const monto=Math.min(s*0.5,1200000);
  let meses=0;
  if (m>=36) meses=12; else if (m>=24) meses=8; else if (m>=12) meses=4; else if (m>=6) meses=2;
  const total=monto*meses;
  return { monto:'$'+monto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), meses:meses.toString(), total:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Sueldo $${s.toLocaleString('es-AR')}, ${m} meses cotizados: ${meses} meses × $${monto.toFixed(0)}.` };
}
