export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Subcutaneous vs Visceral Fat Split Calculator
 *
 * Given:
 *   - grasaTotal: total body fat as % of body weight (from DEXA, bioimpedance, Navy method, etc.)
 *   - porcionVisceral: visceral fat as % of TOTAL FAT (not of body weight)
 *
 * Computes:
 *   - grasaVisceral_pct: visceral fat as % of body weight = grasaTotal × porcionVisceral / 100
 *   - grasaSubcutanea_pct: subcutaneous fat as % of body weight = grasaTotal − grasaVisceral_pct
 *   - ratio: subcutaneous-to-visceral ratio
 *
 * Formula source: standard body composition partitioning formula used in DEXA reporting;
 * reference ranges from NHANES / Despres et al. (Circulation 2008) / AHA guidelines.
 */
export function grasaSubcutaneaVisceralTotalDiferencia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const grasaTotal = Number(i.grasaTotal) || 0;
  const porcionVisceral = Number(i.porcionVisceral) || 0;

  // Core calculation
  const grasaVisceral = grasaTotal * porcionVisceral / 100;
  const grasaSubcutanea = grasaTotal - grasaVisceral;
  const ratio = grasaVisceral > 0 ? grasaSubcutanea / grasaVisceral : 0;

  // Risk classification based on visceral fat share thresholds from NHANES / DEXA population studies
  let riskLevel: string;
  let riskColor: string;
  if (porcionVisceral < 10) {
    riskLevel = __lang === 'en' ? 'Low — favourable fat distribution' : 'Bajo — distribución de grasa favorable';
    riskColor = 'green';
  } else if (porcionVisceral < 20) {
    riskLevel = __lang === 'en' ? 'Moderate — monitor waist circumference' : 'Moderado — monitoreá tu circunferencia de cintura';
    riskColor = 'yellow';
  } else if (porcionVisceral < 30) {
    riskLevel = __lang === 'en' ? 'Elevated — associated with metabolic syndrome markers' : 'Elevado — asociado con marcadores de síndrome metabólico';
    riskColor = 'orange';
  } else {
    riskLevel = __lang === 'en' ? 'High — significantly elevated cardiometabolic risk' : 'Alto — riesgo cardiometabólico significativamente elevado';
    riskColor = 'red';
  }

  const resultado = __lang === 'en'
    ? `Visceral: ${grasaVisceral.toFixed(1)} % | Subcutaneous: ${grasaSubcutanea.toFixed(1)} %`
    : `Visceral: ${grasaVisceral.toFixed(1)} % | Subcutánea: ${grasaSubcutanea.toFixed(1)} %`;

  const resumen = __lang === 'en'
    ? `Your total body fat is ${grasaTotal.toFixed(1)} %, of which **${grasaVisceral.toFixed(1)} % of body weight** is visceral fat and **${grasaSubcutanea.toFixed(1)} % of body weight** is subcutaneous fat. The subcutaneous-to-visceral ratio is **${ratio.toFixed(1)}:1**. Visceral fat risk level: **${riskLevel}**. ${riskColor === 'green' ? 'Your fat distribution profile carries low metabolic risk from visceral fat.' : riskColor === 'red' ? 'Consider consulting a physician or registered dietitian to discuss cardiometabolic risk reduction.' : 'Aerobic exercise and reducing refined carbohydrates are the most effective strategies for lowering visceral fat share.'}`
    : `Tu grasa corporal total es ${grasaTotal.toFixed(1)} %, de la cual **${grasaVisceral.toFixed(1)} % de tu peso corporal** es grasa visceral y **${grasaSubcutanea.toFixed(1)} % de tu peso corporal** es grasa subcutánea. La relación subcutánea/visceral es **${ratio.toFixed(1)}:1**. Nivel de riesgo visceral: **${riskLevel}**. ${riskColor === 'green' ? 'Tu distribución de grasa tiene bajo riesgo metabólico por componente visceral.' : riskColor === 'red' ? 'Consultá con tu médico o nutricionista para evaluar estrategias de reducción del riesgo cardiometabólico.' : 'El ejercicio aeróbico y reducir carbohidratos refinados son las estrategias más efectivas para bajar la fracción de grasa visceral.'}`;

  const _insight = {
    title: __lang === 'en' ? 'Your fat distribution' : 'Tu distribución de grasa',
    text: __lang === 'en'
      ? `Visceral fat represents **${porcionVisceral.toFixed(1)} %** of your total fat mass, equivalent to **${grasaVisceral.toFixed(1)} %** of body weight. Risk: **${riskLevel}**. Even a modest visceral share drives disproportionate metabolic risk — visceral fat is drained directly into the portal circulation reaching the liver first.`
      : `La grasa visceral representa el **${porcionVisceral.toFixed(1)} %** de tu masa grasa total, equivalente al **${grasaVisceral.toFixed(1)} %** de tu peso corporal. Riesgo: **${riskLevel}**. La grasa visceral drena directamente al sistema porta hepático, lo que explica su mayor impacto metabólico comparado con la subcutánea.`,
    tone: riskColor === 'green' ? 'positive' : riskColor === 'red' ? 'warning' : 'neutral',
    icon: '⚖️',
    chart: {
      type: 'donut',
      labels: __lang === 'en' ? ['Visceral fat', 'Subcutaneous fat'] : ['Grasa visceral', 'Grasa subcutánea'],
      values: [parseFloat(grasaVisceral.toFixed(1)), parseFloat(grasaSubcutanea.toFixed(1))],
      colors: ['#ef4444', '#3b82f6'],
    },
  };

  return { resultado, resumen, _insight };
}
