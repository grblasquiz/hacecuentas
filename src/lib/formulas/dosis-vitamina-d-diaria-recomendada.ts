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

  return {
    dosisMinima,
    dosisMaxima: dosisMaximaStr,
    detalle,
  };
}
