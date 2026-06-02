/** Años para amortizar instalación solar on-grid en AR según consumo y tarifa. */
export interface Inputs { consumoKwhMes: number; tarifaArsKwh: number; potenciaInstaladaKw: number; costoInstalacionUsd: number; tipoCambio: number; }
export interface Outputs { generacionAnualKwh: number; ahorroAnualArs: number; ahorroAnualUsd: number; anosAmortizacion: number; explicacion: string; _insight?: any; _chart?: any; }
export function panelesSolaresAmortizacionAnosArgentina(i: Inputs): Outputs {
  const consumo = Number(i.consumoKwhMes);
  const tarifa = Number(i.tarifaArsKwh);
  const kwInst = Number(i.potenciaInstaladaKw);
  const costo = Number(i.costoInstalacionUsd);
  const tc = Number(i.tipoCambio);
  if (!consumo || !tarifa || !kwInst || !costo || !tc) throw new Error('Completá todos los campos');
  // Generación AR promedio: 1500 kWh/año por kWp instalado
  const generacionAnual = kwInst * 1500;
  const consumoAnual = consumo * 12;
  const inyectado = Math.max(0, generacionAnual - consumoAnual);
  const autoconsumido = Math.min(generacionAnual, consumoAnual);
  // Inyección a red bajo Ley 27.424 se paga ~70% de la tarifa final
  const ahorroArs = autoconsumido * tarifa + inyectado * tarifa * 0.7;
  const ahorroUsd = ahorroArs / tc;
  const anos = costo / ahorroUsd;
  const anosR = Number(anos.toFixed(1));

  const tone: 'good' | 'warn' | 'neutral' = anosR <= 6 ? 'good' : (anosR <= 10 ? 'neutral' : 'warn');
  const cobertura = consumoAnual > 0 ? Math.round((generacionAnual / consumoAnual) * 100) : 0;
  const insightText = anosR <= 6
    ? `Recuperás los **USD ${costo.toLocaleString('es-AR')}** en **${anosR} años** y el sistema dura 25+: amortización rápida para Argentina, con ahorro de **$${ahorroArs.toLocaleString('es-AR')}/año**.`
    : (anosR <= 10
        ? `La inversión se paga en **${anosR} años** con un ahorro de **$${ahorroArs.toLocaleString('es-AR')}/año**. Razonable frente a una vida útil de 25+ años, pero sensible a la tarifa eléctrica y al tipo de cambio.`
        : `La amortización tarda **${anosR} años**: la inyección a red se paga al 70% de la tarifa y el excedente generado (${cobertura}% de tu consumo) rinde menos. Revisá si conviene achicar la potencia instalada al consumo real.`);

  return {
    generacionAnualKwh: Number(generacionAnual.toFixed(0)),
    ahorroAnualArs: Number(ahorroArs.toFixed(0)),
    ahorroAnualUsd: Number(ahorroUsd.toFixed(2)),
    anosAmortizacion: anosR,
    explicacion: `Sistema de ${kwInst} kWp genera ${generacionAnual.toFixed(0)} kWh/año. Ahorro: $${ahorroArs.toLocaleString('es-AR')} ARS (USD ${ahorroUsd.toFixed(0)}). Amortización: ${anos.toFixed(1)} años.`,
    _insight: {
      title: 'Amortización de tu instalación solar',
      text: insightText,
      tone,
      icon: '☀️',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Autoconsumo', value: Math.round(autoconsumido) },
        { label: 'Inyectado a red', value: Math.round(inyectado) },
      ],
      prefix: '',
      centerValue: `${generacionAnual.toFixed(0)} kWh`,
      centerLabel: 'Generación anual',
      ariaLabel: `Generación anual de ${generacionAnual.toFixed(0)} kWh: ${Math.round(autoconsumido)} kWh de autoconsumo y ${Math.round(inyectado)} kWh inyectados a la red`,
    },
  };
}
