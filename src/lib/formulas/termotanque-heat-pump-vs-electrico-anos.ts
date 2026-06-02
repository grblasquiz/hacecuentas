/** Años para amortizar termotanque heat pump vs eléctrico según consumo y tarifa. */
export interface Inputs { personasHogar: number; tarifaUsdKwh: number; costoHeatPumpUsd: number; costoElectricoUsd: number; }
export interface Outputs { kwhAnualesElectrico: number; kwhAnualesHeatPump: number; ahorroAnualUsd: number; anosAmortizacion: number; explicacion: string; _insight?: any; }
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

  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (sobrecosto <= 0) {
    insightTone = 'good';
    insightText = `El heat pump sale **igual o más barato de entrada** y encima ahorra **USD ${ahorroAnual.toFixed(0)}/año** en electricidad: la decisión es inmediata, recuperás todo desde el primer día.`;
  } else if (ahorroAnual <= 0) {
    insightTone = 'warn';
    insightText = `Con esta tarifa el heat pump **no genera ahorro anual**, así que el sobrecosto de USD ${sobrecosto.toFixed(0)} no se amortiza. Conviene revisar la tarifa o el consumo antes de cambiar.`;
  } else if (anos <= 5) {
    insightTone = 'good';
    insightText = `Recuperás el sobrecosto de **USD ${sobrecosto.toFixed(0)}** en solo **${anos.toFixed(1)} años** gracias a un ahorro de **USD ${ahorroAnual.toFixed(0)}/año**: muy buena inversión, dura mucho más que eso.`;
  } else if (anos <= 10) {
    insightTone = 'neutral';
    insightText = `El sobrecosto de **USD ${sobrecosto.toFixed(0)}** se paga solo en **${anos.toFixed(1)} años** con un ahorro de **USD ${ahorroAnual.toFixed(0)}/año**: razonable dentro de la vida útil del equipo.`;
  } else {
    insightTone = 'warn';
    insightText = `Tarda **${anos.toFixed(1)} años** en amortizar el sobrecosto de USD ${sobrecosto.toFixed(0)} (ahorro de solo USD ${ahorroAnual.toFixed(0)}/año): puede acercarse a la vida útil del equipo, evaluá con cuidado.`;
  }

  return {
    kwhAnualesElectrico: Number(kwhElectrico.toFixed(0)),
    kwhAnualesHeatPump: Number(kwhHeatPump.toFixed(0)),
    ahorroAnualUsd: Number(ahorroAnual.toFixed(2)),
    anosAmortizacion: Number(anos.toFixed(1)),
    explicacion: `Para ${p} personas: eléctrico consume ${kwhElectrico.toFixed(0)} kWh/año (USD ${costoAnualEl.toFixed(0)}), heat pump ${kwhHeatPump.toFixed(0)} kWh/año (USD ${costoAnualHp.toFixed(0)}). Ahorro: USD ${ahorroAnual.toFixed(0)}/año. Amortización del sobrecosto: ${anos.toFixed(1)} años.`,
    _insight: {
      title: 'Cuándo se paga solo',
      text: insightText,
      tone: insightTone,
      icon: '♨️',
    },
  };
}
