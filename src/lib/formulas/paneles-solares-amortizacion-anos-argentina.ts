/** Años para amortizar instalación solar on-grid en AR según consumo y tarifa. */
export interface Inputs { consumoKwhMes: number; tarifaArsKwh: number; potenciaInstaladaKw: number; costoInstalacionUsd: number; tipoCambio: number; }
export interface Outputs { generacionAnualKwh: number; ahorroAnualArs: number; ahorroAnualUsd: number; anosAmortizacion: number; explicacion: string; }
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
  return {
    generacionAnualKwh: Number(generacionAnual.toFixed(0)),
    ahorroAnualArs: Number(ahorroArs.toFixed(0)),
    ahorroAnualUsd: Number(ahorroUsd.toFixed(2)),
    anosAmortizacion: Number(anos.toFixed(1)),
    explicacion: `Sistema de ${kwInst} kWp genera ${generacionAnual.toFixed(0)} kWh/año. Ahorro: $${ahorroArs.toLocaleString('es-AR')} ARS (USD ${ahorroUsd.toFixed(0)}). Amortización: ${anos.toFixed(1)} años.`,
  };
}
