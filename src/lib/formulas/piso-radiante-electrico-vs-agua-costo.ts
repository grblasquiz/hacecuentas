/** Costo instalación + operación piso radiante eléctrico vs hidráulico según m². */
export interface Inputs { metrosCuadrados: number; horasUsoDiario: number; mesesUso: number; tarifaUsdKwh: number; precioGasUsdM3: number; }
export interface Outputs { costoInstalacionElectricoUsd: number; costoInstalacionHidraulicoUsd: number; costoOperacionElectricoUsd: number; costoOperacionHidraulicoUsd: number; mejorOpcion: string; explicacion: string; }
export function pisoRadianteElectricoVsAguaCosto(i: Inputs): Outputs {
  const m2 = Number(i.metrosCuadrados);
  const hs = Number(i.horasUsoDiario);
  const meses = Number(i.mesesUso);
  const tarifa = Number(i.tarifaUsdKwh);
  const pGas = Number(i.precioGasUsdM3);
  if (!m2 || m2 <= 0) throw new Error('Metros cuadrados debe ser mayor a 0');
  // Instalación promedio (USD/m²): eléctrico 80, hidráulico 130 + caldera fija 1500
  const instElec = m2 * 80;
  const instHidr = m2 * 130 + 1500;
  // Operación: eléctrico 150 W/m², hidráulico equiv. 100 W/m² térmicos via caldera condensación
  const diasUso = meses * 30;
  const kwhElec = (m2 * 0.15 * hs * diasUso);
  const m3GasHidr = (m2 * 0.10 * hs * diasUso) / (10.4 * 0.95);
  const opElec = kwhElec * tarifa;
  const opHidr = m3GasHidr * pGas;
  const totalElec = instElec + opElec * 10;
  const totalHidr = instHidr + opHidr * 10;
  const mejor = totalElec < totalHidr ? 'eléctrico' : 'hidráulico';
  return {
    costoInstalacionElectricoUsd: Number(instElec.toFixed(0)),
    costoInstalacionHidraulicoUsd: Number(instHidr.toFixed(0)),
    costoOperacionElectricoUsd: Number(opElec.toFixed(0)),
    costoOperacionHidraulicoUsd: Number(opHidr.toFixed(0)),
    mejorOpcion: mejor,
    explicacion: `Para ${m2}m² con ${hs}h/día durante ${meses} meses: eléctrico USD ${instElec.toFixed(0)} instalación + USD ${opElec.toFixed(0)}/año operación. Hidráulico USD ${instHidr.toFixed(0)} + USD ${opHidr.toFixed(0)}/año. A 10 años, mejor opción: ${mejor}.`,
  };
}
