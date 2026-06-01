/** Dólar MEP comisión real comparativa brokers (Cocos / IOL / Bull / PPI) */
export interface Inputs { montoArs: number; tipoCambioMep: number; comisionCompraPct: number; comisionVentaPct: number; derechoMercadoPct: number; }
export interface Outputs { dolaresNetos: number; tipoCambioEfectivo: number; spreadVsMepPct: number; costoTotalArs: number; explicacion: string; _chart?: any; _insight?: any; }
export function dolarMepCocosIolComisionReal(i: Inputs): Outputs {
  const ars = Number(i.montoArs);
  const mep = Number(i.tipoCambioMep);
  const cCompra = Number(i.comisionCompraPct) / 100;
  const cVenta = Number(i.comisionVentaPct) / 100;
  const derecho = Number(i.derechoMercadoPct) / 100;
  if (!ars || ars <= 0) throw new Error('Ingresá el monto en pesos');
  if (!mep || mep <= 0) throw new Error('Ingresá el tipo de cambio MEP');
  const compraNeta = ars * (1 - cCompra - derecho);
  const dolaresBrutos = compraNeta / mep;
  const dolaresNetos = dolaresBrutos * (1 - cVenta - derecho);
  const tcEfectivo = ars / dolaresNetos;
  const spread = ((tcEfectivo - mep) / mep) * 100;
  const costoTotal = ars - dolaresNetos * mep;
  const valorDolaresArs = dolaresNetos * mep;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Valor en USD recibido', value: Math.round(valorDolaresArs) },
      { label: 'Costo (comisiones + derechos)', value: Math.round(costoTotal) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(ars).toLocaleString('es-AR'),
    centerLabel: 'Pesos invertidos',
    ariaLabel: 'Composición de los pesos invertidos en dólar MEP: valor en USD efectivamente recibido frente al costo total de comisiones y derechos de mercado.',
  };
  const costoPct = (costoTotal / ars) * 100;
  const insightTone: 'good' | 'warn' | 'neutral' =
    spread >= 3 ? 'warn' : spread <= 1.5 ? 'good' : 'neutral';
  const insightLectura =
    spread >= 3 ? 'es **caro** para un MEP: comisiones + derechos te están comiendo el ida y vuelta, compará brokers o subí el monto para diluir los fijos'
    : spread <= 1.5 ? 'es un costo **bajo** para hacer MEP, estás operando eficiente'
    : 'es un costo **típico** de MEP retail';
  const insight = {
    title: 'Cuánto te cuesta el MEP',
    text: `De los $${Math.round(ars).toLocaleString('es-AR')} que ponés, **$${Math.round(costoTotal).toLocaleString('es-AR')}** (**${costoPct.toFixed(1)}%**) se van en comisiones y derechos. Tu dólar efectivo queda en **$${tcEfectivo.toFixed(2)}**, un **${spread.toFixed(2)}%** sobre el MEP de $${mep}: ${insightLectura}.`,
    tone: insightTone,
    icon: '💸',
  };

  return {
    dolaresNetos: Number(dolaresNetos.toFixed(2)),
    tipoCambioEfectivo: Number(tcEfectivo.toFixed(2)),
    spreadVsMepPct: Number(spread.toFixed(3)),
    costoTotalArs: Number(costoTotal.toFixed(2)),
    explicacion: `Convertís $${ars.toLocaleString('es-AR')} ARS a USD ${dolaresNetos.toFixed(2)} netos. TC efectivo $${tcEfectivo.toFixed(2)} (spread ${spread.toFixed(2)}% vs MEP $${mep}).`,
    _chart: chart,
    _insight: insight,
  };
}
