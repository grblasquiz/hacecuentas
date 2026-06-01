/**
 * Calculadora de IMC (Índice de Masa Corporal).
 * Fórmula OMS: IMC = peso (kg) / altura² (m).
 *
 * Inputs opcionales (advanced):
 *  - cintura → calcula WHtR (cintura/altura) y riesgo cardiometabólico (Lancet 2024).
 *  - edad ≥ 65 → corre rango saludable a 23–28 (OMS para adultos mayores, evita sarcopenia).
 *  - perfil "atleta" → agrega warning de sobreestimación si IMC cae en sobrepeso/obesidad.
 *  - sistema "imperial" → convierte lb→kg y in→cm antes del cálculo; devuelve pesos en lb.
 *
 * i18n: la calc tiene versión en inglés (/en/bmi-calculator). El runtime inyecta
 * `inputs.__lang`. Los strings de salida (categoría, diferencia, riesgo, interpretación
 * y labels del gráfico) se devuelven ya traducidos según el idioma — el dict client-side
 * (formula-strings-i18n.json) no cubre los dinámicos ni el gráfico, así que la fuente de
 * verdad para el idioma es esta función. Patrón: igual que sueno-bebe-horas.ts.
 */

const LB_TO_KG = 0.4536;
const IN_TO_CM = 2.54;
const KG_TO_LB = 1 / LB_TO_KG;

type Lang = 'es' | 'en';

interface Strings {
  bajoPeso: string;
  bajoPesoMayor: string;
  normal: string;
  normalMayor: string;
  sobrepeso: string;
  obesidad1: string;
  obesidad2: string;
  obesidad3: string;
  dentroNormal: string;
  faltan: (s: string) => string;
  exceso: (s: string) => string;
  riesgoBajo: string;
  riesgoNormal: string;
  riesgoAumentado: string;
  riesgoAlto: string;
  interpAtleta: string;
  interpMayor: string;
  interpWhtr: string;
  errPeso: string;
  errAltura: string;
  markerLabel: (v: number) => string;
  ariaLabel: (v: number, cat: string) => string;
  segBajo: string;
  segNormal: string;
  segSobrepeso: string;
  segOb1: string;
  segOb2: string;
  segOb3: string;
  insightTitle: string;
  insightBajo: (imc: string, cat: string, rango: string) => string;
  insightNormal: (imc: string, cat: string, rango: string, bracket: string) => string;
  insightSobre: (imc: string, cat: string, rango: string) => string;
  insightObesidad: (imc: string, cat: string, rango: string) => string;
}

const STRINGS: Record<Lang, Strings> = {
  es: {
    bajoPeso: 'Bajo peso',
    bajoPesoMayor: 'Bajo peso para adulto mayor',
    normal: 'Peso normal ✅',
    normalMayor: 'Peso normal (ajustado >65) ✅',
    sobrepeso: 'Sobrepeso',
    obesidad1: 'Obesidad grado I',
    obesidad2: 'Obesidad grado II',
    obesidad3: 'Obesidad grado III',
    dentroNormal: 'Estás dentro del peso normal',
    faltan: (s) => `Te faltan ${s} para el peso normal`,
    exceso: (s) => `Tenés ${s} por encima del peso normal`,
    riesgoBajo: 'Bajo (cintura proporcionalmente fina, descartar bajo peso)',
    riesgoNormal: 'Normal ✅',
    riesgoAumentado: 'Aumentado — considerá reducir grasa abdominal',
    riesgoAlto: 'Alto — consultá con un profesional de la salud',
    interpAtleta:
      'Marcaste "atleta": el IMC sobreestima el riesgo cuando hay mucha masa muscular. Confirmá con porcentaje de grasa corporal o relación cintura-cadera antes de actuar sobre este número.',
    interpMayor:
      'Aplicamos rango ajustado 23–28 (OMS para ≥65 años). Mantener algo más de peso protege frente a la sarcopenia.',
    interpWhtr:
      'Aunque el IMC da normal, tu WHtR está sobre 0.5: hay grasa abdominal de riesgo aunque el peso total parezca bien.',
    errPeso: 'Ingresá un peso válido',
    errAltura: 'Ingresá una altura válida',
    markerLabel: (v) => `Tu IMC: ${v}`,
    ariaLabel: (v, cat) => `Escala de IMC: tu valor ${v} corresponde a "${cat}".`,
    segBajo: 'Bajo peso',
    segNormal: 'Normal',
    segSobrepeso: 'Sobrepeso',
    segOb1: 'Obesidad I',
    segOb2: 'Obesidad II',
    segOb3: 'Obesidad III',
    insightTitle: 'Qué significa tu IMC',
    insightBajo: (imc, cat, rango) =>
      `Con un IMC de **${imc}** caés en **${cat}**: estás por debajo del rango saludable. Para tu altura, un peso de **${rango}** te ubicaría en zona normal.`,
    insightNormal: (imc, cat, rango, bracket) =>
      `Tu IMC es **${imc}**, dentro de la zona **${cat}** (rango saludable **${bracket}** de IMC). Para tu altura eso equivale a un peso de **${rango}**: vas bien, mantenelo.`,
    insightSobre: (imc, cat, rango) =>
      `Con un IMC de **${imc}** estás en **${cat}**, por encima del rango saludable. Para tu altura, un peso de **${rango}** te devolvería a la zona normal.`,
    insightObesidad: (imc, cat, rango) =>
      `Tu IMC de **${imc}** cae en **${cat}**, una zona de mayor riesgo para la salud. Para tu altura, el rango saludable es **${rango}**; conviene consultar con un profesional.`,
  },
  en: {
    bajoPeso: 'Underweight',
    bajoPesoMayor: 'Underweight for older adults',
    normal: 'Normal weight ✅',
    normalMayor: 'Normal weight (adjusted >65) ✅',
    sobrepeso: 'Overweight',
    obesidad1: 'Obesity class I',
    obesidad2: 'Obesity class II',
    obesidad3: 'Obesity class III',
    dentroNormal: "You're at a healthy weight",
    faltan: (s) => `You need to gain about ${s} to reach a healthy weight`,
    exceso: (s) => `You're about ${s} over a healthy weight`,
    riesgoBajo: 'Low (proportionally slim waist; rule out underweight)',
    riesgoNormal: 'Normal ✅',
    riesgoAumentado: 'Increased — consider reducing abdominal fat',
    riesgoAlto: 'High — consult a healthcare professional',
    interpAtleta:
      'You selected "athlete": BMI overestimates risk when there is a lot of muscle mass. Confirm with body fat percentage or waist-to-hip ratio before acting on this number.',
    interpMayor:
      'We applied the adjusted 23–28 range (WHO for ages ≥65). Carrying a bit more weight protects against sarcopenia.',
    interpWhtr:
      'Even though your BMI reads normal, your WHtR is above 0.5: there is risky abdominal fat even if your total weight looks fine.',
    errPeso: 'Enter a valid weight',
    errAltura: 'Enter a valid height',
    markerLabel: (v) => `Your BMI: ${v}`,
    ariaLabel: (v, cat) => `BMI scale: your value ${v} falls in "${cat}".`,
    segBajo: 'Underweight',
    segNormal: 'Normal',
    segSobrepeso: 'Overweight',
    segOb1: 'Obesity I',
    segOb2: 'Obesity II',
    segOb3: 'Obesity III',
    insightTitle: 'What your BMI means',
    insightBajo: (imc, cat, rango) =>
      `With a BMI of **${imc}** you fall into **${cat}**: you're below the healthy range. For your height, a weight of **${rango}** would put you in the normal zone.`,
    insightNormal: (imc, cat, rango, bracket) =>
      `Your BMI is **${imc}**, within the **${cat}** zone (healthy BMI range **${bracket}**). For your height that means a weight of **${rango}**: you're doing well, keep it up.`,
    insightSobre: (imc, cat, rango) =>
      `With a BMI of **${imc}** you're in **${cat}**, above the healthy range. For your height, a weight of **${rango}** would bring you back to the normal zone.`,
    insightObesidad: (imc, cat, rango) =>
      `Your BMI of **${imc}** falls into **${cat}**, a higher health-risk zone. For your height, the healthy range is **${rango}**; it's worth consulting a professional.`,
  },
};

export interface IMCInputs {
  peso: number;
  altura: number; // en cm (o in si sistema=imperial)
  cintura?: number; // cm (o in si sistema=imperial) — opcional
  edad?: number;
  perfil?: 'estandar' | 'atleta';
  sistema?: 'metric' | 'imperial';
  __lang?: string;
}

export interface IMCOutputs {
  imc: number;
  categoria: string;
  pesoIdealMin: number;
  pesoIdealMax: number;
  diferenciaPesoIdeal: string;
  whtr: string;
  riesgoCardiometabolico: string;
  interpretacion: string;
  _chart?: any;
  _insight?: any;
}

export function imc(inputs: IMCInputs): IMCOutputs {
  const lang: Lang = inputs.__lang === 'en' ? 'en' : 'es';
  const S = STRINGS[lang];

  const sistema = inputs.sistema === 'imperial' ? 'imperial' : 'metric';
  const isImperial = sistema === 'imperial';

  let peso = Number(inputs.peso);
  let alturaCm = Number(inputs.altura);
  let cintura = inputs.cintura ? Number(inputs.cintura) : 0;

  if (!peso || peso <= 0) throw new Error(S.errPeso);
  if (!alturaCm || alturaCm <= 0) throw new Error(S.errAltura);

  if (isImperial) {
    peso = peso * LB_TO_KG;
    alturaCm = alturaCm * IN_TO_CM;
    if (cintura) cintura = cintura * IN_TO_CM;
  }

  const alturaM = alturaCm / 100;
  const imcValue = peso / (alturaM * alturaM);

  // Adulto mayor: OMS sugiere rango 23–28 para >=65 años (protege frente a sarcopenia).
  const edad = inputs.edad ? Number(inputs.edad) : 0;
  const esAdultoMayor = edad >= 65;
  const rangoMin = esAdultoMayor ? 23 : 18.5;
  const rangoMax = esAdultoMayor ? 28 : 24.9;

  let categoria = '';
  if (imcValue < 18.5) categoria = S.bajoPeso;
  else if (imcValue < 25) categoria = esAdultoMayor && imcValue < 23 ? S.bajoPesoMayor : S.normal;
  else if (imcValue < 30) categoria = esAdultoMayor && imcValue <= 28 ? S.normalMayor : S.sobrepeso;
  else if (imcValue < 35) categoria = S.obesidad1;
  else if (imcValue < 40) categoria = S.obesidad2;
  else categoria = S.obesidad3;

  const pesoIdealMin = rangoMin * alturaM * alturaM;
  const pesoIdealMax = rangoMax * alturaM * alturaM;

  // Formatter para diff: en imperial mostramos lb, en métrico kg.
  const unidadPeso = isImperial ? 'lb' : 'kg';
  const fmtPeso = (kg: number) => {
    const v = isImperial ? kg * KG_TO_LB : kg;
    return `${v.toFixed(1)} ${unidadPeso}`;
  };

  let diferencia = '';
  if (peso < pesoIdealMin) {
    diferencia = S.faltan(fmtPeso(pesoIdealMin - peso));
  } else if (peso > pesoIdealMax) {
    diferencia = S.exceso(fmtPeso(peso - pesoIdealMax));
  } else {
    diferencia = S.dentroNormal;
  }

  // WHtR (Waist-to-Height Ratio) — Lancet 2024 lo posiciona como mejor predictor
  // cardiometabólico que IMC. Umbrales clínicos: <0.4 bajo, 0.4-0.5 normal,
  // 0.5-0.6 aumentado, >=0.6 alto.
  let whtr = '—';
  let riesgoCardiometabolico = '—';
  if (cintura > 0 && alturaCm > 0) {
    const ratio = cintura / alturaCm;
    whtr = ratio.toFixed(2);
    if (ratio < 0.4) {
      riesgoCardiometabolico = S.riesgoBajo;
    } else if (ratio < 0.5) {
      riesgoCardiometabolico = S.riesgoNormal;
    } else if (ratio < 0.6) {
      riesgoCardiometabolico = S.riesgoAumentado;
    } else {
      riesgoCardiometabolico = S.riesgoAlto;
    }
  }

  // Interpretación contextual: combina categoría + edad + perfil + WHtR.
  const partes: string[] = [];
  if (inputs.perfil === 'atleta' && imcValue >= 25) {
    partes.push(S.interpAtleta);
  }
  if (esAdultoMayor) {
    partes.push(S.interpMayor);
  }
  if (cintura > 0 && imcValue >= 18.5 && imcValue < 25 && cintura / alturaCm >= 0.5) {
    partes.push(S.interpWhtr);
  }
  const interpretacion = partes.length > 0 ? partes.join(' ') : '—';

  const imcRedondeado = Number(imcValue.toFixed(2));
  const categoriaLimpia = categoria.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
  const chart = {
    type: 'scale' as const,
    ariaLabel: S.ariaLabel(imcRedondeado, categoriaLimpia),
    marker: imcRedondeado,
    markerLabel: S.markerLabel(imcRedondeado),
    segments: [
      { nombre: S.segBajo, max: 18.5, color: '#fde68a', colorDark: '#b45309' },
      { nombre: S.segNormal, max: 25, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: S.segSobrepeso, max: 30, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: S.segOb1, max: 35, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: S.segOb2, max: 40, color: '#e8b4b8', colorDark: '#991b1b' },
      { nombre: S.segOb3, max: Math.max(50, Math.ceil(imcValue) + 2), color: '#d4a0a8', colorDark: '#7f1d1d' },
    ],
    unit: '',
    min: 10,
  };

  // Outputs de peso ideal en la unidad elegida (kg o lb).
  const pesoIdealMinOut = isImperial ? pesoIdealMin * KG_TO_LB : pesoIdealMin;
  const pesoIdealMaxOut = isImperial ? pesoIdealMax * KG_TO_LB : pesoIdealMax;

  // Insight narrativo: refleja la zona REAL del resultado (misma lógica que categoria,
  // incluyendo el ajuste 23–28 para adulto mayor). Reutiliza imc, categoria y rango saludable.
  const rangoSaludable = `${fmtPeso(pesoIdealMin)} – ${fmtPeso(pesoIdealMax)}`;
  const fmtImc = (n: number) => {
    const s = Number.isInteger(n) ? String(n) : n.toFixed(1);
    return lang === 'es' ? s.replace('.', ',') : s;
  };
  const bracketSaludable = `${fmtImc(rangoMin)}–${fmtImc(rangoMax)}`;
  const imcStr = lang === 'es' ? imcRedondeado.toFixed(2).replace('.', ',') : imcRedondeado.toFixed(2);
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightIcon: string;
  if (imcValue < rangoMin) {
    // Bajo peso (o bajo peso para adulto mayor si imc < 23).
    insightText = S.insightBajo(imcStr, categoria, rangoSaludable);
    insightTone = 'warn';
    insightIcon = '⚖️';
  } else if (imcValue <= rangoMax) {
    // Zona saludable/normal (18.5–24.9, o 23–28 ajustado para ≥65).
    insightText = S.insightNormal(imcStr, categoria, rangoSaludable, bracketSaludable);
    insightTone = 'good';
    insightIcon = '✅';
  } else if (imcValue < 30) {
    insightText = S.insightSobre(imcStr, categoria, rangoSaludable);
    insightTone = 'warn';
    insightIcon = '⚠️';
  } else {
    insightText = S.insightObesidad(imcStr, categoria, rangoSaludable);
    insightTone = 'warn';
    insightIcon = '🩺';
  }
  const insight = {
    title: S.insightTitle,
    text: insightText,
    tone: insightTone,
    icon: insightIcon,
  };

  return {
    imc: imcRedondeado,
    categoria,
    pesoIdealMin: Number(pesoIdealMinOut.toFixed(1)),
    pesoIdealMax: Number(pesoIdealMaxOut.toFixed(1)),
    diferenciaPesoIdeal: diferencia,
    whtr,
    riesgoCardiometabolico,
    interpretacion,
    _chart: chart,
    _insight: insight,
  };
}
