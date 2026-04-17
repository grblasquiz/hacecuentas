/**
 * Calculadora de emisiones de CO2 por vuelo por pasajero.
 * Factores DEFRA 2025 (kg CO2 por pasajero por km).
 */

export interface VueloEmisionesCo2PasajeroInputs {
  distanciaKm: number;
  clase: string;
  tipoVuelo: string;
  idaYVuelta: string;
}

export interface VueloEmisionesCo2PasajeroOutputs {
  co2Kg: number;
  co2PorKm: string;
  arbolesCompensar: number;
  creditoUSD: string;
  comparacion: string;
}

const FACTORES: Record<string, Record<string, number>> = {
  corto: {
    economica: 0.156,
    premiumeconomy: 0.234,
    business: 0.468,
    first: 0.468,
  },
  medio: {
    economica: 0.131,
    premiumeconomy: 0.197,
    business: 0.393,
    first: 0.525,
  },
  largo: {
    economica: 0.115,
    premiumeconomy: 0.184,
    business: 0.334,
    first: 0.46,
  },
};

export function vueloEmisionesCo2Pasajero(
  inputs: VueloEmisionesCo2PasajeroInputs,
): VueloEmisionesCo2PasajeroOutputs {
  const distancia = Math.max(1, Number(inputs.distanciaKm) || 0);
  if (distancia <= 0) throw new Error('Ingresá una distancia válida en km.');

  const tipoFactor = FACTORES[inputs.tipoVuelo] ?? FACTORES.largo;
  const factor = tipoFactor[inputs.clase] ?? tipoFactor.economica;

  const multiplicadorIV = inputs.idaYVuelta === 'si' ? 2 : 1;
  const co2Kg = Math.round(distancia * factor * multiplicadorIV);

  // 1 árbol absorbe ~20 kg CO2/año
  const arbolesCompensar = Math.ceil(co2Kg / 20);

  // Crédito Gold Standard ~USD 20/tonelada
  const toneladas = co2Kg / 1000;
  const creditoLow = Math.round(toneladas * 15);
  const creditoHigh = Math.round(toneladas * 30);

  const co2PorKm = `${factor.toFixed(3)} kg/km (${inputs.clase}, vuelo ${inputs.tipoVuelo})`;
  const creditoUSD = `USD ${creditoLow}–${creditoHigh} (Gold Standard/Verra)`;

  let comparacion = '';
  if (co2Kg < 300) {
    comparacion = `Equivale a ~${Math.round(co2Kg / 2.3)} litros de nafta quemada en auto.`;
  } else if (co2Kg < 1500) {
    comparacion = `Equivale a ~${(co2Kg / 2300).toFixed(1)} meses de emisiones de un auto nafta argentino promedio.`;
  } else {
    comparacion = `Equivale a ~${(co2Kg / 2300).toFixed(1)} años de manejar un auto nafta promedio. O ~${arbolesCompensar} árboles nuevos absorbiendo 1 año.`;
  }

  return {
    co2Kg,
    co2PorKm,
    arbolesCompensar,
    creditoUSD,
    comparacion,
  };
}
