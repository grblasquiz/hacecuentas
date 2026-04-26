/** Litros de agua + kWh por ciclo lavarropas según etiqueta y capacidad kg */
export interface Inputs { capacidadKg: number; etiquetaEnergetica: string; ciclosPorSemana: number; precioKwh: number; precioM3Agua: number; }
export interface Outputs { litrosPorCiclo: number; kwhPorCiclo: number; costoMensual: number; costoAnual: number; explicacion: string; }
export function lavarropasEficienciaAguaLitrosCiclo(i: Inputs): Outputs {
  const kg = Number(i.capacidadKg);
  const etiq = String(i.etiquetaEnergetica || 'A').toUpperCase().trim();
  const ciclos = Number(i.ciclosPorSemana) || 0;
  const pKwh = Number(i.precioKwh) || 0;
  const pM3 = Number(i.precioM3Agua) || 0;
  if (!kg || kg <= 0) throw new Error('Ingresá la capacidad en kg');
  // Coeficiente litros/kg y kWh/kg por etiqueta (referencia IRAM/UE)
  const coefAgua: Record<string, number> = { 'A+++': 6, 'A++': 7, 'A+': 8, 'A': 9, 'B': 11, 'C': 13, 'D': 15 };
  const coefKwh: Record<string, number> = { 'A+++': 0.10, 'A++': 0.13, 'A+': 0.16, 'A': 0.20, 'B': 0.25, 'C': 0.32, 'D': 0.42 };
  const litros = (coefAgua[etiq] ?? 9) * kg;
  const kwh = (coefKwh[etiq] ?? 0.20) * kg;
  const costoCiclo = (litros / 1000) * pM3 + kwh * pKwh;
  const ciclosMes = ciclos * 4.33;
  const costoMes = costoCiclo * ciclosMes;
  return {
    litrosPorCiclo: Number(litros.toFixed(2)),
    kwhPorCiclo: Number(kwh.toFixed(3)),
    costoMensual: Number(costoMes.toFixed(2)),
    costoAnual: Number((costoMes * 12).toFixed(2)),
    explicacion: `Lavarropas ${etiq} de ${kg} kg usa ${litros.toFixed(0)} L y ${kwh.toFixed(2)} kWh por ciclo. Con ${ciclos} ciclos/semana, gastás ${costoMes.toFixed(2)}/mes.`,
  };
}
