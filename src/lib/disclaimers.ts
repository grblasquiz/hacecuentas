export type DisclaimerLanguage = 'es' | 'en' | 'pt';
export type DisclaimerDomain = 'medical-dose' | 'health' | 'tax' | 'labor' | 'legal' | 'investment' | 'finance' | 'construction-structural' | 'construction-materials' | 'sports' | 'pets' | 'family' | 'math' | 'cooking' | 'business' | 'general';

type CalcLike = { slug?: string; category?: string; h1?: string; title?: string };

const RX = {
  dose: /dosis|dose|dosagem|posolog|suplement|medicamento|farmaco/,
  tax: /impuesto|tribut|monotribut|ganancias|iva\b|iibb|arca\b|afip\b|retencion|percepcion|tax\b|irs\b|irpf|isr\b|sat\b|hacienda|sunat|dian\b|dgi\b/,
  labor: /sueldo|salario|aguinaldo|indemniz|vacacion|liquidacion|paritaria|antiguedad|horas-extra|preaviso|finiquito|despido|nomina|laboral|licencia-(matern|patern|laboral)|severance|payroll/,
  legal: /licencia|registro|documento|dni\b|pasaporte|visa\b|certificado|partida|permiso|multa|patente|tramite|sucesion|herencia|divorcio|contrato|alquiler|escritura|legal|judicial|notarial|ciudadania/,
  investment: /invers|cedear|bono|obligacion-negociable|accion|dividendo|portfolio|cartera|dca\b|fire\b|mep\b|ccl\b|cripto|bitcoin|ethereum|trading|broker|alyc|plazo-fijo|fci\b|fondo-comun|tasa-interna|tir\b|yield|rendimiento/,
  structural: /estructura|estructural|cimiento|fundacion|losa|viga|columna|hormigon|acero|carga|muro-portante|resistencia/,
};

function haystack(calc: CalcLike): string {
  return [calc.slug, calc.category, calc.h1, calc.title].filter(Boolean).join(' ')
    .toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Clasifica por riesgo real para evitar avisos de CNV/contador fuera de contexto. */
export function classifyDisclaimerDomain(calc: CalcLike): DisclaimerDomain {
  const text = haystack(calc);
  const category = (calc.category || '').toLocaleLowerCase('es');
  if (RX.dose.test(text) && ['salud', 'familia', 'mascotas', 'deportes'].includes(category)) return 'medical-dose';
  if (category === 'salud') return 'health';
  if (category === 'mascotas') return 'pets';
  if (RX.tax.test(text) || category === 'impuestos') return 'tax';
  if (RX.labor.test(text)) return 'labor';
  if (RX.legal.test(text)) return 'legal';
  if (category === 'construccion') return RX.structural.test(text) ? 'construction-structural' : 'construction-materials';
  if (category === 'cocina') return 'cooking';
  if (['matematica', 'ciencia', 'electronica', 'educacion'].includes(category)) return 'math';
  if (category === 'deportes') return 'sports';
  if (category === 'familia') return 'family';
  if (RX.investment.test(text)) return 'investment';
  if (category === 'finanzas') return 'finance';
  if (category === 'negocios') return 'business';
  return 'general';
}

const COPY: Record<DisclaimerLanguage, Record<DisclaimerDomain, string>> = {
  es: {
    'medical-dose': 'Las dosis son referencias generales, no una indicación médica ni una receta. No te automediques ni modifiques una pauta profesional; consultá con un médico o farmacéutico.',
    health: 'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
    tax: 'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.',
    labor: 'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.',
    legal: 'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.',
    investment: 'Herramienta educativa, no constituye asesoramiento ni recomendación de inversión. Rentabilidad y capital pueden variar o perderse; verificá costos y riesgos con una entidad o asesor habilitado.',
    finance: 'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',
    'construction-structural': 'Estimación preliminar. No reemplaza el cálculo estructural, la documentación técnica ni la dirección de un profesional habilitado.',
    'construction-materials': 'Estimación de cantidades y materiales. Verificá rendimiento, desperdicio y aplicación con la ficha del fabricante o el profesional a cargo.',
    sports: 'Estimación general. Ajustá cargas y objetivos a tu condición física; ante dolor, lesión o riesgo de salud consultá a un profesional.',
    pets: 'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
    family: 'Información general. En decisiones de salud, fertilidad, embarazo o crianza, consultá al profesional correspondiente.',
    math: 'Resultado matemático basado en los datos ingresados. Verificá unidades, supuestos y redondeos antes de usarlo en un trabajo técnico.',
    cooking: 'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
    business: 'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.',
    general: 'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
  },
  en: {
    'medical-dose': 'Doses are general references, not medical advice or a prescription. Do not self-medicate or change professional guidance; consult a physician or pharmacist.', health: 'For guidance only; this does not replace diagnosis, treatment, or professional follow-up. Consult a licensed healthcare professional.', tax: 'Informational estimate based on the stated parameters. Rules and brackets may change; verify the relevant tax authority and consult a qualified tax professional for a final filing.', labor: 'Indicative estimate based on the stated rules. Agreements, caps, and individual circumstances may change the result; verify with HR, the labor authority, or a qualified professional.', legal: 'Informational guide for estimating requirements, timing, or fees. Confirm current rules with the official authority; seek qualified legal advice when rights are affected.', investment: 'Educational tool, not investment advice or a recommendation. Returns and capital can fluctuate or be lost; verify costs and risks with an authorized provider or adviser.', finance: 'Informational estimate. Actual rates, fees, and terms depend on the provider and contract; compare official documents before deciding.', 'construction-structural': 'Preliminary estimate. It does not replace structural calculations, technical documents, or supervision by a licensed professional.', 'construction-materials': 'Material and quantity estimate. Check coverage, waste, and application against the manufacturer’s specifications or the professional in charge.', sports: 'General estimate. Adapt loads and goals to your condition; consult a qualified professional for pain, injury, or health risk.', pets: 'For guidance only; this does not replace veterinary assessment. Do not medicate or change your pet’s diet based only on this result.', family: 'General information. Consult the appropriate professional for health, fertility, pregnancy, or parenting decisions.', math: 'Mathematical result based on the inputs. Verify units, assumptions, and rounding before technical use.', cooking: 'Quantities and times are estimates; adjust them to the ingredient, equipment, and recipe. Always follow appropriate food-safety practices.', business: 'Planning estimate. It does not replace accounting, contractual, or financial advice tailored to your activity.', general: 'Estimated result based on your inputs. Verify assumptions and cited sources before using it for an important decision.',
  },
  pt: {
    'medical-dose': 'As doses são referências gerais, não orientação médica nem receita. Não se automedique nem altere uma indicação profissional; consulte médico ou farmacêutico.', health: 'Resultado orientativo; não substitui diagnóstico, tratamento ou acompanhamento profissional. Consulte um profissional de saúde habilitado.', tax: 'Estimativa informativa baseada nos parâmetros indicados. Regras e faixas podem mudar; confira o órgão fiscal aplicável e consulte um profissional tributário para a apuração definitiva.', labor: 'Cálculo orientativo conforme as regras indicadas. Convenções, limites e situações individuais podem alterar o resultado; confirme com RH, órgão trabalhista ou profissional habilitado.', legal: 'Guia informativo para estimar requisitos, prazos ou valores. Confirme a norma vigente no órgão oficial; quando houver efeitos jurídicos, consulte um profissional habilitado.', investment: 'Ferramenta educativa, não é recomendação de investimento. Retorno e capital podem variar ou ser perdidos; confira custos e riscos com instituição ou assessor habilitado.', finance: 'Estimativa informativa. Taxas, custos e condições reais dependem da instituição e do contrato; compare os documentos oficiais antes de decidir.', 'construction-structural': 'Estimativa preliminar. Não substitui cálculo estrutural, documentação técnica nem acompanhamento de profissional habilitado.', 'construction-materials': 'Estimativa de quantidades e materiais. Confira rendimento, perdas e aplicação na ficha do fabricante ou com o profissional responsável.', sports: 'Estimativa geral. Adapte cargas e metas à sua condição; consulte um profissional em caso de dor, lesão ou risco à saúde.', pets: 'Resultado orientativo; não substitui avaliação veterinária. Não medique nem altere a alimentação do animal apenas com este cálculo.', family: 'Informação geral. Em decisões de saúde, fertilidade, gravidez ou cuidados familiares, consulte o profissional adequado.', math: 'Resultado matemático baseado nos dados informados. Confira unidades, premissas e arredondamentos antes do uso técnico.', cooking: 'Quantidades e tempos são estimativas; ajuste ao ingrediente, equipamento e receita. Siga sempre práticas adequadas de segurança alimentar.', business: 'Estimativa para planejamento. Não substitui orientação contábil, contratual ou financeira adaptada à sua atividade.', general: 'Resultado estimado a partir dos dados informados. Confira as premissas e fontes antes de uma decisão importante.',
  },
};

const ES_OVERRIDES: Record<string, string> = {
  'sueldo-en-mano-argentina': 'Cálculo aproximado según la escala indicada. Convenios, deducciones y situaciones personales pueden variar; verificá con RR. HH. o un profesional.',
  'calculadora-aguinaldo-sac': 'El aguinaldo se estima con la mejor remuneración del semestre y las reglas indicadas. Para una liquidación final, verificá recibos y convenio con RR. HH. o un profesional.',
  'calculadora-monotributo-2026': 'Los montos se basan en las escalas publicadas por ARCA y pueden actualizarse. Confirmá la categoría vigente en arca.gob.ar o con un contador.',
  'calculadora-cuota-prestamo': 'Cuota ilustrativa: el CFT real puede variar por seguros, gastos e impuestos. Revisá la oferta y el contrato del banco antes de firmar.',
  'calculadora-imc': 'El IMC es orientativo y no contempla por sí solo composición corporal ni antecedentes. No reemplaza una evaluación médica.',
  'calculadora-calorias-diarias-tdee': 'Estimación poblacional basada en la fórmula indicada. Para un plan individual, consultá a un nutricionista matriculado.',
  'calculadora-embarazo': 'Estimación basada en la regla indicada; la fecha real puede variar. Confirmá el seguimiento con tu obstetra.',
  'calculadora-ovulacion-dias-fertiles': 'Estimación estadística, no un método anticonceptivo ni diagnóstico. Consultá a un profesional si buscás o evitás un embarazo.',
};

export function getCalculatorDisclaimer(calc: CalcLike, language: DisclaimerLanguage = 'es'): string {
  if (language === 'es' && calc.slug && ES_OVERRIDES[calc.slug]) return ES_OVERRIDES[calc.slug];
  return COPY[language][classifyDisclaimerDomain(calc)];
}
