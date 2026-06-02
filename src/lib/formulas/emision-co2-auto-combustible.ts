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
  _insight?: any;
  _chart?: any;
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

  const co2PorKmR = Math.round(co2PorKm);
  const tonR = co2AnualTon.toFixed(2);
  const arboles = Math.round(co2Anual / 22); // ~22 kg CO2 absorbidos por árbol/año
  const tone = co2PorKm < 180 ? 'good' : co2PorKm < 230 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Huella de tu auto',
    text: `Tu ${info.nombre} emite **${co2PorKmR} g CO2/km** (${nivel.toLowerCase()}): en ${km.toLocaleString('es-AR')} km/año son **${tonR} toneladas** de CO2, lo que absorberían unos **${arboles.toLocaleString('es-AR')} árboles** en un año.`,
    tone,
    icon: co2PorKm < 180 ? '🌱' : '🌍',
  };
  const _chart = {
    type: 'scale',
    marker: co2PorKmR,
    markerLabel: `${co2PorKmR} g/km`,
    min: 0,
    segments: [
      { nombre: 'Muy baja', max: 130, color: '#86efac', colorDark: '#15803d' },
      { nombre: 'Baja', max: 180, color: '#bef264', colorDark: '#4d7c0f' },
      { nombre: 'Promedio', max: 230, color: '#fde047', colorDark: '#a16207' },
      { nombre: 'Alta', max: 300, color: '#fdba74', colorDark: '#c2410c' },
      { nombre: 'Muy alta', max: Math.max(380, co2PorKmR + 1), color: '#fca5a5', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Emisión de ${co2PorKmR} gramos de CO2 por km: nivel ${nivel.toLowerCase()}.`,
  };

  return {
    co2PorKm: co2PorKmR,
    co2Anual: Math.round(co2Anual),
    co2AnualTon: Number(co2AnualTon.toFixed(2)),
    detalle: `Tu auto a ${info.nombre} emite ${co2PorKmR} g CO2/km (${nivel}). En ${km.toLocaleString('es-AR')} km/año: ${Math.round(co2Anual).toLocaleString('es-AR')} kg (${co2AnualTon.toFixed(2)} toneladas) de CO2.`,
    _insight,
    _chart,
  };
}
