export interface Inputs { ingresoMensual: number; cuotasActuales?: number; porcentajeMaximo?: number; }
export function cuotaMaximaSegunIngreso(i: Inputs) {
  const ingreso = Number(i.ingresoMensual), actuales = Number(i.cuotasActuales || 0), pct = Number(i.porcentajeMaximo || 30);
  if (!(ingreso > 0)) throw new Error('Ingresá un ingreso mensual mayor que cero.');
  if (actuales < 0 || pct <= 0 || pct > 100) throw new Error('Revisá las cuotas actuales y el porcentaje máximo.');
  const limiteTotal = ingreso * pct / 100, cuotaMaxima = Math.max(0, limiteTotal - actuales), ratioActual = actuales / ingreso * 100;
  return { cuotaMaxima: Math.round(cuotaMaxima), limiteTotal: Math.round(limiteTotal), ratioActual: Number(ratioActual.toFixed(1)), detalle: `Con un límite elegido de ${pct}%, todas tus cuotas no deberían superar $${Math.round(limiteTotal).toLocaleString('es-AR')}. Después de las cuotas actuales, quedarían $${Math.round(cuotaMaxima).toLocaleString('es-AR')} para una cuota nueva.`, _insight:{title:'Es un límite de planificación, no una aprobación',text:'Cada entidad usa políticas propias y puede mirar ingreso bruto, historial, estabilidad y otros compromisos.',tone:cuotaMaxima>0?'neutral':'warn',icon:'🧭'} };
}
