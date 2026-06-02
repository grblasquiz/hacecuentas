/**
 * Calculadora de costo de combustible para un viaje
 * costo = (km / 100) × consumo_cada_100km × precio_litro
 */

export interface ViajeCombustibleInputs {
  distanciaKm: number;
  consumo: number; // L / 100km
  precioLitro: number;
  pasajeros: number; // para dividir entre pasajeros
  ida: string; // 'ida' | 'ida-vuelta'
}

export interface ViajeCombustibleOutputs {
  litrosTotales: number;
  costoTotal: number;
  costoPorPersona: number;
  costoPorKm: number;
  distanciaEfectiva: number;
  _insight?: any;
}

export function viajeCombustible(inputs: ViajeCombustibleInputs): ViajeCombustibleOutputs {
  const km = Number(inputs.distanciaKm);
  const cons = Number(inputs.consumo);
  const precio = Number(inputs.precioLitro);
  const pasajeros = Math.max(1, Number(inputs.pasajeros) || 1);
  const idaVuelta = inputs.ida === 'ida-vuelta';

  if (!km || km <= 0) throw new Error('Ingresá la distancia en km');
  if (!cons || cons <= 0) throw new Error('Ingresá el consumo cada 100 km');
  if (!precio || precio <= 0) throw new Error('Ingresá el precio del litro');

  const distanciaEfectiva = idaVuelta ? km * 2 : km;
  const litrosTotales = (distanciaEfectiva / 100) * cons;
  const costoTotal = litrosTotales * precio;
  const costoPorPersona = costoTotal / pasajeros;
  const costoPorKm = costoTotal / distanciaEfectiva;

  const costoTotalR = Math.round(costoTotal);
  const costoPorPersonaR = Math.round(costoPorPersona);
  const litrosR = Math.round(litrosTotales * 100) / 100;
  const _insight = {
    title: 'Nafta para el viaje',
    text: pasajeros > 1
      ? `Recorrer **${distanciaEfectiva.toLocaleString('es-AR')} km${idaVuelta ? ' (ida y vuelta)' : ''}** consume **${litrosR.toLocaleString('es-AR')} L** y cuesta **$${costoTotalR.toLocaleString('es-AR')}**. Dividido entre ${pasajeros} pasajeros, son **$${costoPorPersonaR.toLocaleString('es-AR')} por persona**.`
      : `Recorrer **${distanciaEfectiva.toLocaleString('es-AR')} km${idaVuelta ? ' (ida y vuelta)' : ''}** consume **${litrosR.toLocaleString('es-AR')} L** y te cuesta **$${costoTotalR.toLocaleString('es-AR')}** de combustible (≈$${(Math.round(costoPorKm * 100) / 100).toLocaleString('es-AR')} por km).`,
    tone: 'neutral',
    icon: '⛽',
  };

  return {
    litrosTotales: litrosR,
    costoTotal: costoTotalR,
    costoPorPersona: costoPorPersonaR,
    costoPorKm: Math.round(costoPorKm * 100) / 100,
    distanciaEfectiva,
    _insight,
  };
}
