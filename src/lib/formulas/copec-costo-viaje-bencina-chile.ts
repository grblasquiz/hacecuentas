export interface Inputs { distanciaKm: number; consumoL100: number; precioLitro: number; peajes: number }
export interface Outputs { litrosEstimados: number; costoCombustible: number; costoTotal: number; costoPorKm: number; detalle: string; _insight?: any }
export function compute(i: Inputs): Outputs {
  const km = Math.max(0, Number(i.distanciaKm) || 0), consumo = Math.max(0, Number(i.consumoL100) || 0), precio = Math.max(0, Number(i.precioLitro) || 0), peajes = Math.max(0, Number(i.peajes) || 0);
  const litrosEstimados = km * consumo / 100, costoCombustible = litrosEstimados * precio, costoTotal = costoCombustible + peajes, costoPorKm = km ? costoTotal / km : 0;
  const f = (n: number) => `$${Math.round(n).toLocaleString('es-CL')}`;
  return { litrosEstimados: Math.round(litrosEstimados * 100) / 100, costoCombustible: Math.round(costoCombustible), costoTotal: Math.round(costoTotal), costoPorKm: Math.round(costoPorKm * 100) / 100, detalle: `${km.toLocaleString('es-CL')} km × ${consumo.toLocaleString('es-CL')} L/100 km = ${litrosEstimados.toFixed(1)} L. Combustible ${f(costoCombustible)} + peajes ${f(peajes)} = ${f(costoTotal)}.`, _insight: { title: `Viaje estimado: ${f(costoTotal)}`, text: `Vas a usar aproximadamente **${litrosEstimados.toFixed(1)} litros**. El costo estimado por km, incluyendo peajes informados, es **${f(costoPorKm)}**.`, tone: 'neutral', icon: '⛽' } };
}
