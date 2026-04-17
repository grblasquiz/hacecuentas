/** Email marketing ingreso lista */
export interface Inputs { suscriptoresActivos: number; emailsMes: number; openRate: number; ctr: number; conversionRate: number; aov: number; }
export interface Outputs { ingresoMensual: number; rpmSuscriptor: number; ingresoAnual: number; clicksMes: number; ventasMes: number; }
export function emailMarketingIngresoLista(i: Inputs): Outputs {
  const s = Number(i.suscriptoresActivos);
  const em = Number(i.emailsMes);
  const or = Number(i.openRate) / 100;
  const ctr = Number(i.ctr) / 100;
  const cr = Number(i.conversionRate) / 100;
  const aov = Number(i.aov);
  if (s < 0 || em < 0) throw new Error('Valores inválidos');
  const opens = s * em * or;
  const clicks = opens * ctr;
  const ventas = clicks * cr;
  const revenue = ventas * aov;
  const rpm = s > 0 ? revenue / (s / 1000) : 0;
  return {
    ingresoMensual: Math.round(revenue),
    rpmSuscriptor: Number(rpm.toFixed(2)),
    ingresoAnual: Math.round(revenue * 12),
    clicksMes: Math.round(clicks),
    ventasMes: Math.round(ventas)
  };
}
