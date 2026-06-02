/** Dosis de ácido fólico según etapa y factores de riesgo */
export interface Inputs {
  etapa: string;
  factorRiesgo?: string;
}
export interface Outputs {
  dosis: string;
  momento: string;
  alimentos: string;
  nota: string;
  _insight?: any;
}

export function dosisAcidoFolico(i: Inputs): Outputs {
  const etapa = String(i.etapa || 'preconcepcion');
  const riesgo = String(i.factorRiesgo || 'ninguno');

  // Factores de alto riesgo requieren 4mg
  const altoRiesgo = ['antecedente-dtn', 'diabetes', 'epilepsia'].includes(riesgo);
  const riesgoModerado = ['obesidad', 'gemelar'].includes(riesgo);

  let dosisMcg = 400;
  let dosisTexto = '400 mcg/día (0,4 mg)';
  let momento = 'Una vez al día, preferentemente con el desayuno';
  let nota = 'Consultá siempre con tu obstetra o ginecóloga.';

  if (altoRiesgo) {
    dosisMcg = 4000;
    dosisTexto = '4000 mcg/día (4 mg) — DOSIS ALTA por factor de riesgo';
    nota = 'Esta dosis alta requiere prescripción médica. Consultá con tu obstetra.';
  } else if (riesgoModerado) {
    dosisMcg = 1000;
    dosisTexto = '1000 mcg/día (1 mg)';
  } else {
    switch (etapa) {
      case 'preconcepcion':
        dosisMcg = 400;
        dosisTexto = '400 mcg/día (0,4 mg)';
        momento = 'Empezá al menos 1-3 meses antes de buscar el embarazo. Una toma diaria.';
        break;
      case 'primer-trimestre':
        dosisMcg = 600;
        dosisTexto = '400-600 mcg/día';
        momento = 'Una vez al día, todos los días sin falta. Período más crítico.';
        break;
      case 'segundo-trimestre':
      case 'tercer-trimestre':
        dosisMcg = 600;
        dosisTexto = '600 mcg/día';
        momento = 'Continuá con la suplementación diaria.';
        break;
      case 'lactancia':
        dosisMcg = 500;
        dosisTexto = '500 mcg/día';
        momento = 'Continuá durante toda la lactancia.';
        break;
    }
  }

  const alimentos = 'Lentejas (358 mcg/taza), espinaca cocida (263 mcg), brócoli (168 mcg), palta (163 mcg), espárragos (134 mcg)';

  const mgEquiv = (dosisMcg / 1000).toLocaleString('es-AR', { maximumFractionDigits: 1 });
  let _insight: any;
  if (altoRiesgo) {
    _insight = {
      title: 'Dosis alta: receta obligatoria',
      text: `Tu factor de riesgo eleva la recomendación a **${dosisMcg} mcg (${mgEquiv} mg)**, 10 veces la dosis estándar. Esta cantidad **no se compra ni se toma sin prescripción**: tu obstetra debe indicártela.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else if (riesgoModerado) {
    _insight = {
      title: 'Dosis reforzada',
      text: `Por tu factor de riesgo moderado la dosis sube a **${dosisMcg} mcg (${mgEquiv} mg)/día**, por encima de los 400 mcg habituales. Tomala una vez al día y confirmá con tu médico.`,
      tone: 'neutral',
      icon: '💊',
    };
  } else {
    _insight = {
      title: 'Suplementación estándar',
      text: `La dosis indicada es **${dosisMcg} mcg/día**. La clave es la **constancia diaria**: el tubo neural se cierra en las primeras semanas, así que no saltees tomas.`,
      tone: 'good',
      icon: '🤰',
    };
  }

  return { dosis: dosisTexto, momento, alimentos, nota, _insight };
}
