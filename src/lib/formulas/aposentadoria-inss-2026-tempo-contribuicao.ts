import { INSS_TETO, SALARIO_MINIMO } from '../data/brasil-2026';
// Calculadora Aposentadoria INSS 2026
// Fontes: EC 103/2019, Portaria MPS 2026, IN INSS 128/2022

export interface Inputs {
  sex: string;              // "M" = Masculino, "F" = Feminino
  age: number;              // idade atual em anos
  contribution_years: number; // tempo de contribuição em anos completos
  salary_avg: number;       // média dos salários de contribuição (R$)
}

export interface Outputs {
  benefit_value: number;    // valor estimado do benefício em R$
  benefit_rate: number;     // alíquota aplicada (0-1)
  best_rule: string;        // descrição da regra mais vantajosa
  age_rule_eligible: string;
  transition_rule_eligible: string;
  years_missing: string;
  _insight?: any;
}

// Constantes 2026 — Portaria MPS
const TETO_INSS_2026 = INSS_TETO;
const SALARIO_MINIMO_2026 = SALARIO_MINIMO;

// Regra de Transição por Pontos 2026 — EC 103/2019
const PONTOS_HOMEM_2026 = 97;
const PONTOS_MULHER_2026 = 87;
const CONTRIB_MIN_HOMEM = 35;  // anos mínimos para transição por pontos (H)
const CONTRIB_MIN_MULHER = 30; // anos mínimos para transição por pontos (M)

// Aposentadoria por Idade
const IDADE_MIN_HOMEM = 65;
const IDADE_MIN_MULHER = 62;
const CONTRIB_MIN_IDADE = 15; // carência mínima para apos. por idade

// Fórmula de alíquota: 60% + 2% por ano acima de 20 anos
const BASE_RATE = 0.60;
const INCREMENT_RATE = 0.02;
const INCREMENT_THRESHOLD = 20;

function calcRate(contribYears: number): number {
  const extra = Math.max(0, contribYears - INCREMENT_THRESHOLD);
  return Math.min(1.0, BASE_RATE + INCREMENT_RATE * extra);
}

const fmtBRL = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function clampBenefit(value: number): number {
  if (value < SALARIO_MINIMO_2026) return SALARIO_MINIMO_2026;
  if (value > TETO_INSS_2026) return TETO_INSS_2026;
  return value;
}

export function compute(i: Inputs): Outputs {
  const sex = (i.sex || "M").toString().toUpperCase().trim();
  const age = Math.floor(Number(i.age) || 0);
  const contrib = Math.floor(Number(i.contribution_years) || 0);
  const salaryAvg = Number(i.salary_avg) || 0;

  // Validações básicas
  if (age <= 0 || contrib < 0 || salaryAvg <= 0) {
    return {
      benefit_value: 0,
      benefit_rate: 0,
      best_rule: "Preencha todos os campos com valores válidos.",
      age_rule_eligible: "—",
      transition_rule_eligible: "—",
      years_missing: "Verifique os dados informados.",
      _insight: undefined
    };
  }

  const isHomem = sex !== "F";

  // ─── Regra 1: Aposentadoria por Idade ───────────────────────────────────
  const idadeMin = isHomem ? IDADE_MIN_HOMEM : IDADE_MIN_MULHER;
  const cumpreIdade = age >= idadeMin && contrib >= CONTRIB_MIN_IDADE;

  let ageRuleText = "";
  let ageRateFinal = 0;
  let ageBenefit = 0;

  if (cumpreIdade) {
    ageRateFinal = calcRate(contrib);
    ageBenefit = clampBenefit(ageRateFinal * salaryAvg);
    ageRuleText = `Elegível ✓ — alíquota ${(ageRateFinal * 100).toFixed(0)}%, benefício estimado R$ ${ageBenefit.toFixed(2)}`;
  } else {
    const faltaIdade = Math.max(0, idadeMin - age);
    const faltaContrib = Math.max(0, CONTRIB_MIN_IDADE - contrib);
    const partes: string[] = [];
    if (faltaIdade > 0) partes.push(`${faltaIdade} ano(s) de idade`);
    if (faltaContrib > 0) partes.push(`${faltaContrib} ano(s) de contribuição`);
    ageRuleText = `Não elegível — faltam: ${partes.join(" e ")}`;
  }

  // ─── Regra 2: Transição por Pontos ──────────────────────────────────────
  const pontosMin = isHomem ? PONTOS_HOMEM_2026 : PONTOS_MULHER_2026;
  const contribMinTrans = isHomem ? CONTRIB_MIN_HOMEM : CONTRIB_MIN_MULHER;
  const pontosTotais = age + contrib;
  const cumpriuPontos = pontosTotais >= pontosMin && contrib >= contribMinTrans;

  let transRuleText = "";
  let transRateFinal = 0;
  let transBenefit = 0;

  if (cumpriuPontos) {
    transRateFinal = calcRate(contrib);
    transBenefit = clampBenefit(transRateFinal * salaryAvg);
    transRuleText = `Elegível ✓ — ${pontosTotais} pontos (mín. ${pontosMin}), alíquota ${(transRateFinal * 100).toFixed(0)}%, benefício estimado R$ ${transBenefit.toFixed(2)}`;
  } else {
    const faltaPontos = Math.max(0, pontosMin - pontosTotais);
    const faltaContribTrans = Math.max(0, contribMinTrans - contrib);
    const partes: string[] = [];
    if (faltaPontos > 0) partes.push(`${faltaPontos} ponto(s)`);
    if (faltaContribTrans > 0) partes.push(`${faltaContribTrans} ano(s) de contribuição`);
    transRuleText = `Não elegível — faltam: ${partes.join(" e ")} (você tem ${pontosTotais} pontos, mínimo ${pontosMin})}`;
  }

  // ─── Seleciona a regra mais vantajosa ────────────────────────────────────
  let bestRule = "";
  let finalBenefit = 0;
  let finalRate = 0;
  let yearsMissing = "";

  if (!cumpreIdade && !cumpriuPontos) {
    // Calcula quanto falta para cada regra e aponta a mais próxima
    const faltaIdadeAnos = Math.max(0, idadeMin - age);
    const faltaContribIdade = Math.max(0, CONTRIB_MIN_IDADE - contrib);
    const faltaMaxIdade = Math.max(faltaIdadeAnos, faltaContribIdade);

    const faltaPontosNum = Math.max(0, pontosMin - pontosTotais);
    const faltaContribTrans = Math.max(0, contribMinTrans - contrib);

    bestRule = "Nenhuma regra elegível ainda";
    finalBenefit = 0;
    finalRate = 0;

    const projecaoRate = calcRate(contrib);
    const projecaoBenefit = clampBenefit(projecaoRate * salaryAvg);

    yearsMissing = (
      `Se aposentar pela idade: faltam ${faltaMaxIdade} ano(s). ` +
      `Se pela transição por pontos: faltam ${faltaPontosNum} ponto(s) e ${faltaContribTrans} ano(s) de contribuição. ` +
      `Com ${contrib} anos de contribuição atuais, alíquota seria ${(projecaoRate * 100).toFixed(0)}% → R$ ${projecaoBenefit.toFixed(2)}.`
    );
  } else if (cumpriuPontos && !cumpreIdade) {
    bestRule = `Transição por Pontos (${pontosTotais} pontos ≥ ${pontosMin})`;
    finalBenefit = transBenefit;
    finalRate = transRateFinal;
    yearsMissing = "Você ainda não cumpre a aposentadoria por idade.";
  } else if (!cumpriuPontos && cumpreIdade) {
    bestRule = `Aposentadoria por Idade (${age} anos ≥ ${idadeMin} e ${contrib} anos de contribuição ≥ 15)`;
    finalBenefit = ageBenefit;
    finalRate = ageRateFinal;
    yearsMissing = "Você ainda não cumpre a transição por pontos.";
  } else {
    // Ambas elegíveis: escolhe a de maior benefício
    if (transBenefit >= ageBenefit) {
      bestRule = `Transição por Pontos (R$ ${transBenefit.toFixed(2)} > Idade R$ ${ageBenefit.toFixed(2)})`;
      finalBenefit = transBenefit;
      finalRate = transRateFinal;
    } else {
      bestRule = `Aposentadoria por Idade (R$ ${ageBenefit.toFixed(2)} > Pontos R$ ${transBenefit.toFixed(2)})`;
      finalBenefit = ageBenefit;
      finalRate = ageRateFinal;
    }
    yearsMissing = "Você é elegível por ambas as regras. Consulte o Meu INSS para confirmar.";
  }

  const elegivel = cumpreIdade || cumpriuPontos;
  const _insight = elegivel
    ? {
        title: 'Você já pode se aposentar',
        text: `Pela regra mais vantajosa — **${bestRule}** — seu benefício estimado é de **${fmtBRL(finalBenefit)}/mês** (alíquota de **${(finalRate * 100).toFixed(0)}%** sobre a média de ${fmtBRL(salaryAvg)}).`,
        tone: 'good',
        icon: '🎉',
      }
    : {
        title: 'Ainda falta tempo para aposentar',
        text: `Com **${age} anos** de idade e **${contrib} anos** de contribuição você somou **${pontosTotais} pontos** (mínimo ${pontosMin}). Nenhuma regra está liberada ainda — mantendo a média de ${fmtBRL(salaryAvg)}, a alíquota projetada seria de **${(calcRate(contrib) * 100).toFixed(0)}%**.`,
        tone: 'warn',
        icon: '⏳',
      };

  return {
    benefit_value: finalBenefit,
    benefit_rate: finalRate,
    best_rule: bestRule,
    age_rule_eligible: ageRuleText,
    transition_rule_eligible: transRuleText,
    years_missing: yearsMissing,
    _insight
  };
}
