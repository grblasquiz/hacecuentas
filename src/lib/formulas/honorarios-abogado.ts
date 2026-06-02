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
  _insight?: any;
  _chart?: any;
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

  const estimadoR = Math.round(honorarioEstimado);
  const minR = Math.round(rangoMinimo);
  const maxR = Math.round(rangoMaximo);
  const fmtARS = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const pctEstimado = monto > 0 ? (honorarioEstimado / monto) * 100 : 0;

  // Scale: dónde cae el honorario estimado dentro del rango orientativo mín–máx
  const chart = {
    type: 'scale' as const,
    marker: estimadoR,
    markerLabel: 'Estimado ' + fmtARS(estimadoR),
    min: minR,
    segments: [
      { nombre: 'Piso del rango', max: Math.round((rangoMinimo + honorarioEstimado) / 2), color: '#86efac', colorDark: '#22c55e' },
      { nombre: 'Zona media', max: Math.round((honorarioEstimado + rangoMaximo) / 2), color: '#fde68a', colorDark: '#f59e0b' },
      { nombre: 'Techo del rango', max: maxR, color: '#fca5a5', colorDark: '#ef4444' },
    ],
    ariaLabel: 'Honorario estimado dentro del rango orientativo, desde el mínimo hasta el máximo',
  };

  const insight = {
    title: 'Qué significa',
    text: `Para este asunto, los honorarios orientativos rondan **${fmtARS(estimadoR)}** (entre ${fmtARS(minR)} y ${fmtARS(maxR)}), es decir ~**${pctEstimado.toFixed(0)}%** del monto del juicio. Es una referencia de pacto: el número final se acuerda con el abogado y puede regularlo el juez según ley arancelaria.`,
    tone: 'neutral' as 'good' | 'warn' | 'neutral',
    icon: '⚖️',
  };

  return {
    honorarioEstimado: estimadoR,
    rangoMinimo: minR,
    rangoMaximo: maxR,
    porcentaje: `${(porcMin * 100).toFixed(0)}% - ${(porcMax * 100).toFixed(0)}%`,
    _insight: insight,
    _chart: chart,
  };
}
