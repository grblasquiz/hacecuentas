/** Calorías diarias para gato según peso, etapa, actividad y condición */
export interface Inputs {
  pesoKg: number;
  etapaVida?: string;
  actividad?: string;
  castrado?: boolean;
  condicionCorporal?: string;
}
export interface Outputs {
  kcalDia: number;
  gramosSecoDia: number;
  gramosHumedoDia: number;
  factorUsado: string;
  detalle: string;
}

export function caloriasDiariasGatoPesoActividad(i: Inputs): Outputs {
  const peso = Number(i.pesoKg);
  const etapa = String(i.etapaVida || 'adulto');
  const actividad = String(i.actividad || 'interior');
  const castrado = i.castrado !== false; // default true
  const condicion = String(i.condicionCorporal || 'normal');

  if (!peso || peso <= 0 || peso > 15) throw new Error('Ingresá el peso del gato (0,5-15 kg)');

  // RER = 70 × peso^0.75
  const RER = 70 * Math.pow(peso, 0.75);

  // Factor por etapa y actividad
  let factor = 1.0;
  let factorLabel = '';

  if (etapa === 'gatito_4m') {
    factor = 2.5;
    factorLabel = 'Gatito < 4 meses (×2,5)';
  } else if (etapa === 'gatito_12m') {
    factor = 2.0;
    factorLabel = 'Gatito 4-12 meses (×2,0)';
  } else if (etapa === 'senior' || etapa === 'geriatrico') {
    factor = 1.1;
    factorLabel = 'Senior/geriátrico (×1,1)';
  } else {
    // Adulto
    if (castrado) {
      if (actividad === 'exterior') {
        factor = 1.2;
        factorLabel = 'Adulto castrado activo exterior (×1,2)';
      } else if (actividad === 'mixto') {
        factor = 1.1;
        factorLabel = 'Adulto castrado mixto (×1,1)';
      } else {
        factor = 1.0;
        factorLabel = 'Adulto castrado indoor (×1,0)';
      }
    } else {
      if (actividad === 'exterior') {
        factor = 1.4;
        factorLabel = 'Adulto entero activo exterior (×1,4)';
      } else if (actividad === 'mixto') {
        factor = 1.2;
        factorLabel = 'Adulto entero mixto (×1,2)';
      } else {
        factor = 1.2;
        factorLabel = 'Adulto entero indoor (×1,2)';
      }
    }
  }

  // Ajuste por condición corporal
  let ajusteCondicion = 1.0;
  if (condicion === 'bajo') ajusteCondicion = 1.2;
  else if (condicion === 'sobrepeso') ajusteCondicion = 0.85;
  else if (condicion === 'obeso') ajusteCondicion = 0.75;

  if (ajusteCondicion !== 1.0) {
    factorLabel += ` → ajuste condición corporal (×${ajusteCondicion})`;
  }

  const kcalDia = Math.round(RER * factor * ajusteCondicion);
  const gramosSecoDia = Math.round(kcalDia / 3.8);
  const gramosHumedoDia = Math.round(kcalDia / 0.9);

  return {
    kcalDia,
    gramosSecoDia,
    gramosHumedoDia,
    factorUsado: factorLabel,
    detalle: `Tu gato de ${peso} kg necesita ~${kcalDia} kcal/día (${factorLabel}). Equivale a ~${gramosSecoDia} g de seco o ~${gramosHumedoDia} g de húmedo.`,
  };
}
