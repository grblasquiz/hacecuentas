/** Twitter/X Monetización */
export interface Inputs { impresionesMensuales: number; nicho: string; premium: string; }
export interface Outputs { rpmEstimado: string; ingresoMensual: string; ingresoAnual: string; netoAnual: string; }

export function twitterXMonetizacionIngreso(i: Inputs): Outputs {
  const imp = Number(i.impresionesMensuales) || 0;
  const n = String(i.nicho);
  const pr = String(i.premium);
  const rpmBase: Record<string, { p: number; pp: number }> = {
    'Finanzas / trading': { p: 5, pp: 8 },
    'Negocios / marketing B2B': { p: 4, pp: 6.5 },
    'Tech / SaaS': { p: 3, pp: 5 },
    'Entretenimiento / memes': { p: 1, pp: 1.5 },
    'Política / opinión': { p: 1.5, pp: 2.5 },
    'Deportes': { p: 1.5, pp: 2.5 },
    'Gaming': { p: 1.2, pp: 2 },
    'Lifestyle': { p: 0.75, pp: 1.5 },
  };
  const r = rpmBase[n] || { p: 1, pp: 2 };
  const rpm = pr.startsWith('Premium+') ? r.pp : r.p;
  const costoPrem = pr.startsWith('Premium+') ? 16 : 8;
  const mensual = (imp / 1000000) * rpm;
  const anual = mensual * 12;
  const neto = anual - (costoPrem * 12);
  return {
    rpmEstimado: `$${rpm.toFixed(2)} USD por millón impresiones`,
    ingresoMensual: `$${mensual.toFixed(2)} USD/mes`,
    ingresoAnual: `$${anual.toFixed(2)} USD/año`,
    netoAnual: `$${neto.toFixed(2)} USD/año (después de $${costoPrem * 12} Premium)`,
  };
}
