export interface Inputs {
  weight_kg: number;
  height_cm: number;
  sex: string;
}

export interface Outputs {
  imc: number;
  classification: string;
  ideal_weight: number;
  weight_to_normal: string;
  healthy_range: string;
  disclaimer: string;
  _chart?: any;
  _insight?: any;
}

// Pontos de corte OMS para adultos (WHO, 2000 / atualizado 2024)
const IMC_UNDERWEIGHT = 18.5;
const IMC_NORMAL_MAX = 24.9;
const IMC_OVERWEIGHT_MAX = 29.9;
const IMC_OBESE_I_MAX = 34.9;
const IMC_OBESE_II_MAX = 39.9;

// Ponto médio da faixa normal usado para calcular peso ideal
const IMC_IDEAL_MIDPOINT = 21.7;

function classifyImc(imc: number): string {
  if (imc < IMC_UNDERWEIGHT) return "Magreza (abaixo do peso)";
  if (imc <= IMC_NORMAL_MAX) return "Peso normal (eutrófico)";
  if (imc <= IMC_OVERWEIGHT_MAX) return "Sobrepeso";
  if (imc <= IMC_OBESE_I_MAX) return "Obesidade Grau I";
  if (imc <= IMC_OBESE_II_MAX) return "Obesidade Grau II";
  return "Obesidade Grau III (mórbida)";
}

export function compute(i: Inputs): Outputs {
  const weight = Number(i.weight_kg) || 0;
  const heightCm = Number(i.height_cm) || 0;
  const sex = i.sex || "neutral";

  if (weight <= 0 || heightCm <= 0) {
    return {
      imc: 0,
      classification: "Informe peso e altura válidos.",
      ideal_weight: 0,
      weight_to_normal: "—",
      healthy_range: "—",
      disclaimer: "O IMC é uma ferramenta de triagem. Consulte um profissional de saúde para avaliação completa."
    };
  }

  const heightM = heightCm / 100;
  const heightSq = heightM * heightM;

  // IMC principal
  const imc = weight / heightSq;
  const imcRounded = Math.round(imc * 100) / 100;

  const classification = classifyImc(imcRounded);

  // Peso ideal: ponto médio da faixa normal (IMC 21,7)
  const ideal_weight = Math.round(IMC_IDEAL_MIDPOINT * heightSq * 10) / 10;

  // Faixa saudável
  const minHealthy = Math.round(IMC_UNDERWEIGHT * heightSq * 10) / 10;
  const maxHealthy = Math.round(IMC_NORMAL_MAX * heightSq * 10) / 10;
  const healthy_range = `${minHealthy.toFixed(1)} kg a ${maxHealthy.toFixed(1)} kg`;

  // Diferença até faixa normal
  let weight_to_normal: string;
  if (imcRounded >= IMC_UNDERWEIGHT && imcRounded <= IMC_NORMAL_MAX) {
    weight_to_normal = "Você já está na faixa normal. ✓";
  } else if (imcRounded < IMC_UNDERWEIGHT) {
    const diff = Math.round((minHealthy - weight) * 10) / 10;
    weight_to_normal = `Você está ${diff.toFixed(1)} kg abaixo do mínimo saudável (${minHealthy.toFixed(1)} kg).`;
  } else {
    // Acima do normal
    const diff = Math.round((weight - maxHealthy) * 10) / 10;
    weight_to_normal = `Você está ${diff.toFixed(1)} kg acima do máximo saudável (${maxHealthy.toFixed(1)} kg).`;
  }

  // Ressalva
  let disclaimer = "O IMC não diferencia massa muscular de gordura corporal e não deve ser usado como único critério diagnóstico. Não aplicar em crianças, adolescentes, gestantes ou idosos sem ajustes.";
  if (sex === "male") {
    disclaimer += " Para homens com alta massa muscular, o IMC pode superestimar o risco de saúde.";
  } else if (sex === "female") {
    disclaimer += " Mulheres naturalmente têm maior percentual de gordura que homens com o mesmo IMC; considere medidas complementares.";
  }

  // Gauge de escala IMC: mostra em qual faixa OMS o valor cai
  const chart = {
    type: "scale" as const,
    marker: imcRounded,
    markerLabel: `Seu IMC: ${imcRounded}`,
    min: 10,
    unit: '',
    segments: [
      { nombre: 'Magreza', max: 18.5, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Normal', max: 25, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Sobrepeso', max: 30, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Obesidade I', max: 35, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Obesidade II', max: 40, color: '#e8b4b8', colorDark: '#991b1b' },
      { nombre: 'Obesidade III', max: Math.max(50, Math.ceil(imcRounded) + 2), color: '#d4a0a8', colorDark: '#7f1d1d' },
    ],
    ariaLabel: `Escala de IMC: seu valor ${imcRounded} corresponde a "${classification}".`,
  };

  const isNormal = imcRounded >= IMC_UNDERWEIGHT && imcRounded <= IMC_NORMAL_MAX;
  const insight = {
    title: isNormal ? 'IMC na faixa saudável' : 'IMC fora da faixa saudável',
    text: isNormal
      ? `Com **${weight.toFixed(1)} kg** e **${heightCm} cm**, seu IMC é **${imcRounded}**, na faixa normal da OMS (18,5–24,9). A faixa de peso saudável para sua altura vai de **${healthy_range}**.`
      : `Com **${weight.toFixed(1)} kg** e **${heightCm} cm**, seu IMC é **${imcRounded}** — classificação **${classification}**. ${weight_to_normal} A faixa saudável para sua altura é **${healthy_range}**.`,
    tone: isNormal ? 'good' : 'warn',
    icon: isNormal ? '✅' : '⚖️',
  };

  return {
    imc: imcRounded,
    classification,
    ideal_weight,
    weight_to_normal,
    healthy_range,
    disclaimer,
    _chart: chart,
    _insight: insight
  };
}
