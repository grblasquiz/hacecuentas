export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function gananciasTramosEmpleadoMensual2026(i: Inputs): Outputs {
  const s=Number(i.sueldoBrutoMensual)||0;
  const tramos=[[1800000,0.05],[2200000,0.09],[2700000,0.12],[3300000,0.15],[4000000,0.19],[5000000,0.23],[6500000,0.27],[9000000,0.31]];
  let imp=0, prev=0, alic=0.35;
  for (const [tope,al] of tramos) { if (s<=tope) { imp+=(s-prev)*al; alic=al; break; } else { imp+=(tope-prev)*al; prev=tope; } }
  if (s>9000000) imp+=(s-9000000)*0.35;
  return { retencion:'$'+imp.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), alicuotaMarginal:(alic*100).toFixed(0)+'%', resumen:`Sueldo $${s.toLocaleString('es-AR')}: retención ganancias ~$${imp.toFixed(0)}, tramo marginal ${(alic*100).toFixed(0)}%.` };
}
