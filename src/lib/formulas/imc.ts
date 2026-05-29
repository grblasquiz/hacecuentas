/**
 * Calculadora de IMC (Índice de Masa Corporal).
 * Fórmula OMS: IMC = peso (kg) / altura² (m).
 *
 * Inputs opcionales (advanced):
 *  - cintura → calcula WHtR (cintura/altura) y riesgo cardiometabólico (Lancet 2024).
 *  - edad ≥ 65 → corre rango saludable a 23–28 (OMS para adultos mayores, evita sarcopenia).
 *  - perfil "atleta" → agrega warning de sobreestimación si IMC cae en sobrepeso/obesidad.
 *  - sistema "imperial" → convierte lb→kg y in→cm antes del cálculo; devuelve pesos en lb.
 */

const LB_TO_KG = 0.4536;
const IN_TO_CM = 2.54;
const KG_TO_LB = 1 / LB_TO_KG;

export interface IMCInputs {
  peso: number;
  altura: number; // en cm (o in si sistema=imperial)
  cintura?: number; // cm (o in si sistema=imperial) — opcional
  edad?: number;
  perfil?: 'estandar' | 'atleta';
  sistema?: 'metric' | 'imperial';
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
}

export function imc(inputs: IMCInputs): IMCOutputs {
  const sistema = inputs.sistema === 'imperial' ? 'imperial' : 'metric';
  const isImperial = sistema === 'imperial';

  let peso = Number(inputs.peso);
  let alturaCm = Number(inputs.altura);
  let cintura = inputs.cintura ? Number(inputs.cintura) : 0;

  if (!peso || peso <= 0) throw new Error('Ingresá un peso válido');
  if (!alturaCm || alturaCm <= 0) throw new Error('Ingresá una altura válida');

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
  if (imcValue < 18.5) categoria = 'Bajo peso';
  else if (imcValue < 25) categoria = esAdultoMayor && imcValue < 23 ? 'Bajo peso para adulto mayor' : 'Peso normal ✅';
  else if (imcValue < 30) categoria = esAdultoMayor && imcValue <= 28 ? 'Peso normal (ajustado >65) ✅' : 'Sobrepeso';
  else if (imcValue < 35) categoria = 'Obesidad grado I';
  else if (imcValue < 40) categoria = 'Obesidad grado II';
  else categoria = 'Obesidad grado III';

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
    diferencia = `Te faltan ${fmtPeso(pesoIdealMin - peso)} para el peso normal`;
  } else if (peso > pesoIdealMax) {
    diferencia = `Tenés ${fmtPeso(peso - pesoIdealMax)} por encima del peso normal`;
  } else {
    diferencia = 'Estás dentro del peso normal';
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
      riesgoCardiometabolico = 'Bajo (cintura proporcionalmente fina, descartar bajo peso)';
    } else if (ratio < 0.5) {
      riesgoCardiometabolico = 'Normal ✅';
    } else if (ratio < 0.6) {
      riesgoCardiometabolico = 'Aumentado — considerá reducir grasa abdominal';
    } else {
      riesgoCardiometabolico = 'Alto — consultá con un profesional de la salud';
    }
  }

  // Interpretación contextual: combina categoría + edad + perfil + WHtR.
  const partes: string[] = [];
  if (inputs.perfil === 'atleta' && imcValue >= 25) {
    partes.push(
      `Marcaste "atleta": el IMC sobreestima el riesgo cuando hay mucha masa muscular. Confirmá con porcentaje de grasa corporal o relación cintura-cadera antes de actuar sobre este número.`
    );
  }
  if (esAdultoMayor) {
    partes.push(
      `Aplicamos rango ajustado 23–28 (OMS para ≥65 años). Mantener algo más de peso protege frente a la sarcopenia.`
    );
  }
  if (cintura > 0 && imcValue >= 18.5 && imcValue < 25 && cintura / alturaCm >= 0.5) {
    partes.push(
      `Aunque el IMC da normal, tu WHtR está sobre 0.5: hay grasa abdominal de riesgo aunque el peso total parezca bien.`
    );
  }
  const interpretacion = partes.length > 0 ? partes.join(' ') : '—';

  const imcRedondeado = Number(imcValue.toFixed(2));
  const chart = {
    type: 'scale' as const,
    ariaLabel: `Escala de IMC: tu valor ${imcRedondeado} corresponde a "${categoria.replace(/[^\p{L}\p{N}\s]/gu, '').trim()}".`,
    marker: imcRedondeado,
    markerLabel: `Tu IMC: ${imcRedondeado}`,
    segments: [
      { nombre: 'Bajo peso', max: 18.5, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Normal', max: 25, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Sobrepeso', max: 30, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Obesidad I', max: 35, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Obesidad II', max: 40, color: '#e8b4b8', colorDark: '#991b1b' },
      { nombre: 'Obesidad III', max: Math.max(50, Math.ceil(imcValue) + 2), color: '#d4a0a8', colorDark: '#7f1d1d' },
    ],
    unit: '',
    min: 10,
  };

  // Outputs de peso ideal en la unidad elegida (kg o lb).
  const pesoIdealMinOut = isImperial ? pesoIdealMin * KG_TO_LB : pesoIdealMin;
  const pesoIdealMaxOut = isImperial ? pesoIdealMax * KG_TO_LB : pesoIdealMax;

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
  };
}
