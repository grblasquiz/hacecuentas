/** Email marketing ingreso lista */
export interface Inputs { suscriptoresActivos: number; emailsMes: number; openRate: number; ctr: number; conversionRate: number; aov: number; }
export interface Outputs { ingresoMensual: number; rpmSuscriptor: number; ingresoAnual: number; clicksMes: number; ventasMes: number; _insight?: any; }
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
  const ingMensual = Math.round(revenue);
  const ingAnual = Math.round(revenue * 12);
  const ventasR = Math.round(ventas);
  const fmt = (n: number) => n.toLocaleString('es-AR');
  return {
    ingresoMensual: ingMensual,
    rpmSuscriptor: Number(rpm.toFixed(2)),
    ingresoAnual: ingAnual,
    clicksMes: Math.round(clicks),
    ventasMes: ventasR,
    _insight: {
      title: 'Lo que rinde tu lista',
      text: `Con **${fmt(s)} suscriptores** y ${em} envío(s) al mes, generás unas **${fmt(ventasR)} ventas mensuales** y **$${fmt(ingMensual)}** de ingreso (**$${fmt(ingAnual)}/año**). Cada 1.000 suscriptores te valen **$${rpm.toFixed(2)}** por envío: subí ese RPM mejorando apertura, CTR o ticket promedio.`,
      tone: 'good',
      icon: '📧',
    },
  };
}
