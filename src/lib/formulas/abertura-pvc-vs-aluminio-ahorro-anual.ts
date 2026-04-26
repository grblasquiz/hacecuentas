/** Ahorro energético anual aberturas PVC DVH vs aluminio según m² y zona climática. */
export interface Inputs { metrosCuadradosVentana: number; zonaClimatica: 'templada' | 'fria' | 'muy-fria'; tarifaArsKwh: number; }
export interface Outputs { kwhAhorradosAnuales: number; ahorroAnualArs: number; reduccionConsumoPct: number; explicacion: string; }
export function aberturaPvcVsAluminioAhorroAnual(i: Inputs): Outputs {
  const m2 = Number(i.metrosCuadradosVentana);
  const tarifa = Number(i.tarifaArsKwh);
  if (!m2 || m2 <= 0) throw new Error('Metros cuadrados debe ser mayor a 0');
  if (!tarifa || tarifa <= 0) throw new Error('Tarifa debe ser mayor a 0');
  // Pérdidas térmicas por m² de ventana (kWh/año):
  // - Aluminio + vidrio simple (U≈5.8): 280 kWh/m²
  // - PVC DVH (U≈1.4): 70 kWh/m²
  const perdidaAluminio: Record<string, number> = { templada: 280, fria: 420, 'muy-fria': 580 };
  const perdidaPvc: Record<string, number> = { templada: 70, fria: 105, 'muy-fria': 145 };
  const pAl = perdidaAluminio[i.zonaClimatica];
  const pPvc = perdidaPvc[i.zonaClimatica];
  if (!pAl) throw new Error('Zona climática inválida');
  const ahorroKwh = (pAl - pPvc) * m2;
  const ahorroArs = ahorroKwh * tarifa;
  const reduccion = ((pAl - pPvc) / pAl) * 100;
  return {
    kwhAhorradosAnuales: Number(ahorroKwh.toFixed(0)),
    ahorroAnualArs: Number(ahorroArs.toFixed(0)),
    reduccionConsumoPct: Number(reduccion.toFixed(1)),
    explicacion: `Cambiando ${m2}m² de ventanas de aluminio a PVC DVH en zona ${i.zonaClimatica}: ahorro de ${ahorroKwh.toFixed(0)} kWh/año = $${ahorroArs.toLocaleString('es-AR')} ARS. Reducción de pérdidas: ${reduccion.toFixed(1)}%.`,
  };
}
