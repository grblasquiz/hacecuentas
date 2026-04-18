export interface ConsumoHeladeraAnualKwhInputs { potenciaW: number; dutyCycle: number; tarifa?: number; }
export interface ConsumoHeladeraAnualKwhOutputs { kwhAnual: string; kwhMensual: string; costoAnual: string; resumen: string; }
export function consumoHeladeraAnualKwh(i: ConsumoHeladeraAnualKwhInputs): ConsumoHeladeraAnualKwhOutputs {
  const p = Number(i.potenciaW); const dc = Number(i.dutyCycle) / 100; const tarifa = Number(i.tarifa ?? 80);
  if (!p || !dc) throw new Error('Completá potencia y duty cycle');
  const kwhAnual = p * 24 * 365 * dc / 1000;
  const kwhMensual = kwhAnual / 12;
  const costoAnual = kwhAnual * tarifa;
  return { kwhAnual: kwhAnual.toFixed(0) + ' kWh', kwhMensual: kwhMensual.toFixed(1) + ' kWh', costoAnual: '$' + costoAnual.toFixed(0),
    resumen: `Consumo anual: ${kwhAnual.toFixed(0)} kWh (${kwhMensual.toFixed(1)}/mes). Costo: $${costoAnual.toFixed(0)} a $${tarifa}/kWh.` };
}
