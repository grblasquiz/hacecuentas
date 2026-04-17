/** Facturacion minima freelance mes */
export interface Inputs { gastosPersonales: number; gastosTrabajo: number; ahorroObjetivo: number; impuestosPct: number; }
export interface Outputs { facturacionMinima: number; facturacionAnual: number; netoMensual: number; totalGastos: number; }
export function facturarFreelanceMinimoMes(i: Inputs): Outputs {
  const gp = Number(i.gastosPersonales);
  const gt = Number(i.gastosTrabajo);
  const ah = Number(i.ahorroObjetivo);
  const imp = Number(i.impuestosPct) / 100;
  if (gp < 0 || gt < 0 || ah < 0) throw new Error('Valores inválidos');
  if (imp >= 1) throw new Error('Impuestos debe ser menor al 100%');
  const neto = gp + gt + ah;
  const bruta = neto / (1 - imp);
  return {
    facturacionMinima: Math.round(bruta),
    facturacionAnual: Math.round(bruta * 12),
    netoMensual: Math.round(neto),
    totalGastos: Math.round(gp + gt)
  };
}
