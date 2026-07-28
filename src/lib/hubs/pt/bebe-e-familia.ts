import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'pt/vida/bebe-e-familia',
  title: "O que preciso planejar para o bebê e a família? | Hacé Cuentas",
  description: "Hub de decisão com 8 cálculos: Quantos ml de fórmula o bebê precisa por dia? Calculadora por idade e peso; Quando Começar BLW? Calculadora por Idade e Etapa; Data Provável do Parto (DPP) pela DUM — Regra de Naegele; Calculadora de Idade — anos, meses e dias; Dia dos Pais 2026: calculadora de orçamento para o presente; Ovulação e Período Fértil: calcule seus dias férteis; Quantas fraldas por dia e por mês conforme a idade do bebê; Quanto de mesada dar ao filho por idade?.",
  silo: "Bebê e família",
  siloHref: '/pt/vida',
  locale: 'pt',
  eyebrow: "Brasil · Bebê e família",
  h1: "O que preciso planejar para o bebê e a família?",
  lede: "Escolha o seu caso e preencha apenas os campos correspondentes. Este hub preserva as 8 fórmulas originais e reúne a decisão numa só página.",
  stamps: ['8 calculadoras incluídas', 'Fórmulas originais reutilizadas', 'Revisto em 28/07/2026'],
  resultLabel: "Seu resultado",
  cases: { title: "O que precisa calcular?", intro: "Escolha um caso; o hub aplica a fórmula original.", items: [
  {
    "id": "c1",
    "label": "Quantos ml de fórmula o bebê precisa por dia? Calculadora por idade e peso",
    "hint": "Bebês de 0 a 6 meses precisam de aproximadamente **150 ml de fórmula por quilo de peso ao dia** (Regra de Barness, adotada pela SBP). Um bebê de 6 kg precisa de 900 ml/dia divididos em 6 mamadas de 150 ml cada. O limite máximo recomendado é 1.000 ml/dia independentemente do peso.",
    "yes": [
      "**Fórmula: 150 ml × peso (kg) = ml/dia** para 0–6 meses (Regra de Barness / SBP). Bebê de 6 kg → 900 ml/dia em 6 mamadas de 150 ml. Limite máximo: 1.000 ml/dia. A partir dos 6 meses com alimentação complementar: 110–120 ml/kg/dia."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-20.",
    "answer": "Bebês de 0 a 6 meses precisam de aproximadamente **150 ml de fórmula por quilo de peso ao dia** (Regra de Barness, adotada pela SBP). Um bebê de 6 kg precisa de 900 ml/dia divididos em 6 mamadas de 150 ml cada. O limite máximo recomendado é 1.000 ml/dia independentemente do peso."
  },
  {
    "id": "c2",
    "label": "Quando Começar BLW? Calculadora por Idade e Etapa",
    "hint": "O BLW (Baby-Led Weaning) pode começar aos **6 meses completos** quando o bebê consegue sentar com apoio, sustenta a cabeça erguida e demonstra interesse por comida. Antes dos 6 meses, o leite materno ou fórmula cobre 100% da nutrição. Etapas: 6–8 meses = Início (tiras macias); 9–11 meses = Variedade crescente; 12+ meses = Comida da família sem sal nem açúcar.",
    "yes": [
      "**O BLW é indicado a partir dos 6 meses completos**, quando o bebê consegue sentar com apoio, tem controle de cabeça e demonstra interesse por comida — os 3 sinais clássicos de prontidão segundo o MS/Brasil e a OMS."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-20.",
    "answer": "O BLW (Baby-Led Weaning) pode começar aos **6 meses completos** quando o bebê consegue sentar com apoio, sustenta a cabeça erguida e demonstra interesse por comida. Antes dos 6 meses, o leite materno ou fórmula cobre 100% da nutrição. Etapas: 6–8 meses = Início (tiras macias); 9–11 meses = Variedade crescente; 12+ meses = Comida da família sem sal nem açúcar."
  },
  {
    "id": "c3",
    "label": "Data Provável do Parto (DPP) pela DUM — Regra de Naegele",
    "hint": "Pela Regra de Naegele, a Data Provável do Parto (DPP) é calculada somando **280 dias (40 semanas)** ao primeiro dia da Última Menstruação (DUM): DPP = DUM + 280 dias. Se o ciclo menstrual for diferente de 28 dias, aplica-se um ajuste: DPP = DUM + 280 + (ciclo − 28 dias). Por exemplo, com DUM em 01/01/2026 e ciclo de 28 dias, a DPP é **08/10/2026**. Com ciclo de 35 dias, a DPP avança 7 dias: **15/10/2026**.",
    "yes": [
      "Pela Regra de Naegele, a DPP = DUM + 280 dias (ajustado pelo ciclo). Uma gestação a termo dura em média 40 semanas a partir da DUM; ciclos diferentes de 28 dias deslocam a DPP proporcionalmente."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-28.",
    "answer": "Pela Regra de Naegele, a Data Provável do Parto (DPP) é calculada somando **280 dias (40 semanas)** ao primeiro dia da Última Menstruação (DUM): DPP = DUM + 280 dias. Se o ciclo menstrual for diferente de 28 dias, aplica-se um ajuste: DPP = DUM + 280 + (ciclo − 28 dias). Por exemplo, com DUM em 01/01/2026 e ciclo de 28 dias, a DPP é **08/10/2026**. Com ciclo de 35 dias, a DPP avança 7 dias: **15/10/2026**."
  },
  {
    "id": "c4",
    "label": "Calculadora de Idade — anos, meses e dias",
    "hint": "Para saber a idade exata, subtraia a data de nascimento da data de hoje contando anos, meses e dias completos: a pessoa só completa mais um ano no dia do aniversário. Quem nasceu em 15/05/1990, em 16/07/2026 tem 36 anos, 2 meses e 1 dia — o equivalente a 434 meses, cerca de 1.887 semanas ou 13.211 dias vividos. Esta calculadora faz essa contagem por calendário (respeitando meses de 28 a 31 dias e anos bissextos) e ainda mostra o dia da semana do nascimento e quantos dias faltam para o próximo aniversário.",
    "yes": [
      "A idade se conta por **calendário**: anos, meses e dias completos, com \"empréstimo\" quando o dia atual é menor que o dia do nascimento. Você só vira mais velho **no dia do aniversário** — antes disso, ainda tem a idade anterior, por mais que o ano já tenha virado."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-07-16.",
    "answer": "Para saber a idade exata, subtraia a data de nascimento da data de hoje contando anos, meses e dias completos: a pessoa só completa mais um ano no dia do aniversário. Quem nasceu em 15/05/1990, em 16/07/2026 tem 36 anos, 2 meses e 1 dia — o equivalente a 434 meses, cerca de 1.887 semanas ou 13.211 dias vividos. Esta calculadora faz essa contagem por calendário (respeitando meses de 28 a 31 dias e anos bissextos) e ainda mostra o dia da semana do nascimento e quantos dias faltam para o próximo aniversário."
  },
  {
    "id": "c5",
    "label": "Dia dos Pais 2026: calculadora de orçamento para o presente",
    "hint": "O Dia dos Pais 2026 é domingo, 9 de agosto (sempre o segundo domingo de agosto no Brasil). Para o presente, uma regra prática: divida o orçamento disponível pelo número de presentes e trabalhe numa faixa de ±30% — com R$ 300 para 2 presentes, mire R$ 150 cada, entre R$ 105 (econômico) e R$ 195 (caprichado).",
    "yes": [
      "Dia dos Pais 2026 = **domingo, 9 de agosto** (segundo domingo de agosto). Regra do presente sem culpa: orçamento ÷ nº de presentes, com faixa de ±30% por presente — e extras (almoço, embalagem, frete) contados ANTES, não depois."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-07-22.",
    "answer": "O Dia dos Pais 2026 é domingo, 9 de agosto (sempre o segundo domingo de agosto no Brasil). Para o presente, uma regra prática: divida o orçamento disponível pelo número de presentes e trabalhe numa faixa de ±30% — com R$ 300 para 2 presentes, mire R$ 150 cada, entre R$ 105 (econômico) e R$ 195 (caprichado)."
  },
  {
    "id": "c6",
    "label": "Ovulação e Período Fértil: calcule seus dias férteis",
    "hint": "A ovulação ocorre aproximadamente 14 dias antes da próxima menstruação (fase lútea fixa). Para um ciclo de 28 dias, a ovulação acontece no dia 14 a partir da última menstruação. A janela fértil dura 7 dias: começa 5 dias antes da ovulação e termina 1 dia após. Os dias de maior fertilidade são os 2 dias anteriores e o próprio dia da ovulação — com chance de concepção de até 33% por ciclo.",
    "yes": [
      "A ovulação acontece aproximadamente 14 dias antes da próxima menstruação; a janela fértil abrange 7 dias (5 antes e 1 após a ovulação), com maior fertilidade nos 2 dias anteriores e no dia da ovulação."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-28.",
    "answer": "A ovulação ocorre aproximadamente 14 dias antes da próxima menstruação (fase lútea fixa). Para um ciclo de 28 dias, a ovulação acontece no dia 14 a partir da última menstruação. A janela fértil dura 7 dias: começa 5 dias antes da ovulação e termina 1 dia após. Os dias de maior fertilidade são os 2 dias anteriores e o próprio dia da ovulação — com chance de concepção de até 33% por ciclo."
  },
  {
    "id": "c7",
    "label": "Quantas fraldas por dia e por mês conforme a idade do bebê",
    "hint": "Recém-nascidos (0–2 meses) usam 10–12 fraldas por dia (~330/mês). Com 3 meses: ~8/dia (240/mês). Com 6 meses: ~6/dia (180/mês). Com 18 meses: ~5/dia (150/mês). Total mensal = média diária × 30.",
    "yes": [
      "**Fraldas/mês = Trocas por dia × 30 dias** — Recém-nascidos (0–1 mês): ~12/dia = 360/mês; 2–4 meses: ~10/dia = 300/mês; 5–9 meses: ~8/dia = 240/mês; 10–18 meses: ~6/dia = 180/mês."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Recém-nascidos (0–2 meses) usam 10–12 fraldas por dia (~330/mês). Com 3 meses: ~8/dia (240/mês). Com 6 meses: ~6/dia (180/mês). Com 18 meses: ~5/dia (150/mês). Total mensal = média diária × 30."
  },
  {
    "id": "c8",
    "label": "Quanto de mesada dar ao filho por idade?",
    "hint": "A referência mais usada no Brasil é **R$10 por ano de idade por semana** (nível médio): filho de 10 anos → R$100/semana (≈R$433/mês). Para nível básico use R$5/ano de idade; para nível alto, R$20/ano. Separe sempre 10–20% para poupança.",
    "yes": [
      "A referência prática é **R$10 × idade por semana** (nível médio). Filho de 10 anos → R$100/semana ≈ R$433/mês. Nível básico: R$5/ano de idade. Nível alto: R$20/ano de idade. Reajuste pelo IPCA anualmente."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-20.",
    "answer": "A referência mais usada no Brasil é **R$10 por ano de idade por semana** (nível médio): filho de 10 anos → R$100/semana (≈R$433/mês). Para nível básico use R$5/ano de idade; para nível alto, R$20/ano. Separe sempre 10–20% para poupança."
  }
] },
  inputsTitle: "Seus dados",
  inputsIntro: "Os campos indicam a qual caso pertencem; os demais são ignorados.",
  fields: [
  {
    "id": "c1__edadMeses",
    "label": "Quantos ml de fórmula o bebê precisa por dia? Calculadora por idade e peso: Idade do bebê (meses)",
    "type": "number",
    "value": 3,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c1__pesoKg",
    "label": "Quantos ml de fórmula o bebê precisa por dia? Calculadora por idade e peso: Peso do bebê (kg)",
    "type": "number",
    "value": 6,
    "step": 0.01,
    "thousands": false,
    "help": "Peso atual em quilogramas, sem roupas. Use o peso da última consulta de puericultura se não souber o exato."
  },
  {
    "id": "c2__edadMeses",
    "label": "Quando Começar BLW? Calculadora por Idade e Etapa: Idade do bebê (meses)",
    "type": "number",
    "value": 6,
    "min": 0,
    "max": 24,
    "step": 1,
    "thousands": false,
    "help": "Informe a idade completa em meses. Exemplo: um bebê com 6 meses e 15 dias = 6 meses."
  },
  {
    "id": "c3__dum",
    "label": "Data Provável do Parto (DPP) pela DUM — Regra de Naegele: Data da Última Menstruação (DUM)",
    "type": "date",
    "value": "2026-07-28",
    "thousands": false
  },
  {
    "id": "c3__cycle_days",
    "label": "Data Provável do Parto (DPP) pela DUM — Regra de Naegele: Duração do Ciclo Menstrual (dias)",
    "type": "number",
    "value": 28,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c4__dataNascimento",
    "label": "Calculadora de Idade — anos, meses e dias: Data de nascimento",
    "type": "date",
    "value": "2026-07-28",
    "thousands": false,
    "help": "Informe a data no formato dia/mês/ano. É a partir dela que a idade é calculada."
  },
  {
    "id": "c4__dataReferencia",
    "label": "Calculadora de Idade — anos, meses e dias: Data de referência (opcional)",
    "type": "date",
    "value": "2026-07-28",
    "thousands": false,
    "help": "Idade em que data? Deixe em branco para calcular a idade hoje."
  },
  {
    "id": "c5__orcamentoTotal",
    "label": "Dia dos Pais 2026: calculadora de orçamento para o presente: Orçamento total para o Dia dos Pais (R$)",
    "type": "number",
    "value": 300,
    "min": 0,
    "step": 10,
    "thousands": false,
    "help": "Quanto você pode gastar no total sem comprometer o mês."
  },
  {
    "id": "c5__numeroPresentes",
    "label": "Dia dos Pais 2026: calculadora de orçamento para o presente: Quantos presentes vai comprar?",
    "type": "number",
    "value": 1,
    "min": 1,
    "max": 10,
    "step": 1,
    "thousands": false,
    "help": "Pai, sogro, padrasto, avô... cada um conta."
  },
  {
    "id": "c5__custoExtras",
    "label": "Dia dos Pais 2026: calculadora de orçamento para o presente: Extras: almoço, embalagem, frete (R$)",
    "type": "number",
    "value": 0,
    "min": 0,
    "step": 10,
    "thousands": false,
    "help": "Gastos do dia que saem do mesmo bolso — desconte antes de dividir."
  },
  {
    "id": "c6__dum",
    "label": "Ovulação e Período Fértil: calcule seus dias férteis: Data da última menstruação (DUM)",
    "type": "date",
    "value": "2026-07-28",
    "thousands": false
  },
  {
    "id": "c6__cycle_length",
    "label": "Ovulação e Período Fértil: calcule seus dias férteis: Duração do ciclo menstrual (dias)",
    "type": "number",
    "value": 28,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c7__mes",
    "label": "Quantas fraldas por dia e por mês conforme a idade do bebê: Idade em meses",
    "type": "number",
    "value": 1,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c8__edad",
    "label": "Quanto de mesada dar ao filho por idade?: Idade do filho (anos)",
    "type": "number",
    "value": 10,
    "step": 1,
    "thousands": false,
    "help": "A idade atual da criança em anos completos."
  },
  {
    "id": "c8__nivelVida",
    "label": "Quanto de mesada dar ao filho por idade?: Nível de vida familiar",
    "type": "select",
    "value": "medio",
    "options": [
      {
        "value": "basico",
        "label": "Básico (R$5/ano de idade)"
      },
      {
        "value": "medio",
        "label": "Médio (R$10/ano de idade)"
      },
      {
        "value": "alto",
        "label": "Alto (R$20/ano de idade)"
      }
    ],
    "thousands": false
  }
],
  fineprint: "Estimativa informativa. Confira os dados e as fontes oficiais antes de decidir.",
  chart: { type: 'bars', caption: "Os principais resultados numéricos da fórmula selecionada." },
  breakdownTitle: "Resultados da fórmula",
  breakdownIntro: "Cada linha vem da fórmula da calculadora original.",
  faq: [
  {
    "q": "Quantos ml de fórmula um bebê de 3 meses precisa por mamada?",
    "a": "Um bebê de 3 meses com peso médio de 6 kg precisa de 6 × 150 = **900 ml/dia** divididos em 6 mamadas de **150 ml cada**. Se seu bebê pesa mais ou menos, multiplique o peso em kg por 150 para obter o total diário, depois divida pelo número de mamadas."
  },
  {
    "q": "Qual é a fórmula correta para calcular ml de mamadeira por dia?",
    "a": "A fórmula padrão (Regra de Barness, usada pela SBP): **Volume diário (ml) = Peso do bebê (kg) × 150**. O resultado é o total diário, que deve ser dividido pelo número de mamadas da faixa etária. O limite máximo é 1.000 ml/dia."
  },
  {
    "q": "Quantos ml um recém-nascido precisa por dia?",
    "a": "Nos primeiros dias: 30–60 ml por mamada, 8–10 mamadas/dia = 250–500 ml/dia. Com 1 mês de vida: cerca de 75–90 ml por mamada × 8 mamadas ≈ 600–720 ml/dia. A regra geral para o 1.º mês: 150 ml/kg/dia — bebê de 4 kg precisa de ~600 ml/dia."
  },
  {
    "q": "Por que existe um limite máximo de 1.000 ml/dia de leite?",
    "a": "Volumes acima de 1.000 ml/dia sobrecarregam os rins imaturos do bebê com excesso de proteínas, sódio e fósforo. Além disso, volumes muito grandes competem com a introdução alimentar a partir dos 6 meses e podem causar anemia ferropriva, pois o leite em excesso inibe a absorção de ferro."
  },
  {
    "q": "A partir de quando o bebê pode tomar menos mamadas por dia?",
    "a": "O número de mamadas diminui gradualmente: recém-nascidos mamam 8 vezes/dia; aos 1–3 meses, 7 vezes; aos 3–6 meses, 6 vezes; com o início da alimentação complementar aos 6 meses, caem para 5. Aos 12 meses, o leite pode ser oferecido 3–4 vezes ao dia como complemento à alimentação sólida."
  },
  {
    "q": "Como saber se o bebê está tomando a quantidade certa de leite?",
    "a": "Indicadores recomendados pela SBP: **ganho de peso adequado** (~150–200 g/semana no 1.º trimestre), 6 ou mais fraldas molhadas por dia, bebê aparentemente satisfeito após as mamadas e crescimento dentro das curvas da Caderneta de Saúde da Criança. Consulte o pediatra se o bebê não estiver ganhando peso conforme esperado."
  },
  {
    "q": "Como calcular para bebês prematuros?",
    "a": "Use a **idade corrigida** (idade cronológica menos as semanas de prematuridade). Um bebê nascido com 34 semanas, ao completar 2 meses de vida, tem idade corrigida de ~0 meses: siga o protocolo de recém-nascido (8 mamadas/dia, volume calculado pelo peso atual). Prematuros com menos de 1.500 g devem ser acompanhados em serviço especializado."
  },
  {
    "q": "O bebê amamentado no peito precisa desta calculadora?",
    "a": "Em amamentação exclusiva no seio, o bebê regula a ingestão por demanda e não é necessário medir volumes. A calculadora é mais útil para fórmula infantil, leite ordenhado em mamadeira ou dieta mista. O Ministério da Saúde recomenda amamentação exclusiva até os 6 meses e complementar até os 2 anos ou mais."
  },
  {
    "q": "Quantas latas de fórmula em pó preciso comprar por mês?",
    "a": "Uma lata de 800 g de fórmula em pó rende cerca de 5.800–6.200 ml de fórmula preparada (verifique o rótulo, geralmente 1 medida rasa de ~4,4 g por 30 ml de água). Se seu bebê toma 900 ml/dia = 27.000 ml/mês, você precisa de aproximadamente **4–5 latas de 800 g por mês**."
  },
  {
    "q": "É seguro usar 200 ml por kg ao invés de 150 ml?",
    "a": "Sim, dentro de certos limites. Alguns pediatras indicam entre 150 e 200 ml/kg/dia dependendo do ganho de peso e do tipo de fórmula. O fator 150 ml/kg é o mais conservador e seguro para uso geral; 200 ml/kg pode ser indicado em casos de baixo ganho ponderal, sempre sob orientação médica e nunca ultrapassando 1.000 ml/dia."
  },
  {
    "q": "A partir de quantos meses o bebê pode iniciar o BLW?",
    "a": "O Ministério da Saúde do Brasil recomenda que a introdução de alimentos complementares — incluindo o BLW — comece **a partir dos 6 meses completos de vida**. Antes disso, o leite materno exclusivo (ou fórmula) atende 100% das necessidades nutricionais do bebê. Iniciar antes dos 6 meses aumenta o risco de engasgos, alergias e infecções intestinais."
  },
  {
    "q": "Quais são os 3 sinais de prontidão para o BLW?",
    "a": "Os três sinais clássicos reconhecidos pelo MS e pela OMS são: (1) **sentar com pouco ou nenhum apoio**, mantendo a cabeça erguida de forma estável; (2) **perda do reflexo de extrusão** (o bebê para de empurrar objetos para fora da boca com a língua); e (3) **interesse demonstrado por alimentos**, como tentar pegar comida e levar à boca. Os três devem estar presentes simultaneamente."
  },
  {
    "q": "O BLW é seguro? Existe risco de engasgo?",
    "a": "Estudos publicados no *British Medical Journal* (2016) mostraram que bebês em BLW **não apresentam maior risco de engasgo** do que bebês alimentados com papinhas, desde que as regras de segurança sejam seguidas (alimentos macios, tamanho adequado, supervisão constante). O reflexo de vômito (gag reflex), frequente no início, é um mecanismo de proteção natural — diferente do engasgo real."
  },
  {
    "q": "Bebês prematuros podem fazer BLW? Quando?",
    "a": "Sim, mas o início deve ser calculado pela **idade gestacional corrigida**, não pela data de nascimento. Um bebê nascido com 32 semanas de gestação tem 2 meses de 'correção': só estará pronto para o BLW quando atingir 6 meses de idade corrigida, o que corresponde a ~8 meses de vida cronológica. Sempre consulte o pediatra responsável pelo acompanhamento do prematuro."
  }
],
  sources: [
  {
    "name": "Ministério da Saúde — Saúde da Criança: Nutrição Infantil (Cadernos de Atenção Básica)",
    "url": "https://bvsms.saude.gov.br/bvs/publicacoes/saude_crianca_nutricao_aleitamento_alimentacao.pdf"
  },
  {
    "name": "Sociedade Brasileira de Pediatria — Manual de Alimentação",
    "url": "https://www.sbp.com.br/fileadmin/user_upload/_22923c-ManNutrologico_Aliment_-_3Tir.pdf"
  },
  {
    "name": "OMS — Preparação, Armazenamento e Manuseio de Fórmulas em Pó",
    "url": "https://www.who.int/publications/i/item/9241593806"
  },
  {
    "name": "Ministério da Saúde — Guia Alimentar para Crianças Menores de 2 Anos",
    "url": "https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_criancas_menores_2anos.pdf"
  },
  {
    "name": "Ministério da Saúde – Saúde da Criança: Aleitamento Materno e Alimentação Complementar",
    "url": "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/aleitamento-materno"
  },
  {
    "name": "OMS – Agua, saneamiento e higiene: datos y cifras sobre necesidades de agua por persona",
    "url": "https://www.who.int/es/news-room/fact-sheets/detail/drinking-water"
  },
  {
    "name": "Guia Alimentar para Crianças Brasileiras Menores de 2 Anos – Ministério da Saúde (2019)",
    "url": "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/guia-alimentar-para-criancas-brasileiras-menores-de-2-anos"
  },
  {
    "name": "Sociedade Brasileira de Pediatria – Manual de Alimentação",
    "url": "https://www.sbp.com.br/fileadmin/user_upload/pdfs/14097c-ManualNutrologia-Alimentacao.pdf"
  },
  {
    "name": "Organização Mundial da Saúde – Alimentação complementar (WHO Complementary Feeding)",
    "url": "https://www.who.int/news-room/fact-sheets/detail/complementary-feeding"
  },
  {
    "name": "FEBRASGO – Manual de Orientação em Obstetrícia",
    "url": "https://www.febrasgo.org.br/",
    "publisher": "Federação Brasileira das Associações de Ginecologia e Obstetrícia",
    "date": "2025"
  },
  {
    "name": "Ministério da Saúde – Gestação de Alto Risco: Manual Técnico",
    "url": "https://bvsms.saude.gov.br/bvs/publicacoes/gestacao_alto_risco.pdf",
    "publisher": "Ministério da Saúde do Brasil",
    "date": "2022"
  },
  {
    "name": "Cadernos de Atenção Básica nº 32 – Atenção ao Pré-Natal de Baixo Risco",
    "url": "https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf",
    "publisher": "Ministério da Saúde do Brasil",
    "date": "2013"
  },
  {
    "name": "ACOG Practice Bulletin – Medically Indicated Late-Preterm and Early-Term Deliveries",
    "url": "https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2021/08/medically-indicated-late-preterm-and-early-term-deliveries",
    "publisher": "American College of Obstetricians and Gynecologists",
    "date": "2021"
  },
  {
    "name": "Código Civil — Lei 10.406/2002 (art. 5º, maioridade)",
    "url": "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm"
  },
  {
    "name": "IBGE — Estatísticas de população",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/populacao.html"
  },
  {
    "name": "CNDL/SPC Brasil — pesquisas de intenção de compra Dia dos Pais",
    "url": "https://www.cndl.org.br/"
  },
  {
    "name": "Governo Federal — calendário de datas comemorativas",
    "url": "https://www.gov.br/pt-br"
  },
  {
    "name": "Federação Brasileira das Associações de Ginecologia e Obstetrícia (FEBRASGO) — Anticoncepção",
    "url": "https://www.febrasgo.org.br/pt/noticias/item/1345-metodos-anticoncepcionais",
    "publisher": "FEBRASGO",
    "date": "2024"
  },
  {
    "name": "Ministério da Saúde — Saúde Sexual e Reprodutiva",
    "url": "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-sexual-e-reprodutiva",
    "publisher": "Ministério da Saúde",
    "date": "2025"
  },
  {
    "name": "World Health Organization — Selected Practice Recommendations for Contraceptive Use (3rd ed.)",
    "url": "https://www.who.int/publications/i/item/9789241564519",
    "publisher": "WHO",
    "date": "2016"
  },
  {
    "name": "Wilcox AJ et al. — Timing of Sexual Intercourse in Relation to Ovulation (NEJM 1995)",
    "url": "https://www.nejm.org/doi/full/10.1056/NEJM199512073332301",
    "publisher": "New England Journal of Medicine",
    "date": "1995"
  },
  {
    "name": "IBGE – Pesquisa Nacional de Saúde (PNS): Indicadores de Saúde Materno-Infantil",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/saude/9160-pesquisa-nacional-de-saude.html"
  },
  {
    "name": "INMETRO – Relatório de Análise de Fraldas Descartáveis",
    "url": "https://www.gov.br/inmetro/pt-br/assuntos/noticias/inmetro-analisa-fraldas-descartaveis"
  },
  {
    "name": "IBGE — Pesquisa de Orçamentos Familiares (POF) 2017–2018",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/saude/24786-pesquisa-de-orcamentos-familiares-2.html"
  },
  {
    "name": "Banco Central do Brasil — Calculadora do Cidadão (IPCA acumulado)",
    "url": "https://www.bcb.gov.br/meubc/calculadora"
  },
  {
    "name": "IBGE — PNAD Contínua: Rendimento de todas as fontes 2023",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/trabalho/9171-pesquisa-nacional-por-amostra-de-domicilios-continua-mensal.html"
  }
],
  replaces: [
    '/pt/biberon-ml-idade', // Absorbida como caso calculable con formulaId formula-infantil-biberon-edad-ml-dia.
    '/pt/blw-introducao-alimentos', // Absorbida como caso calculable con formulaId introduccion-alimentos-blw-edad-etapa-6meses.
    '/pt/calculadora-data-parto-dum-naegele-portugues', // Absorbida como caso calculable con formulaId data-parto-dum-naegele-portugues.
    '/pt/calculadora-idade-anos-meses-dias-data-nascimento', // Absorbida como caso calculable con formulaId idade-anos-meses-dias-data-nascimento.
    '/pt/calculadora-orcamento-presente-dia-dos-pais', // Absorbida como caso calculable con formulaId calculadora-orcamento-presente-dia-dos-pais.
    '/pt/calculadora-ovulacao-periodo-fertil-ciclo', // Absorbida como caso calculable con formulaId ovulacao-periodo-fertil-ciclo.
    '/pt/fraldas-por-dia-mes-bebe-idade', // Absorbida como caso calculable con formulaId pañales-por-dia-mes-bebe-edad.
    '/pt/mesada-semanal-filho-idade', // Absorbida como caso calculable con formulaId mesada-semanal-hijo-edad-sugerida-monto.
  ],
  lastReviewed: '2026-07-28',
};
