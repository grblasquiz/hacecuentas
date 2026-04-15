/** Calcula el consumo real de combustible en L/100km y km/L */
export interface Inputs {
  kmRecorridos: number;
  litrosCargados: number;
}
export interface Outputs {
  consumoL100km: number;
  kmPorLitro: number;
  detalle: string;
}

export function consumoNaftaLitros100km(i: Inputs): Outputs {
  const km = Number(i.kmRecorridos);
  const litros = Number(i.litrosCargados);

  if (!km || km <= 0) throw new Error('Ingresá los kilómetros recorridos (mayor a 0)');
  if (!litros || litros <= 0) throw new Error('Ingresá los litros de nafta cargados (mayor a 0)');

  const consumoL100km = (litros / km) * 100;
  const kmPorLitro = km / litros;

  let nivel = '';
  if (consumoL100km < 7) nivel = 'muy eficiente';
  else if (consumoL100km < 10) nivel = 'eficiente';
  else if (consumoL100km < 13) nivel = 'promedio';
  else if (consumoL100km < 16) nivel = 'alto';
  else nivel = 'muy alto';

  return {
    consumoL100km: Number(consumoL100km.toFixed(1)),
    kmPorLitro: Number(kmPorLitro.toFixed(1)),
    detalle: `Tu auto consume ${consumoL100km.toFixed(1)} L/100km (${kmPorLitro.toFixed(1)} km/L). Nivel: ${nivel}. Recorriste ${km} km con ${litros} litros.`,
  };
}
