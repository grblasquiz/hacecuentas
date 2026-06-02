/** Dosis diaria recomendada de vitamina D según edad y factores */
export interface Inputs {
  grupoEtario: string;
  embarazoLactancia?: string;
  factorRiesgo?: string;
}
export interface Outputs {
  dosisMinima: string;
  dosisMaxima: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function dosisVitaminaDDiariaRecomendada(i: Inputs): Outputs {
  const grupo = String(i.grupoEtario || 'adulto');
  const embarazo = String(i.embarazoLactancia || 'no');
  const riesgo = String(i.factorRiesgo || 'no');

  let dosisMin: number;
  let dosisMax: number;
  let limiteSuperior: number;
  let grupoLabel: string;

  switch (grupo) {
    case 'lactante':
      dosisMin = 400;
      dosisMax = 400;
      limiteSuperior = 1500;
      grupoLabel = 'lactante (0-12 meses)';
      break;
    case 'nino':
      dosisMin = 600;
      dosisMax = 1000;
      limiteSuperior = 4000;
      grupoLabel = 'niño/a (1-18 años)';
      break;
    case 'mayor':
      dosisMin = 800;
      dosisMax = 2000;
      limiteSuperior = 4000;
      grupoLabel = 'adulto mayor (65+ años)';
      break;
    default: // adulto
      dosisMin = 600;
      dosisMax = 1000;
      limiteSuperior = 4000;
      grupoLabel = 'adulto (19-64 años)';
  }

  // Embarazo/lactancia
  if (embarazo === 'embarazo' || embarazo === 'lactancia') {
    dosisMin = Math.max(dosisMin, 600);
    dosisMax = Math.max(dosisMax, 1000);
    grupoLabel += ` — ${embarazo}`;
  }

  // Factor de riesgo
  if (riesgo === 'si') {
    dosisMin = Math.max(dosisMin, 1500);
    dosisMax = Math.max(dosisMax, 2000);
    grupoLabel += ' — con factor de riesgo';
  }

  const dosisMinima = dosisMin === dosisMax
    ? `${dosisMin} UI/día`
    : `${dosisMin} – ${dosisMax} UI/día`;

  const dosisMaximaStr = `${limiteSuperior} UI/día (límite superior seguro)`;

  const detalle =
    `Grupo: ${grupoLabel} | ` +
    `Dosis recomendada: ${dosisMinima} | ` +
    `Límite superior: ${limiteSuperior} UI/día | ` +
    `Objetivo en sangre: 25(OH)D entre 30-100 ng/mL. ` +
    `Consultá a tu médico antes de suplementar.`;

  const reforzada = riesgo === 'si';
  const _insight = {
    title: reforzada ? 'Dosis reforzada por riesgo' : 'Dosis recomendada',
    text: reforzada
      ? `Tu factor de riesgo lleva la recomendación a **${dosisMinima}**, por encima de lo habitual para ${grupoLabel.split(' — ')[0]}. Sigue lejos del límite seguro de **${limiteSuperior.toLocaleString('es-AR')} UI/día**, pero conviene controlar 25(OH)D en sangre con tu médico.`
      : `Para ${grupoLabel.split(' — ')[0]} la dosis sugerida es **${dosisMinima}**. Tenés un amplio margen hasta el límite superior seguro de **${limiteSuperior.toLocaleString('es-AR')} UI/día**, así que el riesgo de exceso por suplemento es bajo.`,
    tone: reforzada ? 'warn' : 'good',
    icon: '☀️',
  };

  const _chart = {
    type: 'scale',
    marker: dosisMax,
    markerLabel: `${dosisMax.toLocaleString('es-AR')} UI`,
    min: 0,
    segments: [
      { nombre: 'Recomendada', max: dosisMax, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Margen seguro', max: limiteSuperior, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Sobre el límite', max: Math.round(limiteSuperior * 1.5), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Dosis recomendada ${dosisMax} UI sobre una escala con límite superior seguro de ${limiteSuperior} UI por día`,
  };

  return {
    dosisMinima,
    dosisMaxima: dosisMaximaStr,
    detalle,
    _insight,
    _chart,
  };
}
