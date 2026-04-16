/**
 * Calculadora de Honorarios de Abogado - Argentina
 * Estimación orientativa según tipo de asunto y monto
 */

export interface HonorariosAbogadoInputs {
  montoJuicio: number;
  tipoAsunto: string;
  etapa: string;
}

export interface HonorariosAbogadoOutputs {
  honorarioEstimado: number;
  rangoMinimo: number;
  rangoMaximo: number;
  porcentaje: string;
}

export function honorariosAbogado(inputs: HonorariosAbogadoInputs): HonorariosAbogadoOutputs {
  const monto = Number(inputs.montoJuicio);
  const tipo = inputs.tipoAsunto || 'juicio-civil';
  const etapa = inputs.etapa || 'completo';

  if (!monto || monto <= 0) {
    throw new Error('Ingresá el monto del juicio o asunto');
  }

  // Rangos base por tipo de asunto
  const rangos: Record<string, [number, number]> = {
    'juicio-civil': [0.11, 0.20],
    'juicio-laboral': [0.11, 0.20],
    'sucesion': [0.03, 0.12],
    'divorcio': [0.05, 0.10],
    'penal': [0.10, 0.20],
    'consulta': [0.02, 0.05],
  };

  let [porcMin, porcMax] = rangos[tipo] || [0.11, 0.20];

  // Ajuste por etapa
  switch (etapa) {
    case 'consulta':
      porcMin *= 0.2;
      porcMax *= 0.2;
      break;
    case 'mediacion':
      porcMin *= 0.5;
      porcMax *= 0.5;
      break;
    case 'completo':
      // Sin ajuste
      break;
    case 'apelacion':
      porcMin *= 1.3;
      porcMax *= 1.3;
      break;
  }

  const rangoMinimo = monto * porcMin;
  const rangoMaximo = monto * porcMax;
  const honorarioEstimado = (rangoMinimo + rangoMaximo) / 2;

  return {
    honorarioEstimado: Math.round(honorarioEstimado),
    rangoMinimo: Math.round(rangoMinimo),
    rangoMaximo: Math.round(rangoMaximo),
    porcentaje: `${(porcMin * 100).toFixed(0)}% - ${(porcMax * 100).toFixed(0)}%`,
  };
}
