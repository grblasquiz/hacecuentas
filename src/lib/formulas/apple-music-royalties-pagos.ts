/** Apple Music Royalties */
export interface Inputs { streamsMensuales: number; tier: string; comisionDistribuidor: number; }
export interface Outputs { rate: string; ingresoMensual: string; ingresoAnual: string; netoAnual: string; _insight?: any; _chart?: any; }

export function appleMusicRoyaltiesPagos(i: Inputs): Outputs {
  const sm = Number(i.streamsMensuales);
  const t = String(i.tier);
  const com = Number(i.comisionDistribuidor) || 0;
  if (sm < 0) throw new Error('Streams inválidos');
  const rates: Record<string, number> = {
    'Tier 1 (EEUU, Canadá, UK)': 0.0085,
    'Tier 2 (Europa occidental)': 0.0065,
    'Tier 3 (LATAM, Brasil)': 0.0040,
    'Tier 4 (Asia emergente)': 0.0018,
  };
  const rate = rates[t] || 0.006;
  const mensual = sm * rate;
  const anualBruto = mensual * 12;
  const netoAnual = anualBruto * (1 - com / 100);
  const comisionMonto = anualBruto - netoAnual;

  const fmtUSD = (n: number) =>
    '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const comisionAlta = com >= 20;
  const _insight = {
    title: comisionAlta ? 'Tu distribuidor se queda con bastante' : 'Lo que te llevás de Apple Music',
    text: com > 0
      ? `Con **${sm.toLocaleString('es-AR')} streams/mes** a ${rate.toFixed(4)} USD, generás **${fmtUSD(anualBruto)}/año** brutos, pero el **${com}%** del distribuidor se lleva ${fmtUSD(comisionMonto)} y te quedan **${fmtUSD(netoAnual)}** netos.`
      : `Con **${sm.toLocaleString('es-AR')} streams/mes** a ${rate.toFixed(4)} USD por reproducción, juntás **${fmtUSD(anualBruto)}/año**. Apple paga por tier de país: subir el peso de oyentes de EE.UU./UK mejora el rate promedio.`,
    tone: comisionAlta ? 'warn' : 'neutral',
    icon: '🎵',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Neto para vos', value: Number(netoAnual.toFixed(2)) },
      { label: `Distribuidor (${com}%)`, value: Number(comisionMonto.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: fmtUSD(anualBruto),
    centerLabel: 'bruto anual',
    ariaLabel: `Reparto del ingreso anual bruto de ${fmtUSD(anualBruto)}: ${fmtUSD(netoAnual)} netos y ${fmtUSD(comisionMonto)} de comisión del distribuidor`,
  };

  return {
    rate: `$${rate.toFixed(4)} USD por stream`,
    ingresoMensual: `$${mensual.toFixed(2)} USD/mes`,
    ingresoAnual: `$${anualBruto.toFixed(2)} USD/año`,
    netoAnual: `$${netoAnual.toFixed(2)} USD/año (después de ${com}%)`,
    _insight,
    _chart,
  };
}
