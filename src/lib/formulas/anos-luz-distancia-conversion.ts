/** Conversión de años luz a km, parsecs, unidades astronómicas */
export interface Inputs {
  valor: number;
  unidadOrigen: string;
}
export interface Outputs {
  anosLuz: number;
  kilometros: number;
  parsecs: number;
  unidadesAstronomicas: number;
  millasTerrestres: number;
  tiempoSegundos: number;
  resumen: string;
}

// Constantes
const C_KM_S = 299792.458; // velocidad de la luz en km/s
const ANO_LUZ_KM = 9.4607304725808e12; // km en un año luz
const PARSEC_KM = 3.0856775814913673e13; // km en un parsec
const UA_KM = 149597870.7; // km en una unidad astronómica
const MILLA_KM = 1.609344;

export function anosLuzDistanciaConversion(i: Inputs): Outputs {
  const valor = Number(i.valor);
  const unidad = String(i.unidadOrigen || 'anos-luz');
  if (!valor || valor < 0) throw new Error('Ingresá un valor válido mayor a cero');

  // Convertir a km base
  let km = 0;
  if (unidad === 'anos-luz') km = valor * ANO_LUZ_KM;
  else if (unidad === 'kilometros') km = valor;
  else if (unidad === 'parsecs') km = valor * PARSEC_KM;
  else if (unidad === 'ua') km = valor * UA_KM;
  else if (unidad === 'millas') km = valor * MILLA_KM;
  else throw new Error('Unidad de origen no reconocida');

  const anosLuz = km / ANO_LUZ_KM;
  const parsecs = km / PARSEC_KM;
  const unidadesAstronomicas = km / UA_KM;
  const millas = km / MILLA_KM;
  const tiempoSegundos = km / C_KM_S;

  return {
    anosLuz: Number(anosLuz.toExponential(6)),
    kilometros: Number(km.toExponential(6)),
    parsecs: Number(parsecs.toExponential(6)),
    unidadesAstronomicas: Number(unidadesAstronomicas.toExponential(6)),
    millasTerrestres: Number(millas.toExponential(6)),
    tiempoSegundos: Number(tiempoSegundos.toExponential(4)),
    resumen: `${valor} ${unidad.replace('-', ' ')} equivalen a ${anosLuz.toExponential(3)} años luz (${km.toExponential(3)} km, ${parsecs.toExponential(3)} parsecs).`,
  };
}
