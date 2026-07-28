import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'pt/pets/cuidar-do-meu-pet',
  title: "Quanto meu animal precisa por dia? | Hacé Cuentas",
  description: "Hub de decisão com 7 cálculos: Quantos litros por peixe? Calculadora de aquário; Calculadora de Vitamina C para Cobaias — Dose Diária por Peso; Quanto deve comer um coelho? Feno, pellets e verduras por peso; Idade do seu animal em anos humanos; Quanto devo alimentar meu furão? Ração e proteína diária por peso; Quantos minutos de passeio o seu cachorro precisa por dia?; Quanto alimentar tartaruga de água: calculadora por peso e idade.",
  silo: "Cuidados com pets",
  siloHref: '/pt/pets',
  locale: 'pt',
  eyebrow: "Brasil · Cuidados com pets",
  h1: "Quanto meu animal precisa por dia?",
  lede: "Escolha o seu caso e preencha apenas os campos correspondentes. Este hub preserva as 7 fórmulas originais e reúne a decisão numa só página.",
  stamps: ['7 calculadoras incluídas', 'Fórmulas originais reutilizadas', 'Revisto em 28/07/2026'],
  resultLabel: "Seu resultado",
  cases: { title: "O que precisa calcular?", intro: "Escolha um caso; o hub aplica a fórmula original.", items: [
  {
    "id": "c1",
    "label": "Quantos litros por peixe? Calculadora de aquário",
    "hint": "O volume mínimo do aquário é calculado como: **comprimento adulto (cm) × quantidade de peixes × fator da espécie**. Fatores: peixes tropicais esguios (tetras, guppies, corydoras) = **1 L por cm**; tropicais robustos (ciclídeos, discus, acará-bandeira) = **2 L/cm**; peixes de água fria (goldfish, cometa) = **3 L/cm** (produzem 3× mais amônia); peixes marinhos = **5 L/cm**. Bettas têm mínimo fixo de **15 L** independentemente do tamanho. Adicione sempre 15 % ao resultado para compensar substrato e decoração.\n\n**Tabela de referência rápida — mínimo por peixe (1 exemplar):**\n\n| Espécie | Comprimento adulto | Litros mínimos |\n|---------|-------------------|---------------|\n| Tetra-neon | 3,5 cm | 4 L |\n| Guppy | 4–5 cm | 5 L |\n| Betta (macho) | 6–7 cm | 15 L (mínimo fixo) |\n| Corydoras | 5–7 cm | 6–8 L |\n| Acará-bandeira / ciclídeo médio | 12–15 cm | 24–30 L |\n| Disco | 15–20 cm | 30–40 L |\n| Oscar | 30–35 cm | 200+ L |\n| Goldfish comum | 20–30 cm | 60–90 L |\n| Goldfish fantail | 15–20 cm | 45–60 L |\n| Peixe-palhaço (marinho) | 8–10 cm | 40–50 L |",
    "yes": [
      "**Volume mínimo (L) = Comprimento adulto médio (cm) × Quantidade de peixes × Fator da espécie (1–5 L/cm).** Acrescente sempre ao menos 15 % ao resultado para compensar substrato e decoração."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-06-04.",
    "answer": "O volume mínimo do aquário é calculado como: **comprimento adulto (cm) × quantidade de peixes × fator da espécie**. Fatores: peixes tropicais esguios (tetras, guppies, corydoras) = **1 L por cm**; tropicais robustos (ciclídeos, discus, acará-bandeira) = **2 L/cm**; peixes de água fria (goldfish, cometa) = **3 L/cm** (produzem 3× mais amônia); peixes marinhos = **5 L/cm**. Bettas têm mínimo fixo de **15 L** independentemente do tamanho. Adicione sempre 15 % ao resultado para compensar substrato e decoração.\n\n**Tabela de referência rápida — mínimo por peixe (1 exemplar):**\n\n| Espécie | Comprimento adulto | Litros mínimos |\n|---------|-------------------|---------------|\n| Tetra-neon | 3,5 cm | 4 L |\n| Guppy | 4–5 cm | 5 L |\n| Betta (macho) | 6–7 cm | 15 L (mínimo fixo) |\n| Corydoras | 5–7 cm | 6–8 L |\n| Acará-bandeira / ciclídeo médio | 12–15 cm | 24–30 L |\n| Disco | 15–20 cm | 30–40 L |\n| Oscar | 30–35 cm | 200+ L |\n| Goldfish comum | 20–30 cm | 60–90 L |\n| Goldfish fantail | 15–20 cm | 45–60 L |\n| Peixe-palhaço (marinho) | 8–10 cm | 40–50 L |"
  },
  {
    "id": "c2",
    "label": "Calculadora de Vitamina C para Cobaias — Dose Diária por Peso",
    "hint": "Uma cobaia adulta saudável precisa de 10–20 mg de vitamina C por quilograma de peso corporal por dia. Para uma cobaia típica de 900 g: 0,9 kg × 15 mg/kg = 13,5 mg/dia. Fêmeas gestantes ou lactantes precisam de 30–40 mg/kg/dia (~31 mg/dia a 900 g). Com sinais de escorbuto, a dose sobe para 25–50 mg/kg/dia sob supervisão veterinária. Fórmula: Dose (mg/dia) = Peso (kg) × Fator (mg/kg/dia).",
    "yes": [
      "**Dose (mg/dia) = Peso (kg) × fator por estado** — uma cobaia adulta saudável de 900 g precisa de cerca de 13,5 mg de vitamina C por dia; uma fêmea gestante do mesmo peso precisa de 31,5 mg/dia; um animal doente pode precisar de até 45 mg/dia."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-06-04.",
    "answer": "Uma cobaia adulta saudável precisa de 10–20 mg de vitamina C por quilograma de peso corporal por dia. Para uma cobaia típica de 900 g: 0,9 kg × 15 mg/kg = 13,5 mg/dia. Fêmeas gestantes ou lactantes precisam de 30–40 mg/kg/dia (~31 mg/dia a 900 g). Com sinais de escorbuto, a dose sobe para 25–50 mg/kg/dia sob supervisão veterinária. Fórmula: Dose (mg/dia) = Peso (kg) × Fator (mg/kg/dia)."
  },
  {
    "id": "c3",
    "label": "Quanto deve comer um coelho? Feno, pellets e verduras por peso",
    "hint": "Um coelho adulto de 2 kg precisa: feno de gramíneas à vontade (mínimo 60 g/dia), 200 g de vegetais frescos variados e 50 g de pellets por dia (teto adulto). Regra essencial: o feno deve representar 80% da dieta; pellets são suplemento — máximo 50 g/dia independentemente do tamanho do coelho. Filhotes até 6 meses: alfafa e pellets à vontade.",
    "yes": [
      "**A base da dieta do coelho é feno ilimitado (≥30 g/kg/dia).** Pellets são suplemento, não alimento principal — máximo 50 g/dia para adultos. Sem feno suficiente, os coelhos desenvolvem má oclusão dentária e estase gastrointestinal — a principal causa de morte em coelhos domésticos."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-19.",
    "answer": "Um coelho adulto de 2 kg precisa: feno de gramíneas à vontade (mínimo 60 g/dia), 200 g de vegetais frescos variados e 50 g de pellets por dia (teto adulto). Regra essencial: o feno deve representar 80% da dieta; pellets são suplemento — máximo 50 g/dia independentemente do tamanho do coelho. Filhotes até 6 meses: alfafa e pellets à vontade."
  },
  {
    "id": "c4",
    "label": "Idade do seu animal em anos humanos",
    "hint": "Este conversor transforma a idade real do seu cão ou gato em anos humanos equivalentes, levando em conta o tamanho/raça do animal e as diferentes taxas de envelhecimento em cada fase da vida.",
    "yes": [
      "A fórmula correta **não é \"× 7\"**: um cão médio de 1 ano ≈ 15 anos humanos, 5 anos ≈ 35, 10 anos ≈ 60 e 15 anos ≈ 76. Para gatos: 2 anos ≈ 24 anos humanos, 10 anos ≈ 56 e 15 anos ≈ 76."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-20.",
    "answer": "Este conversor transforma a idade real do seu cão ou gato em anos humanos equivalentes, levando em conta o tamanho/raça do animal e as diferentes taxas de envelhecimento em cada fase da vida."
  },
  {
    "id": "c5",
    "label": "Quanto devo alimentar meu furão? Ração e proteína diária por peso",
    "hint": "Um furão adulto precisa de 6% do peso corporal em alimento por dia: um furão de 1 kg precisa de 60 g/dia com pelo menos 19 g de proteína animal (mínimo 32% em base seca). Filhotes e fêmeas prenhes precisam de 7% e até 38% de proteína mínima.",
    "yes": [
      "Um furão adulto de 1 kg precisa de aproximadamente 60 g de alimento por dia, dos quais pelo menos 19 g devem ser proteína animal pura. Esse valor sobe ou cai conforme a fase da vida: filhotes e fêmeas prenhes precisam de até 40 % a mais."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-19.",
    "answer": "Um furão adulto precisa de 6% do peso corporal em alimento por dia: um furão de 1 kg precisa de 60 g/dia com pelo menos 19 g de proteína animal (mínimo 32% em base seca). Filhotes e fêmeas prenhes precisam de 7% e até 38% de proteína mínima."
  },
  {
    "id": "c6",
    "label": "Quantos minutos de passeio o seu cachorro precisa por dia?",
    "hint": "Um cão adulto de alta energia (Border Collie, Labrador, Dálmata) precisa de 80–100 minutos de passeio por dia divididos em 2 saídas. Raças de energia média (Beagle, Golden Retriever) precisam de 40–70 min/dia. Raças de baixa energia (Bulldog Inglês, Shih Tzu) precisam de apenas 25–40 min/dia. Filhotes recebem 60% do tempo base adulto; sêniors, 70%.",
    "yes": [
      "Um cão adulto de alta energia (Labrador, Dálmata, Golden) precisa de ~80 min/dia em 2 saídas de ~40 min cada. Uma raça de baixa energia (Bulldog, Basset Hound) fica bem com ~25–30 min/dia. Filhotes e sêniors recebem ajustes automáticos: 60% e 70% do tempo base adulto, respectivamente."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-19.",
    "answer": "Um cão adulto de alta energia (Border Collie, Labrador, Dálmata) precisa de 80–100 minutos de passeio por dia divididos em 2 saídas. Raças de energia média (Beagle, Golden Retriever) precisam de 40–70 min/dia. Raças de baixa energia (Bulldog Inglês, Shih Tzu) precisam de apenas 25–40 min/dia. Filhotes recebem 60% do tempo base adulto; sêniors, 70%."
  },
  {
    "id": "c7",
    "label": "Quanto alimentar tartaruga de água: calculadora por peso e idade",
    "hint": "A quantidade de alimento para tartaruga de água é calculada como porcentagem do peso corporal conforme a fase de vida: **filhotes (0–1 ano): 3% do peso, todos os dias** · **jovens (1–4 anos): 2% do peso, 4×/semana** · **sub-adultos (4–7 anos): 1,5% do peso, 3×/semana** · **adultos (7+ anos): 1% do peso, 3×/semana**. Exemplo: tartaruga adulta de 500 g → 5 g por sessão, 3 vezes por semana (15 g/semana). Sempre pese o alimento em balança digital — estimar \"a olho\" pode errar 50%.",
    "yes": [
      "**Quantidade por sessão (g) = Peso corporal (g) × taxa por fase**: filhotes 3%, jovens 2%, sub-adultos 1,5%, adultos 1%. Exemplo: adulta de 600 g → 6 g/sessão, 3×/semana (18 g/semana)."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-19.",
    "answer": "A quantidade de alimento para tartaruga de água é calculada como porcentagem do peso corporal conforme a fase de vida: **filhotes (0–1 ano): 3% do peso, todos os dias** · **jovens (1–4 anos): 2% do peso, 4×/semana** · **sub-adultos (4–7 anos): 1,5% do peso, 3×/semana** · **adultos (7+ anos): 1% do peso, 3×/semana**. Exemplo: tartaruga adulta de 500 g → 5 g por sessão, 3 vezes por semana (15 g/semana). Sempre pese o alimento em balança digital — estimar \"a olho\" pode errar 50%."
  }
] },
  inputsTitle: "Seus dados",
  inputsIntro: "Os campos indicam a qual caso pertencem; os demais são ignorados.",
  fields: [
  {
    "id": "c1__fishLength",
    "label": "Quantos litros por peixe? Calculadora de aquário: Comprimento adulto médio (cm)",
    "type": "number",
    "value": 0.5,
    "min": 1,
    "max": 100,
    "step": 0.5,
    "thousands": false,
    "help": "Comprimento do corpo em cm (sem contar a cauda) no tamanho adulto. Se tiver peixes de tamanhos diferentes, insira a média."
  },
  {
    "id": "c1__fishCount",
    "label": "Quantos litros por peixe? Calculadora de aquário: Quantidade de peixes",
    "type": "number",
    "value": 0.6,
    "min": 1,
    "max": 500,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c1__fishType",
    "label": "Quantos litros por peixe? Calculadora de aquário: Tipo de peixe",
    "type": "select",
    "value": "tropical_slim",
    "options": [
      {
        "value": "tropical_slim",
        "label": "Tropical esguio (tetra, guppy, corydoras, dânio)"
      },
      {
        "value": "tropical_heavy",
        "label": "Tropical robusto (ciclídeo, disco, acará-bandeira)"
      },
      {
        "value": "coldwater",
        "label": "Água fria (goldfish, cometa, carpa koi)"
      },
      {
        "value": "betta",
        "label": "Betta (peixe lutador)"
      },
      {
        "value": "marine",
        "label": "Marinho / recife"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__v1",
    "label": "Calculadora de Vitamina C para Cobaias — Dose Diária por Peso: Peso da cobaia",
    "type": "number",
    "value": 0.9,
    "min": 100,
    "max": 2000,
    "step": 1,
    "thousands": false,
    "help": "Pese o animal numa balança digital de cozinha. Faixa típica adulto: 700–1200 g."
  },
  {
    "id": "c2__v2",
    "label": "Calculadora de Vitamina C para Cobaias — Dose Diária por Peso: Estado fisiológico",
    "type": "select",
    "value": "1",
    "options": [
      {
        "value": "1",
        "label": "Adulto saudável (manutenção)"
      },
      {
        "value": "2",
        "label": "Gestante ou lactante"
      },
      {
        "value": "3",
        "label": "Doente ou com sinais de deficiência"
      }
    ],
    "thousands": false
  },
  {
    "id": "c3__peso_kg",
    "label": "Quanto deve comer um coelho? Feno, pellets e verduras por peso: Peso do coelho (kg)",
    "type": "number",
    "value": 25,
    "min": 0.3,
    "max": 12,
    "step": 0.1,
    "thousands": false,
    "help": "Pesos adultos típicos: Anão holandês 1–1,5 kg · Mini Lop 1,5–2,5 kg · Nova Zelândia 3,5–5 kg · Gigante Flamengo 6–10 kg"
  },
  {
    "id": "c3__etapa",
    "label": "Quanto deve comer um coelho? Feno, pellets e verduras por peso: Fase de vida",
    "type": "select",
    "value": "cachorro",
    "options": [
      {
        "value": "cachorro",
        "label": "Filhote (0–6 meses)"
      },
      {
        "value": "joven",
        "label": "Jovem (6–12 meses)"
      },
      {
        "value": "adulto",
        "label": "Adulto (1–5 anos)"
      },
      {
        "value": "senior",
        "label": "Idoso (mais de 5 anos)"
      },
      {
        "value": "gestante",
        "label": "Gestante ou lactante"
      }
    ],
    "thousands": false
  },
  {
    "id": "c4__tipo",
    "label": "Idade do seu animal em anos humanos: Tipo",
    "type": "select",
    "value": "perro_chico",
    "options": [
      {
        "value": "perro_chico",
        "label": "Cão pequeno"
      },
      {
        "value": "perro_mediano",
        "label": "Cão médio"
      },
      {
        "value": "perro_grande",
        "label": "Cão grande"
      },
      {
        "value": "perro_gigante",
        "label": "Cão gigante"
      },
      {
        "value": "gato",
        "label": "Gato"
      }
    ],
    "thousands": false
  },
  {
    "id": "c4__edadMascota",
    "label": "Idade do seu animal em anos humanos: Idade do animal (anos)",
    "type": "number",
    "value": 5,
    "step": 0.01,
    "thousands": false,
    "help": "Contribuição à seguridade social (típicamente 3%)."
  },
  {
    "id": "c5__v1",
    "label": "Quanto devo alimentar meu furão? Ração e proteína diária por peso: Peso do furão",
    "type": "number",
    "value": 1.2,
    "min": 0.1,
    "max": 3,
    "step": 0.05,
    "thousands": false
  },
  {
    "id": "c5__v2",
    "label": "Quanto devo alimentar meu furão? Ração e proteína diária por peso: Fase da vida",
    "type": "select",
    "value": "adult",
    "options": [
      {
        "value": "kit",
        "label": "Filhote / Juvenil (< 1 ano)"
      },
      {
        "value": "adult",
        "label": "Adulto (1–3 anos)"
      },
      {
        "value": "pregnant",
        "label": "Prenha / Lactante"
      },
      {
        "value": "senior",
        "label": "Sênior (3+ anos)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c6__energia",
    "label": "Quantos minutos de passeio o seu cachorro precisa por dia?: Nível de energia da raça",
    "type": "select",
    "value": "media",
    "options": [
      {
        "value": "alta",
        "label": "Alto (trabalho / pastoreio / caça)"
      },
      {
        "value": "media",
        "label": "Médio (companheiro ativo)"
      },
      {
        "value": "baja",
        "label": "Baixo (companheiro tranquilo)"
      }
    ],
    "thousands": false,
    "help": "Alto: Border Collie, Labrador, Dálmata, Jack Russell, Pastor Australiano. Médio: Beagle, Golden Retriever, Cocker Spaniel, Schnauzer. Baixo: Bulldog Inglês, Shih Tzu, Basset Hound, Chihuahua adulto."
  },
  {
    "id": "c6__tamano",
    "label": "Quantos minutos de passeio o seu cachorro precisa por dia?: Porte do cão",
    "type": "select",
    "value": "mediano",
    "options": [
      {
        "value": "chico",
        "label": "Pequeno (até 10 kg)"
      },
      {
        "value": "mediano",
        "label": "Médio (10–25 kg)"
      },
      {
        "value": "grande",
        "label": "Grande (25–40 kg)"
      },
      {
        "value": "gigante",
        "label": "Gigante (mais de 40 kg)"
      }
    ],
    "thousands": false,
    "help": "Pequeno: até 10 kg (Maltês, Chihuahua, Pinscher). Médio: 10–25 kg (Beagle, Cocker, Border Collie). Grande: 25–40 kg (Labrador, Golden, Husky). Gigante: mais de 40 kg (São Bernardo, Mastim, Dogue Alemão)."
  },
  {
    "id": "c6__edad",
    "label": "Quantos minutos de passeio o seu cachorro precisa por dia?: Fase de vida",
    "type": "select",
    "value": "adulto",
    "options": [
      {
        "value": "cachorro",
        "label": "Filhote (menos de 1 ano)"
      },
      {
        "value": "adulto",
        "label": "Adulto (1–7 anos)"
      },
      {
        "value": "senior",
        "label": "Sênior (8 anos ou mais)"
      }
    ],
    "thousands": false,
    "help": "Filhote: menos de 1 ano. Adulto: 1 a 7 anos. Sênior: 8 anos ou mais (raças grandes a partir de 6–7 anos)."
  },
  {
    "id": "c6__braquicefalo",
    "label": "Quantos minutos de passeio o seu cachorro precisa por dia?: É raça braquicefálica (focinho achatado)?",
    "type": "select",
    "value": "false",
    "options": [
      {
        "value": "false",
        "label": "Não"
      },
      {
        "value": "true",
        "label": "Sim (Bulldog, Pug, Boxer, Shih Tzu…)"
      }
    ],
    "thousands": false,
    "help": "Bulldog Inglês, Pug, Boxer, Shih Tzu, Boston Terrier, Pequinês — têm vias aéreas anatômicamente comprimidas e maior risco de golpe de calor durante esforço físico."
  },
  {
    "id": "c7__peso_g",
    "label": "Quanto alimentar tartaruga de água: calculadora por peso e idade: Peso da tartaruga",
    "type": "number",
    "value": 300,
    "min": 5,
    "max": 5000,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c7__edad_anios",
    "label": "Quanto alimentar tartaruga de água: calculadora por peso e idade: Idade aproximada",
    "type": "number",
    "value": 3,
    "min": 0,
    "max": 40,
    "step": 0.5,
    "thousands": false
  }
],
  fineprint: "Estimativa informativa. Confira os dados e as fontes oficiais antes de decidir.",
  chart: { type: 'bars', caption: "Os principais resultados numéricos da fórmula selecionada." },
  breakdownTitle: "Resultados da fórmula",
  breakdownIntro: "Cada linha vem da fórmula da calculadora original.",
  faq: [
  {
    "q": "Quantos litros por peixe precisa um aquário?",
    "a": "Depende da espécie. A fórmula é: <strong>litros = comprimento adulto (cm) × quantidade × fator da espécie</strong>. Tropicais esguios (tetras, guppies): 1 L/cm. Tropicais robustos (ciclídeos, disco): 2 L/cm. Água fria (goldfish): 3 L/cm. Marinhos: 5 L/cm. Exemplo: 10 tetras-neon de 3,5 cm → 10 × 3,5 × 1 = 35 L mínimo. Esta calculadora aplica o fator correto automaticamente."
  },
  {
    "q": "A regra dos 2,5 cm por litro é válida para todos os tipos de peixes?",
    "a": "Não. A regra de 2,5 cm/L (ou 1 cm/L em outra variante) é uma estimativa razoável apenas para peixes tropicais de corpo fusiforme bem filtrado. Ela subestima significativamente as necessidades de goldfish e ciclídeos (que precisam de 3× e 2× mais volume por cm, respectivamente) e superestima a densidade para espécies marinhas, que exigem 5 L por cm de comprimento adulto. Esta calculadora aplica os fatores corretos por tipo de espécie."
  },
  {
    "q": "Quantos litros um goldfish realmente precisa?",
    "a": "Muito mais do que a maioria dos iniciantes imagina. Usando o fator 3 L/cm para água fria: um goldfish comum adulto de 20 cm precisa de <strong>60 litros mínimo para um único exemplar</strong>. Dois goldfish de 20 cm: mínimo 120 litros. Goldfish fantasia de 15 cm: 45 litros por exemplar. As tigelas e aquários de 5–10 L vendidos em feiras causam estresse crônico e morte precoce. Goldfish bem cuidados vivem 15–20 anos."
  },
  {
    "q": "Qual é o volume mínimo recomendado para um betta macho solitário?",
    "a": "O mínimo recomendado por entidades de bem-estar animal e aquaristas especializados é de <strong>15 litros</strong>, sendo 20 litros o ideal para garantir qualidade de água estável e espaço para natação. Aquários menores que 5 L causam estresse crônico, picos rápidos de amônia e redução da expectativa de vida — que pode chegar a 3–5 anos em condições adequadas. Bettas são tropicais e precisam de aquecedor para manter 24–28 °C."
  },
  {
    "q": "Como calcular o volume real de água em um aquário com substrato e decoração?",
    "a": "Meça as dimensões internas (comprimento × largura × altura em cm) e divida por 1.000 para obter litros brutos. Depois subtraia entre 15 % e 20 % para compensar substrato, rochas, filtro interno e espaço de ar na tampa. Exemplo: aquário de 60 × 30 × 35 cm = 63 L brutos → aproximadamente <strong>50–54 L de água efetiva</strong>. Se quiser o valor exato, preencha o aquário vazio com baldes medidos e conte os litros."
  },
  {
    "q": "Quantos peixes cabem em um aquário de 100 litros?",
    "a": "Depende da espécie. Para tropicais esguios (1 L/cm): 100 cm de comprimento total — aproximadamente 28 tetra-neons de 3,5 cm ou 20 guppies de 5 cm. Para goldfish (3 L/cm): apenas 33 cm totais — um goldfish adulto, não cinco. A escolha da espécie muda completamente a capacidade do aquário."
  },
  {
    "q": "A superlotação prejudica a saúde dos peixes? Quais são os sinais?",
    "a": "Sim. A superlotação eleva rapidamente amônia (NH₃) e nitrito (NO₂) para níveis tóxicos (>0,5 mg/L). Os sinais incluem: ofegância na superfície da água, nadadeiras coladas ao corpo, coloração pálida, lesões por brigas e mortalidade súbita. O controle da qualidade da água é tão importante quanto o volume — faça trocas semanais de 20–30 % do volume mesmo em aquários bem dimensionados."
  },
  {
    "q": "É necessário ter filtro para usar esta calculadora?",
    "a": "Os fatores desta calculadora pressupõem <strong>filtração biológica eficiente</strong>, com vazão de pelo menos 5× o volume do aquário por hora (ex.: filtro de 500 L/h para aquário de 100 L). Sem filtro, os volumes mínimos calculados devem ser dobrados e as trocas de água precisam ser diárias. Aquários sem filtro com a densidade calculada aqui entrarão em colapso biológico rapidamente."
  },
  {
    "q": "Posso misturar espécies de água fria com tropicais no mesmo aquário?",
    "a": "Não. Peixes de água fria (goldfish, cometa) prosperam entre 15–22 °C, enquanto tropicais (tetras, guppies, bettas) precisam de 24–28 °C. Manter ambos no mesmo aquário significa que um grupo estará sempre fora da faixa ideal de temperatura, gerando estresse crônico e redução de imunidade. Além disso, some os requisitos de volume de cada grupo separadamente ao planejar aquários mistos de espécies compatíveis."
  },
  {
    "q": "Como saber o tamanho adulto médio de um peixe antes de comprá-lo?",
    "a": "Consulte a etiqueta do fornecedor, bases de dados como <strong>FishBase</strong> (fishbase.se) ou peça o nome científico da espécie ao lojista. O FishBase é o maior banco de dados de biologia de peixes do mundo, com informações sobre mais de 35.000 espécies, incluindo comprimento máximo registrado e tamanho adulto médio — dado essencial para o planejamento correto do aquário."
  },
  {
    "q": "Quando posso adicionar novos peixes a um aquário já estabelecido?",
    "a": "Somente após confirmar que o ciclo do nitrogênio está estável (amônia e nitrito em 0 ppm, nitrato abaixo de 20 ppm). Um aquário novo leva 4–8 semanas para estabelecer as colônias bacterianas de filtração biológica. Adicione peixes em lotes pequenos com intervalos de 2–3 semanas e faça sempre quarentena de novos peixes por ao menos 2 semanas em aquário separado antes de introduzi-los ao aquário principal."
  },
  {
    "q": "Por que o betta tem um mínimo fixo em vez de usar a fórmula por cm?",
    "a": "Bettas são peixes labirínticos — respiram ar atmosférico diretamente da superfície além das brânquias. Mesmo sendo peixes relativamente pequenos (6–7 cm), aquários minúsculos geram picos rápidos de amônia e variações bruscas de temperatura que são letais. O mínimo de 15 L reflete o limite real abaixo do qual a qualidade da água não consegue ser mantida sem intervenções diárias. Bettas machos também são extremamente territoriais e nunca devem ser mantidos juntos independentemente do volume do aquário."
  },
  {
    "q": "Quanto de vitamina C uma cobaia precisa por dia?",
    "a": "Uma cobaia adulta saudável precisa de 10–20 mg de vitamina C por quilograma de peso corporal por dia. Para uma cobaia típica de 900 g: 9–18 mg/dia (13,5 mg/dia no ponto médio de 15 mg/kg). Fêmeas gestantes ou lactantes precisam de 30–40 mg/kg/dia. Animais com sinais de escorbuto: 25–50 mg/kg/dia sob supervisão veterinária."
  },
  {
    "q": "Por que cobaias precisam de vitamina C todo dia, diferente de cachorros e gatos?",
    "a": "Cobaias possuem uma mutação no gene GULO que inativa a enzima L-gulonolactona oxidase — a última etapa da síntese endógena de vitamina C. Humanos e primatas têm a mesma limitação. Sem suplementação diária, os estoques de ácido ascórbico se esgotam em poucos dias e os primeiros sinais de escorbuto surgem em 2–4 semanas de privação total."
  }
],
  sources: [
  {
    "name": "INJAF — Independent Network of Responsible Aquarium Fishkeepers: Understanding fish stocking guides",
    "url": "https://injaf.org/articles-guides/general-guides/understanding-fish-stocking-guides/"
  },
  {
    "name": "Practical Fishkeeping UK — FAQ on stocking densities",
    "url": "https://www.practicalfishkeeping.co.uk/features/frequently-asked-questions-on-stocking-densities/"
  },
  {
    "name": "Aquarium Science (David Hurd) — Calculating Stocking Ratio",
    "url": "https://aquariumscience.org/index.php/13-2-calculating-stocking-ratio/"
  },
  {
    "name": "FishBase — Base de dados global de biologia de peixes (Froese & Pauly, eds.)",
    "url": "https://www.fishbase.se/search.php"
  },
  {
    "name": "Wikipedia PT — Aquarismo: técnicas e parâmetros de qualidade de água",
    "url": "https://pt.wikipedia.org/wiki/Aquarismo"
  },
  {
    "name": "Merck Veterinary Manual — Nutritional Problems of Guinea Pigs",
    "url": "https://www.merckvetmanual.com/all-other-pets/guinea-pigs/nutritional-problems-of-guinea-pigs"
  },
  {
    "name": "Veterinary Partner (VIN) — Vitamin C Supplements for Guinea Pigs",
    "url": "https://veterinarypartner.vin.com/default.aspx?pid=19239&catId=254109&id=4952750"
  },
  {
    "name": "Guinea Lynx — Scurvy & Vitamin C Deficiency in Guinea Pigs",
    "url": "https://www.guinealynx.info/scurvy.html"
  },
  {
    "name": "USDA FoodData Central — Ácido ascórbico em alimentos",
    "url": "https://fdc.nal.usda.gov/"
  },
  {
    "name": "House Rabbit Society — Feeding Your Rabbit",
    "url": "https://rabbit.org/suggested-vegetables-and-fruits-for-a-rabbit-diet/"
  },
  {
    "name": "WSAVA — World Small Animal Veterinary Association",
    "url": "https://wsava.org"
  },
  {
    "name": "AAHA — American Animal Hospital Association",
    "url": "https://www.aaha.org"
  },
  {
    "name": "BSAVA Manual of Rabbit Medicine (Meredith & Lord, 4.ª ed.)",
    "url": "https://www.bsava.com/resources/bsava-manuals/"
  },
  {
    "name": "IBGE – Pesquisa Nacional de Saúde: posse de animais de estimação no Brasil",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/saude/9160-pesquisa-nacional-de-saude.html"
  },
  {
    "name": "Wikipedia PT – Expectativa de vida de cães e gatos domésticos",
    "url": "https://pt.wikipedia.org/wiki/C%C3%A3o_dom%C3%A9stico"
  },
  {
    "name": "VCA Animal Hospitals — Feeding Ferrets",
    "url": "https://vcahospitals.com/know-your-pet/feeding-ferrets"
  },
  {
    "name": "Bell JA (2000). Ferret Nutrition. Vet Clin North Am Exot Anim Pract. PubMed 11228691",
    "url": "https://pubmed.ncbi.nlm.nih.gov/11228691/"
  },
  {
    "name": "Indiana BOAH — Ferret General Care Guidelines",
    "url": "https://www.in.gov/boah/files/Ferrets-General-Care-Guidelines.pdf"
  },
  {
    "name": "Quesenberry KE & Carpenter JW — Ferrets, Rabbits and Rodents: Clinical Medicine and Surgery, 4th ed. Elsevier, 2020",
    "url": "https://www.elsevier.com/books/ferrets-rabbits-and-rodents/quesenberry/978-0-323-48435-0"
  },
  {
    "name": "American Kennel Club — How Much Exercise Does a Dog Need?",
    "url": "https://www.akc.org/expert-advice/health/how-much-exercise-does-dog-need/"
  },
  {
    "name": "WSAVA — Global Nutrition and Wellness Guidelines",
    "url": "https://wsava.org/global-guidelines/global-nutrition-guidelines/"
  },
  {
    "name": "NIH PubMed — Displasia coxofemoral e exercício em cães jovens",
    "url": "https://pubmed.ncbi.nlm.nih.gov/18328041/"
  },
  {
    "name": "ARAV — Association of Reptilian and Amphibian Veterinarians",
    "url": "https://www.arav.org"
  },
  {
    "name": "Wikipedia PT — Trachemys scripta elegans (tartaruga-de-orelha-vermelha)",
    "url": "https://pt.wikipedia.org/wiki/Trachemys_scripta_elegans"
  },
  {
    "name": "NIH PubMed — Hyperparatiroidismo nutricional secundário em répteis cativos",
    "url": "https://pubmed.ncbi.nlm.nih.gov/9240734/"
  },
  {
    "name": "Mader DR — Reptile Medicine and Surgery (3rd ed.), Elsevier",
    "url": "https://www.elsevier.com/books/reptile-medicine-and-surgery/mader/978-1-4160-0136-0"
  }
],
  replaces: [
    '/pt/aquario-litros-peixes', // Absorbida como caso calculable con formulaId pecera-litros-peces-cantidad-m2.
    '/pt/cobaia-vitamina-c-dosagem-diaria', // Absorbida como caso calculable con formulaId cobayo-vitamina-c-dosis-diaria.
    '/pt/coelho-comida-feno-peso-idade', // Absorbida como caso calculable con formulaId conejo-comida-heno-peso-edad.
    '/pt/conversor-idade-cachorro-gato-humana', // Absorbida como caso calculable con formulaId envejecer-mascota-humano-tabla-raza-tamano.
    '/pt/furao-dieta-proteina-animal', // Absorbida como caso calculable con formulaId huron-ferret-dieta-proteina-animal.
    '/pt/passeios-cachorro-minutos-raca', // Absorbida como caso calculable con formulaId paseos-perro-minutos-raza-energia.
    '/pt/tartaruga-agua-dieta-peso-idade', // Absorbida como caso calculable con formulaId tortuga-agua-dieta-peso-edad.
  ],
  lastReviewed: '2026-07-28',
};
