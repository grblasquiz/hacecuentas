/** YT ingresos por pais */
export interface YoutubeIngresosVistasPaisInputs { vistasMensuales: number; pctTier1: number; pctTier2: number; pctTier3: number; }
export interface YoutubeIngresosVistasPaisOutputs { cpmPonderado: number; rpmPonderado: number; ingresoMensual: number; ingresoAnual: number; }
export function youtubeIngresosVistasPais(i: YoutubeIngresosVistasPaisInputs): YoutubeIngresosVistasPaisOutputs {
  const v=Number(i.vistasMensuales), t1=Number(i.pctTier1), t2=Number(i.pctTier2), t3=Number(i.pctTier3);
  if (!v || v<=0) throw new Error('Vistas invalidas');
  if (Math.abs(t1+t2+t3-100) > 0.5) throw new Error('Los porcentajes deben sumar 100');
  const cpm=(t1*12+t2*5+t3*1.5)/100, rpm=cpm*0.55, m=(v/1000)*rpm;
  return { cpmPonderado:+cpm.toFixed(2), rpmPonderado:+rpm.toFixed(2), ingresoMensual:+m.toFixed(2), ingresoAnual:+(m*12).toFixed(2) };
}
