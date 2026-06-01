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
  _insight?: any;
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

  // Tiempo que la luz tarda en recorrer esta distancia, en la escala más legible
  let tiempoLegible: string;
  if (tiempoSegundos >= 3.15576e7) tiempoLegible = `**${(tiempoSegundos / 3.15576e7).toLocaleString('es-AR', { maximumFractionDigits: 2 })} años**`;
  else if (tiempoSegundos >= 86400) tiempoLegible = `**${(tiempoSegundos / 86400).toLocaleString('es-AR', { maximumFractionDigits: 1 })} días**`;
  else if (tiempoSegundos >= 3600) tiempoLegible = `**${(tiempoSegundos / 3600).toLocaleString('es-AR', { maximumFractionDigits: 1 })} horas**`;
  else if (tiempoSegundos >= 60) tiempoLegible = `**${(tiempoSegundos / 60).toLocaleString('es-AR', { maximumFractionDigits: 1 })} minutos**`;
  else tiempoLegible = `**${tiempoSegundos.toLocaleString('es-AR', { maximumFractionDigits: 2 })} segundos**`;

  const _insight = {
    title: 'A la velocidad de la luz',
    text: `Esa distancia es **${km.toExponential(2)} km** (unos **${anosLuz.toExponential(2)} años luz**). Un rayo de luz tardaría ${tiempoLegible} en cruzarla de punta a punta.`,
    tone: 'neutral',
    icon: '🌌',
  };

  return {
    anosLuz: Number(anosLuz.toExponential(6)),
    kilometros: Number(km.toExponential(6)),
    parsecs: Number(parsecs.toExponential(6)),
    unidadesAstronomicas: Number(unidadesAstronomicas.toExponential(6)),
    millasTerrestres: Number(millas.toExponential(6)),
    tiempoSegundos: Number(tiempoSegundos.toExponential(4)),
    resumen: `${valor} ${unidad.replace('-', ' ')} equivalen a ${anosLuz.toExponential(3)} años luz (${km.toExponential(3)} km, ${parsecs.toExponential(3)} parsecs).`,
    _insight,
  };
}
