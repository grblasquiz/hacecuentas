export interface Inputs {
  input_mode: string;
  get_direto: number;
  peso: number;
  altura: number;
  idade: number;
  sexo: string;
  nivel_atividade: string;
  objetivo: string;
  proteina_g_kg: string;
  gordura_pct: string;
}

export interface Outputs {
  kcal_alvo: number;
  proteina_g: number;
  gordura_g: number;
  carbo_g: number;
  distribuicao_pct: string;
  exemplos_alimentos: string;
  tmb_calculada: number;
  get_usado: number;
}

// Fatores de atividade — Ainsworth et al. / Harris-Benedict revisado
const FATORES_ATIVIDADE: Record<string, number> = {
  sedentario: 1.20,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muito_intenso: 1.90,
};

// Ajuste calórico por objetivo
const AJUSTE_OBJETIVO: Record<string, number> = {
  cutting: 0.80,
  manutencao: 1.00,
  bulking: 1.10,
};

// Kcal por grama de cada macro
const KCAL_PROTEINA = 4;
const KCAL_CARBO = 4;
const KCAL_GORDURA = 9;

function calcularTMB(peso: number, altura: number, idade: number, sexo: string): number {
  // Fórmula Mifflin-St Jeor (1990)
  const base = 10 * peso + 6.25 * altura - 5 * idade;
  return sexo === 'feminino' ? base - 161 : base + 5;
}

function exemplosAlimentos(
  proteina_g: number,
  carbo_g: number,
  gordura_g: number
): string {
  // Valores aproximados por 100 g (TACO/UNICAMP)
  // Peito de frango cozido: ~32 g ptn / 100 g
  // Ovo inteiro: ~13 g ptn, ~10 g gord / unidade (60 g)
  // Arroz branco cozido: ~2,5 g ptn, ~28 g carbo / 100 g
  // Feijão cozido: ~4,5 g ptn, ~14 g carbo / 100 g
  // Azeite extravirgem: ~100 g gord / 100 mL (~14 g por colher de sopa)

  const frangoPorcoes = (proteina_g * 0.5 / 32 * 100).toFixed(0);
  const arrozPorcoes = (carbo_g * 0.6 / 28 * 100).toFixed(0);
  const feijaoPorcoes = (carbo_g * 0.4 / 14 * 100).toFixed(0);
  const azeiteColheres = (gordura_g * 0.4 / 14).toFixed(1);

  return (
    `Proteína: ~${frangoPorcoes} g de peito de frango cozido (cobre ~50% da meta) + ovos/atum/whey para o restante. ` +
    `Carboidrato: ~${arrozPorcoes} g de arroz branco cozido + ~${feijaoPorcoes} g de feijão cozido. ` +
    `Gordura: ~${azeiteColheres} col. sopa de azeite + gordura dos alimentos proteicos.`
  );
}

export function compute(i: Inputs): Outputs {
  const peso = Number(i.peso) || 0;
  const altura = Number(i.altura) || 0;
  const idade = Number(i.idade) || 0;
  const sexo = i.sexo || 'masculino';
  const nivel_atividade = i.nivel_atividade || 'moderado';
  const objetivo = i.objetivo || 'manutencao';
  const proteina_g_kg = parseFloat(i.proteina_g_kg) || 2.0;
  const gordura_pct = parseFloat(i.gordura_pct) || 28;
  const input_mode = i.input_mode || 'calcular_tmb';

  const erroBase: Outputs = {
    kcal_alvo: 0,
    proteina_g: 0,
    gordura_g: 0,
    carbo_g: 0,
    distribuicao_pct: 'Preencha os campos corretamente.',
    exemplos_alimentos: '—',
    tmb_calculada: 0,
    get_usado: 0,
  };

  // --- Obter GET ---
  let get_usado = 0;
  let tmb_calculada = 0;

  if (input_mode === 'get_direto') {
    get_usado = Number(i.get_direto) || 0;
    if (get_usado <= 0) return { ...erroBase, distribuicao_pct: 'Informe um GET válido (kcal/dia).' };
    tmb_calculada = 0; // não calculado
  } else {
    if (peso <= 0 || altura <= 0 || idade <= 0) {
      return { ...erroBase, distribuicao_pct: 'Informe peso, altura e idade para calcular a TMB.' };
    }
    tmb_calculada = Math.round(calcularTMB(peso, altura, idade, sexo));
    const fa = FATORES_ATIVIDADE[nivel_atividade] ?? 1.55;
    get_usado = Math.round(tmb_calculada * fa);
  }

  if (get_usado <= 500) {
    return { ...erroBase, distribuicao_pct: 'GET muito baixo. Verifique os dados informados.' };
  }

  // --- Ajuste calórico pelo objetivo ---
  const ajuste = AJUSTE_OBJETIVO[objetivo] ?? 1.0;
  const kcal_alvo = Math.round(get_usado * ajuste);

  // --- Distribuição de macros ---
  // Proteína: baseada no peso corporal (g/kg)
  const pesoReferencia = (input_mode === 'get_direto') ? (Number(i.peso) || 75) : peso;
  const proteina_g = Math.round(pesoReferencia * proteina_g_kg);
  const proteina_kcal = proteina_g * KCAL_PROTEINA;

  // Gordura: percentual das calorias-alvo
  const gordura_kcal = kcal_alvo * (gordura_pct / 100);
  const gordura_g = Math.round(gordura_kcal / KCAL_GORDURA);

  // Carboidrato: saldo restante
  const carbo_kcal = kcal_alvo - proteina_kcal - gordura_kcal;
  const carbo_g = Math.max(0, Math.round(carbo_kcal / KCAL_CARBO));

  // --- Percentuais reais ---
  const pPct = kcal_alvo > 0 ? Math.round((proteina_g * KCAL_PROTEINA / kcal_alvo) * 100) : 0;
  const gPct = kcal_alvo > 0 ? Math.round((gordura_g * KCAL_GORDURA / kcal_alvo) * 100) : 0;
  const cPct = Math.max(0, 100 - pPct - gPct);

  // Aviso se carboidrato negativo
  if (carbo_kcal < 0) {
    return {
      ...erroBase,
      kcal_alvo,
      proteina_g,
      gordura_g,
      tmb_calculada,
      get_usado,
      distribuicao_pct:
        'A soma de proteína + gordura ultrapassa as calorias-alvo. Reduza a meta de proteína para 1,6 g/kg ou a gordura para 25%.',
      exemplos_alimentos: '—',
    };
  }

  const distribuicao_pct = `P ${pPct}% / C ${cPct}% / G ${gPct}%`;

  const exemplos = exemplosAlimentos(proteina_g, carbo_g, gordura_g);

  return {
    kcal_alvo,
    proteina_g,
    gordura_g,
    carbo_g,
    distribuicao_pct,
    exemplos_alimentos: exemplos,
    tmb_calculada,
    get_usado,
  };
}
