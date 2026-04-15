/** Calcula las emisiones de CO2 de un auto según consumo y tipo de combustible */
export interface Inputs {
  consumoL100km: number;
  tipoCombustible: number;
  kmAnuales: number;
}
export interface Outputs {
  co2PorKm: number;
  co2Anual: number;
  co2AnualTon: number;
  detalle: string;
}

export function emisionCo2AutoCombustible(i: Inputs): Outputs {
  const consumo = Number(i.consumoL100km);
  const tipo = Number(i.tipoCombustible);
  const km = Number(i.kmAnuales);

  if (!consumo || consumo < 2 || consumo > 30) throw new Error('El consumo debe estar entre 2 y 30 L/100km');
  if (tipo < 1 || tipo > 3) throw new Error('El tipo de combustible debe ser 1 (Nafta), 2 (Diésel) o 3 (GNC)');
  if (!km || km < 1000) throw new Error('Ingresá los km anuales (mínimo 1.000)');

  // Factores de emisión (kg CO2 por litro o m³)
  const factores: Record<number, { factor: number; nombre: string; unidad: string; ajusteConsumo: number }> = {
    1: { factor: 2.31, nombre: 'Nafta', unidad: 'L', ajusteConsumo: 1 },
    2: { factor: 2.68, nombre: 'Diésel', unidad: 'L', ajusteConsumo: 1 },
    3: { factor: 1.88, nombre: 'GNC', unidad: 'm³', ajusteConsumo: 1.3 }, // GNC consume 1.3x más en volumen
  };

  const info = factores[tipo];
  const consumoReal = consumo * info.ajusteConsumo; // Ajuste para GNC
  const co2PorKm = (consumoReal / 100) * info.factor * 1000; // gramos
  const co2Anual = (co2PorKm / 1000) * km; // kg
  const co2AnualTon = co2Anual / 1000;

  let nivel = '';
  if (co2PorKm < 130) nivel = 'Muy baja emisión';
  else if (co2PorKm < 180) nivel = 'Baja emisión';
  else if (co2PorKm < 230) nivel = 'Emisión promedio';
  else if (co2PorKm < 300) nivel = 'Alta emisión';
  else nivel = 'Muy alta emisión';

  return {
    co2PorKm: Math.round(co2PorKm),
    co2Anual: Math.round(co2Anual),
    co2AnualTon: Number(co2AnualTon.toFixed(2)),
    detalle: `Tu auto a ${info.nombre} emite ${Math.round(co2PorKm)} g CO2/km (${nivel}). En ${km.toLocaleString('es-AR')} km/año: ${Math.round(co2Anual).toLocaleString('es-AR')} kg (${co2AnualTon.toFixed(2)} toneladas) de CO2.`,
  };
}
