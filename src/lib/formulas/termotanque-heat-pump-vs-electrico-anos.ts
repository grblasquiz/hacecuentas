/** Años para amortizar termotanque heat pump vs eléctrico según consumo y tarifa. */
export interface Inputs { personasHogar: number; tarifaUsdKwh: number; costoHeatPumpUsd: number; costoElectricoUsd: number; }
export interface Outputs { kwhAnualesElectrico: number; kwhAnualesHeatPump: number; ahorroAnualUsd: number; anosAmortizacion: number; explicacion: string; }
export function termotanqueHeatPumpVsElectricoAnos(i: Inputs): Outputs {
  const p = Number(i.personasHogar);
  const tarifa = Number(i.tarifaUsdKwh);
  const cHp = Number(i.costoHeatPumpUsd);
  const cEl = Number(i.costoElectricoUsd);
  if (!p || p <= 0) throw new Error('Personas en el hogar debe ser mayor a 0');
  if (!tarifa || tarifa <= 0) throw new Error('Tarifa debe ser mayor a 0');
  // Demanda ACS: 50 L/persona/día a 60°C, 4500 kWh/año por familia tipo de 4
  const kwhAnualBase = p * 1100;
  const kwhElectrico = kwhAnualBase / 0.95; // η 95%
  const kwhHeatPump = kwhAnualBase / 3.0; // COP 3.0
  const costoAnualEl = kwhElectrico * tarifa;
  const costoAnualHp = kwhHeatPump * tarifa;
  const ahorroAnual = costoAnualEl - costoAnualHp;
  const sobrecosto = cHp - cEl;
  const anos = sobrecosto / ahorroAnual;
  return {
    kwhAnualesElectrico: Number(kwhElectrico.toFixed(0)),
    kwhAnualesHeatPump: Number(kwhHeatPump.toFixed(0)),
    ahorroAnualUsd: Number(ahorroAnual.toFixed(2)),
    anosAmortizacion: Number(anos.toFixed(1)),
    explicacion: `Para ${p} personas: eléctrico consume ${kwhElectrico.toFixed(0)} kWh/año (USD ${costoAnualEl.toFixed(0)}), heat pump ${kwhHeatPump.toFixed(0)} kWh/año (USD ${costoAnualHp.toFixed(0)}). Ahorro: USD ${ahorroAnual.toFixed(0)}/año. Amortización del sobrecosto: ${anos.toFixed(1)} años.`,
  };
}
