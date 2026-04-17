/** ROI curso Udemy */
export interface Inputs { horasProduccion: number; precioPublicado: number; alumnosEsperados: number; valorHora: number; }
export interface Outputs { ingresoAnual: number; costoOportunidad: number; roiPct: number; precioEfectivo: number; mesesPayback: number; }
export function roiCursoOnlineUdemy(i: Inputs): Outputs {
  const hs = Number(i.horasProduccion);
  const precio = Number(i.precioPublicado);
  const alumnos = Number(i.alumnosEsperados);
  const valorHora = Number(i.valorHora);
  if (hs < 0 || precio < 0 || alumnos < 0) throw new Error('Valores inválidos');
  const precioEfectivo = Math.max(10, precio * 0.15);
  const revenueShare = 0.50;
  const ingreso = alumnos * precioEfectivo * revenueShare;
  const costoOp = hs * valorHora;
  const roi = costoOp > 0 ? ((ingreso - costoOp) / costoOp) * 100 : 0;
  const ingresoMensual = ingreso / 12;
  const payback = ingresoMensual > 0 ? costoOp / ingresoMensual : 999;
  return {
    ingresoAnual: Math.round(ingreso),
    costoOportunidad: Math.round(costoOp),
    roiPct: Number(roi.toFixed(2)),
    precioEfectivo: Number(precioEfectivo.toFixed(2)),
    mesesPayback: Number(payback.toFixed(1))
  };
}
