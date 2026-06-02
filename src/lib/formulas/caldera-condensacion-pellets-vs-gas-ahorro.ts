/** Ahorro anual caldera de condensación pellets vs gas natural. */
export interface Inputs { metrosCuadrados: number; zonaClimatica: 'templada' | 'fria' | 'muy-fria'; precioGasUsdM3: number; precioPelletsUsdKg: number; }
export interface Outputs { kwhAnuales: number; costoGasUsd: number; costoPelletsUsd: number; ahorroAnualUsd: number; explicacion: string; _insight?: any; }
export function calderaCondensacionPelletsVsGasAhorro(i: Inputs): Outputs {
  const m2 = Number(i.metrosCuadrados);
  if (!m2 || m2 <= 0) throw new Error('Metros cuadrados debe ser mayor a 0');
  // Demanda anual kWh/m² según zona
  const demandaKwh: Record<string, number> = { templada: 90, fria: 140, 'muy-fria': 200 };
  const demanda = demandaKwh[i.zonaClimatica];
  if (!demanda) throw new Error('Zona climática inválida');
  const kwhAnuales = m2 * demanda;
  // Gas: 10.4 kWh/m³, η condensación 95%
  const m3Gas = kwhAnuales / (10.4 * 0.95);
  const costoGas = m3Gas * Number(i.precioGasUsdM3);
  // Pellets: 4.8 kWh/kg, η caldera pellets 90%
  const kgPellets = kwhAnuales / (4.8 * 0.9);
  const costoPellets = kgPellets * Number(i.precioPelletsUsdKg);
  const ahorro = costoGas - costoPellets;
  const ahorroPct = costoGas > 0 ? Math.round((ahorro / costoGas) * 100) : 0;
  return {
    kwhAnuales: Number(kwhAnuales.toFixed(0)),
    costoGasUsd: Number(costoGas.toFixed(2)),
    costoPelletsUsd: Number(costoPellets.toFixed(2)),
    ahorroAnualUsd: Number(ahorro.toFixed(2)),
    explicacion: `Para ${m2}m² en zona ${i.zonaClimatica}: demanda ${kwhAnuales.toFixed(0)} kWh/año. Gas: USD ${costoGas.toFixed(0)}. Pellets: USD ${costoPellets.toFixed(0)}. ${ahorro >= 0 ? 'Ahorro' : 'Sobrecosto'} con pellets: USD ${Math.abs(ahorro).toFixed(0)}/año.`,
    _insight: {
      title: ahorro >= 0 ? 'Pellets conviene' : 'Pellets sale más caro',
      text: ahorro >= 0
        ? `Con pellets gastás **USD ${costoPellets.toFixed(0)}/año** contra **USD ${costoGas.toFixed(0)}** del gas: ahorrás **USD ${ahorro.toFixed(0)}/año** (${ahorroPct}% menos). Compará contra el costo de instalar la caldera de pellets para ver el repago.`
        : `Con pellets gastás **USD ${costoPellets.toFixed(0)}/año** contra **USD ${costoGas.toFixed(0)}** del gas: pagás **USD ${Math.abs(ahorro).toFixed(0)}/año más** (${Math.abs(ahorroPct)}% por encima). A estos precios el gas sigue siendo más barato.`,
      tone: ahorro >= 0 ? 'good' : 'warn',
      icon: ahorro >= 0 ? '🔥' : '💸',
    },
  };
}
