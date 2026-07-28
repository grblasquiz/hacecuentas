import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'pt/saude/treino-e-desempenho',
  title: "Quanto devo treinar e qual é o meu resultado? | Hacé Cuentas",
  description: "Hub de decisão com 11 cálculos: 1RM agachamento: calcule seu máximo; 1RM Levantamento Terra: Calcule seu Máximo Estimado; Calculadora de 1RM no Supino; IMC 2026: Calcule e Veja sua Classificação pela Tabela OMS; Calculadora de Macros: Cutting, Manutenção e Bulking; TMB Mifflin-St Jeor: calcule sua Taxa Metabólica Basal; Pace Natação 100m; Calculadora de pontos para subir de categoria no pádel (APT/AAP); Projeção de Tempo na Meia Maratona pelo seu 10K; Calculadora de média de pontos por partida no rugby; Ritmo ajustado trail running con desnivel: calculadora Naismith.",
  silo: "Treino e desempenho",
  siloHref: '/pt/saude',
  locale: 'pt',
  eyebrow: "Brasil · Treino e desempenho",
  h1: "Quanto devo treinar e qual é o meu resultado?",
  lede: "Escolha o seu caso e preencha apenas os campos correspondentes. Este hub preserva as 11 fórmulas originais e reúne a decisão numa só página.",
  stamps: ['11 calculadoras incluídas', 'Fórmulas originais reutilizadas', 'Revisto em 28/07/2026'],
  resultLabel: "Seu resultado",
  cases: { title: "O que precisa calcular?", intro: "Escolha um caso; o hub aplica a fórmula original.", items: [
  {
    "id": "c1",
    "label": "1RM agachamento: calcule seu máximo",
    "hint": "A calculadora de 1RM (Uma Repetição Máxima) para agachamento estima o peso máximo que você consegue levantar em uma única repetição, sem precisar chegar ao limite absoluto do esforço. A fórmula base utilizada é a de Epley: 1RM = peso × (1 + reps / 30).",
    "yes": [
      "**1RM (Epley) = peso (kg) × (1 + repetições ÷ 30)** — Exemplo real: 80 kg × 5 reps → 80 × (1 + 5/30) = **93,3 kg** de 1RM estimado no agachamento."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "A calculadora de 1RM (Uma Repetição Máxima) para agachamento estima o peso máximo que você consegue levantar em uma única repetição, sem precisar chegar ao limite absoluto do esforço. A fórmula base utilizada é a de Epley: 1RM = peso × (1 + reps / 30)."
  },
  {
    "id": "c2",
    "label": "1RM Levantamento Terra: Calcule seu Máximo Estimado",
    "hint": "Para calcular seu 1RM no levantamento terra, use a Fórmula de Epley: **1RM = Peso (kg) × (1 + Repetições ÷ 30)**. Exemplo: 80 kg × 5 repetições → 1RM estimado ≈ 93 kg. Para maior precisão, use séries de 3 a 6 repetições. Acima de 10 reps o erro pode superar 10%.",
    "yes": [
      "**1RM = Peso (kg) × (1 + Repetições ÷ 30)** — Ex.: 100 kg × 5 reps → 1RM ≈ 117 kg. Use de 3 a 6 reps para maior precisão (erro < 5%)."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Para calcular seu 1RM no levantamento terra, use a Fórmula de Epley: **1RM = Peso (kg) × (1 + Repetições ÷ 30)**. Exemplo: 80 kg × 5 repetições → 1RM estimado ≈ 93 kg. Para maior precisão, use séries de 3 a 6 repetições. Acima de 10 reps o erro pode superar 10%."
  },
  {
    "id": "c3",
    "label": "Calculadora de 1RM no Supino",
    "hint": "A calculadora de 1RM (Uma Repetição Máxima) no supino estima o peso máximo que você consegue levantar em uma única repetição, com base em uma carga submáxima e no número de repetições realizadas. A fórmula de Epley — 1RM = Peso × (1 + Reps/30) — é a mais utilizada em academias do mundo inteiro.",
    "yes": [
      "Fórmula de Epley: **1RM = Peso (kg) × (1 + Repetições ÷ 30)**. Ex.: 80 kg × 5 reps → 80 × (1 + 5/30) = **93,3 kg**. Use entre 3 e 10 reps para maior precisão."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "A calculadora de 1RM (Uma Repetição Máxima) no supino estima o peso máximo que você consegue levantar em uma única repetição, com base em uma carga submáxima e no número de repetições realizadas. A fórmula de Epley — 1RM = Peso × (1 + Reps/30) — é a mais utilizada em academias do mundo inteiro."
  },
  {
    "id": "c4",
    "label": "IMC 2026: Calcule e Veja sua Classificação pela Tabela OMS",
    "hint": "O IMC (Índice de Massa Corporal) é calculado como Peso (kg) dividido pela Altura ao quadrado (m²). A OMS classifica: abaixo de 18,5 magreza; 18,5–24,9 peso normal; 25–29,9 sobrepeso; 30 ou mais obesidade (graus I, II e III). Exemplo: 75 kg e 1,72 m resultam em IMC de 25,35 kg/m², caracterizando sobrepeso. Não se aplica diretamente a atletas, gestantes, crianças nem idosos acima de 65 anos.",
    "yes": [
      "Um IMC entre 18,5 e 24,9 kg/m² é considerado saudável pela OMS; acima de 30 kg/m² já caracteriza obesidade, associada a maior risco de doenças cardiovasculares, diabetes tipo 2 e hipertensão."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-28.",
    "answer": "O IMC (Índice de Massa Corporal) é calculado como Peso (kg) dividido pela Altura ao quadrado (m²). A OMS classifica: abaixo de 18,5 magreza; 18,5–24,9 peso normal; 25–29,9 sobrepeso; 30 ou mais obesidade (graus I, II e III). Exemplo: 75 kg e 1,72 m resultam em IMC de 25,35 kg/m², caracterizando sobrepeso. Não se aplica diretamente a atletas, gestantes, crianças nem idosos acima de 65 anos."
  },
  {
    "id": "c5",
    "label": "Calculadora de Macros: Cutting, Manutenção e Bulking",
    "hint": "Calcular os macronutrientes (proteína, carboidrato e gordura) é o passo mais concreto para definir uma dieta voltada a um objetivo específico — emagrecimento, manutenção ou ganho de massa muscular.",
    "yes": [
      "Para cutting, reduza ~20% das calorias de manutenção e consuma 1,8–2,2 g de proteína por kg; para bulking, adicione ~10% e mantenha 1,6–2,0 g/kg."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-05-28.",
    "answer": "Calcular os macronutrientes (proteína, carboidrato e gordura) é o passo mais concreto para definir uma dieta voltada a um objetivo específico — emagrecimento, manutenção ou ganho de massa muscular."
  },
  {
    "id": "c6",
    "label": "TMB Mifflin-St Jeor: calcule sua Taxa Metabólica Basal",
    "hint": "A Taxa Metabólica Basal (TMB) pela fórmula Mifflin-St Jeor é: **homens** TMB = 10 × peso(kg) + 6,25 × altura(cm) − 5 × idade + 5; **mulheres** TMB = 10 × peso(kg) + 6,25 × altura(cm) − 5 × idade − 161. Exemplo: mulher de 28 anos, 62 kg e 165 cm tem TMB ≈ 1.350 kcal/dia. O gasto total (GET) é a TMB multiplicada pelo fator de atividade (1,2 a 1,9).",
    "yes": [
      "A fórmula Mifflin-St Jeor estima a TMB com erro médio de ±10% e é 5% mais precisa do que Harris-Benedict em adultos com peso normal e sobrepeso."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-06-04.",
    "answer": "A Taxa Metabólica Basal (TMB) pela fórmula Mifflin-St Jeor é: **homens** TMB = 10 × peso(kg) + 6,25 × altura(cm) − 5 × idade + 5; **mulheres** TMB = 10 × peso(kg) + 6,25 × altura(cm) − 5 × idade − 161. Exemplo: mulher de 28 anos, 62 kg e 165 cm tem TMB ≈ 1.350 kcal/dia. O gasto total (GET) é a TMB multiplicada pelo fator de atividade (1,2 a 1,9)."
  },
  {
    "id": "c7",
    "label": "Pace Natação 100m",
    "hint": "A calculadora de pace de natação para 100 metros converte seu tempo total de treino ou prova em ritmo por 100m — a unidade padrão usada em natação competitiva e recreativa. O pace é expresso em minutos e segundos por 100m (ex.: 1:40/100m) e indica quanto tempo você leva para percorrer cada 100 metros.",
    "yes": [
      "**Pace (s/100m) = (Tempo total em segundos ÷ Distância em metros) × 100** — Ex.: 1500m em 25 min (1500s) → (1500 ÷ 1500) × 100 = 100s/100m = **1:40/100m** (nível Intermediário)."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-20.",
    "answer": "A calculadora de pace de natação para 100 metros converte seu tempo total de treino ou prova em ritmo por 100m — a unidade padrão usada em natação competitiva e recreativa. O pace é expresso em minutos e segundos por 100m (ex.: 1:40/100m) e indica quanto tempo você leva para percorrer cada 100 metros."
  },
  {
    "id": "c8",
    "label": "Calculadora de pontos para subir de categoria no pádel (APT/AAP)",
    "hint": "Para subir da Sexta para a Quinta divisão no ranking de pádel você precisa acumular aproximadamente 500 pontos nos seus melhores 10 torneios do ano. Com média de 55 pontos por torneio provincial (chegando a semifinais), são necessários 8–10 torneios. Torneios de nível mais alto distribuem mais pontos por fase.",
    "yes": [
      "**Pontos para subir = limiar da próxima categoria. O sistema conta apenas os 10 melhores resultados do ano. Subir da Sexta para a Quinta exige ~500 pts; da Quinta para a Quarta ~800 pts. Com média de ~60 pts por torneio provincial, são necessários 8–10 torneios com boas colocações.**"
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-20.",
    "answer": "Para subir da Sexta para a Quinta divisão no ranking de pádel você precisa acumular aproximadamente 500 pontos nos seus melhores 10 torneios do ano. Com média de 55 pontos por torneio provincial (chegando a semifinais), são necessários 8–10 torneios. Torneios de nível mais alto distribuem mais pontos por fase."
  },
  {
    "id": "c9",
    "label": "Projeção de Tempo na Meia Maratona pelo seu 10K",
    "hint": "Para prever o tempo de meia maratona a partir do 10K, use a fórmula de Cameron: T21K = T10K × (21,0975 / 10) ^ (1,07 + 0,0065 × ln(T10K)). O expoente dinâmico compensa a fadiga progressiva. Um 10K em 50 minutos projeta uma meia maratona de aproximadamente 1h53min; um 10K em 45 minutos projeta cerca de 1h42min.",
    "yes": [
      "**Fórmula de Cameron: T21K = T10K × (21,0975 / 10)^(1,07 + 0,0065 × ln(T10K))** — 10K em 50min projeta ≈ 1h53min. Para correr meia maratona em menos de 2h, você precisa de um 10K em torno de 52:57 ou menos."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Para prever o tempo de meia maratona a partir do 10K, use a fórmula de Cameron: T21K = T10K × (21,0975 / 10) ^ (1,07 + 0,0065 × ln(T10K)). O expoente dinâmico compensa a fadiga progressiva. Um 10K em 50 minutos projeta uma meia maratona de aproximadamente 1h53min; um 10K em 45 minutos projeta cerca de 1h42min."
  },
  {
    "id": "c10",
    "label": "Calculadora de média de pontos por partida no rugby",
    "hint": "A média de pontos por partida no rugby se calcula dividindo os pontos de tabela totais pelas partidas disputadas. Com o sistema World Rugby (4 pts vitória / 2 empate / 0 derrota + bônus), uma média ≥ 2,2 pts/partida costuma ser zona segura; abaixo de 1,8 há risco real de rebaixamento.",
    "yes": [
      "**Média = Pontos totais ÷ Partidas jogadas.** Com 35 pts em 15 partidas → **2,33 pts/partida** → zona segura confortável. O limiar crítico de rebaixamento na maioria das competições fica em torno de **1,8 pts/partida**; abaixo de 2,2 já é zona de risco."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-20.",
    "answer": "A média de pontos por partida no rugby se calcula dividindo os pontos de tabela totais pelas partidas disputadas. Com o sistema World Rugby (4 pts vitória / 2 empate / 0 derrota + bônus), uma média ≥ 2,2 pts/partida costuma ser zona segura; abaixo de 1,8 há risco real de rebaixamento."
  },
  {
    "id": "c11",
    "label": "Ritmo ajustado trail running con desnivel: calculadora Naismith",
    "hint": "Regra de Naismith: cada 100 m de desnível positivo equivalem a 1 km adicional de distância plana equivalente. Para calcular o tempo ajustado em trail running: Distância equivalente (km) = Distância real + Desnível (m) ÷ 100 → Tempo ajustado = Distância equivalente × Ritmo base. Exemplo: 20 km + 1.000 m de desnível a ritmo 6:00/km → 30 km equivalentes × 6 min = 3h00 com ritmo efetivo de 9:00/km.",
    "yes": [
      "**Tempo ajustado = (Distância_km + Desnível_m ÷ 100) × Ritmo_base_min/km** — Exemplo: 20 km + 1.000 m a ritmo 6:00/km → 30 km equiv. × 6 = 180 min = **3h00**; ritmo efetivo **9:00 min/km**."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-20.",
    "answer": "Regra de Naismith: cada 100 m de desnível positivo equivalem a 1 km adicional de distância plana equivalente. Para calcular o tempo ajustado em trail running: Distância equivalente (km) = Distância real + Desnível (m) ÷ 100 → Tempo ajustado = Distância equivalente × Ritmo base. Exemplo: 20 km + 1.000 m de desnível a ritmo 6:00/km → 30 km equivalentes × 6 min = 3h00 com ritmo efetivo de 9:00/km."
  }
] },
  inputsTitle: "Seus dados",
  inputsIntro: "Os campos indicam a qual caso pertencem; os demais são ignorados.",
  fields: [
  {
    "id": "c1__peso",
    "label": "1RM agachamento: calcule seu máximo: Peso (kg)",
    "type": "number",
    "value": 80,
    "step": 0.01,
    "thousands": false,
    "help": "Seu peso corporal em kg."
  },
  {
    "id": "c1__reps",
    "label": "1RM agachamento: calcule seu máximo: Repetições",
    "type": "number",
    "value": 5,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c2__peso",
    "label": "1RM Levantamento Terra: Calcule seu Máximo Estimado: Peso levantado (kg)",
    "type": "number",
    "value": 80,
    "step": 0.01,
    "thousands": false,
    "help": "Peso total na barra em kg."
  },
  {
    "id": "c2__reps",
    "label": "1RM Levantamento Terra: Calcule seu Máximo Estimado: Repetições",
    "type": "number",
    "value": 5,
    "step": 1,
    "thousands": false,
    "help": "Número de repetições realizadas na série (ideal: 3–6 reps)."
  },
  {
    "id": "c3__peso",
    "label": "Calculadora de 1RM no Supino: Peso (kg)",
    "type": "number",
    "value": 80,
    "step": 0.01,
    "thousands": false,
    "help": "Peso corporal em kg."
  },
  {
    "id": "c3__reps",
    "label": "Calculadora de 1RM no Supino: Repetições",
    "type": "number",
    "value": 5,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c4__weight_kg",
    "label": "IMC 2026: Calcule e Veja sua Classificação pela Tabela OMS: Peso (kg)",
    "type": "number",
    "value": 70,
    "step": 0.1,
    "thousands": false
  },
  {
    "id": "c4__height_cm",
    "label": "IMC 2026: Calcule e Veja sua Classificação pela Tabela OMS: Altura (cm)",
    "type": "number",
    "value": 170,
    "step": 0.5,
    "thousands": false
  },
  {
    "id": "c4__sex",
    "label": "IMC 2026: Calcule e Veja sua Classificação pela Tabela OMS: Sexo biológico (opcional, para peso ideal)",
    "type": "select",
    "value": "neutral",
    "options": [
      {
        "value": "neutral",
        "label": "Prefiro não informar"
      },
      {
        "value": "male",
        "label": "Masculino"
      },
      {
        "value": "female",
        "label": "Feminino"
      }
    ],
    "thousands": false
  },
  {
    "id": "c5__input_mode",
    "label": "Calculadora de Macros: Cutting, Manutenção e Bulking: Como informar o gasto energético?",
    "type": "radio",
    "value": "calcular_tmb",
    "options": [
      {
        "value": "get_direto",
        "label": "Informar GET diretamente (kcal/dia)"
      },
      {
        "value": "calcular_tmb",
        "label": "Calcular a partir de peso, altura, idade e sexo"
      }
    ],
    "thousands": false
  },
  {
    "id": "c5__get_direto",
    "label": "Calculadora de Macros: Cutting, Manutenção e Bulking: GET (Gasto Energético Total) em kcal/dia",
    "type": "number",
    "value": 2500,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c5__peso",
    "label": "Calculadora de Macros: Cutting, Manutenção e Bulking: Peso corporal (kg)",
    "type": "number",
    "value": 75,
    "step": 0.1,
    "thousands": false
  },
  {
    "id": "c5__altura",
    "label": "Calculadora de Macros: Cutting, Manutenção e Bulking: Altura (cm)",
    "type": "number",
    "value": 175,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c5__idade",
    "label": "Calculadora de Macros: Cutting, Manutenção e Bulking: Idade (anos)",
    "type": "number",
    "value": 30,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c5__sexo",
    "label": "Calculadora de Macros: Cutting, Manutenção e Bulking: Sexo biológico",
    "type": "radio",
    "value": "masculino",
    "options": [
      {
        "value": "masculino",
        "label": "Masculino"
      },
      {
        "value": "feminino",
        "label": "Feminino"
      }
    ],
    "thousands": false
  },
  {
    "id": "c5__nivel_atividade",
    "label": "Calculadora de Macros: Cutting, Manutenção e Bulking: Nível de atividade física",
    "type": "select",
    "value": "moderado",
    "options": [
      {
        "value": "sedentario",
        "label": "Sedentário (sem exercício)"
      },
      {
        "value": "leve",
        "label": "Leve (1–3 dias/semana)"
      },
      {
        "value": "moderado",
        "label": "Moderado (3–5 dias/semana)"
      },
      {
        "value": "intenso",
        "label": "Intenso (6–7 dias/semana)"
      },
      {
        "value": "muito_intenso",
        "label": "Muito intenso (2x/dia ou trabalho físico pesado)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c5__objetivo",
    "label": "Calculadora de Macros: Cutting, Manutenção e Bulking: Objetivo",
    "type": "select",
    "value": "manutencao",
    "options": [
      {
        "value": "cutting",
        "label": "Cutting — emagrecer (−20% kcal)"
      },
      {
        "value": "manutencao",
        "label": "Manutenção de peso"
      },
      {
        "value": "bulking",
        "label": "Bulking — ganhar massa (+10% kcal)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c5__proteina_g_kg",
    "label": "Calculadora de Macros: Cutting, Manutenção e Bulking: Meta de proteína (g por kg de peso corporal)",
    "type": "select",
    "value": "2.0",
    "options": [
      {
        "value": "1.6",
        "label": "1,6 g/kg — mínimo recomendado para preservar massa"
      },
      {
        "value": "1.8",
        "label": "1,8 g/kg — intermediário (bulking conservador)"
      },
      {
        "value": "2.0",
        "label": "2,0 g/kg — padrão para cutting/bulking"
      },
      {
        "value": "2.2",
        "label": "2,2 g/kg — máximo prático (cutting agressivo)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c5__gordura_pct",
    "label": "Calculadora de Macros: Cutting, Manutenção e Bulking: Gordura como % das calorias totais",
    "type": "select",
    "value": "28",
    "options": [
      {
        "value": "25",
        "label": "25% — menor proporção de gordura"
      },
      {
        "value": "28",
        "label": "28% — proporção equilibrada (padrão)"
      },
      {
        "value": "30",
        "label": "30% — maior proporção de gordura"
      }
    ],
    "thousands": false
  },
  {
    "id": "c6__sex",
    "label": "TMB Mifflin-St Jeor: calcule sua Taxa Metabólica Basal: Sexo biológico",
    "type": "radio",
    "value": "male",
    "options": [
      {
        "value": "male",
        "label": "Masculino"
      },
      {
        "value": "female",
        "label": "Feminino"
      }
    ],
    "thousands": false
  },
  {
    "id": "c6__weight",
    "label": "TMB Mifflin-St Jeor: calcule sua Taxa Metabólica Basal: Peso (kg)",
    "type": "number",
    "value": 70,
    "step": 0.1,
    "thousands": false
  },
  {
    "id": "c6__height",
    "label": "TMB Mifflin-St Jeor: calcule sua Taxa Metabólica Basal: Altura (cm)",
    "type": "number",
    "value": 170,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c6__age",
    "label": "TMB Mifflin-St Jeor: calcule sua Taxa Metabólica Basal: Idade (anos)",
    "type": "number",
    "value": 30,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c6__activity",
    "label": "TMB Mifflin-St Jeor: calcule sua Taxa Metabólica Basal: Nível de atividade física",
    "type": "select",
    "value": "sedentary",
    "options": [
      {
        "value": "sedentary",
        "label": "Sedentário — sem exercício ou trabalho de escritório (×1,2)"
      },
      {
        "value": "light",
        "label": "Levemente ativo — exercício leve 1–3 dias/semana (×1,375)"
      },
      {
        "value": "moderate",
        "label": "Moderadamente ativo — exercício moderado 3–5 dias/semana (×1,55)"
      },
      {
        "value": "very_active",
        "label": "Muito ativo — exercício intenso 6–7 dias/semana (×1,725)"
      },
      {
        "value": "extra_active",
        "label": "Extremamente ativo — trabalho físico pesado + treino intenso (×1,9)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c7__distanciaM",
    "label": "Pace Natação 100m: Distância m",
    "type": "number",
    "value": 1500,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c7__tiempoMinutos",
    "label": "Pace Natação 100m: Tempo total min",
    "type": "number",
    "value": 25,
    "step": 0.01,
    "thousands": false,
    "help": "Aporte para obra social (típicamente 3%)."
  },
  {
    "id": "c8__categoriaActual",
    "label": "Calculadora de pontos para subir de categoria no pádel (APT/AAP): Categoria atual",
    "type": "select",
    "value": "septima",
    "options": [
      {
        "value": "septima",
        "label": "Sétima"
      },
      {
        "value": "sexta",
        "label": "Sexta"
      },
      {
        "value": "quinta",
        "label": "Quinta"
      },
      {
        "value": "cuarta",
        "label": "Quarta"
      },
      {
        "value": "tercera",
        "label": "Terceira"
      },
      {
        "value": "segunda",
        "label": "Segunda"
      },
      {
        "value": "primera",
        "label": "Primeira"
      }
    ],
    "thousands": false
  },
  {
    "id": "c9__t10kMin",
    "label": "Projeção de Tempo na Meia Maratona pelo seu 10K: Tempo de 10K (minutos)",
    "type": "number",
    "value": 50,
    "step": 0.01,
    "thousands": false,
    "help": "Seu melhor tempo de corrida nos 10K em minutos decimais (ex: 50,5 para 50:30). Use um resultado de prova competitiva, não treino."
  },
  {
    "id": "c10__puntosGanados",
    "label": "Calculadora de média de pontos por partida no rugby: Pontos de tabela conquistados",
    "type": "number",
    "value": 35,
    "step": 1,
    "thousands": false,
    "help": "Total de pontos acumulados na tabela de classificação (vitórias × 4, empates × 2, mais bônus)."
  },
  {
    "id": "c10__partidosJugados",
    "label": "Calculadora de média de pontos por partida no rugby: Partidas jogadas",
    "type": "number",
    "value": 15,
    "step": 1,
    "thousands": false,
    "help": "Número de partidas efetivamente disputadas — não incluir adiamentos nem folgas."
  },
  {
    "id": "c11__distanciaKm",
    "label": "Ritmo ajustado trail running con desnivel: calculadora Naismith: Distância (km)",
    "type": "number",
    "value": 20,
    "step": 0.1,
    "thousands": false,
    "help": "Distância total do percurso em quilômetros."
  },
  {
    "id": "c11__desnivelPositivo",
    "label": "Ritmo ajustado trail running con desnivel: calculadora Naismith: Desnível positivo (m)",
    "type": "number",
    "value": 1000,
    "step": 10,
    "thousands": false,
    "help": "Ganho total de elevação acumulado (D+) em metros — soma de todas as subidas, não a diferença entre o ponto mais alto e mais baixo."
  },
  {
    "id": "c11__paceBaseKm",
    "label": "Ritmo ajustado trail running con desnivel: calculadora Naismith: Ritmo base (min/km)",
    "type": "number",
    "value": 6,
    "step": 0.1,
    "thousands": false,
    "help": "Seu ritmo habitual em terreno plano, em minutos por quilômetro."
  }
],
  fineprint: "Estimativa informativa. Confira os dados e as fontes oficiais antes de decidir.",
  chart: { type: 'bars', caption: "Os principais resultados numéricos da fórmula selecionada." },
  breakdownTitle: "Resultados da fórmula",
  breakdownIntro: "Cada linha vem da fórmula da calculadora original.",
  faq: [
  {
    "q": "A fórmula de Epley é a mais precisa para o agachamento?",
    "a": "A fórmula de Epley é uma das mais usadas e validadas para grandes grupos musculares como o agachamento, mas não é universalmente a mais precisa para todos. Um estudo de Mayhew et al. (1992) mostrou que Brzycki e Epley têm precisão similar para 3–8 repetições, com erro médio de ±5%. Para séries de 1–3 reps, todas as fórmulas convergem e são bastante confiáveis."
  },
  {
    "q": "Quantas repetições devo usar para obter a estimativa mais confiável?",
    "a": "O intervalo ideal é de **3 a 8 repetições** com carga próxima ao esforço máximo (RPE 8–9, ou seja, poderiam sobrar 1–2 reps). Abaixo de 3 reps, a diferença com o 1RM real é pequena o suficiente para testar diretamente. Acima de 10 reps, as fórmulas superestimam o 1RM porque a resistência à fadiga passa a influenciar mais do que a força máxima."
  },
  {
    "q": "Qual é o 1RM médio no agachamento para um homem adulto não treinado no Brasil?",
    "a": "Segundo dados do IBGE (PNS 2019) e referencias da literatura de força, homens adultos sedentários entre 20–35 anos geralmente apresentam 1RM no agachamento entre **60% e 80% do peso corporal**. Um homem de 80 kg sem treino resistido regular teria 1RM estimado entre 48 e 64 kg — bem abaixo dos padrões de praticantes intermediários (130–140% do peso corporal)."
  },
  {
    "q": "Posso usar essa calculadora para agachamento frontal (front squat)?",
    "a": "Sim, a calculadora funciona para qualquer variação do agachamento, desde que você insira o peso e as reps correspondentes àquele exercício específico. Em média, o 1RM no front squat é aproximadamente **80–85% do 1RM do back squat**, pois a posição exige maior mobilidade e distribui a carga de forma diferente. Nunca use o 1RM do back squat para prescrever carga no front squat diretamente."
  },
  {
    "q": "Com que frequência devo testar ou estimar o 1RM no agachamento?",
    "a": "A maioria dos protocolos de periodização recomenda reavaliação a cada **4 a 8 semanas** (ao final de cada mesociclo). Testes máximos reais (1RM absoluto) são geralmente realizados apenas 1–2 vezes por ano em atletas avançados, pois impõem alto stress ao sistema nervoso central e aumentam o risco de lesão. A estimativa por fórmulas permite monitoramento contínuo sem esse custo."
  },
  {
    "q": "Há algum risco de lesão ao fazer um teste de 1RM real no agachamento?",
    "a": "Sim. Testes de 1RM máximo no agachamento aumentam o risco de lesões musculares, tendinosas e lombares, especialmente em praticantes iniciantes ou com técnica deficiente. O Ministério da Saúde (MS) e o CREF recomendam que avaliações de força máxima sejam realizadas sob supervisão de profissional de Educação Física habilitado. Para iniciantes, o uso de fórmulas estimativas é considerado a abordagem mais segura."
  },
  {
    "q": "O 1RM estimado muda com a idade?",
    "a": "Sim. A força muscular máxima tende a atingir o pico entre **25 e 35 anos** e declina progressivamente após os 40, com perda de aproximadamente **1–2% ao ano** na ausência de treino resistido — fenômeno chamado de sarcopenia, documentado pelo IBGE e pela literatura gerontológica. Porém, com treino regular de força, essa perda pode ser significativamente retardada, e praticantes de 60+ anos ainda apresentam 1RMs impressionantes comparados a jovens sedentários."
  },
  {
    "q": "Como usar o 1RM para montar um treino de hipertrofia no agachamento?",
    "a": "Para hipertrofia, a literatura científica (Schoenfeld, 2010) recomenda treinar entre **67% e 85% do 1RM**, com 3–5 séries de 6–12 repetições por sessão. Exemplo prático: se seu 1RM estimado é 100 kg, treine com 70–85 kg. O volume semanal total (séries × reps × kg) é o principal determinante do crescimento muscular, e o 1RM serve de âncora para calibrar as cargas em cada fase do programa."
  },
  {
    "q": "Qual é a fórmula para calcular o 1RM no levantamento terra?",
    "a": "A fórmula mais usada é a de Epley: **1RM = Peso (kg) × (1 + Repetições ÷ 30)**. Exemplo: 80 kg × 5 reps → 1RM = 80 × 1,167 = **93,3 kg**. Para maior precisão, use séries de 3 a 6 repetições. Acima de 10 reps o erro pode ultrapassar 10%."
  },
  {
    "q": "A fórmula de Epley é precisa para o levantamento terra especificamente?",
    "a": "Sim, com boa precisão para séries de 1 a 10 repetições. Estudos publicados no Journal of Strength and Conditioning Research indicam erro médio de 3–5% nessa faixa. O levantamento terra, por ser um movimento multiarticular de alto recrutamento, tende a ter estimativas ligeiramente mais conservadoras do que o valor real quando executado com boa técnica."
  },
  {
    "q": "Com quantas repetições o teste de estimativa é mais confiável?",
    "a": "Entre **3 e 6 repetições** é a janela ideal. Com menos de 3 reps, a série se aproxima do 1RM real e perde sentido estimá-la. Com mais de 8–10 reps, o componente de resistência muscular entra em jogo, distorcendo a estimativa de força máxima para cima em até 10–15%."
  },
  {
    "q": "Qual é o 1RM médio no levantamento terra para iniciantes?",
    "a": "Um iniciante do sexo masculino com peso corporal entre 75–85 kg costuma apresentar 1RM inicial entre 80 e 120 kg no levantamento terra após 4–8 semanas de aprendizado técnico. Mulheres na mesma faixa de peso geralmente atingem 50–80 kg no início. A base de força varia muito com o histórico de atividade física."
  },
  {
    "q": "Posso usar esse estimador para programar treino de powerlifting?",
    "a": "Sim, é prática comum. A maioria dos programas clássicos (Texas Method, 5/3/1 de Wendler, Sheiko) prescrevem cargas como porcentagem do 1RM. Com o valor estimado, calcule: **Carga = 1RM estimado × % do programa**. Por exemplo, no 5/3/1, a semana de intensidade usa 95% do 1RM — se seu 1RM estimado é 140 kg, a carga será 133 kg."
  },
  {
    "q": "O 1RM estimado é diferente para homens e mulheres?",
    "a": "A **fórmula é a mesma** para ambos — ela calcula com base no peso levantado e nas repetições, independentemente do sexo. A diferença está nos valores de referência: mulheres geralmente apresentam 1RM absoluto 30–40% menor, mas em termos de força relativa ao peso corporal, a diferença se reduz significativamente com treinamento de longa data."
  }
],
  sources: [
  {
    "name": "Ministério da Saúde — Atividade Física e Saúde",
    "url": "https://www.gov.br/saude/pt-br/assuntos/saude-brasil/eu-quero-me-exercitar/atividade-fisica"
  },
  {
    "name": "IBGE — Pesquisa Nacional de Saúde (PNS) 2019",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/saude/9160-pesquisa-nacional-de-saude.html"
  },
  {
    "name": "Wikipedia PT — Repetição Máxima",
    "url": "https://pt.wikipedia.org/wiki/Repeti%C3%A7%C3%A3o_m%C3%A1xima"
  },
  {
    "name": "Journal of Strength and Conditioning Research — Prediction of 1RM strength (PubMed)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/8563287/"
  },
  {
    "name": "ExRx.net — Deadlift Strength Standards",
    "url": "https://exrx.net/Testing/WeightLifting/StrengthStandards"
  },
  {
    "name": "Stronger by Science — How to use 1RM calculators",
    "url": "https://www.strongerbyscience.com/how-to-use-1rm-calculators/"
  },
  {
    "name": "Classificação de IMC para Adultos — OMS",
    "url": "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight",
    "publisher": "Organização Mundial da Saúde (OMS/WHO)",
    "date": "2024"
  },
  {
    "name": "Vigilância de Fatores de Risco e Proteção — VIGITEL Brasil",
    "url": "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/v/vigitel",
    "publisher": "Ministério da Saúde do Brasil",
    "date": "2025"
  },
  {
    "name": "Diretrizes Brasileiras de Obesidade — ABESO",
    "url": "https://abeso.org.br/diretrizes/",
    "publisher": "Associação Brasileira para o Estudo da Obesidade e da Síndrome Metabólica (ABESO)",
    "date": "2023"
  },
  {
    "name": "Cadernos de Atenção Básica — Obesidade nº 12",
    "url": "https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_obesidade.pdf",
    "publisher": "Ministério da Saúde / Departamento de Atenção Básica",
    "date": "2006"
  },
  {
    "name": "ISSN Position Stand: Protein and Exercise (Jäger et al., 2017)",
    "url": "https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8",
    "publisher": "Journal of the International Society of Sports Nutrition",
    "date": "2017"
  },
  {
    "name": "ABRAN — Associação Brasileira de Nutrologia",
    "url": "https://abran.org.br/",
    "publisher": "ABRAN",
    "date": "2024"
  },
  {
    "name": "CFN — Resolução 600/2018 (atuação do nutricionista)",
    "url": "https://www.cfn.org.br/wp-content/uploads/resolucoes/Res_600_2018.htm",
    "publisher": "Conselho Federal de Nutricionistas",
    "date": "2018"
  },
  {
    "name": "Schoenfeld & Aragon — How much protein per meal for muscle hypertrophy (JISSN, 2018)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/29497353/",
    "publisher": "Journal of the International Society of Sports Nutrition",
    "date": "2018"
  },
  {
    "name": "Mifflin MD et al. — A new predictive equation for resting energy expenditure (Am J Clin Nutr, 1990)",
    "url": "https://academic.oup.com/ajcn/article/51/2/241/4695104",
    "publisher": "American Journal of Clinical Nutrition",
    "date": "1990"
  },
  {
    "name": "Tabela Brasileira de Composição de Alimentos (TBCA) — FCF/USP",
    "url": "https://www.tbca.net.br/",
    "publisher": "Universidade de São Paulo",
    "date": "2023"
  },
  {
    "name": "Mifflin MD et al. — A new predictive equation for resting energy expenditure in healthy individuals",
    "url": "https://pubmed.ncbi.nlm.nih.gov/2305711/",
    "publisher": "American Journal of Clinical Nutrition / PubMed",
    "date": "1990"
  },
  {
    "name": "Ministério da Saúde — Guia Alimentar para a População Brasileira",
    "url": "https://www.gov.br/saude/pt-br/assuntos/saude-brasil/publicacoes-para-promocao-a-saude/guia-alimentar-para-a-populacao-brasileira",
    "publisher": "Ministério da Saúde",
    "date": "2014"
  },
  {
    "name": "CFN — Conselho Federal de Nutricionistas — Referências em Nutrição",
    "url": "https://www.cfn.org.br",
    "publisher": "Conselho Federal de Nutricionistas",
    "date": "2026"
  },
  {
    "name": "Academy of Nutrition and Dietetics — Estimating Resting Metabolic Rate",
    "url": "https://www.eatrightpro.org/practice/practice-resources/evidence-analysis-library",
    "publisher": "Academy of Nutrition and Dietetics",
    "date": "2005"
  },
  {
    "name": "TACO — Tabela Brasileira de Composição de Alimentos (UNICAMP/NEPA)",
    "url": "https://www.unicamp.br/nepa/taco/",
    "publisher": "UNICAMP / Ministério da Saúde",
    "date": "2011"
  },
  {
    "name": "Wikipedia PT – Natação: Recordes mundiais e regulamentos",
    "url": "https://pt.wikipedia.org/wiki/Nata%C3%A7%C3%A3o"
  },
  {
    "name": "Ministério do Esporte – Programa Bolsa Atleta (critérios de classificação)",
    "url": "https://www.gov.br/esporte/pt-br/acoes-e-programas/bolsa-atleta"
  },
  {
    "name": "Confederação Brasileira de Padel (CBPádel) — Regulamentos Oficiais",
    "url": "https://www.cbpadel.com.br/regulamentos"
  },
  {
    "name": "APT Padel Tour — Sistema de Pontos Oficial",
    "url": "https://www.aptpadeltour.com/ranking"
  },
  {
    "name": "Wikipedia PT — Pádel",
    "url": "https://pt.wikipedia.org/wiki/P%C3%A1del"
  },
  {
    "name": "Riegel, P.S. (1981). Athletic Records and Human Endurance. American Scientist, 69(3), 285–290.",
    "url": "https://www.americanscientist.org/article/athletic-records-and-human-endurance"
  },
  {
    "name": "Wikipedia PT — Meia Maratona",
    "url": "https://pt.wikipedia.org/wiki/Meia_maratona"
  },
  {
    "name": "World Rugby — Laws of the Game",
    "url": "https://www.world.rugby/the-game/laws"
  },
  {
    "name": "Confederação Brasileira de Rugby (CBRu)",
    "url": "https://www.cbru.com.br"
  },
  {
    "name": "Sudamérica Rugby",
    "url": "https://www.sudamericarugby.com"
  },
  {
    "name": "ITRA — International Trail Running Association: Índice de Esforço e Distância Equivalente",
    "url": "https://itra.run/page/mountainIndex.html"
  },
  {
    "name": "Regra de Naismith — Wikipedia (formulação original de 1892 e aplicações modernas)",
    "url": "https://pt.wikipedia.org/wiki/Regra_de_Naismith"
  },
  {
    "name": "American College of Sports Medicine (ACSM) — Diretrizes para Exercício em Altitude",
    "url": "https://www.acsm.org/education-resources/books/acsms-guidelines-for-exercise-testing-and-prescription"
  },
  {
    "name": "Naismith's Rule — Wikipedia (original 1892 formulation and modern applications)",
    "url": "https://en.wikipedia.org/wiki/Naismith%27s_rule"
  }
],
  replaces: [
    '/pt/1rm-agachamento-estimador', // Absorbida como caso calculable con formulaId 1rm-sentadilla-estimador.
    '/pt/1rm-levantamento-terra-estimador', // Absorbida como caso calculable con formulaId 1rm-peso-muerto-estimador.
    '/pt/1rm-supino-estimador', // Absorbida como caso calculable con formulaId 1rm-press-banca-estimador.
    '/pt/calculadora-imc-tabela-oms-classificacao', // Absorbida como caso calculable con formulaId imc-tabela-oms-classificacao.
    '/pt/calculadora-macros-emagrecimento-ganho-massa', // Absorbida como caso calculable con formulaId macros-emagrecimento-ganho-massa.
    '/pt/calculadora-tmb-mifflin-st-jeor-portugues', // Absorbida como caso calculable con formulaId tmb-mifflin-st-jeor-portugues.
    '/pt/pace-natacao-100m-ritmo', // Absorbida como caso calculable con formulaId pace-natacion-100m-ritmo.
    '/pt/padel-ranking-pontos-apt-aap-subir', // Absorbida como caso calculable con formulaId padel-ranking-puntos-apt-aap-subir.
    '/pt/projecao-21k-de-10k-cameron', // Absorbida como caso calculable con formulaId proyeccion-21k-desde-10k-cameron.
    '/pt/rugby-handicap-pontos-descenso-media', // Absorbida como caso calculable con formulaId rugby-handicap-puntos-descenso-promedio.
    '/pt/trail-running-desnivel-ritmo-ajustado', // Absorbida como caso calculable con formulaId trail-running-desnivel-ritmo-ajustado.
  ],
  lastReviewed: '2026-07-28',
};
