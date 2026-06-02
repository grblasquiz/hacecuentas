/** TikTok Spark Ads Costo */
export interface Inputs { budget: number; cpm: number; ctr: number; }
export interface Outputs { impresiones: number; clicks: number; cpcEstimado: string; diasDuracion: string; _insight?: any; }

export function tiktokSparkAdsCosto(i: Inputs): Outputs {
  const b = Number(i.budget);
  const cpm = Number(i.cpm);
  const ctr = Number(i.ctr);
  if (b <= 0 || cpm <= 0 || ctr <= 0) throw new Error('Ingresá valores válidos');
  const impresiones = Math.round((b / cpm) * 1000);
  const clicks = Math.round(impresiones * (ctr / 100));
  const cpc = clicks > 0 ? b / clicks : 0;
  const dias = Math.max(1, Math.floor(b / 50));
  const _insight = {
    title: 'Lo que rinde tu presupuesto',
    text: `Con **$${b.toLocaleString('es-AR')}** a un CPM de $${cpm} comprás unas **${impresiones.toLocaleString('es-AR')} impresiones** y, con CTR de ${ctr}%, ~**${clicks.toLocaleString('es-AR')} clicks** a $${cpc.toFixed(2)} cada uno. Te alcanza para correr la campaña ~${dias} día${dias === 1 ? '' : 's'} respetando el mínimo de $50/día.`,
    tone: 'neutral' as const,
    icon: '🎯',
  };
  return {
    impresiones,
    clicks,
    cpcEstimado: `$${cpc.toFixed(2)} USD por click`,
    diasDuracion: `~${dias} días con mínimo de $50/día`,
    _insight,
  };
}
